import { startTransaction, captureException } from "./monitoring";

export interface APMMetrics {
  apiResponseTime: number;
  databaseQueryTime?: number;
  cacheHit?: boolean;
  error?: Error;
}

/**
 * Track API performance metrics
 */
export async function trackAPICall<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(operation, "api.request");

  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    transaction?.setData("duration", duration);
    transaction?.setData("status", "success");
    transaction?.finish();

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    transaction?.setData("duration", duration);
    transaction?.setData("status", "error");
    transaction?.finish();

    captureException(error instanceof Error ? error : new Error(String(error)), {
      operation,
      duration,
    });

    throw error;
  }
}

/**
 * Track database query performance
 */
export async function trackDatabaseQuery<T>(
  queryName: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(queryName, "db.query");

  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    transaction?.setData("duration", duration);
    transaction?.setData("status", "success");
    transaction?.finish();

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    transaction?.setData("duration", duration);
    transaction?.setData("status", "error");
    transaction?.finish();

    captureException(error instanceof Error ? error : new Error(String(error)), {
      query: queryName,
      duration,
    });

    throw error;
  }
}

/**
 * Track cache operations
 */
export function trackCacheOperation(
  operation: "hit" | "miss" | "set" | "delete",
  key: string,
  duration?: number
) {
  const transaction = startTransaction(`cache.${operation}`, "cache.operation");

  transaction?.setData("key", key);
  transaction?.setData("operation", operation);
  if (duration !== undefined) {
    transaction?.setData("duration", duration);
  }
  transaction?.finish();
}

/**
 * Track page load performance (client-side)
 */
export function trackPageLoad(metrics: {
  domContentLoaded?: number;
  loadComplete?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  timeToInteractive?: number;
}) {
  if (typeof window === "undefined") return;

  const transaction = startTransaction(window.location.pathname, "navigation");

  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined) {
      transaction?.setData(key, value);
    }
  });

  transaction?.finish();
}

/**
 * Track custom business metrics
 */
export function trackBusinessMetric(
  metricName: string,
  value: number,
  tags?: Record<string, string>
) {
  const transaction = startTransaction(metricName, "business.metric");

  transaction?.setData("value", value);
  if (tags) {
    Object.entries(tags).forEach(([key, val]) => {
      transaction?.setData(key, val);
    });
  }

  transaction?.finish();
}
