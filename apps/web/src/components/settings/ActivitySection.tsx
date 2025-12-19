"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@aibos/shared";

interface ActivityLog {
  id: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  createdAt: string;
}

export function ActivitySection() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/auth/activity");
        if (!response.ok) {
          throw new Error("Failed to fetch activity log");
        }
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Activity</h2>
        <p className="text-foreground-muted">Loading activity log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Activity</h2>
        <div className="bg-error-900/50 border border-error-700 text-error-200 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">Activity Log</h2>
      <p className="text-foreground-muted mb-6">
        View your recent account activity and actions
      </p>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-foreground-muted">
          <p>No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 border border-border rounded-lg hover:bg-background-hover transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground capitalize">
                    {activity.action.replace("_", " ")}
                  </p>
                  {activity.resourceType && (
                    <p className="text-sm text-foreground-muted mt-1">
                      Resource: {activity.resourceType}
                    </p>
                  )}
                </div>
                <div className="text-sm text-foreground-muted">
                  {formatDateTime(activity.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
