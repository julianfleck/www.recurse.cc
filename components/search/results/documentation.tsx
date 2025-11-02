"use client";

import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
  ContentTree,
} from "@recurse/ui/components";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SearchItem } from "../types";

type DocumentationResultsProps = {
  results: SearchItem[];
  searchTerm: string;
  onSelect?: () => void;
  isLoading?: boolean;
};

function highlightText(text: string, searchTerm: string) {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
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
  isLoading = false,
}: DocumentationResultsProps) {
  const router = useRouter();

  // Group results by type - prioritize pages first
  const pages = results.filter(
    (r) => r.type === 'page' || !r.type || r.type === 'doc'
  );
  const headings = results.filter((r) => r.type === 'heading');
  const textMatches = results.filter(
    (r) => r.type === 'text' || r.type === 'content'
  );

  // If no explicit pages found, treat all non-heading results as pages
  const finalPages =
    pages.length > 0 ? pages : results.filter((r) => r.type !== 'heading');
  const finalHeadings = pages.length > 0 ? headings : [];
  const finalTextMatches = pages.length > 0 ? textMatches : [];

  const handleSelect = (href: string) => {
    if (href) {
      router.push(href);
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
              onSelect={() => handleSelect(result.href || '')}
              value={`${result.title} ${result.summary}`}
            >
              <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">
                  {result.title || 'Untitled'}
                </div>
                {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {result.breadcrumbs.join(' › ')}
                  </div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {(finalHeadings.length > 0 || finalTextMatches.length > 0) && (
        <>
          {finalPages.length > 0 && <CommandSeparator />}
          <ContentTree
            results={[...finalHeadings, ...finalTextMatches]}
            searchTerm={searchTerm}
            onSelect={handleSelect}
          />
        </>
      )}
    </>
  );
}
