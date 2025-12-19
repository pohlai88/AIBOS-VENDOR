import Link from 'next/link'
import { Button, Card } from '@aibos/ui'

/**
 * Root Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-foreground">
          404 - Page Not Found
        </h1>
        <p className="text-foreground-muted mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-2">
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
