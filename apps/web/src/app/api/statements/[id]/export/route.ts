import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { id } = await params;

    const { data: statement, error } = await supabase
      .from("statements")
      .select("*, transactions(*)")
      .eq("id", id)
      .single();

    if (error || !statement) {
      return NextResponse.json(
        { error: "Statement not found" },
        { status: 404 }
      );
    }

    // Check access
    const hasAccess =
      statement.organization_id === user.organizationId ||
      (statement.is_shared &&
        statement.organization_id !== user.organizationId &&
        user.role === "vendor") ||
      (statement.vendor_id === user.organizationId &&
        user.role !== "vendor");

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const format = request.nextUrl.searchParams.get("format") || "csv";

    if (format === "csv") {
      const csv = generateCSV(statement);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="statement-${id}.csv"`,
        },
      });
    }

    return NextResponse.json({ statement });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Database response type (snake_case from Supabase)
interface StatementDB {
  id: string;
  organization_id: string;
  vendor_id: string | null;
  period_start: string;
  period_end: string;
  balance: number;
  currency: string;
  is_shared: boolean;
  transactions?: TransactionDB[];
}

interface TransactionDB {
  id: string;
  statement_id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  reference: string | null;
}

function generateCSV(statement: StatementDB): string {
  const headers = ["Date", "Type", "Description", "Amount", "Reference"];
  const rows = (statement.transactions || []).map((t: TransactionDB) => [
    t.date,
    t.type,
    t.description,
    t.amount,
    t.reference || "",
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell)}"`).join(",")),
  ].join("\n");
}

