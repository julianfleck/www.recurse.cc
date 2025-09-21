"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchResultsList } from "@/components/search-results-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import { isOnAuthPage } from "@/lib/auth-utils";
import { useAuthStore } from "@/components/auth/auth-store";

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Focus input when opened and clear state when closed
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    } else if (!open) {
      // Clear any pending search and reset state when modal closes
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      setSearchTerm("");
      setSearchResults([]);
      setError(null);
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for debounced search
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
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
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="mx-auto max-w-2xl pt-16">
        <div className="relative mx-4 rounded-lg border bg-background shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search knowledge base..."
                value={searchTerm}
                onChange={(e) => handleInputChange(e)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 h-6 w-6 p-0"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {error && (
            <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
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

          <div className="border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <div>
                <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs">↑↓</kbd> to navigate
              </div>
              <div>
                <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs">Enter</kbd> to select
              </div>
              <div>
                <kbd className="rounded border bg-background px-1.5 py-0.5 text-xs">Esc</kbd> to close
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
