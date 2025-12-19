'use client'

import { useEffect } from 'react'
import { Button, Card } from '@aibos/ui'

/**
 * Global Error Boundary
 * Catches errors that escape all other error boundaries
 * This is the last line of defense for catastrophic errors
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log catastrophic errors
    console.error('Global error caught:', error)

    // Track with analytics if available
    import('@/lib/analytics')
      .then(({ trackError }) => trackError(error, { context: 'GlobalError' }))
      .catch(() => {
        // Analytics failed, but that's okay
      })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card className="max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4 text-error-400">
              Application Error
            </h1>
            <p className="text-foreground mb-2">
              A critical error occurred that prevented the application from loading.
            </p>
            {error.message && (
              <p className="text-foreground-muted text-sm mb-4">
                {error.message}
              </p>
            )}
            {error.digest && (
              <p className="text-foreground-muted text-xs mb-4 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-2">
              <Button onClick={reset}>Try again</Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                Go to home
              </Button>
            </div>
          </Card>
        </div>
      </body>
    </html>
  )
}
