import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";
import { logDataModification } from "@/lib/audit-log";
import crypto from "crypto";

/**
 * GET /api/webhooks - List webhooks for organization
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("organization_id", user.organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch webhooks" },
        { status: 500 }
      );
    }

    // Don't return secrets
    const sanitizedWebhooks = (webhooks || []).map((w) => ({
      id: w.id,
      url: w.url,
      events: w.events,
      enabled: w.enabled,
      created_at: w.created_at,
      updated_at: w.updated_at,
    }));

    return NextResponse.json({ webhooks: sanitizedWebhooks });
  } catch (error) {
    logError("Failed to list webhooks", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks - Create new webhook
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Only admins can create webhooks
    if (user.role !== "company_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url, events } = body;

    if (!url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "URL and events are required" },
        { status: 400 }
      );
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString("hex");

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .insert({
        organization_id: user.organizationId,
        url,
        events,
        secret,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      logError("Failed to create webhook", error);
      return NextResponse.json(
        { error: "Failed to create webhook" },
        { status: 500 }
      );
    }

    await logDataModification(
      "create",
      "webhook",
      webhook.id,
      user.id,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
      request.headers.get("user-agent") || undefined
    );

    // Return webhook with secret (only shown once)
    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        enabled: webhook.enabled,
        secret, // Include secret for initial setup
        created_at: webhook.created_at,
      },
    });
  } catch (error) {
    logError("Failed to create webhook", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
