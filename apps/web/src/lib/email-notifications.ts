import { createClient } from "@/lib/supabase/server";
import { sendEmail, generatePaymentUpdateEmail, generateDocumentUpdateEmail, generateMessageEmail } from "./email";
import { logError, logInfo } from "./logger";

/**
 * Get user email preferences
 */
async function getUserEmailPreferences(userId: string): Promise<{
  emailNotifications: boolean;
  emailPaymentUpdates: boolean;
  emailDocumentUpdates: boolean;
  emailMessageNotifications: boolean;
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Default to all enabled if preferences don't exist
  return {
    emailNotifications: data?.email_notifications ?? true,
    emailPaymentUpdates: data?.email_payment_updates ?? true,
    emailDocumentUpdates: data?.email_document_updates ?? true,
    emailMessageNotifications: data?.email_message_notifications ?? true,
  };
}

/**
 * Get user email address
 */
async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = await createClient();

  // Get email from users table (which should have email from auth.users)
  const { data: userData } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  return userData?.email || null;
}

/**
 * Get user name from users table
 */
async function getUserName(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  return data?.email?.split("@")[0] || "User";
}

/**
 * Send payment update email notification
 */
export async function sendPaymentUpdateEmail(
  userId: string,
  paymentData: {
    amount: string;
    status: string;
    paymentId: string;
    link?: string;
  }
): Promise<boolean> {
  try {
    const preferences = await getUserEmailPreferences(userId);

    // Check if email notifications are enabled
    if (!preferences.emailNotifications || !preferences.emailPaymentUpdates) {
      logInfo("[Email Notification] Skipped - preferences disabled", {
        userId,
        type: "payment_update",
      });
      return false;
    }

    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      logError("[Email Notification] No email found", new Error("User email not found"), {
        userId,
      });
      return false;
    }

    const userName = await getUserName(userId);
    const template = generatePaymentUpdateEmail({
      recipientName: userName,
      paymentAmount: paymentData.amount,
      paymentStatus: paymentData.status,
      paymentId: paymentData.paymentId,
      link: paymentData.link,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = paymentData.link
      ? `${baseUrl}${paymentData.link}`
      : `${baseUrl}/payments/${paymentData.paymentId}`;

    return await sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html.replace(
        paymentData.link || "",
        fullLink
      ),
      text: template.text,
    });
  } catch (error) {
    logError("[Email Notification] Payment update failed", error, {
      userId,
      paymentId: paymentData.paymentId,
    });
    return false;
  }
}

/**
 * Send document update email notification
 */
export async function sendDocumentUpdateEmail(
  userId: string,
  documentData: {
    documentName: string;
    action: "uploaded" | "shared" | "updated";
    link?: string;
  }
): Promise<boolean> {
  try {
    const preferences = await getUserEmailPreferences(userId);

    // Check if email notifications are enabled
    if (!preferences.emailNotifications || !preferences.emailDocumentUpdates) {
      logInfo("[Email Notification] Skipped - preferences disabled", {
        userId,
        type: "document_update",
      });
      return false;
    }

    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      logError("[Email Notification] No email found", new Error("User email not found"), {
        userId,
      });
      return false;
    }

    const userName = await getUserName(userId);
    const template = generateDocumentUpdateEmail({
      recipientName: userName,
      documentName: documentData.documentName,
      action: documentData.action,
      link: documentData.link,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = documentData.link
      ? `${baseUrl}${documentData.link}`
      : `${baseUrl}/documents`;

    return await sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html.replace(
        documentData.link || "",
        fullLink
      ),
      text: template.text,
    });
  } catch (error) {
    logError("[Email Notification] Document update failed", error, {
      userId,
      documentName: documentData.documentName,
    });
    return false;
  }
}

/**
 * Send message email notification
 */
export async function sendMessageEmail(
  recipientUserId: string,
  messageData: {
    senderName: string;
    messagePreview: string;
    threadSubject?: string;
    link?: string;
  }
): Promise<boolean> {
  try {
    const preferences = await getUserEmailPreferences(recipientUserId);

    // Check if email notifications are enabled
    if (!preferences.emailNotifications || !preferences.emailMessageNotifications) {
      logInfo("[Email Notification] Skipped - preferences disabled", {
        userId: recipientUserId,
        type: "message",
      });
      return false;
    }

    const userEmail = await getUserEmail(recipientUserId);
    if (!userEmail) {
      logError("[Email Notification] No email found", new Error("User email not found"), {
        userId: recipientUserId,
      });
      return false;
    }

    const userName = await getUserName(recipientUserId);
    const template = generateMessageEmail({
      recipientName: userName,
      senderName: messageData.senderName,
      messagePreview: messageData.messagePreview,
      threadSubject: messageData.threadSubject,
      link: messageData.link,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = messageData.link
      ? `${baseUrl}${messageData.link}`
      : `${baseUrl}/messages`;

    return await sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html.replace(
        messageData.link || "",
        fullLink
      ),
      text: template.text,
    });
  } catch (error) {
    logError("[Email Notification] Message failed", error, {
      userId: recipientUserId,
    });
    return false;
  }
}
