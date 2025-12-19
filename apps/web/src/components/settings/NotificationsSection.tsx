"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@aibos/ui";

interface NotificationPreferences {
  emailNotifications: boolean;
  emailPaymentUpdates: boolean;
  emailDocumentUpdates: boolean;
  emailMessageNotifications: boolean;
}

export const NotificationsSection = memo(function NotificationsSection() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    emailPaymentUpdates: true,
    emailDocumentUpdates: true,
    emailMessageNotifications: true,
  });

  useEffect(() => {
    // Fetch current preferences
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/auth/preferences");
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        }
      } catch (error) {
        // Use proper error tracking
        import("@/lib/logger")
          .then(({ logError }) => logError("Failed to fetch preferences", error))
          .catch(() => {
            // Fallback if logger fails
            console.error("Failed to fetch preferences:", error);
          });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = useCallback(
    (key: keyof NotificationPreferences) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );


  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save preferences");
      }

      setMessage({
        type: "success",
        text: "Notification preferences saved successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save preferences",
      });
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Notifications
        </h2>
        <p className="text-foreground-muted">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Notifications
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${message.type === "success"
            ? "bg-success-900/50 border-success-700 text-success-200"
            : "bg-error-900/50 border-error-700 text-error-200"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <h3 className="font-medium text-foreground">Email Notifications</h3>
            <p className="text-sm text-foreground-muted">
              Receive email notifications for important updates
            </p>
          </div>
          <button
            onClick={() => handleToggle("emailNotifications")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailNotifications ? "bg-primary-600" : "bg-background-elevated"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <h3 className="font-medium text-foreground">Payment Updates</h3>
            <p className="text-sm text-foreground-muted">
              Get notified when payment status changes
            </p>
          </div>
          <button
            onClick={() => handleToggle("emailPaymentUpdates")}
            disabled={!preferences.emailNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailPaymentUpdates && preferences.emailNotifications
              ? "bg-primary-600"
              : "bg-background-elevated"
              } ${!preferences.emailNotifications ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailPaymentUpdates && preferences.emailNotifications
                ? "translate-x-6"
                : "translate-x-1"
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <h3 className="font-medium text-foreground">Document Updates</h3>
            <p className="text-sm text-foreground-muted">
              Get notified when documents are shared or updated
            </p>
          </div>
          <button
            onClick={() => handleToggle("emailDocumentUpdates")}
            disabled={!preferences.emailNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailDocumentUpdates && preferences.emailNotifications
              ? "bg-primary-600"
              : "bg-background-elevated"
              } ${!preferences.emailNotifications ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailDocumentUpdates && preferences.emailNotifications
                ? "translate-x-6"
                : "translate-x-1"
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <h3 className="font-medium text-foreground">Message Notifications</h3>
            <p className="text-sm text-foreground-muted">
              Get notified when you receive new messages
            </p>
          </div>
          <button
            onClick={() => handleToggle("emailMessageNotifications")}
            disabled={!preferences.emailNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailMessageNotifications && preferences.emailNotifications
              ? "bg-primary-600"
              : "bg-background-elevated"
              } ${!preferences.emailNotifications ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailMessageNotifications && preferences.emailNotifications
                ? "translate-x-6"
                : "translate-x-1"
                }`}
            />
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
});
