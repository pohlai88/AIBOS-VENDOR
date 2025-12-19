/**
 * OAuth Callback Handler
 * 
 * Handles OAuth callback from Supabase after user authenticates with provider.
 * Exchanges authorization code for session and redirects user.
 * 
 * GET /api/auth/oauth/callback?code=...&state=...
 * 
 * Following Supabase Next.js SSR best practices:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/logger";

// Route segment config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/oauth/callback
 * 
 * Handles OAuth callback from provider
 * 
 * Query Parameters:
 * - code: Authorization code from OAuth provider
 * - state: State parameter (contains redirect_to if provided)
 * - error: Error from OAuth provider (if any)
 * - error_description: Error description (if any)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      logError("[OAuth Callback] OAuth provider error", new Error(error), {
        error,
        errorDescription,
      });

      const origin = request.nextUrl.origin;
      return NextResponse.redirect(
        `${origin}/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`
      );
    }

    // Verify code is present
    if (!code) {
      logError("[OAuth Callback] Missing authorization code", new Error("No code parameter"));
      const origin = request.nextUrl.origin;
      return NextResponse.redirect(
        `${origin}/login?error=missing_code&message=${encodeURIComponent("Authorization code not provided")}`
      );
    }

    const supabase = await createClient();

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      logError("[OAuth Callback] Failed to exchange code for session", exchangeError, {
        code: code.substring(0, 10) + "...", // Log partial code for debugging
      });

      const origin = request.nextUrl.origin;
      return NextResponse.redirect(
        `${origin}/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
      );
    }

    if (!data.session || !data.user) {
      logError("[OAuth Callback] No session or user returned", new Error("Invalid response"));
      const origin = request.nextUrl.origin;
      return NextResponse.redirect(
        `${origin}/login?error=no_session&message=${encodeURIComponent("Failed to create session")}`
      );
    }

    logInfo("[OAuth Callback] OAuth login successful", {
      userId: data.user.id,
      email: data.user.email,
      provider: data.user.app_metadata?.provider,
    });

    // Get redirect URL from state or default to dashboard
    const state = searchParams.get("state");
    let redirectTo = "/dashboard";

    if (state) {
      try {
        // State might contain redirect_to parameter
        const stateParams = new URLSearchParams(state);
        const redirectToParam = stateParams.get("redirect_to");
        if (redirectToParam && redirectToParam.startsWith("/")) {
          redirectTo = redirectToParam;
        }
      } catch {
        // Ignore state parsing errors, use default
      }
    }

    // Ensure redirectTo is safe (starts with /)
    if (!redirectTo.startsWith("/")) {
      redirectTo = "/dashboard";
    }

    // Handle redirect with proper origin (for production with load balancers)
    const origin = request.nextUrl.origin;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    let redirectUrl: string;
    if (isLocalEnv) {
      redirectUrl = `${origin}${redirectTo}`;
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${redirectTo}`;
    } else {
      redirectUrl = `${origin}${redirectTo}`;
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    logError("[OAuth Callback] Unexpected error", error);
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(
      `${origin}/login?error=unexpected_error&message=${encodeURIComponent("An unexpected error occurred")}`
    );
  }
}
