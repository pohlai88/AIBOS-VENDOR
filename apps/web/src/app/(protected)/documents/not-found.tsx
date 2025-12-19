import Link from 'next/link'
import { Button, Card } from '@aibos/ui'

/**
 * Not Found page for documents route
 * Shown when a document ID doesn't exist or user doesn't have access
 */
export default function DocumentsNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          Document Not Found
        </h2>
        <p className="text-foreground-muted mb-4">
          The document you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="flex gap-2">
          <Link href="/documents">
            <Button>Back to Documents</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
