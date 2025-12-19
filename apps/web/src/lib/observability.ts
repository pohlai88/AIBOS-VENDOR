/**
 * Observability and monitoring utilities
 * Provides request tracing, correlation IDs, and performance monitoring
 */

import { headers } from 'next/headers'

/**
 * Generate or retrieve correlation ID for request tracing
 * Used to track requests across Server Actions, Route Handlers, and DB queries
 */
export async function getCorrelationId(): Promise<string> {
  const headersList = await headers()

  // Check for existing correlation ID from upstream
  const existingId = headersList.get('x-correlation-id')
  if (existingId) {
    return existingId
  }

  // Generate new correlation ID
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Initialize observability tools
 * Called from instrumentation.ts on server startup
 */
export async function initObservability() {
  // Initialize error tracking (Sentry, etc.)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const { init } = await import('@sentry/nextjs')
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    })
  }

  // Initialize other observability tools as needed
  // - APM (Application Performance Monitoring)
  // - Log aggregation
  // - Metrics collection
}

/**
 * Create a performance timer for tracking operation duration
 */
export function createTimer(operation: string) {
  const start = Date.now()

  return {
    end: () => {
      const duration = Date.now() - start
      console.log(`[Performance] ${operation} took ${duration}ms`)
      return duration
    },
    getDuration: () => Date.now() - start,
  }
}

/**
 * Log structured data for observability
 */
export function logStructured(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  }

  // In production, send to log aggregation service
  // For now, structured console logging
  console[level](JSON.stringify(logEntry))
}
