import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export type ListingSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "ending_soon"
  | "popular"
  | "relevance";

const PAGE_SIZE = 24;

type Options = {
  category?: string;
  listingType?: "all" | "fixed" | "auction";
  pageSize?: number;
};

export function useMarketplaceListings({
  category,
  listingType = "all",
  pageSize = PAGE_SIZE,
}: Options) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);
  const [sortBy, setSortBy] = useState<ListingSort>("newest");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) {
          next.set("q", debouncedSearch);
        } else {
          next.delete("q");
        }
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, setSearchParams]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, category, listingType, sortBy]);

  const { data, isLoading, isFetching } = trpc.marketplace.listListings.useQuery({
    category,
    listingType,
    search: debouncedSearch || undefined,
    sortBy,
    limit: pageSize,
    offset: page * pageSize,
  });

  const listings = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasSearch = debouncedSearch.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    sortBy,
    setSortBy,
    page,
    setPage,
    pageSize,
    listings,
    totalCount,
    totalPages,
    hasSearch,
    isLoading,
    isFetching,
  };
}
