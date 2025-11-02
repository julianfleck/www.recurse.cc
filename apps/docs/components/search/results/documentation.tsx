"use client";

import { File, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@recurse/ui/components/command";
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
  const router = useRouter();

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
      // Check if href is cross-origin (different domain/subdomain)
      if (typeof window !== "undefined" && (href.startsWith("http://") || href.startsWith("https://"))) {
        const hrefUrl = new URL(href);
        const currentUrl = new URL(window.location.href);
        // If different origin, use full page navigation
        if (hrefUrl.origin !== currentUrl.origin) {
          window.location.href = href;
          onSelect?.();
          return;
        }
      }
      // Same origin or relative path: use router
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
              key={`page-${result.id}-${idx}`}
              onSelect={() => handleSelect(result.href || "")}
              value={`${result.title} ${result.summary}`}
            >
              <File />
              <span>{highlightText(result.title || "Untitled", searchTerm)}</span>
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
                key={`heading-${result.id}-${idx}`}
                onSelect={() => handleSelect(result.href || "")}
                value={`${result.title} ${result.summary}`}
              >
                <Hash />
                <span>{highlightText(result.title || "Untitled", searchTerm)}</span>
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
                key={`text-${result.id}-${idx}`}
                onSelect={() => handleSelect(result.href || "")}
                value={`${result.title} ${result.summary}`}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span>{highlightText(result.title || "Untitled", searchTerm)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      )}
    </>
  );
}
