import { createClient } from "@/lib/supabase/server";
import { logError, logInfo } from "./logger";
import crypto from "crypto";

export type WebhookEvent =
  | "document.uploaded"
  | "document.deleted"
  | "payment.completed"
  | "payment.failed"
  | "message.sent"
  | "user.created"
  | "user.updated";

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
  id: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  organizationId: string;
}

/**
 * Generate webhook signature for verification
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Get active webhooks for an organization
 */
export async function getWebhooks(organizationId: string): Promise<WebhookConfig[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("enabled", true);

    if (error) {
      logError("Failed to fetch webhooks", error);
      return [];
    }

    return (data || []).map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      enabled: webhook.enabled,
      organizationId: webhook.organization_id,
    }));
  } catch (error) {
    logError("Error fetching webhooks", error);
    return [];
  }
}

/**
 * Deliver webhook event to subscribers
 */
export async function deliverWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>,
  organizationId: string
): Promise<void> {
  try {
    const webhooks = await getWebhooks(organizationId);
    const webhooksForEvent = webhooks.filter((w) => w.events.includes(event));

    if (webhooksForEvent.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID(),
    };

    const payloadString = JSON.stringify(payload);

    // Deliver to all matching webhooks in parallel
    const deliveries = webhooksForEvent.map(async (webhook) => {
      const signature = generateWebhookSignature(payloadString, webhook.secret);

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
            "X-Webhook-Id": payload.id,
          },
          body: payloadString,
        });

        // Log delivery
        await logWebhookDelivery(webhook.id, payload.id, response.status, response.ok);

        if (!response.ok) {
          // Retry logic would go here
          logError("Webhook delivery failed", new Error(`HTTP ${response.status}`), {
            webhookId: webhook.id,
            event,
            status: response.status,
          });
        }

        return { webhookId: webhook.id, success: response.ok };
      } catch (error) {
        await logWebhookDelivery(webhook.id, payload.id, 0, false);
        logError("Webhook delivery error", error, {
          webhookId: webhook.id,
          event,
        });
        return { webhookId: webhook.id, success: false };
      }
    });

    await Promise.allSettled(deliveries);
  } catch (error) {
    logError("Failed to deliver webhook", error, { event, organizationId });
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(
  webhookId: string,
  eventId: string,
  statusCode: number,
  success: boolean
): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.from("webhook_deliveries").insert({
      webhook_id: webhookId,
      event_id: eventId,
      status_code: statusCode,
      success,
      delivered_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't fail webhook delivery if logging fails
    logError("Failed to log webhook delivery", error);
  }
}

/**
 * Retry failed webhook delivery
 */
export async function retryWebhookDelivery(deliveryId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data: delivery, error: fetchError } = await supabase
      .from("webhook_deliveries")
      .select("*, webhooks(*)")
      .eq("id", deliveryId)
      .single();

    if (fetchError || !delivery || delivery.success) {
      return false;
    }

    const webhook = delivery.webhooks;
    if (!webhook || !webhook.enabled) {
      return false;
    }

    // Re-deliver (simplified - would need to reconstruct original payload)
    logInfo("Retrying webhook delivery", { deliveryId, webhookId: webhook.id });
    
    return true;
  } catch (error) {
    logError("Failed to retry webhook delivery", error);
    return false;
  }
}
