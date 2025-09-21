"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { isOnAuthPage } from "@/lib/auth-utils";
import type { SearchProvider } from "./types";
import { DocumentationResults } from "./results/documentation";
import { KnowledgeBaseResults } from "./results/knowledge-base";

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
  const [results, setResults] = useState<
    ReturnType<SearchProvider["search"]> extends Promise<infer R> ? R : never
  >([] as never);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([] as never);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setResults([] as never);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await provider.search(searchTerm);
        setResults(data as never);
      } catch (err) {
        if (err instanceof Error && err.name === "AuthenticationError") {
          if (!isOnAuthPage()) {
            window.location.href = "/login";
          }
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([] as never);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, provider, debounceMs]);

  const emptyMessage = useMemo(() => {
    return (
      error || (searchTerm ? "No results found." : "Start typing to search...")
    );
  }, [error, searchTerm]);

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandInput
        onValueChange={setSearchTerm}
        placeholder={placeholder}
        value={searchTerm}
      />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {searchType === "documentation" ? (
          <DocumentationResults
            results={results as never}
            searchTerm={searchTerm}
            onSelect={() => onOpenChange(false)}
          />
        ) : (
          <KnowledgeBaseResults
            results={results as never}
            searchTerm={searchTerm}
          />
        )}
      </CommandList>
    </CommandDialog>
  );
}
