"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function DocumentsSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "created_at");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");

  const debouncedSearch = useDebounce(search, 300);

  const updateSearchParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change
      params.delete("page");

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateSearchParams("search", debouncedSearch);
  }, [debouncedSearch, updateSearchParams]);

  // Update URL immediately when category changes
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCategory = e.target.value;
      setCategory(newCategory);
      updateSearchParams("category", newCategory);
    },
    [updateSearchParams]
  );

  // Update URL immediately when sort changes
  const handleSortByChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSortBy = e.target.value;
      setSortBy(newSortBy);
      updateSearchParams("sortBy", newSortBy);
    },
    [updateSearchParams]
  );

  const handleSortOrderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSortOrder = e.target.value;
      setSortOrder(newSortOrder);
      updateSearchParams("sortOrder", newSortOrder);
    },
    [updateSearchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4" role="search" aria-label="Document search and filters">
      <label htmlFor="document-search" className="sr-only">
        Search documents
      </label>
      <input
        id="document-search"
        type="text"
        placeholder="Search documents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search documents by name"
        className="flex-1 px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      />
      <label htmlFor="document-category" className="sr-only">
        Filter by category
      </label>
      <select
        id="document-category"
        value={category}
        onChange={handleCategoryChange}
        aria-label="Filter documents by category"
        className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <option value="">All Categories</option>
        <option value="invoice">Invoice</option>
        <option value="contract">Contract</option>
        <option value="statement">Statement</option>
        <option value="other">Other</option>
      </select>
      <label htmlFor="document-sort-by" className="sr-only">
        Sort by
      </label>
      <select
        id="document-sort-by"
        value={sortBy}
        onChange={handleSortByChange}
        aria-label="Sort documents by"
        className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <option value="created_at">Date</option>
        <option value="name">Name</option>
        <option value="file_size">Size</option>
        <option value="category">Category</option>
      </select>
      <label htmlFor="document-sort-order" className="sr-only">
        Sort order
      </label>
      <select
        id="document-sort-order"
        value={sortOrder}
        onChange={handleSortOrderChange}
        aria-label="Sort order"
        className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}
