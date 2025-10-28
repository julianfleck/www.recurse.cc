"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      {results.map((result, idx) => (
        <CommandItem
          className="flex-col items-start gap-1 px-4 py-3 data-[selected=true]:bg-accent/60"
          key={`${result.id}-${idx}`}
          onSelect={() => {
            if ((result as any).href) {
              router.push((result as any).href as string);
            }
          }}
          value={result.title || result.id}
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-medium text-sm">
              {result.title || result.id}
            </span>
            {result.type && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                {result.type}
              </span>
            )}
          </div>

          {(result as any).breadcrumbs &&
            (result as any).breadcrumbs.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                {(result as any).breadcrumbs.join(" › ")}
              </div>
            )}

          {result.summary && (
            <p className="line-clamp-2 text-muted-foreground text-xs">
              {result.summary}
            </p>
          )}

          {result.metadata && result.metadata.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <span className="truncate">
                {result.metadata.slice(0, 2).join(" › ")}
                {result.metadata.length > 2 && " › ..."}
              </span>
            </div>
          )}
        </CommandItem>
      ))}
    </>
  );
}
