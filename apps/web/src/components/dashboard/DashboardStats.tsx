import { Suspense } from "react";
import { DashboardStatsSkeleton } from "./DashboardStatsSkeleton";
import { DashboardStatsClient } from "./DashboardStatsClient";
import { getDashboardStats } from "@/lib/data-fetching";

/**
 * Server Component: DashboardStats
 * Follows Next.js 16 best practices:
 * - Direct database access (no API route call)
 * - Parallel data fetching
 * - Proper Suspense boundaries
 */
async function DashboardStatsContent() {
  // Use direct database access with parallel fetching (best practice)
  const stats = await getDashboardStats();

  return <DashboardStatsClient initialStats={stats} />;
}

export function DashboardStats() {
  return (
    <Suspense fallback={<DashboardStatsSkeleton />}>
      <DashboardStatsContent />
    </Suspense>
  );
}
