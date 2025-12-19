export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry on server-side
    const { initSentry } = await import("./src/lib/monitoring");
    initSentry();
  }
}
