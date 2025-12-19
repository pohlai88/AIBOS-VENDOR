import { DocumentsListClient } from "./DocumentsListClient";
import { DocumentsSearch } from "./DocumentsSearch";
import { Suspense } from "react";
import { getDocuments } from "@/lib/data-fetching";

/**
 * Server Component: DocumentsList
 * Follows Next.js 16 best practices:
 * - Direct database access (no API route call)
 * - Uses React cache() for request memoization
 * - Proper error handling
 */
export async function DocumentsList({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  const params = await searchParams;

  // Convert URLSearchParams to object for easier handling
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const page = parseInt(params.get("page") || "1", 10);
  const sortBy = params.get("sortBy") || "created_at";
  const sortOrder = (params.get("sortOrder") || "desc") as "asc" | "desc";

  try {
    // Use direct database access with caching (best practice)
    const { documents, pagination } = await getDocuments({
      search: search || undefined,
      category: category || undefined,
      page,
      sortBy,
      sortOrder,
      limit: 10,
    });

    return (
      <>
        <div className="mb-4">
          <Suspense fallback={
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-background-elevated border border-border rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-background-elevated border border-border rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-background-elevated border border-border rounded-lg animate-pulse" />
              <div className="h-10 w-36 bg-background-elevated border border-border rounded-lg animate-pulse" />
            </div>
          }>
            <DocumentsSearch />
          </Suspense>
        </div>
        <DocumentsListClient
          initialDocuments={documents}
          pagination={pagination}
        />
      </>
    );
  } catch (error) {
    return (
      <div className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg">
        {error instanceof Error ? error.message : "Failed to load documents"}
      </div>
    );
  }
}

