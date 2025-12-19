import { Resend } from "resend";
import { logError, logInfo } from "./logger";

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email templates
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    logError("[Email] Resend not configured", new Error("RESEND_API_KEY not set"), {
      to: options.to,
      subject: options.subject,
    });
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || "noreply@vendor-portal.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    if (result.error) {
      logError("[Email] Send failed", result.error, {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }

    logInfo("[Email] Sent successfully", {
      to: options.to,
      subject: options.subject,
      id: result.data?.id,
    });

    return true;
  } catch (error) {
    logError("[Email] Send error", error, {
      to: options.to,
      subject: options.subject,
    });
    return false;
  }
}

/**
 * Generate email template for payment updates
 */
export function generatePaymentUpdateEmail(data: {
  recipientName: string;
  paymentAmount: string;
  paymentStatus: string;
  paymentId: string;
  link?: string;
}): EmailTemplate {
  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    paid: "#10b981",
    failed: "#ef4444",
    cancelled: "#6b7280",
  };

  const statusColor = statusColors[data.paymentStatus] || "#6b7280";

  return {
    subject: `Payment ${data.paymentStatus} - ${data.paymentAmount}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Payment Update</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello ${data.recipientName},</p>
            
            <p>Your payment status has been updated:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
              <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> ${data.paymentAmount}</p>
              <p style="margin: 0 0 10px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: capitalize;">${data.paymentStatus}</span></p>
              <p style="margin: 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
            </div>
            
            ${data.link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.link}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Payment Details</a>
              </div>
            ` : ""}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This is an automated notification from AI-BOS Vendor Portal.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Payment Update

Hello ${data.recipientName},

Your payment status has been updated:

Amount: ${data.paymentAmount}
Status: ${data.paymentStatus}
Payment ID: ${data.paymentId}

${data.link ? `View Payment Details: ${data.link}` : ""}

This is an automated notification from AI-BOS Vendor Portal.
    `.trim(),
  };
}

/**
 * Generate email template for document updates
 */
export function generateDocumentUpdateEmail(data: {
  recipientName: string;
  documentName: string;
  action: "uploaded" | "shared" | "updated";
  link?: string;
}): EmailTemplate {
  const actionTexts: Record<string, string> = {
    uploaded: "has been uploaded",
    shared: "has been shared with you",
    updated: "has been updated",
  };

  return {
    subject: `Document ${actionTexts[data.action]} - ${data.documentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Document Update</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello ${data.recipientName},</p>
            
            <p>A document ${actionTexts[data.action]}:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-weight: bold; font-size: 18px;">${data.documentName}</p>
            </div>
            
            ${data.link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.link}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Document</a>
              </div>
            ` : ""}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This is an automated notification from AI-BOS Vendor Portal.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Document Update

Hello ${data.recipientName},

A document ${actionTexts[data.action]}:

${data.documentName}

${data.link ? `View Document: ${data.link}` : ""}

This is an automated notification from AI-BOS Vendor Portal.
    `.trim(),
  };
}

/**
 * Generate email template for new messages
 */
export function generateMessageEmail(data: {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  threadSubject?: string;
  link?: string;
}): EmailTemplate {
  return {
    subject: data.threadSubject
      ? `New message: ${data.threadSubject}`
      : `New message from ${data.senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">New Message</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello ${data.recipientName},</p>
            
            <p>You have received a new message from <strong>${data.senderName}</strong>:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; white-space: pre-wrap;">${data.messagePreview}</p>
            </div>
            
            ${data.link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.link}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to Message</a>
              </div>
            ` : ""}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This is an automated notification from AI-BOS Vendor Portal.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
New Message

Hello ${data.recipientName},

You have received a new message from ${data.senderName}:

${data.messagePreview}

${data.link ? `Reply to Message: ${data.link}` : ""}

This is an automated notification from AI-BOS Vendor Portal.
    `.trim(),
  };
}

/**
 * Generate welcome email template
 */
export function generateWelcomeEmail(data: {
  recipientName: string;
  loginLink?: string;
}): EmailTemplate {
  return {
    subject: "Welcome to AI-BOS Vendor Portal",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello ${data.recipientName},</p>
            
            <p>Welcome to AI-BOS Vendor Portal! We're excited to have you on board.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Manage your documents</li>
              <li>Track payments and statements</li>
              <li>Communicate with your partners</li>
              <li>Access your dashboard</li>
            </ul>
            
            ${data.loginLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.loginLink}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
              </div>
            ` : ""}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to AI-BOS Vendor Portal

Hello ${data.recipientName},

Welcome to AI-BOS Vendor Portal! We're excited to have you on board.

You can now:
- Manage your documents
- Track payments and statements
- Communicate with your partners
- Access your dashboard

${data.loginLink ? `Get Started: ${data.loginLink}` : ""}

If you have any questions, please don't hesitate to contact our support team.
    `.trim(),
  };
}
