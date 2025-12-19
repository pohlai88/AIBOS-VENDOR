import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, statementCreateSchema } from "@/lib/validation";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes for statements
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get("vendorId");
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    let query = supabase
      .from("statements")
      .select("id, organization_id, vendor_id, period_start, period_end, balance, currency, is_shared, created_at, updated_at, transactions(id, type, amount, description, date, reference)", { count: "exact" })
      .eq("tenant_id", user.tenantId) // Explicit tenant filter
      .order("period_start", { ascending: false });

    // Apply filters based on user role and access
    if (user.role === "vendor") {
      // Vendors can see their own statements + shared company statements
      query = query.or(
        `vendor_id.eq.${user.organizationId},and(organization_id.neq.${user.organizationId},is_shared.eq.true)`
      );
    } else {
      // Company users can see all statements in their org + vendor statements
      query = query.or(
        `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active and tenant_id.eq.${user.tenantId})`
      );
    }

    if (vendorId && user.role !== "vendor") {
      query = query.eq("vendor_id", vendorId);
    }

    if (periodStart) {
      query = query.gte("period_start", periodStart);
    }

    if (periodEnd) {
      query = query.lte("period_end", periodEnd);
    }

    const { data, error } = await query;

    if (error) {
      logError("[Statements API GET Error]", error, {
        userId: user.id,
      });
      return createErrorResponse(new Error("Failed to fetch statements"), 400, "QUERY_ERROR");
    }

    return createSuccessResponse({ statements: data || [] });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Statements API GET Error]", error, {
      ...errorDetails,
      path: "/api/statements",
    });

    return createErrorResponse(
      new Error("Failed to fetch statements"),
      500,
      "STATEMENTS_FETCH_ERROR"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === "vendor") {
      return createErrorResponse(
        new Error("Vendors cannot create statements"),
        403,
        "FORBIDDEN"
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const validatedBody = await validateRequest(statementCreateSchema, body);

    const { data: statement, error } = await supabase
      .from("statements")
      .insert({
        organization_id: user.organizationId,
        tenant_id: user.tenantId, // Required for multi-tenant
        vendor_id: validatedBody.vendorId || null,
        period_start: validatedBody.periodStart,
        period_end: validatedBody.periodEnd,
        balance: validatedBody.balance || 0,
        currency: validatedBody.currency || "USD",
        is_shared: validatedBody.isShared || false,
      })
      .select()
      .single();

    if (error) {
      return createErrorResponse(
        new Error(error.message),
        400,
        "STATEMENT_CREATE_ERROR"
      );
    }

    // Add transactions if provided
    if (validatedBody.transactions && validatedBody.transactions.length > 0) {
      const transactions = validatedBody.transactions.map((t) => ({
        statement_id: statement.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        reference: t.reference || null,
      }));

      await supabase.from("transactions").insert(transactions);
    }

    // Revalidate cache after creating statement
    revalidateTag("statements", "max");

    return createSuccessResponse({ statement });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Statements API POST Error]", error, {
      ...errorDetails,
      path: "/api/statements",
    });

    return createErrorResponse(
      new Error("Failed to create statement"),
      500,
      "STATEMENT_CREATE_ERROR"
    );
  }
}

