import { Card } from "@aibos/ui";

export default function MessagesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="h-8 bg-secondary-700 rounded w-48"></div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads list skeleton */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-secondary-700 rounded w-32"></div>
                <div className="h-8 bg-secondary-700 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-secondary-700 rounded"></div>
                ))}
              </div>
            </div>
          </Card>

          {/* Message thread skeleton */}
          <div className="lg:col-span-2">
            <Card>
              <div className="space-y-4">
                <div className="h-6 bg-secondary-700 rounded w-3/4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-secondary-700 rounded"></div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
