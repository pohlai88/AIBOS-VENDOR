import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";
import { logDataModification } from "@/lib/audit-log";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/webhooks/:id - Update webhook
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Only admins can update webhooks
    if (user.role !== "company_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.url !== undefined) updates.url = body.url;
    if (body.events !== undefined) updates.events = body.events;
    if (body.enabled !== undefined) updates.enabled = body.enabled;

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .update(updates)
      .eq("id", id)
      .eq("organization_id", user.organizationId)
      .select()
      .single();

    if (error || !webhook) {
      return NextResponse.json(
        { error: "Webhook not found or update failed" },
        { status: 404 }
      );
    }

    await logDataModification(
      "update",
      "webhook",
      id,
      user.id,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
      request.headers.get("user-agent") || undefined
    );

    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        enabled: webhook.enabled,
        updated_at: webhook.updated_at,
      },
    });
  } catch (error) {
    logError("Failed to update webhook", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/:id - Delete webhook
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Only admins can delete webhooks
    if (user.role !== "company_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", id)
      .eq("organization_id", user.organizationId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete webhook" },
        { status: 500 }
      );
    }

    await logDataModification(
      "delete",
      "webhook",
      id,
      user.id,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
      request.headers.get("user-agent") || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to delete webhook", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
