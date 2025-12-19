import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  beforeSend(event, _hint) {
    // Filter sensitive data
    if (event.request) {
      if (event.request.cookies) {
        delete event.request.cookies;
      }
    }
    return event;
  },
});
