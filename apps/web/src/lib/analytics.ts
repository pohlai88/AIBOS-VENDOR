/**
 * Analytics utility for tracking user events and page views
 * Supports multiple analytics providers (Google Analytics, custom, etc.)
 */

// Track page view
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
      page_path: path,
      page_title: title,
    });
  }

  // Custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true") {
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, title }),
    }).catch(console.error);
  }
}

// Track custom event
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", eventName, properties);
  }

  // Custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true") {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: eventName, properties }),
    }).catch(console.error);
  }
}

// Track document actions
export function trackDocumentAction(
  action: "upload" | "download" | "delete" | "view",
  documentId: string,
  metadata?: Record<string, unknown>
) {
  trackEvent("document_action", {
    action,
    document_id: documentId,
    ...metadata,
  });
}

// Track payment actions
export function trackPaymentAction(
  action: "view" | "export" | "create",
  paymentId?: string,
  metadata?: Record<string, unknown>
) {
  trackEvent("payment_action", {
    action,
    payment_id: paymentId,
    ...metadata,
  });
}

// Track statement actions
export function trackStatementAction(
  action: "view" | "export" | "create",
  statementId?: string,
  metadata?: Record<string, unknown>
) {
  trackEvent("statement_action", {
    action,
    statement_id: statementId,
    ...metadata,
  });
}

// Track message actions
export function trackMessageAction(
  action: "send" | "view" | "create_thread",
  threadId?: string,
  metadata?: Record<string, unknown>
) {
  trackEvent("message_action", {
    action,
    thread_id: threadId,
    ...metadata,
  });
}

// Track error
export function trackError(
  error: Error,
  context?: Record<string, unknown>
) {
  trackEvent("error", {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}

// Track user engagement
export function trackEngagement(
  type: "click" | "hover" | "scroll" | "time_on_page",
  element?: string,
  metadata?: Record<string, unknown>
) {
  trackEvent("engagement", {
    type,
    element,
    ...metadata,
  });
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}
