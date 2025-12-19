import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { id } = await params;

    const { data: payment, error } = await supabase
      .from("payments")
      .select("id, organization_id, vendor_id, invoice_id, amount, currency, status, method, transaction_id, paid_at, due_date, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !payment) {
      return createErrorResponse(
        new Error("Payment not found"),
        404,
        "PAYMENT_NOT_FOUND"
      );
    }

    // Check access
    const hasAccess =
      payment.organization_id === user.organizationId ||
      payment.vendor_id === user.organizationId;

    if (!hasAccess) {
      return createErrorResponse(
        new Error("Access denied"),
        403,
        "ACCESS_DENIED"
      );
    }

    return createSuccessResponse({ payment });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Payments API GET by ID Error]", error, {
      ...errorDetails,
      path: "/api/payments/[id]",
    });

    return createErrorResponse(
      new Error("Failed to fetch payment"),
      500,
      "PAYMENT_FETCH_ERROR"
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role === "vendor") {
      return createErrorResponse(
        new Error("Vendors cannot update payments"),
        403,
        "FORBIDDEN"
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { id } = await params;

    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        status: body.status,
        transaction_id: body.transactionId,
        paid_at: body.paidAt,
      })
      .eq("id", id)
      .eq("organization_id", user.organizationId)
      .select()
      .single();

    if (error) {
      logError("[Payments API PATCH Error]", error, {
        paymentId: id,
        userId: user.id,
      });
      return createErrorResponse(
        new Error("Failed to update payment"),
        400,
        "PAYMENT_UPDATE_ERROR"
      );
    }

    // Revalidate cache after update
    revalidateTag("payments", "max");

    // Send email notification to vendor (if payment status changed)
    if (payment && body.status) {
      const { sendPaymentUpdateEmail } = await import("@/lib/email-notifications");
      // Send to vendor if they exist
      if (payment.vendor_id) {
        sendPaymentUpdateEmail(payment.vendor_id, {
          amount: `${payment.currency || "USD"} ${payment.amount}`,
          status: payment.status,
          paymentId: payment.id,
          link: `/payments/${payment.id}`,
        }).catch((error) => {
          // Log but don't fail the request
          logError("[Email] Payment update notification failed", error, {
            paymentId: payment.id,
            vendorId: payment.vendor_id,
          });
        });
      }
    }

    return createSuccessResponse({ payment });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Payments API PATCH Error]", error, {
      ...errorDetails,
      path: "/api/payments/[id]",
    });

    return createErrorResponse(
      new Error("Failed to update payment"),
      500,
      "PAYMENT_UPDATE_ERROR"
    );
  }
}

