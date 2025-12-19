import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { validateRequest, messageCreateSchema } from "@/lib/validation";

// Route segment config - messages are real-time, no caching
export const dynamic = "force-dynamic";
export const revalidate = 0; // Real-time data, no cache

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      // Get message threads
      let query = supabase
        .from("message_threads")
        .select("id, organization_id, vendor_id, subject, last_message_at, created_at, updated_at", { count: "exact" })
        .order("last_message_at", { ascending: false });

      if (user.role === "vendor") {
        query = query.eq("vendor_id", user.organizationId);
      } else {
        query = query.eq("organization_id", user.organizationId);
      }

      const { data: threads, error } = await query;

      if (error) {
        logError("[Messages API GET Error]", error, {
          userId: user.id,
        });
        return createErrorResponse(new Error("Failed to fetch threads"), 400, "QUERY_ERROR");
      }

      return createSuccessResponse({ threads: threads || [] });
    } else {
      // Get messages for a thread
      const { data: messages, error } = await supabase
        .from("messages")
        .select("id, thread_id, sender_id, sender_organization_id, recipient_id, recipient_organization_id, content, read_at, created_at, updated_at, message_attachments(id, file_name, file_url, file_size, mime_type)", { count: "exact" })
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) {
        logError("[Messages API GET Error]", error, {
          threadId,
          userId: user.id,
        });
        return createErrorResponse(new Error("Failed to fetch messages"), 400, "QUERY_ERROR");
      }

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("thread_id", threadId)
        .neq("sender_id", user.id)
        .is("read_at", null);

      return createSuccessResponse({ messages: messages || [] });
    }
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Messages API GET Error]", error, {
      ...errorDetails,
      path: "/api/messages",
    });

    return createErrorResponse(
      new Error("Failed to fetch messages"),
      500,
      "MESSAGES_FETCH_ERROR"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const { threadId, content, recipientOrganizationId } = await validateRequest(
      messageCreateSchema,
      body
    );

    // Verify thread access
    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .select("*")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      return createErrorResponse(new Error("Thread not found"), 404, "THREAD_NOT_FOUND");
    }

    const hasAccess =
      thread.organization_id === user.organizationId ||
      thread.vendor_id === user.organizationId;

    if (!hasAccess) {
      return createErrorResponse(new Error("Access denied"), 403, "ACCESS_DENIED");
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        sender_organization_id: user.organizationId,
        recipient_id: null,
        recipient_organization_id:
          recipientOrganizationId ||
          (thread.organization_id === user.organizationId
            ? thread.vendor_id
            : thread.organization_id),
        content,
      })
      .select()
      .single();

    if (messageError) {
      return createErrorResponse(
        new Error(messageError.message),
        400,
        "MESSAGE_CREATE_ERROR"
      );
    }

    // Update thread last_message_at
    await supabase
      .from("message_threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId);

    // Revalidate cache after creating message
    revalidateTag("messages", "max");

    // Send email notification to recipient
    if (message && message.recipient_organization_id) {
      const { sendMessageEmail } = await import("@/lib/email-notifications");

      // Get recipient users in the organization
      const { data: recipientUsers } = await supabase
        .from("users")
        .select("id, email")
        .eq("organization_id", message.recipient_organization_id);

      // Get sender name
      const { data: senderUser } = await supabase
        .from("users")
        .select("email")
        .eq("id", user.id)
        .single();

      const senderName = senderUser?.email?.split("@")[0] || "User";
      const messagePreview = content.length > 200 ? `${content.substring(0, 200)}...` : content;

      // Send email to all users in recipient organization
      if (recipientUsers) {
        recipientUsers.forEach((recipient) => {
          sendMessageEmail(recipient.id, {
            senderName,
            messagePreview,
            threadSubject: thread.subject,
            link: `/messages?thread=${threadId}`,
          }).catch((error) => {
            // Log but don't fail the request
            logError("[Email] Message notification failed", error, {
              recipientId: recipient.id,
              threadId,
            });
          });
        });
      }
    }

    return createSuccessResponse({ message });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Messages API POST Error]", error, {
      ...errorDetails,
      path: "/api/messages",
    });

    return createErrorResponse(
      new Error("Failed to create message"),
      500,
      "MESSAGE_CREATE_ERROR"
    );
  }
}

