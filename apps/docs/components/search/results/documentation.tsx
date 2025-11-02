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
              className="flex items-center gap-3 px-4 py-3"
              key={`page-${result.id}-${idx}`}
              onSelect={() => handleSelect(result.href || "")}
              value={`${result.title} ${result.summary}`}
            >
              <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">
                  {result.title || "Untitled"}
                </div>
                {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {result.breadcrumbs.join(" › ")}
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
                <Hash className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">
                    {result.title || "Untitled"}
                  </div>
                  {result.breadcrumbs && result.breadcrumbs.length > 0 && (
                    <div className="mt-0.5 text-muted-foreground text-xs">
                      {result.breadcrumbs.join(" › ")}
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
            {finalTextMatches.map((result, idx) => {
              // For content results, extract page title from various sources
              // Priority: pageTitle field > last breadcrumb > metadata > URL path > fallback to "Untitled"
              let pageTitle = "Untitled";
              
              if (result.pageTitle) {
                pageTitle = result.pageTitle;
              } else if (result.breadcrumbs && result.breadcrumbs.length > 0) {
                pageTitle = result.breadcrumbs[result.breadcrumbs.length - 1];
              } else if (result.metadata && result.metadata.length > 0) {
                // Parse metadata which might be "Breadcrumb › Breadcrumb"
                const lastMeta = result.metadata[result.metadata.length - 1];
                const parts = lastMeta.split(" › ");
                pageTitle = parts[parts.length - 1] || lastMeta;
              } else if (result.href) {
                // Extract from URL path as last resort
                try {
                  const url = new URL(result.href, window.location.origin);
                  const pathParts = url.pathname.split('/').filter(Boolean);
                  if (pathParts.length > 0) {
                    // Get last path segment and format it
                    const lastSegment = pathParts[pathParts.length - 1];
                    pageTitle = lastSegment
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  }
                } catch (e) {
                  // If URL parsing fails, keep "Untitled"
                }
              }
              
              return (
                <CommandItem
                  className="flex items-center gap-3 px-4 py-3"
                  key={`text-${result.id}-${idx}`}
                  onSelect={() => handleSelect(result.href || "")}
                  value={`${pageTitle} ${result.title} ${result.summary}`}
                >
                  <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">
                      {pageTitle}
                    </div>
                    {result.breadcrumbs && result.breadcrumbs.length > 1 && (
                      <div className="mt-0.5 text-muted-foreground text-xs">
                        {result.breadcrumbs.slice(0, -1).join(" › ")}
                      </div>
                    )}
                    <div className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                      {highlightText(result.title || result.summary || "", searchTerm)}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </>
      )}
    </>
  );
}
