import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { logError } from "@/lib/logger";

const preferencesSchema = z.object({
  preferences: z.object({
    emailNotifications: z.boolean(),
    emailPaymentUpdates: z.boolean(),
    emailDocumentUpdates: z.boolean(),
    emailMessageNotifications: z.boolean(),
  }),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" - that's okay, we'll return defaults
      logError("[Preferences GET Error]", error, {
        userId: user.id,
        path: "/api/auth/preferences",
      });
    }

    const preferences = data || {
      email_notifications: true,
      email_payment_updates: true,
      email_document_updates: true,
      email_message_notifications: true,
    };

    return createSuccessResponse({
      preferences: {
        emailNotifications: preferences.email_notifications ?? true,
        emailPaymentUpdates: preferences.email_payment_updates ?? true,
        emailDocumentUpdates: preferences.email_document_updates ?? true,
        emailMessageNotifications: preferences.email_message_notifications ?? true,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { preferences } = await preferencesSchema.parseAsync(body);

    const supabase = await createClient();

    // Upsert preferences
    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          email_notifications: preferences.emailNotifications,
          email_payment_updates: preferences.emailPaymentUpdates,
          email_document_updates: preferences.emailDocumentUpdates,
          email_message_notifications: preferences.emailMessageNotifications,
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      logError("[Preferences POST Error]", error, {
        userId: user.id,
        path: "/api/auth/preferences",
      });
      return createErrorResponse(
        new Error("Failed to save preferences"),
        500,
        "SAVE_ERROR"
      );
    }

    return createSuccessResponse({
      message: "Preferences saved successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
