import { DocumentsListClient } from "./DocumentsListClient";
import { DocumentsSearch } from "./DocumentsSearch";
import { getAppUrl } from "@/lib/env";
import { Suspense } from "react";

async function fetchDocuments(
  search: string,
  category: string,
  page: number,
  sortBy: string,
  sortOrder: string
) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  params.set("page", page.toString());
  params.set("limit", "10");
  if (sortBy) params.set("sortBy", sortBy);
  if (sortOrder) params.set("sortOrder", sortOrder);

  const response = await fetch(
    `${getAppUrl()}/api/documents?${params.toString()}`,
    {
      next: {
        revalidate: 60,
        tags: ["documents"],
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load documents");
  }

  const data = await response.json();

  return {
    documents: data.documents || [],
    pagination: data.pagination || {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  };
}

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
  const sortOrder = params.get("sortOrder") || "desc";

  try {
    const { documents, pagination } = await fetchDocuments(
      search,
      category,
      page,
      sortBy,
      sortOrder
    );

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
        Failed to load documents
      </div>
    );
  }
}

