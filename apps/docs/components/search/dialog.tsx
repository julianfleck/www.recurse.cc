"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@recurse/ui/components/command";
import { Spinner } from "@recurse/ui/components/spinner";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { isOnAuthPage } from "@/lib/auth-utils";
import { DocumentationResults } from "./results/documentation";
import { DocumentationSuggestions } from "./suggestions";
import type {
  HierarchicalSearchResult,
  SearchItem,
  SearchProvider,
} from "./types";

// Lazy import KnowledgeBaseResults to avoid importing graph-view dependencies when not needed
// This allows www app to use search without graph-view dependencies
const KnowledgeBaseResults = lazy(() =>
  import("./results/knowledge-base").then((m) => ({
    default: m.KnowledgeBaseResults,
  }))
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
    HierarchicalSearchResult[] | SearchItem[]
  >([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const contentTreeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        setError(null);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setResults([]); // Clear previous results immediately when starting new search
      try {
        const data = await provider.search(searchTerm);
        setResults(data);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof Error && err.name === "AuthenticationError") {
          if (!isOnAuthPage()) {
            window.location.href = "/login";
          }
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      // Focus the ContentTree container so it can receive keyboard events
      contentTreeRef.current?.focus();
    }
  };

  const handleSelectAll = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton={!isLoading}
    >
      <CommandInput
        onKeyDown={handleInputKeyDown}
        onValueChange={setSearchTerm}
        placeholder={placeholder}
        ref={inputRef}
        value={searchTerm}
      />
      <CommandList ref={resultsRef}>
        {!searchTerm && (
          <DocumentationSuggestions onSelect={() => onOpenChange(false)} />
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Spinner size={16} strokeWidth={2} />
          </div>
        )}
        {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
        {searchTerm &&
          !isLoading &&
          results.length > 0 &&
          (searchType === "documentation" ? (
            <DocumentationResults
              containerRef={contentTreeRef}
              onSelect={() => onOpenChange(false)}
              onSelectAll={handleSelectAll}
              results={results as HierarchicalSearchResult[]}
              searchTerm={searchTerm}
            />
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <KnowledgeBaseResults results={results as SearchItem[]} />
            </Suspense>
          ))}
      </CommandList>
    </CommandDialog>
  );
}
