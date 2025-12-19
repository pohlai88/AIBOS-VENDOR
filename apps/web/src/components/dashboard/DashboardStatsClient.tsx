"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DashboardStatsResponse } from "@/types/api";

export function DashboardStatsClient({
  initialStats,
}: {
  initialStats: DashboardStatsResponse;
}) {
  const [stats, setStats] = useState(initialStats);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [, setConnectionStatus] = useState<"connected" | "disconnected" | "error">("disconnected");
  const supabase = createClient();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current user's tenant and organization IDs
  useEffect(() => {
    const fetchUserContext = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: user } = await supabase
          .from("users")
          .select("tenant_id, organization_id")
          .eq("id", authUser.id)
          .single();

        if (user) {
          setTenantId(user.tenant_id);
          setOrganizationId(user.organization_id);
        }
      }
    };
    fetchUserContext();
  }, [supabase]);

  // Debounced fetch function to avoid multiple rapid API calls
  const fetchStats = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          if (data.documents || data.payments || data.statements || data.messages) {
            setStats(data);
          }
        }
      } catch (error) {
        // Use proper error tracking instead of console.error
        try {
          const { trackError } = await import("@/lib/analytics");
          trackError(error instanceof Error ? error : new Error(String(error)), {
            context: "DashboardStatsClient",
          });
        } catch {
          // Fallback if analytics fails
          console.error("Dashboard stats fetch error:", error);
        }
      }
    }, 500); // Debounce by 500ms
  }, []);

  useEffect(() => {
    if (!tenantId || !organizationId) return;

    // Fetch initial stats
    fetchStats();

    // ✅ Single channel for all dashboard updates (instead of 4 separate channels)
    const channel = supabase
      .channel(`tenant:${tenantId}:org:${organizationId}:dashboard`, {
        config: { private: true } // ✅ Private channel with RLS
      })
      .on("broadcast", { event: "stats_invalidated" }, () => {
        // Debounced refetch (already implemented)
        fetchStats();
      })
      .subscribe((status) => {
        // ✅ Handle subscription status
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("error");
          console.error("Failed to subscribe to dashboard updates:", status);
          // Could implement retry logic here
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected");
        }
      });

    // Fetch on tab focus (reliability pattern)
    const handleFocus = () => {
      fetchStats();
    };
    window.addEventListener("focus", handleFocus);

    // Optional: Slow polling catch-up (every 60s) for reliability
    const pollingInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    }, 60000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(pollingInterval);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchStats, tenantId, organizationId]);

  // Render stats using the same component structure
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-background-elevated border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground-muted mb-2">Documents</h3>
        <p className="text-4xl font-bold text-primary-400">
          {stats.documents?.count || 0}
        </p>
        <p className="text-sm text-foreground-muted mt-2">Total documents</p>
      </div>

      <div className="bg-background-elevated border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground-muted mb-2">Payments</h3>
        <p className="text-4xl font-bold text-success-400">
          ${stats.payments?.total?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}
        </p>
        <p className="text-sm text-foreground-muted mt-2">
          Total payments ({stats.payments?.count || 0})
        </p>
      </div>

      <div className="bg-background-elevated border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground-muted mb-2">Statements</h3>
        <p className="text-4xl font-bold text-info-400">
          {stats.statements?.count || 0}
        </p>
        <p className="text-sm text-foreground-muted mt-2">Active statements</p>
      </div>

      <div className="bg-background-elevated border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground-muted mb-2">Messages</h3>
        <p className="text-4xl font-bold text-warning-400">
          {stats.messages?.unread || 0}
        </p>
        <p className="text-sm text-foreground-muted mt-2">Unread messages</p>
      </div>
    </div>
  );
}
