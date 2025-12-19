import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
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

    let query = supabase.from("payments").select("*");

    // Apply filters based on user role and access
    if (user.role === "vendor") {
      query = query.eq("vendor_id", user.organizationId);
    } else {
      query = query.or(
        `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active)`
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

    const { data: payments, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const csv = generateCSV((payments as PaymentDB[]) || []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="payments-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Database response type (snake_case from Supabase)
interface PaymentDB {
  id: string;
  vendor_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  due_date: string;
  paid_at: string | null;
  transaction_id: string | null;
}

function generateCSV(payments: PaymentDB[]): string {
  const headers = [
    "ID",
    "Vendor ID",
    "Amount",
    "Currency",
    "Status",
    "Method",
    "Due Date",
    "Paid At",
    "Transaction ID",
  ];
  const rows = payments.map((p) => [
    p.id,
    p.vendor_id,
    p.amount,
    p.currency,
    p.status,
    p.method,
    p.due_date,
    p.paid_at || "",
    p.transaction_id || "",
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell)}"`).join(",")),
  ].join("\n");
}

