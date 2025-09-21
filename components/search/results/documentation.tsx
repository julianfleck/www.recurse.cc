"use client";

import { useRouter } from "next/navigation";
import { File, Hash } from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import type { SearchItem } from "../types";

interface DocumentationResultsProps {
  results: SearchItem[];
  searchTerm: string;
  onSelect?: () => void;
}

function highlightText(text: string, searchTerm: string) {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">
        {part}
      </mark>
    ) : part
  );
}

export function DocumentationResults({
  results,
  searchTerm,
  onSelect,
}: DocumentationResultsProps) {
  const router = useRouter();

  // Group results by type
  const pages = results.filter(r => r.type === "page" || !r.type || r.type === "doc");
  const headings = results.filter(r => r.type === "heading");
  const textMatches = results.filter(r => r.type === "text" || r.type === "content");

  const handleSelect = (href: string) => {
    if (href) {
      router.push(href);
      onSelect?.();
    }
  };

  return (
    <>
      {pages.length > 0 && (
        <>
          <CommandGroup heading="Pages">
            {pages.map((result, idx) => (
              <CommandItem
                key={`page-${result.id}-${idx}`}
                value={`${result.title} ${result.summary}`}
                onSelect={() => handleSelect(result.href || "")}
                className="flex items-center gap-3 px-4 py-3"
              >
                <File className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {highlightText(result.title || result.id, searchTerm)}
                  </div>
                  {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {result.breadcrumbs.join(" › ")}
                    </div>
                  )}
                  {result.summary && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {highlightText(result.summary, searchTerm)}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}

      {headings.length > 0 && (
        <>
          {pages.length > 0 && <CommandSeparator />}
          <CommandGroup heading="Headings">
            {headings.map((result, idx) => (
              <CommandItem
                key={`heading-${result.id}-${idx}`}
                value={`${result.title} ${result.summary}`}
                onSelect={() => handleSelect(result.href || "")}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {highlightText(result.title || result.id, searchTerm)}
                  </div>
                  {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {result.breadcrumbs.join(" › ")}
                    </div>
                  )}
                  {result.summary && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {highlightText(result.summary, searchTerm)}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}

      {textMatches.length > 0 && (
        <>
          {(pages.length > 0 || headings.length > 0) && <CommandSeparator />}
          <CommandGroup heading="Content">
            {textMatches.map((result, idx) => (
              <CommandItem
                key={`text-${result.id}-${idx}`}
                value={`${result.title} ${result.summary}`}
                onSelect={() => handleSelect(result.href || "")}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {highlightText(result.title || result.id, searchTerm)}
                  </div>
                  {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {result.breadcrumbs.join(" › ")}
                    </div>
                  )}
                  {result.summary && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
