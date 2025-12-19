import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config for caching
export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Parallel data fetching for better performance
    const [
      documentsResult,
      paymentsResult,
      statementsResult,
      messagesResult,
    ] = await Promise.all([
      // Documents count
      (async () => {
        let documentsQuery = supabase
          .from("documents")
          .select("id", { count: "exact", head: true });

        if (user.role === "vendor") {
          documentsQuery = documentsQuery.or(
            `organization_id.eq.${user.organizationId},and(vendor_id.eq.${user.organizationId},is_shared.eq.true)`
          );
        } else {
          documentsQuery = documentsQuery.or(
            `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active)`
          );
        }

        return documentsQuery;
      })(),

      // Payments total and count
      (async () => {
        let paymentsQuery = supabase
          .from("payments")
          .select("amount, status");

        if (user.role === "vendor") {
          paymentsQuery = paymentsQuery.eq("vendor_id", user.organizationId);
        } else {
          paymentsQuery = paymentsQuery.or(
            `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active)`
          );
        }

        return paymentsQuery;
      })(),

      // Statements count
      (async () => {
        let statementsQuery = supabase
          .from("statements")
          .select("id", { count: "exact", head: true });

        if (user.role === "vendor") {
          statementsQuery = statementsQuery.or(
            `vendor_id.eq.${user.organizationId},and(organization_id.neq.${user.organizationId},is_shared.eq.true)`
          );
        } else {
          statementsQuery = statementsQuery.or(
            `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active)`
          );
        }

        return statementsQuery;
      })(),

      // Unread messages count
      (async () => {
        let threadsQuery = supabase
          .from("message_threads")
          .select("id, last_message_at");

        if (user.role === "vendor") {
          threadsQuery = threadsQuery.eq("vendor_id", user.organizationId);
        } else {
          threadsQuery = threadsQuery.eq("organization_id", user.organizationId);
        }

        const { data: threads } = await threadsQuery;

        if (!threads || threads.length === 0) {
          return { count: 0 };
        }

        // Count unread messages (messages not read by current user)
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in(
            "thread_id",
            threads.map((t) => t.id)
          )
          .neq("sender_id", user.id)
          .is("read_at", null);

        return { count: count || 0 };
      })(),
    ]);

    // Process results
    const documentsCount = documentsResult.count || 0;

    const paymentsData = paymentsResult.data || [];
    const totalPayments = paymentsData.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    const paymentsCount = paymentsData.length;

    const statementsCount = statementsResult.count || 0;

    const unreadMessages = messagesResult.count || 0;

    return createSuccessResponse({
      documents: {
        count: documentsCount,
      },
      payments: {
        count: paymentsCount,
        total: totalPayments,
      },
      statements: {
        count: statementsCount,
      },
      messages: {
        unread: unreadMessages,
      },
    });
  } catch (error) {
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error: String(error) };

    logError("[Dashboard Stats API Error]", error, {
      ...errorDetails,
      path: "/api/dashboard/stats",
    });

    return createErrorResponse(
      new Error("Failed to fetch dashboard stats"),
      500,
      "DASHBOARD_STATS_ERROR"
    );
  }
}
