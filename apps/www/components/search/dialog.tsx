"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { DocumentationResults } from "./results/documentation";
import type { SearchProvider } from "./types";

type SearchCommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: SearchProvider;
  placeholder?: string;
  debounceMs?: number;
};

export function SearchCommandDialog({
  open,
  onOpenChange,
  provider,
  placeholder = "Search documentation...",
  debounceMs = 300,
}: SearchCommandDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<SearchProvider["search"]>>>([]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await provider.search(searchTerm);
        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
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
    return null;
  }, [error, searchTerm, isLoading, hasSearched, results.length]);

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <div className="relative">
        <CommandInput
          onValueChange={setSearchTerm}
          placeholder={placeholder}
          value={searchTerm}
        />
        {isLoading && (
          <div className="-translate-y-1/2 absolute top-1/2 right-3">
            <Spinner size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <CommandList>
        {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
        {searchTerm && !isLoading && results.length > 0 && (
          <DocumentationResults
            onSelect={() => onOpenChange(false)}
            results={results}
            searchTerm={searchTerm}
          />
        )}
      </CommandList>
    </CommandDialog>
  );
}

