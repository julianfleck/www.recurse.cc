"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchResultsList } from "@/components/search-results-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(true);
      }
      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setError(null);
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
        setSearchResults(response.data.nodes || []);
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
    [onOpenChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Debounce search
      const timeoutId = setTimeout(() => {
        performSearch(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [performSearch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      performSearch(searchTerm);
    },
    [searchTerm, performSearch]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16">
      <div className="w-full max-w-2xl rounded-lg bg-background p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Search Knowledge Base</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              className="pl-9"
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={handleInputChange}
            />
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="max-h-96 overflow-y-auto">
          <SearchResultsList
            results={searchResults}
            searchTerm={searchTerm}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Press{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5">Esc</kbd> to
            close
          </div>
          <div>
            <kbd className="rounded border bg-muted px-1.5 py-0.5">⌘</kbd> +
            <kbd className="rounded border bg-muted px-1.5 py-0.5">K</kbd> to
            search
          </div>
        </div>
      </div>
    </div>
  );
}
