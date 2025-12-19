import { createClient } from "@/lib/supabase/server";
import { logError, logInfo } from "./logger";

export interface RetentionPolicy {
  resourceType: "audit_logs" | "user_activity_logs" | "documents" | "messages" | "analytics";
  retentionDays: number;
  enabled: boolean;
}

/**
 * Default retention policies (in days)
 */
export const DEFAULT_RETENTION_POLICIES: Record<string, number> = {
  audit_logs: 2555, // 7 years
  user_activity_logs: 365, // 1 year
  documents: 0, // Never delete (configurable per organization)
  messages: 730, // 2 years
  analytics: 365, // 1 year
};

/**
 * Clean up data based on retention policies
 */
export async function cleanupExpiredData(
  resourceType: RetentionPolicy["resourceType"],
  retentionDays: number
): Promise<{ deleted: number; error?: string }> {
  try {
    const supabase = await createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deleted = 0;
    let error: string | undefined;

    switch (resourceType) {
      case "audit_logs":
        const { count: auditCount, error: auditError } = await supabase
          .from("audit_logs")
          .delete({ count: "exact" })
          .lt("created_at", cutoffDate.toISOString());

        deleted = auditCount ?? 0;
        if (auditError) error = auditError.message;
        break;

      case "user_activity_logs":
        const { count: activityCount, error: activityError } = await supabase
          .from("user_activity_logs")
          .delete({ count: "exact" })
          .lt("created_at", cutoffDate.toISOString());

        deleted = activityCount ?? 0;
        if (activityError) error = activityError.message;
        break;

      case "messages":
        // Only delete messages older than retention period
        // Keep threads for context
        const { count: messageCount, error: messageError } = await supabase
          .from("messages")
          .delete({ count: "exact" })
          .lt("created_at", cutoffDate.toISOString());

        deleted = messageCount ?? 0;
        if (messageError) error = messageError.message;
        break;

      case "analytics":
        // Analytics cleanup would depend on your analytics storage
        // This is a placeholder
        logInfo("Analytics cleanup not implemented", { resourceType, retentionDays });
        break;

      case "documents":
        // Documents are never deleted by default (retentionDays = 0)
        // Organizations can configure their own retention
        logInfo("Document retention is organization-specific", { resourceType });
        break;
    }

    if (error) {
      logError(`Failed to cleanup ${resourceType}`, new Error(error), {
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
      });
      return { deleted, error };
    }

    logInfo(`Cleaned up ${deleted} ${resourceType} records`, {
      resourceType,
      retentionDays,
      cutoffDate: cutoffDate.toISOString(),
    });

    return { deleted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Error cleaning up ${resourceType}`, error, {
      retentionDays,
    });
    return { deleted: 0, error: errorMessage };
  }
}

/**
 * Run all retention policy cleanups
 */
export async function runRetentionCleanup(): Promise<{
  results: Record<string, { deleted: number; error?: string }>;
}> {
  const results: Record<string, { deleted: number; error?: string }> = {};

  for (const [resourceType, retentionDays] of Object.entries(DEFAULT_RETENTION_POLICIES)) {
    if (retentionDays > 0) {
      results[resourceType] = await cleanupExpiredData(
        resourceType as RetentionPolicy["resourceType"],
        retentionDays
      );
    }
  }

  return { results };
}

/**
 * Get organization-specific retention policy
 */
export async function getOrganizationRetentionPolicy(
  organizationId: string
): Promise<RetentionPolicy[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("organization_retention_policies")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("enabled", true);

    if (error) {
      logError("Failed to fetch retention policies", error);
      return [];
    }

    return (data || []).map((policy) => ({
      resourceType: policy.resource_type,
      retentionDays: policy.retention_days,
      enabled: policy.enabled,
    }));
  } catch (error) {
    logError("Error fetching retention policies", error);
    return [];
  }
}
