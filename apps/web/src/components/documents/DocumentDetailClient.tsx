"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@aibos/ui";
import type { Document } from "@aibos/shared";
import { formatFileSize, formatDate } from "@aibos/shared";
import { ArrowLeft, Download, Trash2 } from "lucide-react";

export function DocumentDetailClient({ document }: { document: Document }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = useCallback(() => {
    window.open(`/api/documents/${document.id}/download`, "_blank");
  }, [document.id]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setIsDeleting(true);
    try {
      const { deleteDocument } = await import("@/app/actions/documents");
      const formData = new FormData();
      formData.append("id", document.id);

      const result = await deleteDocument(formData);

      if (result.success) {
        router.push("/documents");
        router.refresh();
      } else {
        alert(result.error || "Failed to delete document");
        setIsDeleting(false);
      }
    } catch (error) {
      alert("Failed to delete document");
      setIsDeleting(false);
    }
  }, [document.id, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-serif text-foreground font-normal">
            {document.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            aria-label={`Download ${document.name}`}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete ${document.name}`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Document Details */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
              Document Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Name</dt>
                <dd className="text-foreground font-normal">{document.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Category</dt>
                <dd className="text-foreground capitalize font-normal">{document.category}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">File Size</dt>
                <dd className="text-foreground font-normal">{formatFileSize(document.fileSize)}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">MIME Type</dt>
                <dd className="text-foreground font-normal">{document.mimeType}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
              Metadata
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Uploaded</dt>
                <dd className="text-foreground font-normal">{formatDate(document.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Shared</dt>
                <dd className="text-foreground font-normal">
                  {document.isShared ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {/* Document Preview */}
      <Card>
        <h2 className="text-lg font-serif text-foreground mb-4 font-normal">Preview</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <iframe
            src={document.fileUrl}
            className="w-full h-[600px]"
            title={document.name}
          />
        </div>
      </Card>
    </div>
  );
}
