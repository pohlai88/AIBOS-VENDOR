import { Card } from "@aibos/ui";

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} title="">
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-secondary-700 rounded w-20"></div>
            <div className="h-4 bg-secondary-700 rounded w-32"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
