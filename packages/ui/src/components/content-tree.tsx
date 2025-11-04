'use client';

import { File, FileText, Hash } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuIndicator,
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from './accordion-menu';
import type { HierarchicalSearchResult } from '../../../../components/search/types';

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

  return parts.map((part) => {
    const isMatch = regex.test(part);
    const key = isMatch ? `highlight-${part}` : `text-${part}`;
    
    if (isMatch) {
      return (
        <mark
          className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-900/50"
          key={key}
        >
          {part}
        </mark>
      );
    }
    return <span key={key}>{part}</span>;
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
  const pagesWithContent = normalizedResults.filter((page) => page.headings.length > 0);
  const pagesWithoutContent = normalizedResults.filter((page) => page.headings.length === 0);
  

  // Mouse hover updates selection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const item = target.closest<HTMLElement>(
        '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );
      
      if (item) {
        const itemId = item.getAttribute('data-item-id');
        if (itemId && itemId !== selectedId) {
          setSelectedId(itemId);
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
  }, [selectedId, containerRef]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!containerRef.current?.contains(target)) {
        return;
      }

      const isAccordionItem = target.getAttribute('data-slot') === 'accordion-menu-item' ||
                              target.getAttribute('data-slot') === 'accordion-menu-sub-trigger';
      
      if (!isAccordionItem && target !== containerRef.current) {
        return;
      }

      const isTrigger = target.getAttribute('data-slot') === 'accordion-menu-sub-trigger';

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const focusableItems = containerRef.current?.querySelectorAll<HTMLElement>(
          '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
        );
        if (focusableItems && focusableItems.length > 0) {
          const itemsArray = Array.from(focusableItems);
          const currentIndex = itemsArray.indexOf(target);
          const nextIndex = currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0;
          itemsArray[nextIndex]?.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const focusableItems = containerRef.current?.querySelectorAll<HTMLElement>(
          '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
        );
        if (focusableItems && focusableItems.length > 0) {
          const itemsArray = Array.from(focusableItems);
          const currentIndex = itemsArray.indexOf(target);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemsArray.length - 1;
          itemsArray[prevIndex]?.focus();
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
            const page = normalizedResults.find(p => p.url === pageUrl);
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
              const page = normalizedResults.find(p => p.url === pageUrl);
              if (page?.url) {
                onSelect(page.url);
              }
            } else if (itemId.startsWith('heading-')) {
              // Format: "heading-{pageUrl}-{headingId}"
              const parts = itemId.split('-');
              if (parts.length >= 3) {
                const pageUrl = parts.slice(1, -1).join('-');
                const headingId = parts[parts.length - 1];
                const page = normalizedResults.find(p => p.url === pageUrl);
                const heading = page?.headings.find(h => h.id === headingId);
                if (heading?.url) {
                  onSelect(heading.url);
                }
              }
            } else if (itemId.startsWith('content-')) {
              // Format: "content-{pageUrl}-{contentId}"
              const parts = itemId.split('-');
              if (parts.length >= 3) {
                const pageUrl = parts.slice(1, -1).join('-');
                const contentId = parts[parts.length - 1];
                const page = normalizedResults.find(p => p.url === pageUrl);
                const content = page?.headings.flatMap(h => h.content).find(c => c.id === contentId);
                if (content?.url) {
                  onSelect(content.url);
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
      className='[&_*[data-selected=true]]:bg-accent [&_*[data-selected=true]]:text-accent-foreground outline-none'
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Pages without content */}
      {pagesWithoutContent.length > 0 && (
        <>
          <div className='px-3 py-2 font-medium text-muted-foreground text-xs'>
            Pages
          </div>
          <div className="px-2 pb-2">
            <AccordionMenu type="multiple">
              <AccordionMenuGroup>
                {pagesWithoutContent.map((page) => {
                  const pageKey = page.url || page.id || `page-${Math.random()}`;
                  const itemId = `page-${pageKey}`;
                  return (
                    <AccordionMenuItem
                      key={itemId}
                      onClick={() => page.url && onSelect(page.url)}
                      value={pageKey}
                      data-item-id={itemId}
                      data-selected={selectedId === itemId}
                    >
                      <File className="h-4 w-4" />
                      <div className='min-w-0 flex-1'>
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
            <div className='px-3 py-2 font-medium text-muted-foreground text-xs'>
              Content
            </div>
          )}
          <div className="px-2">
            <AccordionMenu type="multiple">
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
                        data-selected={selectedId === triggerId}
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
                            const itemId = `heading-${pageHref}-${heading.id}`;
                            const headingSubId = `heading-sub-${pageHref}-${heading.id}`;
                            
                            return (
                              <AccordionMenuSub key={itemId} value={headingSubId}>
                                <AccordionMenuSubTrigger
                                  data-item-id={itemId}
                                  data-selected={selectedId === itemId}
                                  onClick={() => onSelect(heading.url)}
                                >
                                  <Hash className="h-4 w-4" />
                                  <span className="text-sm">{highlightText(heading.title, searchTerm)}</span>
                                  <AccordionMenuIndicator />
                                </AccordionMenuSubTrigger>
                                <AccordionMenuSubContent
                                  parentValue={headingSubId}
                                  type="multiple"
                                >
                                  <AccordionMenuGroup>
                                    {heading.content.map((contentItem) => {
                                      const contentItemId = `content-${pageHref}-${contentItem.id}`;
                                      
                                      return (
                                        <AccordionMenuItem
                                          key={contentItemId}
                                          onClick={() => onSelect(contentItem.url)}
                                          value={`${pageHref}-content-${contentItem.id}`}
                                          data-item-id={contentItemId}
                                          data-selected={selectedId === contentItemId}
                                        >
                                          <FileText className="h-4 w-4" />
                                          <div className='min-w-0 flex-1'>
                                            <div className='line-clamp-2 text-muted-foreground text-xs'>
                                              {highlightText(contentItem.title, searchTerm)}
                                            </div>
                                          </div>
                                        </AccordionMenuItem>
                                      );
                                    })}
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
      results={results}
      searchTerm={searchTerm}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      containerRef={containerRef}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  );
}
