"use client";

import { File, Hash } from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import type { SearchItem } from "../types";

type DocumentationResultsProps = {
  results: SearchItem[];
  searchTerm: string;
  onSelect?: () => void;
};

function highlightText(text: string, searchTerm: string) {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (regex.test(part)) {
      return (
        <mark
          className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-900/50"
          key={`highlight-${i}`}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function DocumentationResults({
  results,
  searchTerm,
  onSelect,
}: DocumentationResultsProps) {
  // Group results by type - prioritize pages first
  const pages = results.filter(
    (r) => r.type === "page" || !r.type || r.type === "doc"
  );
  const headings = results.filter((r) => r.type === "heading");
  const textMatches = results.filter(
    (r) => r.type === "text" || r.type === "content"
  );
  
  // If no explicit pages found, treat all non-heading results as pages
  const finalPages = pages.length > 0 ? pages : results.filter((r) => r.type !== "heading");
  const finalHeadings = pages.length > 0 ? headings : [];
  const finalTextMatches = pages.length > 0 ? textMatches : [];

  const handleSelect = (href: string) => {
    if (href) {
      // Always use window.location for navigation (works for both same-origin and cross-origin)
      window.location.href = href;
      onSelect?.();
    }
  };

  return (
    <>
      {finalPages.length > 0 && (
        <CommandGroup heading="Pages">
          {finalPages.map((result, idx) => (
            <CommandItem
              className="flex items-center gap-3 px-4 py-3"
              key={`page-${result.id}-${idx}`}
              onSelect={() => handleSelect(result.href || "")}
              value={`${result.title} ${result.summary}`}
            >
              <File className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">
                  {highlightText(result.title || "Untitled", searchTerm)}
                </div>
                {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {result.breadcrumbs.join(" › ")}
                  </div>
                )}
                {result.summary && (
                  <div className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                    {highlightText(result.summary, searchTerm)}
                  </div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {finalHeadings.length > 0 && (
        <>
          {finalPages.length > 0 && <CommandSeparator />}
          <CommandGroup heading="Headings">
            {finalHeadings.map((result, idx) => (
              <CommandItem
                className="flex items-center gap-3 px-4 py-3"
                key={`heading-${result.id}-${idx}`}
                onSelect={() => handleSelect(result.href || "")}
                value={`${result.title} ${result.summary}`}
              >
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">
                    {highlightText(result.title || "Untitled", searchTerm)}
                  </div>
                  {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                    <div className="mt-0.5 text-muted-foreground text-xs">
                      {result.breadcrumbs.join(" › ")}
                    </div>
                  )}
                  {result.summary && (
                    <div className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                      {highlightText(result.summary, searchTerm)}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}

      {finalTextMatches.length > 0 && (
        <>
          {(finalPages.length > 0 || finalHeadings.length > 0) && <CommandSeparator />}
          <CommandGroup heading="Content">
            {finalTextMatches.map((result, idx) => (
              <CommandItem
                className="flex items-center gap-3 px-4 py-3"
                key={`text-${result.id}-${idx}`}
                onSelect={() => handleSelect(result.href || "")}
                value={`${result.title} ${result.summary}`}
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">
                    {highlightText(result.title || "Untitled", searchTerm)}
                  </div>
                  {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                    <div className="mt-0.5 text-muted-foreground text-xs">
                      {result.breadcrumbs.join(" › ")}
                    </div>
                  )}
                  {result.summary && (
                    <div className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                      {highlightText(result.summary, searchTerm)}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}
    </>
  );
}

