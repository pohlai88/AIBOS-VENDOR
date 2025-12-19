import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@aibos/ui";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";

// Force dynamic rendering since this page requires authentication and API calls
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Vendor portal dashboard with overview of documents, payments, statements, and messages",
  openGraph: {
    title: "Dashboard",
    description: "Vendor portal dashboard with overview of documents, payments, statements, and messages",
  },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-foreground mb-8 font-normal">Dashboard</h1>

      {/* Dashboard Stats with Suspense for streaming */}
      <div className="mb-8">
        <DashboardStats />
      </div>

      {/* Recent Activity and Quick Actions with parallel loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <Card title="Recent Activity">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
        <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
        <div className="h-4 bg-secondary-700 rounded w-5/6"></div>
      </div>
    </Card>
  );
}

