"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Card, Button, Input } from "@aibos/ui";
import type { Message } from "@aibos/shared";
import { formatDateTime } from "@aibos/shared";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth";
import type { MessagesResponse } from "@/types/api";

export const MessageThread = memo(function MessageThread({
  threadId,
  onClose,
}: {
  threadId: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const response = await fetch(`/api/messages?threadId=${threadId}`);
    if (response.ok) {
      const data: MessagesResponse = await response.json();
      setMessages(data.messages || []);
    }
  }, [threadId]);

  const fetchCurrentUser = useCallback(async () => {
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      const data: { user: AuthUser } = await response.json();
      setCurrentUser(data.user);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchCurrentUser();

    const supabase = createClient();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          if (payload.new) {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, fetchMessages, fetchCurrentUser, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages();

        // Track analytics (non-blocking)
        import("@/lib/analytics")
          .then(({ trackMessageAction }) => trackMessageAction("send", threadId))
          .catch(() => { }); // Don't block on analytics errors
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  }, [newMessage, loading, threadId, fetchMessages]);

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close message thread"
        >
          Close
        </Button>
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-4 mb-4"
        role="log"
        aria-label="Message thread"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => {
          const isOwn = message.senderId === currentUser?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              role="article"
              aria-label={isOwn ? "Your message" : "Message from other user"}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${isOwn
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-700 text-foreground-muted"
                  }`}
              >
                <div className="text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${isOwn ? "text-primary-100" : "text-foreground-muted"
                    }`}
                  aria-label={`Sent at ${formatDateTime(message.createdAt)}`}
                >
                  {formatDateTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      <form onSubmit={handleSend} className="flex gap-2" aria-label="Send message">
        <label htmlFor="message-input" className="sr-only">
          Type your message
        </label>
        <Input
          id="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1"
          aria-label="Message input"
          aria-describedby="message-send-button"
        />
        <Button
          id="message-send-button"
          type="submit"
          disabled={loading || !newMessage.trim()}
          aria-label="Send message"
        >
          Send
        </Button>
      </form>
    </Card>
  );
});

