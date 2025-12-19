"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Card, Button, Modal, Input, Select } from "@aibos/ui";
import type { MessageThread } from "@aibos/shared";
import { formatDateTime } from "@aibos/shared";
import { createClient } from "@/lib/supabase/client";
import { MessageThread as MessageThreadComponent } from "./MessageThread";
import type { MessagesResponse } from "@/types/api";

interface Vendor {
  id: string;
  name: string;
}

export const MessagesListClient = memo(function MessagesListClient({
  initialThreads,
}: {
  initialThreads: MessageThread[];
}) {
  const [threads, setThreads] = useState<MessageThread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ vendorId: "", subject: "" });
  const [error, setError] = useState<string | null>(null);

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

  // Fetch vendors for thread creation
  useEffect(() => {
    const fetchVendors = async () => {
      if (!isCreateModalOpen) return;

      setIsLoadingVendors(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get user's organization to fetch vendor relationships
        const { data: userData } = await supabase
          .from("users")
          .select("organization_id, role")
          .eq("id", user.id)
          .single();

        if (!userData || userData.role === "vendor") {
          setVendors([]);
          return;
        }

        // Fetch active vendor relationships with vendor organization details
        const { data: relationships, error: relError } = await supabase
          .from("vendor_relationships")
          .select(`
            vendor_id,
            vendor:vendor_id (
              id,
              name
            )
          `)
          .eq("company_id", userData.organization_id)
          .eq("status", "active");

        if (relError) {
          console.error("Error fetching vendors:", relError);
          return;
        }

        // Transform data to vendor list
        const vendorList: Vendor[] = (relationships || [])
          .map((rel: any) => {
            const vendor = rel.vendor;
            return vendor ? { id: vendor.id, name: vendor.name } : null;
          })
          .filter((v: Vendor | null): v is Vendor => v !== null);

        setVendors(vendorList);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      } finally {
        setIsLoadingVendors(false);
      }
    };

    fetchVendors();
  }, [isCreateModalOpen]);

  const handleCreateThread = useCallback(() => {
    setIsCreateModalOpen(true);
    setFormData({ vendorId: "", subject: "" });
    setError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setFormData({ vendorId: "", subject: "" });
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.vendorId) {
      setError("Please select a vendor");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: formData.vendorId,
          subject: formData.subject || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create thread");
      }

      // Refresh threads list
      await fetchThreads();

      // Select the newly created thread
      if (data.thread?.id) {
        setSelectedThreadId(data.thread.id);
      }

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create thread");
    } finally {
      setIsCreating(false);
    }
  }, [formData, fetchThreads, handleCloseModal]);

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [threads]);

  return (
    <>
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

      {/* Create Thread Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create New Thread"
        description="Start a new conversation with a vendor"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error-500/10 border border-error-500/20 rounded-lg text-sm text-error-500">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="vendorId" className="block text-sm font-normal text-foreground mb-2">
              Vendor
            </label>
            {isLoadingVendors ? (
              <div className="p-3 bg-background-elevated border border-border rounded-lg text-sm text-foreground-muted">
                Loading vendors...
              </div>
            ) : vendors.length === 0 ? (
              <div className="p-3 bg-background-elevated border border-border rounded-lg text-sm text-foreground-muted">
                No active vendors available
              </div>
            ) : (
              <Select
                id="vendorId"
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                required
                options={[
                  { value: "", label: "Select a vendor" },
                  ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
                ]}
                placeholder="Select a vendor"
              />
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-normal text-foreground mb-2">
              Subject (Optional)
            </label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter thread subject"
              className="w-full"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.vendorId || isLoadingVendors}
            >
              {isCreating ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
});

