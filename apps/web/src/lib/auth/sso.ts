import { createClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/logger";
import { logAuthEvent } from "@/lib/audit-log";

export interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oauth" | "oidc";
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Get available SSO providers for an organization
 */
export async function getSSOProviders(organizationId: string): Promise<SSOProvider[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sso_providers")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("enabled", true);

    if (error) {
      logError("Failed to fetch SSO providers", error);
      return [];
    }

    return (data || []).map((provider) => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      enabled: provider.enabled,
      metadata: provider.metadata,
    }));
  } catch (error) {
    logError("Error fetching SSO providers", error);
    return [];
  }
}

/**
 * Initiate SSO login flow
 */
export async function initiateSSO(providerId: string, returnUrl?: string): Promise<{ redirectUrl: string } | null> {
  try {
    const supabase = await createClient();

    // Get provider configuration
    const { data: provider, error: providerError } = await supabase
      .from("sso_providers")
      .select("*")
      .eq("id", providerId)
      .eq("enabled", true)
      .single();

    if (providerError || !provider) {
      logError("SSO provider not found or disabled", providerError);
      return null;
    }

    // Generate SSO request ID for tracking
    const requestId = crypto.randomUUID();

    // Store SSO request in session/cache
    await supabase
      .from("sso_requests")
      .insert({
        id: requestId,
        provider_id: providerId,
        return_url: returnUrl || "/dashboard",
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

    // Build redirect URL based on provider type
    let redirectUrl: string;

    if (provider.type === "saml") {
      redirectUrl = `/api/auth/saml/initiate?provider=${providerId}&request_id=${requestId}`;
    } else {
      redirectUrl = `/api/auth/sso/initiate?provider=${providerId}&request_id=${requestId}`;
    }

    logInfo("SSO login initiated", { providerId, requestId });

    return { redirectUrl };
  } catch (error) {
    logError("Failed to initiate SSO", error);
    return null;
  }
}

/**
 * Handle SSO callback and create/update user
 */
export async function handleSSOCallback(
  providerId: string,
  requestId: string,
  samlResponse?: string,
  oauthCode?: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify SSO request
    const { data: request, error: requestError } = await supabase
      .from("sso_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !request || new Date(request.expires_at) < new Date()) {
      return { success: false, error: "Invalid or expired SSO request" };
    }

    // Get provider configuration
    const { data: provider, error: providerError } = await supabase
      .from("sso_providers")
      .select("*")
      .eq("id", providerId)
      .single();

    if (providerError || !provider) {
      return { success: false, error: "SSO provider not found" };
    }

    // Process authentication based on provider type
    let userInfo: { email: string; name?: string; attributes?: Record<string, unknown> };

    if (provider.type === "saml" && samlResponse) {
      // Process SAML response (would use @node-saml/node-saml)
      // This is a placeholder - actual SAML processing would go here
      userInfo = await processSAMLResponse(provider, samlResponse);
    } else if (oauthCode) {
      // Process OAuth/OIDC code
      userInfo = await processOAuthCode(provider, oauthCode);
    } else {
      return { success: false, error: "Invalid authentication response" };
    }

    // JIT (Just-In-Time) user provisioning
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, organization_id")
      .eq("email", userInfo.email)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user via Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userInfo.email,
        email_confirm: true,
        user_metadata: {
          name: userInfo.name,
          sso_provider: providerId,
          ...userInfo.attributes,
        },
      });

      if (authError || !authUser.user) {
        return { success: false, error: "Failed to create user" };
      }

      // Create user record in users table
      // Note: This would need organization_id from provider config or mapping
      const { error: userError } = await supabase.from("users").insert({
        id: authUser.user.id,
        email: userInfo.email,
        role: "company_user", // Default role, can be mapped from IdP
        organization_id: provider.organization_id,
      });

      if (userError) {
        return { success: false, error: "Failed to create user record" };
      }

      userId = authUser.user.id;
    }

    // Log successful SSO login
    await logAuthEvent("login", userId, undefined, undefined, {
      method: "sso",
      provider: providerId,
    });

    // Clean up SSO request
    await supabase.from("sso_requests").delete().eq("id", requestId);

    return { success: true, userId };
  } catch (error) {
    logError("SSO callback error", error);
    return { success: false, error: "SSO authentication failed" };
  }
}

/**
 * Process SAML response
 * 
 * NOTE: Full SAML implementation requires @node-saml/node-saml package.
 * To enable SAML:
 * 1. Install: npm install @node-saml/node-saml
 * 2. Configure SAML provider metadata in sso_providers table
 * 3. Uncomment and configure the SAML processing code below
 */
async function processSAMLResponse(
  provider: { metadata: Record<string, unknown> },
  samlResponse: string
): Promise<{ email: string; name?: string; attributes?: Record<string, unknown> }> {
  try {
    const { SAML } = await import("@node-saml/node-saml");

    const saml = new SAML({
      callbackUrl: provider.metadata.callbackUrl as string,
      entryPoint: provider.metadata.entryPoint as string,
      issuer: provider.metadata.issuer as string,
      idpCert: provider.metadata.cert as string,
      // Additional SAML configuration from metadata
    });

    const result = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse });

    if (!result.profile) {
      throw new Error("SAML response did not contain a user profile");
    }

    const profile = result.profile;

    return {
      email: (profile.email as string) || (profile.nameID as string) || "",
      name: (profile.name as string) || (profile.displayName as string) || undefined,
      attributes: profile as Record<string, unknown>,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("SAML authentication requires")) {
      throw error;
    }
    logError("SAML processing error", error);
    throw new Error("Failed to process SAML response");
  }
}

/**
 * Process OAuth/OIDC code
 * 
 * NOTE: OAuth/OIDC implementation requires provider-specific configuration.
 * This is a basic implementation that can be extended for specific providers.
 */
async function processOAuthCode(
  provider: { metadata: Record<string, unknown> },
  code: string
): Promise<{ email: string; name?: string; attributes?: Record<string, unknown> }> {
  try {
    const clientId = provider.metadata.clientId as string;
    const clientSecret = provider.metadata.clientSecret as string;
    const tokenUrl = provider.metadata.tokenUrl as string;
    const userInfoUrl = provider.metadata.userInfoUrl as string;
    const redirectUri = provider.metadata.redirectUri as string;

    if (!clientId || !clientSecret || !tokenUrl || !userInfoUrl) {
      throw new Error("OAuth provider configuration incomplete");
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("No access token received");
    }

    // Fetch user info using access token
    const userInfoResponse = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfo = await userInfoResponse.json();

    return {
      email: userInfo.email || userInfo.sub || "",
      name: userInfo.name || userInfo.display_name || userInfo.preferred_username || undefined,
      attributes: userInfo as Record<string, unknown>,
    };
  } catch (error) {
    logError("OAuth processing error", error);
    throw new Error(
      error instanceof Error
        ? `OAuth authentication failed: ${error.message}`
        : "OAuth authentication failed"
    );
  }
}
