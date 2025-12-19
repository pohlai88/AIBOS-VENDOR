/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 * Used for observability, tracing, and monitoring setup
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize observability tools for Node.js runtime
    const { initObservability } = await import('@/lib/observability')
    await initObservability()
  }
}
