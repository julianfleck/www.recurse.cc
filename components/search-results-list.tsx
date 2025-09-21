"use client";

import { CommandItem } from "@/components/ui/command";

export interface SearchResult {
  id: string;
  title?: string;
  summary?: string;
  type?: string;
  metadata?: string[];
  similarity_score?: number;
  reranked_score?: number;
  index?: number;
}

interface SearchResultsListProps {
  results: SearchResult[];
  searchTerm: string;
  isLoading?: boolean;
}

export function SearchResultsList({
  results,
  searchTerm,
  isLoading = false,
}: SearchResultsListProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <span className="text-muted-foreground text-sm">Searching...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {results.map((result) => (
        <CommandItem
          key={result.id}
          value={result.title || result.id}
          className="flex-col items-start gap-1 px-4 py-3"
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-medium">{result.title || result.id}</span>
            {result.type && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {result.type}
              </span>
            )}
          </div>

          {result.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {result.summary}
            </p>
          )}

          {(result.metadata && result.metadata.length > 0) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{result.metadata.slice(0, 2).join(" › ")}</span>
              {result.metadata.length > 2 && <span>› ...</span>}
            </div>
          )}
        </CommandItem>
      ))}
    </>
  );
}
