"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/components/auth/auth-store";
import { SearchResultsList } from "@/components/search-results-list";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { apiService } from "@/lib/api";
import { isOnAuthPage } from "@/lib/auth-utils";

interface KnowledgeBaseSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KnowledgeBaseSearch({
  open,
  onOpenChange,
}: KnowledgeBaseSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setError(null);
        return;
      }

      // Don't search if not authenticated
      if (!accessToken) {
        setError("Please log in to search the knowledge base");
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchParams = {
          query,
          limit: 20,
          field_set: "content",
        };

        const response = await apiService.get("/search", searchParams);
        const data = response.data as any;
        setSearchResults(data?.nodes || []);
      } catch (err) {
        // Handle authentication errors by redirecting to login (but not when already on auth pages)
        if (err instanceof Error && err.name === "AuthenticationError") {
          if (!isOnAuthPage()) {
            window.location.href = "/login";
          }
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  // Perform search when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
      setError(null);
    }
  }, [open]);

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandInput
        onValueChange={setSearchTerm}
        placeholder="Search knowledge base..."
        value={searchTerm}
      />
      <CommandList>
        <CommandEmpty>
          {error ||
            (searchTerm ? "No results found." : "Start typing to search...")}
        </CommandEmpty>
        <SearchResultsList
          isLoading={isLoading}
          results={searchResults}
          searchTerm={searchTerm}
        />
      </CommandList>
    </CommandDialog>
  );
}


