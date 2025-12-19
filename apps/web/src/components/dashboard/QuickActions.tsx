import { Card } from "@aibos/ui";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card title="Quick Actions">
      <div className="space-y-2">
        <Link
          href="/documents"
          className="block px-4 py-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors text-foreground"
        >
          View Documents
        </Link>
        <Link
          href="/payments"
          className="block px-4 py-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors text-foreground"
        >
          View Payments
        </Link>
        <Link
          href="/statements"
          className="block px-4 py-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors text-foreground"
        >
          View Statements
        </Link>
        <Link
          href="/messages"
          className="block px-4 py-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors text-foreground"
        >
          View Messages
        </Link>
      </div>
    </Card>
  );
}
