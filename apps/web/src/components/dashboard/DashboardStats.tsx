import { Suspense } from "react";
import { DashboardStatsSkeleton } from "./DashboardStatsSkeleton";
import { DashboardStatsClient } from "./DashboardStatsClient";
import { getAppUrl } from "@/lib/env";
import type { DashboardStatsResponse } from "@/types/api";

async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await fetch(`${getAppUrl()}/api/dashboard/stats`, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ["dashboard-stats"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  const data = await response.json();
  return data;
}

async function DashboardStatsContent() {
  const stats = await fetchDashboardStats();

  return <DashboardStatsClient initialStats={stats} />;
}

export function DashboardStats() {
  return (
    <Suspense fallback={<DashboardStatsSkeleton />}>
      <DashboardStatsContent />
    </Suspense>
  );
}
