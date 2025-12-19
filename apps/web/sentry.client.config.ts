import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
      if (event.request.cookies) {
        delete event.request.cookies;
      }
      if (event.request.headers) {
        const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];
        sensitiveHeaders.forEach((header) => {
          if (event.request?.headers?.[header]) {
            delete event.request.headers[header];
          }
        });
      }
    }
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
