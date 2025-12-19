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
  const supabase = createClient();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Subscribe to real-time updates
    const documentsChannel = supabase
      .channel("dashboard-documents")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
        },
        fetchStats
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel("dashboard-payments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        fetchStats
      )
      .subscribe();

    const statementsChannel = supabase
      .channel("dashboard-statements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "statements",
        },
        fetchStats
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("dashboard-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        fetchStats
      )
      .subscribe();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(statementsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [supabase, fetchStats]);

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
