/**
 * OAuth Login Buttons Component
 * 
 * Provides OAuth login buttons for the login page.
 * Uses Supabase OAuth implementation.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithOAuth, type OAuthProvider } from "@/lib/auth/oauth";
import { Button } from "@aibos/ui";

interface OAuthButtonsProps {
  redirectTo?: string;
  providers?: OAuthProvider[];
}

/**
 * OAuth Login Buttons
 * 
 * Displays OAuth login buttons for configured providers.
 */
export function OAuthButtons({
  redirectTo = "/dashboard",
  providers = ["google", "github"]
}: OAuthButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoading(provider);
    setError(null);

    try {
      const result = await signInWithOAuth(provider, redirectTo);

      if ("error" in result) {
        setError(`Failed to sign in with ${provider}: ${result.error}`);
        setLoading(null);
        return;
      }

      // Redirect to OAuth provider
      if ("url" in result) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
      setLoading(null);
    }
  };

  const providerLabels: Record<OAuthProvider, string> = {
    google: "Google",
    github: "GitHub",
    azure: "Azure AD",
    apple: "Apple",
    facebook: "Facebook",
    twitter: "Twitter",
    discord: "Discord",
    bitbucket: "Bitbucket",
    gitlab: "GitLab",
    linkedin: "LinkedIn",
    notion: "Notion",
    slack: "Slack",
    spotify: "Spotify",
    twitch: "Twitch",
    zoom: "Zoom",
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background-elevated text-foreground-muted">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin(provider)}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === provider ? (
              <span>Connecting...</span>
            ) : (
              <span>{providerLabels[provider] || provider}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
