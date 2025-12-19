import * as Sentry from "@sentry/nextjs";

let sentryInitialized = false;

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry() {
  if (sentryInitialized) {
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn("Sentry DSN not configured. Error tracking disabled.");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend(event, _hint) {
        // Filter sensitive data
        if (event.request) {
          // Remove cookies
          if (event.request.cookies) {
            delete event.request.cookies;
          }
          // Remove headers that might contain sensitive info
          if (event.request.headers) {
            const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];
            sensitiveHeaders.forEach((header) => {
              if (event.request?.headers?.[header]) {
                delete event.request.headers[header];
              }
            });
          }
        }

        // Remove sensitive data from user context
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }

        return event;
      },
    });

    sentryInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; role?: string; organizationId?: string }) {
  if (!sentryInitialized) return;

  Sentry.setUser({
    id: user.id,
    role: user.role,
    organizationId: user.organizationId,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  if (!sentryInitialized) return;
  Sentry.setUser(null);
}

/**
 * Capture exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!sentryInitialized) {
    console.error("Sentry not initialized:", error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message with Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, unknown>) {
  if (!sentryInitialized) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (!sentryInitialized) return;
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a transaction for performance monitoring
 * Note: In Sentry v7+, use startSpan instead of startTransaction
 * This provides a backward-compatible interface
 */
export function startTransaction(name: string, op: string): { setData: (key: string, value: unknown) => void; finish: () => void } | null {
  if (!sentryInitialized) return null;

  // Create a transaction-like object that uses Sentry's span API
  const attributes: Record<string, unknown> = {};
  let finished = false;

  // Start a span immediately and store it
  let spanContext: { setAttribute: (key: string, value: unknown) => void; end: () => void } | null = null;

  try {
    Sentry.startSpan({ name, op }, (span) => {
      spanContext = {
        setAttribute: (key: string, value: unknown) => {
          attributes[key] = value;
          span?.setAttribute(key, String(value));
        },
        end: () => {
          if (!finished) {
            finished = true;
            span?.end();
          }
        },
      };
    });

    if (!spanContext) return null;

    return {
      setData: (key: string, value: unknown) => {
        if (spanContext && !finished) {
          spanContext.setAttribute(key, value);
        }
      },
      finish: () => {
        if (spanContext && !finished) {
          spanContext.end();
        }
      },
    };
  } catch {
    return null;
  }
}
