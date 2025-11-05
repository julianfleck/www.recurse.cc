'use client';

import { File, FileText, Hash } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { HierarchicalSearchResult } from '../../../../components/search/types';
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuIndicator,
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from './accordion-menu';

type ContentTreeProps = {
  results: HierarchicalSearchResult[]; // Always hierarchical format
  searchTerm: string;
  onSelect: (href: string) => void;
  onSelectAll?: () => void; // Callback to focus input
  containerRef?: React.RefObject<HTMLDivElement>; // Optional ref from parent
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

  return parts.map((part, index) => {
    // Check if part matches the search term (case-insensitive)
    const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
    const key = `part-${index}-${part.slice(0, 10)}`;

    if (isMatch) {
      return (
        <span className="text-foreground" key={key}>
          {part}
        </span>
      );
    }
    return (
      <span className="text-muted-foreground" key={key}>
        {part}
      </span>
    );
  });
}

// Hierarchical rendering component (new format)
function HierarchicalContentTree({
  results,
  searchTerm,
  onSelect,
  onSelectAll,
  containerRef,
  selectedId,
  setSelectedId,
}: {
  results: HierarchicalSearchResult[];
  searchTerm: string;
  onSelect: (href: string) => void;
  onSelectAll?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  // Ensure all pages have headings array (data structure contract)
  const normalizedResults = results.map((page) => ({
    ...page,
    headings: page.headings ?? [],
  }));

  // Separate pages with content vs pages without
  const pagesWithContent = normalizedResults.filter(
    (page) => page.headings.length > 0
  );
  const pagesWithoutContent = normalizedResults.filter(
    (page) => page.headings.length === 0
  );

  // Mouse hover updates selection and takes precedence over keyboard
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const item = target.closest<HTMLElement>(
        '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );

      if (item) {
        const itemId = item.getAttribute('data-item-id');
        if (itemId) {
          // Mouse hover takes precedence - always update selection and clear ALL keyboard focus
          setSelectedId(itemId);
          // Remove focus from ALL focused elements in the container (keyboard navigation uses focus())
          if (containerRef.current?.contains(document.activeElement)) {
            (document.activeElement as HTMLElement).blur();
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [containerRef, setSelectedId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!containerRef.current?.contains(target)) {
        return;
      }

      const isAccordionItem =
        target.getAttribute('data-slot') === 'accordion-menu-item' ||
        target.getAttribute('data-slot') === 'accordion-menu-sub-trigger';

      if (!isAccordionItem && target !== containerRef.current) {
        return;
      }

      const isTrigger =
        target.getAttribute('data-slot') === 'accordion-menu-sub-trigger';

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const focusableItems =
          containerRef.current?.querySelectorAll<HTMLElement>(
            '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
          );
        if (focusableItems && focusableItems.length > 0) {
          const itemsArray = Array.from(focusableItems);
          const currentIndex = itemsArray.indexOf(target);
          const nextIndex =
            currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0;
          const nextItem = itemsArray[nextIndex];
          if (nextItem) {
            nextItem.focus();
            // Update selection to match keyboard focus
            const nextItemId = nextItem.getAttribute('data-item-id');
            if (nextItemId) {
              setSelectedId(nextItemId);
            }
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const focusableItems =
          containerRef.current?.querySelectorAll<HTMLElement>(
            '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
          );
        if (focusableItems && focusableItems.length > 0) {
          const itemsArray = Array.from(focusableItems);
          const currentIndex = itemsArray.indexOf(target);
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : itemsArray.length - 1;
          const prevItem = itemsArray[prevIndex];
          if (prevItem) {
            prevItem.focus();
            // Update selection to match keyboard focus
            const prevItemId = prevItem.getAttribute('data-item-id');
            if (prevItemId) {
              setSelectedId(prevItemId);
            }
          }
        }
      } else if (e.key === 'ArrowRight' && isTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const accordionItem = target.closest('[data-state]');
        const isOpen = accordionItem?.getAttribute('data-state') === 'open';
        if (!isOpen) {
          target.click();
        }
      } else if (e.key === 'ArrowLeft' && isTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const accordionItem = target.closest('[data-state]');
        const isOpen = accordionItem?.getAttribute('data-state') === 'open';
        if (isOpen) {
          target.click();
        }
      } else if (e.key === ' ' && isTrigger) {
        e.preventDefault();
        e.stopPropagation();
        target.click();
      } else if (e.key === 'Enter') {
        if (isTrigger) {
          e.preventDefault();
          e.stopPropagation();
          const triggerId = target.getAttribute('data-item-id');
          if (triggerId?.startsWith('trigger-')) {
            const pageUrl = triggerId.replace('trigger-', '');
            const page = normalizedResults.find((p) => p.url === pageUrl);
            if (page?.url) {
              onSelect(page.url);
            }
          }
        } else {
          const itemId = target.getAttribute('data-item-id');
          if (itemId) {
            e.preventDefault();
            e.stopPropagation();
            // Extract href from item
            if (itemId.startsWith('page-')) {
              const pageUrl = itemId.replace('page-', '');
              const page = normalizedResults.find((p) => p.url === pageUrl);
              if (page?.url) {
                onSelect(page.url);
              }
            } else if (itemId.startsWith('heading-')) {
              // Format: "heading-{pageUrl}-{headingId}"
              const parts = itemId.split('-');
              if (parts.length >= 3) {
                const pageUrl = parts.slice(1, -1).join('-');
                const headingId = parts[parts.length - 1];
                const page = normalizedResults.find((p) => p.url === pageUrl);
                const heading = page?.headings.find((h) => h.id === headingId);
                if (heading?.url) {
                  onSelect(heading.url);
                }
              }
            } else if (itemId.startsWith('content-')) {
              // Format: "content-{pageUrl}-synthetic-{contentId}" or "content-{pageUrl}-{headingId}-{contentId}"
              // Extract by looking for known patterns
              const syntheticPattern = '-synthetic-';
              const syntheticIndex = itemId.indexOf(syntheticPattern);

              if (syntheticIndex > 0) {
                // Synthetic content: content-{pageUrl}-synthetic-{contentId}
                const pageUrl = itemId.slice('content-'.length, syntheticIndex);
                const contentId = itemId.slice(
                  syntheticIndex + syntheticPattern.length
                );
                const page = normalizedResults.find((p) => p.url === pageUrl);
                if (page) {
                  // Find content in headings with same URL as page (synthetic heading)
                  const syntheticHeading = page.headings.find((h) => {
                    const hUrl = h.url || h.id || '';
                    const hHref = hUrl.split('#')[0] || hUrl;
                    return hHref === pageUrl && !hUrl.includes('#');
                  });
                  const content = syntheticHeading?.content.find(
                    (c, idx) => c.id === contentId || String(idx) === contentId
                  );
                  if (content?.url) {
                    onSelect(content.url);
                  }
                }
              } else {
                // Regular content: content-{pageUrl}-{headingId}-{contentIndex}
                // Split and work backwards since contentIndex is numeric
                const parts = itemId.slice('content-'.length).split('-');
                if (parts.length >= 2) {
                  // Try to find the page first, then match heading and content by index
                  for (const page of normalizedResults) {
                    if (itemId.startsWith(`content-${page.url}-`)) {
                      const remaining = itemId.slice(
                        `content-${page.url}-`.length
                      );
                      // Try each heading to find matching pattern
                      for (const heading of page.headings) {
                        if (remaining.startsWith(`${heading.id}-`)) {
                          const contentIndexStr = remaining.slice(
                            `${heading.id}-`.length
                          );
                          const contentIndex = Number.parseInt(
                            contentIndexStr,
                            10
                          );
                          if (
                            !Number.isNaN(contentIndex) &&
                            heading.content[contentIndex]
                          ) {
                            const content = heading.content[contentIndex];
                            if (content?.url) {
                              onSelect(content.url);
                              return;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [normalizedResults, onSelect, containerRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      e.stopPropagation();
      onSelectAll?.();
    }
  };

  return (
    <div
      className="outline-none"
      onKeyDown={handleKeyDown}
      ref={containerRef}
      tabIndex={0}
    >
      {/* Pages without content */}
      {pagesWithoutContent.length > 0 && (
        <>
          <div className="px-3 py-2 font-medium text-muted-foreground text-xs">
            Pages
          </div>
          <div className="px-2 pb-2">
            <AccordionMenu
              matchPath={() => false}
              selectedValue={undefined}
              type="multiple"
            >
              <AccordionMenuGroup>
                {pagesWithoutContent.map((page) => {
                  const pageKey =
                    page.url || page.id || `page-${Math.random()}`;
                  const itemId = `page-${pageKey}`;
                  return (
                    <AccordionMenuItem
                      data-item-id={itemId}
                      data-selected={selectedId === itemId ? 'true' : undefined}
                      key={itemId}
                      onClick={() => page.url && onSelect(page.url)}
                      value={pageKey}
                    >
                      <File className="h-4 w-4" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">
                          {highlightText(page.title, searchTerm)}
                        </div>
                      </div>
                    </AccordionMenuItem>
                  );
                })}
              </AccordionMenuGroup>
            </AccordionMenu>
          </div>
        </>
      )}

      {/* Pages with nested content */}
      {pagesWithContent.length > 0 && (
        <>
          {pagesWithoutContent.length > 0 && (
            <div className="px-3 py-2 font-medium text-muted-foreground text-xs">
              Content
            </div>
          )}
          <div className="px-2">
            <AccordionMenu
              matchPath={() => false}
              selectedValue={undefined}
              type="multiple"
            >
              <AccordionMenuGroup>
                {pagesWithContent.map((page) => {
                  const pageUrl = page.url || page.id || '';
                  const pageHref = pageUrl.split('#')[0] || pageUrl;
                  const triggerId = `trigger-${pageHref}`;

                  if (!pageHref) {
                    console.warn('[ContentTree] Page missing url/id:', page);
                    return null;
                  }

                  return (
                    <AccordionMenuSub key={`page-${pageHref}`} value={pageHref}>
                      <AccordionMenuSubTrigger
                        data-item-id={triggerId}
                        data-selected={
                          selectedId === triggerId ? 'true' : undefined
                        }
                      >
                        <File className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {highlightText(page.title, searchTerm)}
                        </span>
                        <AccordionMenuIndicator />
                      </AccordionMenuSubTrigger>
                      <AccordionMenuSubContent
                        parentValue={pageHref}
                        type="multiple"
                      >
                        <AccordionMenuGroup>
                          {page.headings.map((heading) => {
                            const headingUrl = heading.url || heading.id || '';
                            const headingHref =
                              headingUrl.split('#')[0] || headingUrl;
                            // Check if this is a synthetic heading (same URL as page, no anchor)
                            const isSyntheticHeading =
                              headingHref === pageHref &&
                              !headingUrl.includes('#');

                            // If synthetic heading, render content directly without heading wrapper
                            if (
                              isSyntheticHeading &&
                              heading.content.length > 0
                            ) {
                              return (
                                <React.Fragment
                                  key={`synthetic-${pageHref}-${heading.id}`}
                                >
                                  {heading.content.map(
                                    (contentItem, contentIndex) => {
                                      // Always use index to ensure uniqueness
                                      const contentItemId = `content-${pageHref}-synthetic-${contentIndex}`;

                                      return (
                                        <AccordionMenuItem
                                          data-item-id={contentItemId}
                                          data-selected={
                                            selectedId === contentItemId
                                              ? 'true'
                                              : undefined
                                          }
                                          key={contentItemId}
                                          onClick={() =>
                                            onSelect(contentItem.url)
                                          }
                                          value={`${pageHref}-content-synthetic-${contentIndex}`}
                                        >
                                          <FileText className="h-4 w-4" />
                                          <div className="min-w-0 flex-1">
                                            <div className="line-clamp-2 text-muted-foreground text-xs">
                                              {highlightText(
                                                contentItem.title,
                                                searchTerm
                                              )}
                                            </div>
                                          </div>
                                        </AccordionMenuItem>
                                      );
                                    }
                                  )}
                                </React.Fragment>
                              );
                            }

                            // If heading has no content, render as plain item instead of accordion
                            if (heading.content.length === 0) {
                              const itemId = `heading-${pageHref}-${heading.id}`;

                              return (
                                <AccordionMenuItem
                                  data-item-id={itemId}
                                  data-selected={
                                    selectedId === itemId ? 'true' : undefined
                                  }
                                  key={itemId}
                                  onClick={() => onSelect(heading.url)}
                                  value={itemId}
                                >
                                  <Hash className="h-4 w-4" />
                                  <span className="text-sm">
                                    {highlightText(heading.title, searchTerm)}
                                  </span>
                                </AccordionMenuItem>
                              );
                            }

                            // Real heading with content - render as accordion wrapper
                            const itemId = `heading-${pageHref}-${heading.id}`;
                            const headingSubId = `heading-sub-${pageHref}-${heading.id}`;

                            return (
                              <AccordionMenuSub
                                key={itemId}
                                value={headingSubId}
                              >
                                <AccordionMenuSubTrigger
                                  data-item-id={itemId}
                                  data-selected={
                                    selectedId === itemId ? 'true' : undefined
                                  }
                                  onClick={() => onSelect(heading.url)}
                                >
                                  <Hash className="h-4 w-4" />
                                  <span className="text-sm">
                                    {highlightText(heading.title, searchTerm)}
                                  </span>
                                  <AccordionMenuIndicator />
                                </AccordionMenuSubTrigger>
                                <AccordionMenuSubContent
                                  parentValue={headingSubId}
                                  type="multiple"
                                >
                                  <AccordionMenuGroup>
                                    {heading.content.map(
                                      (contentItem, contentIndex) => {
                                        // Always include index in key to ensure uniqueness even if contentItem.id is duplicated
                                        const contentItemId = `content-${pageHref}-${heading.id}-${contentIndex}`;

                                        return (
                                          <AccordionMenuItem
                                            data-item-id={contentItemId}
                                            data-selected={
                                              selectedId === contentItemId
                                                ? 'true'
                                                : undefined
                                            }
                                            key={contentItemId}
                                            onClick={() =>
                                              onSelect(contentItem.url)
                                            }
                                            value={`${pageHref}-content-${heading.id}-${contentIndex}`}
                                          >
                                            <FileText className="h-4 w-4" />
                                            <div className="min-w-0 flex-1">
                                              <div className="line-clamp-2 text-muted-foreground text-xs">
                                                {highlightText(
                                                  contentItem.title,
                                                  searchTerm
                                                )}
                                              </div>
                                            </div>
                                          </AccordionMenuItem>
                                        );
                                      }
                                    )}
                                  </AccordionMenuGroup>
                                </AccordionMenuSubContent>
                              </AccordionMenuSub>
                            );
                          })}
                        </AccordionMenuGroup>
                      </AccordionMenuSubContent>
                    </AccordionMenuSub>
                  );
                })}
              </AccordionMenuGroup>
            </AccordionMenu>
          </div>
        </>
      )}
    </div>
  );
}

export function ContentTree({
  results,
  searchTerm,
  onSelect,
  onSelectAll,
  containerRef: externalRef,
}: ContentTreeProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef || internalRef;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <HierarchicalContentTree
      containerRef={containerRef}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      results={results}
      searchTerm={searchTerm}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  );
}
