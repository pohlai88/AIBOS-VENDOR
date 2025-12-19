import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { validateRequest, paymentCreateSchema } from "@/lib/validation";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes for payments
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("payments")
      .select("id, organization_id, vendor_id, invoice_id, amount, currency, status, method, transaction_id, paid_at, due_date, created_at, updated_at", { count: "exact" })
      .eq("tenant_id", user.tenantId) // Explicit tenant filter
      .order("created_at", { ascending: false });

    // Apply filters based on user role and access
    if (user.role === "vendor") {
      // Vendors can see their own payments
      query = query.eq("vendor_id", user.organizationId);
    } else {
      // Company users can see all payments in their org + vendor payments
      query = query.or(
        `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active and tenant_id.eq.${user.tenantId})`
      );
    }

    if (vendorId && user.role !== "vendor") {
      query = query.eq("vendor_id", vendorId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("due_date", startDate);
    }

    if (endDate) {
      query = query.lte("due_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      logError("[Payments API GET Error]", error, {
        userId: user.id,
      });
      return createErrorResponse(new Error("Failed to fetch payments"), 400, "QUERY_ERROR");
    }

    return createSuccessResponse({ payments: data || [] });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Payments API GET Error]", error, {
      ...errorDetails,
      path: "/api/payments",
    });

    return createErrorResponse(
      new Error("Failed to fetch payments"),
      500,
      "PAYMENTS_FETCH_ERROR"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === "vendor") {
      return createErrorResponse(
        new Error("Vendors cannot create payments"),
        403,
        "FORBIDDEN"
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const validatedBody = await validateRequest(paymentCreateSchema, body);

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        organization_id: user.organizationId,
        tenant_id: user.tenantId, // Required for multi-tenant
        vendor_id: validatedBody.vendorId,
        invoice_id: validatedBody.invoiceId || null,
        amount: validatedBody.amount,
        currency: validatedBody.currency || "USD",
        status: validatedBody.status || "pending",
        method: validatedBody.method,
        transaction_id: validatedBody.transactionId || null,
        paid_at: validatedBody.paidAt || null,
        due_date: validatedBody.dueDate,
      })
      .select()
      .single();

    if (error) {
      logError("[Payments API POST Error]", error, {
        userId: user.id,
      });
      return createErrorResponse(
        new Error("Failed to create payment"),
        400,
        "PAYMENT_CREATE_ERROR"
      );
    }

    // Revalidate cache after creating payment
    revalidateTag("payments", "max");

    // Send email notification to vendor
    if (payment && validatedBody.vendorId) {
      const { sendPaymentUpdateEmail } = await import("@/lib/email-notifications");
      sendPaymentUpdateEmail(validatedBody.vendorId, {
        amount: `${payment.currency || "USD"} ${payment.amount}`,
        status: payment.status,
        paymentId: payment.id,
        link: `/payments/${payment.id}`,
      }).catch((error) => {
        // Log but don't fail the request
        logError("[Email] Payment creation notification failed", error, {
          paymentId: payment.id,
          vendorId: validatedBody.vendorId,
        });
      });
    }

    // Trigger webhook for payment creation
    if (payment) {
      const { deliverWebhook } = await import("@/lib/webhooks");
      deliverWebhook("payment.completed", {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        vendorId: payment.vendor_id,
        organizationId: user.organizationId,
      }, user.organizationId).catch((error) => {
        logError("[Webhook] Payment webhook failed", error, {
          paymentId: payment.id,
        });
      });
    }

    return createSuccessResponse({ payment });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Payments API POST Error]", error, {
      ...errorDetails,
      path: "/api/payments",
    });

    return createErrorResponse(
      new Error("Failed to create payment"),
      500,
      "PAYMENT_CREATE_ERROR"
    );
  }
}

