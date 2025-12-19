import { NextRequest, NextResponse } from "next/server";
import { handleSSOCallback } from "@/lib/auth/sso";
import { logError } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/saml/initiate - Initiate SAML authentication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get("provider");
    const requestId = searchParams.get("request_id");

    if (!providerId || !requestId) {
      return NextResponse.json(
        { error: "Provider ID and request ID are required" },
        { status: 400 }
      );
    }

    // Get provider configuration
    const supabase = await createClient();
    const { data: provider, error: providerError } = await supabase
      .from("sso_providers")
      .select("*")
      .eq("id", providerId)
      .eq("enabled", true)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: "SAML provider not found or disabled" },
        { status: 404 }
      );
    }

    if (provider.type !== "saml") {
      return NextResponse.json(
        { error: "Provider is not a SAML provider" },
        { status: 400 }
      );
    }

    const { SAML } = await import("@node-saml/node-saml");

    const saml = new SAML({
      callbackUrl: provider.metadata.callbackUrl as string,
      entryPoint: provider.metadata.entryPoint as string,
      issuer: provider.metadata.issuer as string,
      idpCert: provider.metadata.cert as string,
    });

    const relayState = Buffer.from(JSON.stringify({ providerId, requestId })).toString("base64");
    const authnRequest = await saml.getAuthorizeUrlAsync(relayState, undefined, {});

    return NextResponse.redirect(authnRequest);
  } catch (error) {
    logError("SAML initiation error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/saml/callback - Handle SAML response
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const samlResponse = formData.get("SAMLResponse") as string;
    const relayState = formData.get("RelayState") as string;

    if (!samlResponse) {
      return NextResponse.json(
        { error: "SAML response is required" },
        { status: 400 }
      );
    }

    // Parse relay state to get provider and request ID
    const state = relayState ? JSON.parse(Buffer.from(relayState, "base64").toString()) : {};
    const { providerId, requestId } = state;

    if (!providerId || !requestId) {
      return NextResponse.json(
        { error: "Invalid SAML response state" },
        { status: 400 }
      );
    }

    const result = await handleSSOCallback(providerId, requestId, samlResponse);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "SAML authentication failed" },
        { status: 401 }
      );
    }

    // Redirect to dashboard or return URL
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    logError("SAML callback error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
