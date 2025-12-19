import { NextRequest, NextResponse } from "next/server";
import { initiateSSO, handleSSOCallback } from "@/lib/auth/sso";
import { logError } from "@/lib/logger";
import { logSecurityEvent } from "@/lib/audit-log";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/sso - Initiate SSO login
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get("provider");
    const returnUrl = searchParams.get("return_url") || undefined;

    if (!providerId) {
      return NextResponse.json(
        { error: "Provider ID is required" },
        { status: 400 }
      );
    }

    const result = await initiateSSO(providerId, returnUrl);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to initiate SSO" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL(result.redirectUrl, request.url));
  } catch (error) {
    logError("SSO initiation error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/sso/callback - Handle SSO callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, requestId, samlResponse, oauthCode } = body;

    if (!providerId || !requestId) {
      return NextResponse.json(
        { error: "Provider ID and request ID are required" },
        { status: 400 }
      );
    }

    const result = await handleSSOCallback(providerId, requestId, samlResponse, oauthCode);

    if (!result.success) {
      await logSecurityEvent(
        "unauthorized_access",
        null,
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
        request.headers.get("user-agent") || undefined,
        { reason: result.error, providerId }
      );

      return NextResponse.json(
        { error: result.error || "SSO authentication failed" },
        { status: 401 }
      );
    }

    // Set session cookie or redirect to dashboard
    return NextResponse.json({
      success: true,
      userId: result.userId,
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    logError("SSO callback error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
