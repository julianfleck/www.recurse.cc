"use client";

import { SearchIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@recurse/ui/components/command";
import { Spinner } from "@recurse/ui/components/spinner";
import { isOnAuthPage } from "@/lib/auth-utils";
import { DocumentationResults } from "./results/documentation";
import { DocumentationSuggestions } from "./suggestions";
import type { SearchProvider } from "./types";

// Lazy import KnowledgeBaseResults to avoid importing graph-view dependencies when not needed
// This allows www app to use search without graph-view dependencies
const KnowledgeBaseResults = lazy(() => 
  import("./results/knowledge-base").then(m => ({ default: m.KnowledgeBaseResults }))
);

type SearchCommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: SearchProvider;
  placeholder?: string;
  debounceMs?: number;
  searchType?: "documentation" | "knowledgeBase";
};

export function SearchCommandDialog({
  open,
  onOpenChange,
  provider,
  placeholder = "Search...",
  debounceMs = 300,
  searchType = "knowledgeBase",
}: SearchCommandDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<
    ReturnType<SearchProvider["search"]> extends Promise<infer R> ? R : never
  >([] as never);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([] as never);
      setError(null);
      setHasSearched(false);
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setResults([] as never);
        setError(null);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setResults([] as never); // Clear previous results immediately when starting new search
      try {
        const data = await provider.search(searchTerm);
        setResults(data as never);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof Error && err.name === "AuthenticationError") {
          if (!isOnAuthPage()) {
            window.location.href = "/login";
          }
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([] as never);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, provider, debounceMs]);

  const emptyMessage = useMemo(() => {
    if (error) {
      return error;
    }
    if (searchTerm && !isLoading && hasSearched && results.length === 0) {
      return "No results found.";
    }
    return null; // Don't show anything when not searching, loading, or haven't searched yet
  }, [error, searchTerm, isLoading, hasSearched, results.length]);

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton={!isLoading}
    >
        <CommandInput
          onValueChange={setSearchTerm}
          placeholder={placeholder}
          value={searchTerm}
        />
      <CommandList>
        {!searchTerm && <DocumentationSuggestions onSelect={() => onOpenChange(false)} />}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Spinner size={16} strokeWidth={2} />
          </div>
        )}
        {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
        {searchTerm && !isLoading && results.length > 0 && (
          searchType === "documentation" ? (
            <DocumentationResults
              onSelect={() => onOpenChange(false)}
              results={results as never}
              searchTerm={searchTerm}
            />
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <KnowledgeBaseResults results={results as never} />
            </Suspense>
          )
        )}
      </CommandList>
    </CommandDialog>
  );
}
