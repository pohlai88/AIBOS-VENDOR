import { Suspense } from "react";
import type { Metadata } from "next";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { DocumentUploadButton } from "@/components/documents/DocumentUploadButton";
import { Card } from "@aibos/ui";

// Force dynamic rendering since this page requires authentication and API calls
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage and access your documents, invoices, contracts, and statements",
  openGraph: {
    title: "Documents | AI-BOS Vendor Portal",
    description: "Manage and access your documents, invoices, contracts, and statements",
  },
};

function DocumentsLoading() {
  return (
    <>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-background-elevated border border-border rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-background-elevated border border-border rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-background-elevated border border-border rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-background-elevated border border-border rounded-lg animate-pulse" />
        </div>
      </div>
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="space-y-3">
            <div className="h-12 bg-background-elevated rounded border border-border"></div>
            <div className="h-12 bg-background-elevated rounded border border-border"></div>
            <div className="h-12 bg-background-elevated rounded border border-border"></div>
            <div className="h-12 bg-background-elevated rounded border border-border"></div>
            <div className="h-12 bg-background-elevated rounded border border-border"></div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="h-4 bg-background-elevated rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-background-elevated rounded"></div>
              <div className="h-8 w-8 bg-background-elevated rounded"></div>
              <div className="h-8 w-8 bg-background-elevated rounded"></div>
              <div className="h-8 w-20 bg-background-elevated rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();

  // Convert searchParams object to URLSearchParams
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Documents</h1>
        <DocumentUploadButton />
      </div>

      <Suspense fallback={<DocumentsLoading />}>
        <DocumentsList searchParams={Promise.resolve(urlSearchParams)} />
      </Suspense>
    </div>
  );
}

