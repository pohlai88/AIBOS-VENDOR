"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Card, Button } from "@aibos/ui";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@aibos/shared";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

export const NotificationCenter = memo(function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [, setConnectionStatus] = useState<"connected" | "disconnected" | "error">("disconnected");
  const supabase = createClient();

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const fetchNotifications = useCallback(async () => {
    // Fetch from Supabase with user filter (RLS will enforce security)
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      const formattedNotifications: Notification[] = data.map((n) => ({
        id: n.id,
        title: n.title || "Notification",
        message: n.message || "",
        type: (n.type as Notification["type"]) || "info",
        read: n.read || false,
        createdAt: n.created_at,
        link: n.link,
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter((n) => !n.read).length);
    }
  }, [supabase]);

  useEffect(() => {
    if (!currentUserId) return;

    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to Broadcast events for user-specific notifications
    const channel = supabase
      .channel(`user:${currentUserId}:notifications`, {
        config: { private: true } // ✅ Private channel with RLS
      })
      .on("broadcast", { event: "notification_created" }, async () => {
        // Refetch notifications to get authoritative data
        // Don't trust broadcast payload alone (security best practice)
        await fetchNotifications();

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("New notification", {
            body: "You have a new notification",
            icon: "/favicon.ico",
          });
        }
      })
      .subscribe((status) => {
        // ✅ Handle subscription status
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("error");
          console.error("Failed to subscribe to notifications:", status);
          // Could implement retry logic here
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected");
        }
      });

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Fetch on tab focus (reliability pattern)
    const handleFocus = () => {
      fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications, currentUserId]);

  // Keyboard navigation: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [supabase]
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [supabase, notifications]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <Card
            className="absolute right-0 top-12 z-50 w-96 max-h-[600px] overflow-y-auto"
            role="dialog"
            aria-label="Notifications"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  aria-label="Mark all notifications as read"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="divide-y divide-border" role="list" aria-label="Notification list">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-foreground-muted" role="status" aria-live="polite">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    role="listitem"
                    className={`p-4 hover:bg-background-hover transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${!notification.read ? "bg-background-elevated" : ""
                      }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }
                    }}
                    tabIndex={0}
                    aria-label={`${notification.read ? "Read" : "Unread"} notification: ${notification.title}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-foreground">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-foreground-muted mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-foreground-muted mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
});
