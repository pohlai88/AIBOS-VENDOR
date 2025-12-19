import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

export const revalidate = {
  documents: 60, // 1 minute
  statements: 300, // 5 minutes
  payments: 300, // 5 minutes
  messages: 0, // Real-time, no cache
  dashboard: 60, // 1 minute
} as const;

export function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  revalidateSeconds: number = 60
) {
  return unstable_cache(
    async () => fetcher(),
    [key],
    {
      revalidate: revalidateSeconds,
      tags: [key],
    }
  );
}

// Advanced caching with multiple tags
export function getCachedDataWithTags<T>(
  key: string,
  fetcher: () => Promise<T>,
  tags: string[],
  revalidateSeconds: number = 60
) {
  return unstable_cache(
    async () => fetcher(),
    [key, ...tags],
    {
      revalidate: revalidateSeconds,
      tags,
    }
  );
}

// Cache invalidation utilities
export function invalidateCache(tag: string): void {
  revalidateTag(tag, "max");
}

export function invalidateMultipleCaches(tags: string[]): void {
  tags.forEach((tag) => revalidateTag(tag, "max"));
}

// Cache key generators
export const cacheKeys = {
  documents: (userId?: string, filters?: string) =>
    `documents-${userId || "all"}-${filters || ""}`,
  payments: (userId?: string, filters?: string) =>
    `payments-${userId || "all"}-${filters || ""}`,
  statements: (userId?: string, filters?: string) =>
    `statements-${userId || "all"}-${filters || ""}`,
  messages: (threadId?: string) => `messages-${threadId || "all"}`,
  dashboard: (userId?: string) => `dashboard-${userId || "all"}`,
} as const;

// Cache tags
export const cacheTags = {
  documents: "documents",
  payments: "payments",
  statements: "statements",
  messages: "messages",
  dashboard: "dashboard-stats",
  user: (userId: string) => `user-${userId}`,
} as const;

