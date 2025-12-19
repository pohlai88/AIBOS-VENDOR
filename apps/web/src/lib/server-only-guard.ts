/**
 * Server-only guard utilities
 * Prevents accidental client-side usage of server-only code
 */

// This file should only be imported in server components
// Next.js will throw an error if imported in client components

/**
 * Assert that code is running on the server
 * Throws an error if called in a client component
 */
export function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'This function can only be called from Server Components. ' +
      'Add "use server" directive or remove "use client" from the component.'
    )
  }
}

/**
 * Type guard to ensure server-only context
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}
