import { Card } from "@aibos/ui";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
          <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
          <div className="h-4 bg-secondary-700 rounded w-5/6"></div>
        </div>
      </Card>
    </div>
  );
}

