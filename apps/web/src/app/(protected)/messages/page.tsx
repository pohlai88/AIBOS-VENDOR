import { Suspense } from "react";
import type { Metadata } from "next";
import { MessagesList } from "@/components/messages/MessagesList";
import { Card } from "@aibos/ui";


// Force dynamic rendering since this page requires authentication and API calls
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
  description: "Communicate with vendors and company representatives through secure messaging",
  openGraph: {
    title: "Messages",
    description: "Communicate with vendors and company representatives through secure messaging",
  },
};

function MessagesLoading() {
  return (
    <Card>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
        <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
      </div>
    </Card>
  );
}

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-foreground mb-8 font-normal">Messages</h1>

      <Suspense fallback={<MessagesLoading />}>
        <MessagesList />
      </Suspense>
    </div>
  );
}

