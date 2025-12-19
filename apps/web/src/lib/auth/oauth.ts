/**
 * Supabase OAuth Utilities
 * 
 * Client-side utilities for OAuth authentication with Supabase.
 * Following Supabase MCP and Next.js MCP best practices.
 */

import { createClient } from "@/lib/supabase/client";

export type OAuthProvider =
  | "google"
  | "github"
  | "azure"
  | "apple"
  | "facebook"
  | "twitter"
  | "discord"
  | "bitbucket"
  | "gitlab"
  | "linkedin"
  | "notion"
  | "slack"
  | "spotify"
  | "twitch"
  | "zoom";

/**
 * Initiate OAuth login
 * 
 * @param provider - OAuth provider name
 * @param redirectTo - URL to redirect after successful login
 * @returns OAuth URL or error
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo: string = "/dashboard"
): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = createClient();

    // Get current origin for callback
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/api/auth/oauth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          redirect_to: redirectTo,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.url) {
      return { error: "OAuth URL not generated" };
    }

    return { url: data.url };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to initiate OAuth",
    };
  }
}

/**
 * Get available OAuth providers
 * 
 * Returns list of OAuth providers that are configured in Supabase.
 * Note: This requires checking Supabase configuration or API.
 * 
 * @returns Array of available provider names
 */
export function getAvailableOAuthProviders(): OAuthProvider[] {
  // Default list - in production, this could be fetched from API
  // or Supabase configuration
  return [
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
  ];
}

/**
 * Check if OAuth provider is configured
 * 
 * @param provider - OAuth provider name
 * @returns true if provider is available
 */
export function isOAuthProviderAvailable(provider: OAuthProvider): boolean {
  return getAvailableOAuthProviders().includes(provider);
}
