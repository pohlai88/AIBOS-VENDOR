/**
 * DTO Sanitizer for Server → Client Component Props
 * 
 * Prevents non-serializable props from being passed to Client Components.
 * This prevents a whole category of production-only failures where
 * Server Components pass Dates, class instances, or other non-plain objects
 * to Client Components, causing serialization errors.
 * 
 * Usage:
 * ```tsx
 * // Server Component
 * import { sanitizeProps } from '@/lib/serialize-props';
 * 
 * export default async function Page() {
 *   const data = await fetchData();
 *   return <ClientComponent {...sanitizeProps(data)} />;
 * }
 * ```
 */

/**
 * Type guard: Check if value is a plain object (not a class instance)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  // Check if it's a plain object (not a class instance)
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Type guard: Check if value is a Date object
 */
function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Type guard: Check if value is a class instance (not a plain object)
 */
function isClassInstance(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  // If prototype is not null and not Object.prototype, it's likely a class instance
  return proto !== null && proto !== Object.prototype;
}

/**
 * Convert Date to ISO string (serializable)
 */
function serializeDate(date: Date): string {
  return date.toISOString();
}

/**
 * Recursively sanitize an object to ensure all values are serializable
 * - Converts Dates to ISO strings
 * - Removes or converts class instances
 * - Preserves plain objects, arrays, primitives
 */
export function sanitizeProps<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects
  if (isDate(obj)) {
    return serializeDate(obj) as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeProps(item)) as unknown as T;
  }

  // Handle plain objects
  if (isPlainObject(obj)) {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip functions (not serializable)
      if (typeof value === 'function') {
        continue;
      }

      // Skip symbols (not serializable)
      if (typeof value === 'symbol') {
        continue;
      }

      // Handle Date objects
      if (isDate(value)) {
        sanitized[key] = serializeDate(value);
        continue;
      }

      // Handle class instances (convert to plain object if possible, otherwise skip)
      if (isClassInstance(value)) {
        // Try to convert to plain object if it has common serialization methods
        if ('toJSON' in value && typeof (value as { toJSON: () => unknown }).toJSON === 'function') {
          sanitized[key] = sanitizeProps((value as { toJSON: () => unknown }).toJSON());
          continue;
        }

        // If it's a Map or Set, convert to plain object/array
        if (value instanceof Map) {
          sanitized[key] = sanitizeProps(Object.fromEntries(value));
          continue;
        }

        if (value instanceof Set) {
          sanitized[key] = sanitizeProps(Array.from(value));
          continue;
        }

        // For other class instances, try to extract enumerable properties
        try {
          const plain = Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
          );
          sanitized[key] = sanitizeProps(plain);
          continue;
        } catch {
          // If we can't serialize it, skip it
          console.warn(`[serialize-props] Skipping non-serializable property: ${key}`, value);
          continue;
        }
      }

      // Recursively sanitize nested objects
      sanitized[key] = sanitizeProps(value);
    }

    return sanitized as T;
  }

  // Primitives (string, number, boolean, bigint) are already serializable
  return obj;
}

/**
 * Type-safe wrapper for sanitizing props before passing to Client Components
 * 
 * @example
 * ```tsx
 * // Server Component
 * const data = await fetchData();
 * return <ClientComponent {...sanitizeForClient({ data })} />;
 * ```
 */
export function sanitizeForClient<T extends Record<string, unknown>>(
  props: T
): T {
  return sanitizeProps(props);
}

/**
 * Assert that props are serializable (throws in development if not)
 * Useful for catching serialization issues early
 */
export function assertSerializable<T>(props: T, context?: string): T {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Try to serialize
      JSON.stringify(props);
    } catch (error) {
      const contextMsg = context ? ` in ${context}` : '';
      throw new Error(
        `Props are not serializable${contextMsg}. ` +
        `This will cause errors when passing to Client Components. ` +
        `Use sanitizeProps() to fix this. ` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return props;
}
