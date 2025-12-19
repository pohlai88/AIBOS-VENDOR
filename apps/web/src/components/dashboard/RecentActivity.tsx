import { Card } from "@aibos/ui";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@aibos/shared";

async function fetchRecentActivity() {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();

  // Fetch recent activities from different sources
  const [recentDocuments, recentPayments, recentMessages] = await Promise.all([
    // Recent documents
    supabase
      .from("documents")
      .select("id, name, created_at, category")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((result) => {
        if (user.role === "vendor") {
          return supabase
            .from("documents")
            .select("id, name, created_at, category")
            .or(
              `organization_id.eq.${user.organizationId},and(vendor_id.eq.${user.organizationId},is_shared.eq.true)`
            )
            .order("created_at", { ascending: false })
            .limit(5);
        }
        return result;
      }),

    // Recent payments
    supabase
      .from("payments")
      .select("id, amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((result) => {
        if (user.role === "vendor") {
          return supabase
            .from("payments")
            .select("id, amount, currency, status, created_at")
            .eq("vendor_id", user.organizationId)
            .order("created_at", { ascending: false })
            .limit(5);
        }
        return result;
      }),

    // Recent messages
    supabase
      .from("message_threads")
      .select("id, subject, last_message_at")
      .order("last_message_at", { ascending: false })
      .limit(5)
      .then((result) => {
        if (user.role === "vendor") {
          return supabase
            .from("message_threads")
            .select("id, subject, last_message_at")
            .eq("vendor_id", user.organizationId)
            .order("last_message_at", { ascending: false })
            .limit(5);
        }
        return result;
      }),
  ]);

  // Combine and sort by date
  const activities: Array<{
    type: "document" | "payment" | "message";
    title: string;
    date: string;
    id: string;
  }> = [];

  recentDocuments.data?.forEach((doc) => {
    activities.push({
      type: "document",
      title: doc.name,
      date: doc.created_at,
      id: doc.id,
    });
  });

  recentPayments.data?.forEach((payment) => {
    activities.push({
      type: "payment",
      title: `${payment.currency} ${payment.amount} - ${payment.status}`,
      date: payment.created_at,
      id: payment.id,
    });
  });

  recentMessages.data?.forEach((thread) => {
    activities.push({
      type: "message",
      title: thread.subject || "No Subject",
      date: thread.last_message_at,
      id: thread.id,
    });
  });

  // Sort by date and take top 5
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}

export async function RecentActivity() {
  const activities = await fetchRecentActivity();

  if (activities.length === 0) {
    return (
      <Card title="Recent Activity">
        <p className="text-foreground-muted">No recent activity</p>
      </Card>
    );
  }

  return (
    <Card title="Recent Activity">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={`${activity.type}-${activity.id}`}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {activity.type === "document" && "📄 "}
                {activity.type === "payment" && "💳 "}
                {activity.type === "message" && "💬 "}
                {activity.title}
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                {formatDate(activity.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
