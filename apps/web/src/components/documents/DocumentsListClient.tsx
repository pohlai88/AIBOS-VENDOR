"use client";

import { useMemo, useCallback, memo, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Table, Card, Button } from "@aibos/ui";
import type { TableColumn } from "@aibos/ui";
import type { Document } from "@aibos/shared";
import { formatFileSize, formatDate } from "@aibos/shared";
import { Pagination } from "@/components/common/Pagination";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const DocumentsListClient = memo(function DocumentsListClient({
  initialDocuments,
  pagination,
}: {
  initialDocuments: Document[];
  pagination: PaginationInfo;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Use optimistic updates for better UX (Next.js 16 best practice)
  const [optimisticDocuments, setOptimisticDocuments] = useOptimistic(
    initialDocuments,
    (state: Document[], action: { type: 'delete'; id: string } | { type: 'add'; document: Document }) => {
      if (action.type === 'delete') {
        return state.filter((doc) => doc.id !== action.id);
      }
      if (action.type === 'add') {
        return [action.document, ...state];
      }
      return state;
    }
  );

  const handleDownload = useCallback((documentId: string) => {
    window.open(`/api/documents/${documentId}/download`, "_blank");
  }, []);

  const handleDelete = useCallback(async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    // Optimistic update with useOptimistic (Next.js 16 best practice)
    startTransition(async () => {
      setOptimisticDocuments({ type: 'delete', id: documentId });

      try {
        // Use Server Action instead of API route
        const { deleteDocument } = await import("@/app/actions/documents");
        const formData = new FormData();
        formData.append("id", documentId);

        const result = await deleteDocument(formData);

        if (!result.success) {
          // Revert optimistic update on error by refreshing
          router.refresh();
          alert(result.error || "Failed to delete document");
        } else {
          // Track analytics after successful delete
          import("@/lib/analytics")
            .then(({ trackDocumentAction }) => trackDocumentAction("delete", documentId))
            .catch(() => { }); // Don't block on analytics errors

          // Refresh to update pagination (optimistic update already applied)
          router.refresh();
        }
      } catch (error) {
        // Revert optimistic update on error
        router.refresh();
        alert("Failed to delete document");
      }
    });
  }, [router, setOptimisticDocuments]);

  const columns: TableColumn<Document>[] = useMemo(() => [
    {
      key: "name",
      header: "Name",
      render: (doc) => (
        <a
          href={`/documents/${doc.id}`}
          aria-label={`View details for ${doc.name}`}
          className="text-primary-400 hover:text-primary-300 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          onClick={() => {
            // Track analytics (non-blocking)
            import("@/lib/analytics")
              .then(({ trackDocumentAction }) => trackDocumentAction("view", doc.id))
              .catch(() => { }); // Don't block on navigation
          }}
        >
          {doc.name}
        </a>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (doc) => (
        <span className="px-2 py-1 bg-secondary-700 rounded text-xs capitalize">
          {doc.category}
        </span>
      ),
    },
    {
      key: "fileSize",
      header: "Size",
      render: (doc) => formatFileSize(doc.fileSize),
    },
    {
      key: "createdAt",
      header: "Uploaded",
      render: (doc) => formatDate(doc.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (doc) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(doc.id)}
          >
            Download
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(doc.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [handleDownload, handleDelete]);

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={optimisticDocuments}
          emptyMessage="No documents found"
        />

        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
          />
        )}
      </Card>
    </>
  );
});

