/**
 * Supabase OAuth Authentication Routes
 * 
 * Implements Supabase's built-in OAuth providers (Google, GitHub, etc.)
 * Following Supabase MCP and Next.js MCP best practices.
 * 
 * Routes:
 * - GET /api/auth/oauth?provider=google - Initiate OAuth login
 * - GET /api/auth/oauth/callback - Handle OAuth callback
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logger";

// Route segment config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/oauth
 * 
 * Initiate OAuth login with Supabase provider
 * 
 * Query Parameters:
 * - provider: OAuth provider (google, github, azure, apple, etc.)
 * - redirectTo: URL to redirect after successful login (default: /dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get("provider");
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    if (!provider) {
      return createErrorResponse(
        new Error("Provider parameter is required"),
        400,
        "OAUTH_PROVIDER_REQUIRED"
      );
    }

    // Validate provider
    const validProviders = [
      "google",
      "github",
      "azure",
      "apple",
      "facebook",
      "twitter",
      "discord",
      "bitbucket",
      "gitlab",
      "linkedin",
      "notion",
      "slack",
      "spotify",
      "twitch",
      "zoom",
    ];

    if (!validProviders.includes(provider)) {
      return createErrorResponse(
        new Error(`Invalid provider: ${provider}. Valid providers: ${validProviders.join(", ")}`),
        400,
        "OAUTH_INVALID_PROVIDER"
      );
    }

    const supabase = await createClient();

    // Get the origin for redirect URL
    const origin = request.nextUrl.origin;
    const callbackUrl = `${origin}/api/auth/oauth/callback`;

    // Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          // Store redirectTo in state to use after callback
          redirect_to: redirectTo,
        },
      },
    });

    if (error) {
      logError("[OAuth] Failed to initiate OAuth", error, {
        provider,
        redirectTo,
      });
      return createErrorResponse(
        new Error(`OAuth initiation failed: ${error.message}`),
        500,
        "OAUTH_INIT_ERROR"
      );
    }

    if (!data.url) {
      return createErrorResponse(
        new Error("OAuth URL not generated"),
        500,
        "OAUTH_URL_ERROR"
      );
    }

    logInfo("[OAuth] OAuth flow initiated", {
      provider,
      redirectTo,
    });

    // Redirect to OAuth provider
    return NextResponse.redirect(data.url);
  } catch (error) {
    logError("[OAuth] OAuth initiation error", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("OAuth initiation failed"),
      500,
      "OAUTH_ERROR"
    );
  }
}
