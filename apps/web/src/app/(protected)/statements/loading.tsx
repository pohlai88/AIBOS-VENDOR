import { Card } from "@aibos/ui";

export default function StatementsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="h-8 bg-secondary-700 rounded w-48"></div>

        {/* Filters skeleton */}
        <div className="flex gap-4">
          <div className="h-10 bg-secondary-700 rounded w-48"></div>
          <div className="h-10 bg-secondary-700 rounded w-48"></div>
        </div>

        {/* Table skeleton */}
        <Card>
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 pb-4 border-b border-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-secondary-700 rounded"></div>
              ))}
            </div>
            {/* Table rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-4 border-b border-border">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-secondary-700 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
