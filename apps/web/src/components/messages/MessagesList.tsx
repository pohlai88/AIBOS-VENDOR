import { MessagesListClient } from "./MessagesListClient";
import { getAppUrl } from "@/lib/env";

export async function MessagesList() {
  // Messages are real-time, no caching needed
  const response = await fetch(`${getAppUrl()}/api/messages`, {
    cache: "no-store", // Keep no-store for real-time messages
  });

  if (!response.ok) {
    return (
      <div className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg">
        Failed to load messages
      </div>
    );
  }

  const { threads } = await response.json();

  return <MessagesListClient initialThreads={threads || []} />;
}

