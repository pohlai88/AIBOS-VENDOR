"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Modal, Input } from "@aibos/ui";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

const documentUploadFormSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size > 0, "File is required")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    ),
  name: z.string().min(1, "Document name is required"),
  category: z.enum(["invoice", "contract", "statement", "other"], {
    required_error: "Please select a category",
  }),
  isShared: z.boolean(),
});

type DocumentUploadFormData = z.infer<typeof documentUploadFormSchema>;

interface DocumentUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentUploadForm({
  isOpen,
  onClose,
}: DocumentUploadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadFormSchema),
    defaultValues: {
      category: "other",
      isShared: false,
    },
  });

  const selectedFile = watch("file");

  // Auto-fill name from file when file is selected
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue("file", file, { shouldValidate: true });
        // Auto-fill name if empty
        const currentName = watch("name");
        if (!currentName) {
          setValue("name", file.name, { shouldValidate: true });
        }
      }
    },
    [setValue, watch]
  );

  const onSubmit = useCallback(
    async (data: DocumentUploadFormData) => {
      setLoading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", data.file);
        uploadFormData.append("name", data.name);
        uploadFormData.append("category", data.category);
        uploadFormData.append("isShared", data.isShared.toString());

        const response = await fetch("/api/documents", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();

        // Track analytics
        const { trackDocumentAction } = await import("@/lib/analytics");
        if (result.document?.id) {
          trackDocumentAction("upload", result.document.id);
        }

        reset();
        onClose();
        router.refresh();
      } catch (error) {
        console.error("Upload error:", error);
        // Error will be shown via form state
      } finally {
        setLoading(false);
      }
    },
    [router, onClose, reset]
  );

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Document"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Document upload form">
        <div>
          <label htmlFor="document-file" className="block text-sm font-medium text-foreground mb-1">
            File <span className="text-error-400" aria-label="required">*</span>
          </label>
          <input
            id="document-file"
            type="file"
            {...register("file", {
              onChange: handleFileChange,
            })}
            disabled={isSubmitting || loading}
            aria-describedby={errors.file ? "file-error" : selectedFile ? "file-selected" : undefined}
            aria-invalid={errors.file ? "true" : "false"}
            className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.file && (
            <p id="file-error" className="mt-1 text-sm text-error-400" role="alert">
              {errors.file.message}
            </p>
          )}
          {selectedFile && (
            <p id="file-selected" className="mt-1 text-xs text-foreground-muted" aria-live="polite">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div>
          <Input
            type="text"
            label="Name"
            {...register("name")}
            disabled={isSubmitting || loading}
            error={errors.name?.message}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={errors.name ? "true" : "false"}
          />
        </div>

        <div>
          <label htmlFor="document-category" className="block text-sm font-medium text-foreground mb-1">
            Category <span className="text-error-400" aria-label="required">*</span>
          </label>
          <select
            id="document-category"
            {...register("category")}
            disabled={isSubmitting || loading}
            aria-describedby={errors.category ? "category-error" : undefined}
            aria-invalid={errors.category ? "true" : "false"}
            className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="other">Other</option>
            <option value="invoice">Invoice</option>
            <option value="contract">Contract</option>
            <option value="statement">Statement</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-error-400">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="document-shared" className="flex items-center space-x-2 cursor-pointer">
            <input
              id="document-shared"
              type="checkbox"
              {...register("isShared")}
              disabled={isSubmitting || loading}
              className="rounded disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Share document with vendors"
            />
            <span className="text-sm text-foreground">Share with vendors</span>
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || loading}
            aria-label="Cancel document upload"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            aria-label={loading || isSubmitting ? "Uploading document..." : "Upload document"}
          >
            {loading || isSubmitting ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
