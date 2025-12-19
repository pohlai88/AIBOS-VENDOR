"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Table, Card, Button, Modal } from "@aibos/ui";
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
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = useCallback((documentId: string) => {
    window.open(`/api/documents/${documentId}/download`, "_blank");
  }, []);

  const handleDelete = useCallback(async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    // Optimistic update
    const previousDocuments = documents;
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Revert on error
        setDocuments(previousDocuments);
        alert("Failed to delete document");
      } else {
        // Track analytics after successful delete
        import("@/lib/analytics")
          .then(({ trackDocumentAction }) => trackDocumentAction("delete", documentId))
          .catch(() => { }); // Don't block on analytics errors

        // Refresh to update pagination (better UX than full reload)
        router.refresh();
      }
    } catch (error) {
      // Revert on error
      setDocuments(previousDocuments);
      alert("Failed to delete document");
    }
  }, [documents, router]);

  const handleViewDetails = useCallback((doc: Document) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);

    // Track analytics (non-blocking)
    import("@/lib/analytics")
      .then(({ trackDocumentAction }) => trackDocumentAction("view", doc.id))
      .catch(() => { }); // Don't block on analytics errors
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const columns: TableColumn<Document>[] = useMemo(() => [
    {
      key: "name",
      header: "Name",
      render: (doc) => (
        <button
          onClick={() => handleViewDetails(doc)}
          aria-label={`View details for ${doc.name}`}
          className="text-primary-400 hover:text-primary-300 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        >
          {doc.name}
        </button>
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
  ], [handleDownload, handleDelete, handleViewDetails]);

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={documents}
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

      <Modal
        isOpen={isPreviewOpen}
        onClose={handleCloseModal}
        title={selectedDocument?.name}
        size="xl"
        aria-labelledby="document-preview-title"
        aria-describedby="document-preview-content"
      >
        {selectedDocument && (
          <div id="document-preview-content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm" role="group" aria-label="Document details">
              <div>
                <span className="text-foreground-muted">Category:</span>
                <span className="ml-2 capitalize text-foreground">{selectedDocument.category}</span>
              </div>
              <div>
                <span className="text-foreground-muted">Size:</span>
                <span className="ml-2 text-foreground">{formatFileSize(selectedDocument.fileSize)}</span>
              </div>
              <div>
                <span className="text-foreground-muted">Uploaded:</span>
                <span className="ml-2 text-foreground">{formatDate(selectedDocument.createdAt)}</span>
              </div>
              <div>
                <span className="text-foreground-muted">Type:</span>
                <span className="ml-2 text-foreground">{selectedDocument.mimeType}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <iframe
                src={selectedDocument.fileUrl}
                className="w-full h-96 border border-border rounded-lg"
                title={selectedDocument.name}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                aria-label="Close document preview"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDownload(selectedDocument.id)}
                aria-label={`Download ${selectedDocument.name}`}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
});

