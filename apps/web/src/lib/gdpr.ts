import { createClient } from "@/lib/supabase/server";
import { logError, logInfo } from "./logger";

export interface UserDataExport {
  user: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
  };
  documents: Array<{
    id: string;
    name: string;
    category: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
  activityLogs: Array<{
    id: string;
    action: string;
    createdAt: string;
  }>;
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<UserDataExport | null> {
  try {
    const supabase = await createClient();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      logError("Failed to fetch user data", userError);
      return null;
    }

    // Get user documents
    const { data: documents } = await supabase
      .from("documents")
      .select("id, name, category, created_at")
      .or(`organization_id.eq.${user.organization_id},created_by.eq.${user.id}`)
      .order("created_at", { ascending: false });

    // Get user payments (if vendor)
    const { data: payments } = await supabase
      .from("payments")
      .select("id, amount, currency, status, created_at")
      .eq("vendor_id", user.organization_id)
      .order("created_at", { ascending: false });

    // Get user messages
    const { data: messages } = await supabase
      .from("messages")
      .select("id, content, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    // Get activity logs
    const { data: activityLogs } = await supabase
      .from("user_activity_logs")
      .select("id, action, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      documents: (documents || []).map((doc) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        createdAt: doc.created_at,
      })),
      payments: (payments || []).map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.created_at,
      })),
      messages: (messages || []).map((message) => ({
        id: message.id,
        content: message.content.substring(0, 100), // Truncate for export
        createdAt: message.created_at,
      })),
      activityLogs: (activityLogs || []).map((log) => ({
        id: log.id,
        action: log.action,
        createdAt: log.created_at,
      })),
    };
  } catch (error) {
    logError("Failed to export user data", error);
    return null;
  }
}

/**
 * Delete user account and all associated data (Right to be forgotten)
 */
export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get user info before deletion
    const { data: user } = await supabase
      .from("users")
      .select("id, email, organization_id")
      .eq("id", userId)
      .single();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete user activity logs
    await supabase.from("user_activity_logs").delete().eq("user_id", userId);

    // 2. Delete user preferences
    await supabase.from("user_preferences").delete().eq("user_id", userId);

    // 3. Anonymize audit logs (keep for compliance, but remove user reference)
    await supabase
      .from("audit_logs")
      .update({ user_id: null })
      .eq("user_id", userId);

    // 4. Delete user record (this will cascade to auth.users via Supabase)
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      logError("Failed to delete user", deleteError);
      return { success: false, error: deleteError.message };
    }

    // 5. Delete auth user (requires admin client)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      logError("Failed to delete auth user", authError);
      // Continue - user record is already deleted
    }

    logInfo("User account deleted", { userId, email: user.email });

    return { success: true };
  } catch (error) {
    logError("Failed to delete user account", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Track privacy policy acceptance
 */
export async function recordPrivacyPolicyAcceptance(
  userId: string,
  version: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("privacy_consents").insert({
      user_id: userId,
      policy_version: version,
      accepted_at: new Date().toISOString(),
    });

    if (error) {
      logError("Failed to record privacy policy acceptance", error);
      return false;
    }

    return true;
  } catch (error) {
    logError("Error recording privacy policy acceptance", error);
    return false;
  }
}

/**
 * Get user consent status
 */
export async function getUserConsentStatus(userId: string): Promise<{
  privacyPolicyAccepted: boolean;
  lastAcceptedVersion?: string;
  lastAcceptedAt?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: consent } = await supabase
      .from("privacy_consents")
      .select("*")
      .eq("user_id", userId)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .single();

    return {
      privacyPolicyAccepted: !!consent,
      lastAcceptedVersion: consent?.policy_version,
      lastAcceptedAt: consent?.accepted_at,
    };
  } catch (error) {
    logError("Failed to get consent status", error);
    return { privacyPolicyAccepted: false };
  }
}
