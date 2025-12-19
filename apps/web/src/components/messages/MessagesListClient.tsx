"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Card, Button } from "@aibos/ui";
import type { MessageThread } from "@aibos/shared";
import { formatDateTime } from "@aibos/shared";
import { createClient } from "@/lib/supabase/client";
import { MessageThread as MessageThreadComponent } from "./MessageThread";
import type { MessagesResponse } from "@/types/api";

export const MessagesListClient = memo(function MessagesListClient({
  initialThreads,
}: {
  initialThreads: MessageThread[];
}) {
  const [threads, setThreads] = useState<MessageThread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    const response = await fetch("/api/messages");
    if (response.ok) {
      const data: MessagesResponse = await response.json();
      setThreads(data.threads || []);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to message_threads changes
    const channel = supabase
      .channel("message_threads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_threads",
        },
        () => {
          // Refresh threads
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchThreads]);

  const handleSelectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
  }, []);

  const handleCloseThread = useCallback(() => {
    setSelectedThreadId(null);
  }, []);

  const handleCreateThread = useCallback(() => {
    // TODO: Implement thread creation
  }, []);

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [threads]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <Button
              size="sm"
              onClick={handleCreateThread}
              aria-label="Create new message thread"
            >
              New Thread
            </Button>
          </div>

          <div className="space-y-2" role="list" aria-label="Message threads">
            {sortedThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                aria-label={`Open conversation: ${thread.subject || "No Subject"}`}
                aria-current={selectedThreadId === thread.id ? "true" : undefined}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${selectedThreadId === thread.id
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-700 hover:bg-secondary-600 text-foreground-muted"
                  }`}
              >
                <div className="font-medium">{thread.subject || "No Subject"}</div>
                <div className="text-xs opacity-75 mt-1">
                  {formatDateTime(thread.lastMessageAt)}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selectedThreadId ? (
          <MessageThreadComponent
            threadId={selectedThreadId}
            onClose={handleCloseThread}
          />
        ) : (
          <Card>
            <div className="text-center text-foreground-muted py-12">
              Select a conversation to view messages
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});

