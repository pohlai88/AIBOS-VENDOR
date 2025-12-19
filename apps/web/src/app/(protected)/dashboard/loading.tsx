import { Card } from "@aibos/ui";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Header skeleton */}
        <div className="h-8 bg-secondary-700 rounded w-48"></div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} title="">
              <div className="space-y-2">
                <div className="h-10 bg-secondary-700 rounded w-20"></div>
                <div className="h-4 bg-secondary-700 rounded w-32"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="">
            <div className="space-y-3">
              <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
              <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
              <div className="h-4 bg-secondary-700 rounded w-5/6"></div>
            </div>
          </Card>
          <Card title="">
            <div className="space-y-2">
              <div className="h-10 bg-secondary-700 rounded"></div>
              <div className="h-10 bg-secondary-700 rounded"></div>
              <div className="h-10 bg-secondary-700 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
