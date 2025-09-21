"use client";

import { CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import type { SearchItem } from "../types";

interface KnowledgeBaseResultsProps {
  results: SearchItem[];
  searchTerm: string;
}

export function KnowledgeBaseResults({
  results,
  searchTerm,
}: KnowledgeBaseResultsProps) {
  return (
    <>
      {results.map((result, idx) => (
        <CommandItem
          key={`kb-${result.id}-${idx}`}
          value={result.title || result.id}
          className="flex-col items-start gap-1 px-4 py-3 data-[selected=true]:bg-accent/60"
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-medium text-sm">
              {result.title || result.id}
            </span>
            {result.type && (
              <Badge variant="secondary" className="text-xs">
                {result.type}
              </Badge>
            )}
          </div>

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

          {(result as any).similarity_score && (
            <div className="flex items-center justify-between text-muted-foreground text-xs mt-1">
              <span>Similarity</span>
              <Badge variant="outline" className="text-xs">
                {((result as any).similarity_score * 100).toFixed(1)}%
              </Badge>
            </div>
          )}
        </CommandItem>
      ))}
    </>
  );
}
