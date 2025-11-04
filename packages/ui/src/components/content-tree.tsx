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

export type SearchItem = {
  id: string;
  type?: 'page' | 'heading' | 'text' | 'content' | 'doc';
  title?: string;
  summary?: string;
  href?: string;
  breadcrumbs?: string[];
  metadata?: string[];
  pageTitle?: string;
};

type ContentTreeProps = {
  results: SearchItem[];
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

  const { pagesOnly, groupedResults } = useMemo(() => {
    const pages = results.filter(
      (r) => r.type === 'page' || !r.type || r.type === 'doc'
    );
    const headings = results.filter((r) => r.type === 'heading');
    const content = results.filter(
      (r) => r.type === 'text' || r.type === 'content'
    );

    const contentByPage = new Map<
      string,
      { headings: SearchItem[]; content: SearchItem[] }
    >();

    for (const result of [...headings, ...content]) {
      const pageHref = result.href?.split('#')[0];
      if (!pageHref) {
        continue;
      }

      if (!contentByPage.has(pageHref)) {
        contentByPage.set(pageHref, { headings: [], content: [] });
      }

      const group = contentByPage.get(pageHref);
      if (!group) {
        continue;
      }
      
      if (result.type === 'heading') {
        group.headings.push(result);
      } else {
        group.content.push(result);
      }
    }

    const grouped: Array<{
      page: SearchItem;
      headings: SearchItem[];
      content: SearchItem[];
    }> = [];
    const pagesWithoutContent: SearchItem[] = [];

    for (const page of pages) {
      const pageHref = page.href?.split('#')[0];
      if (!pageHref) {
        continue;
      }

      const group = contentByPage.get(pageHref);
      const hasContent = group && (group.headings.length > 0 || group.content.length > 0);
      
      if (hasContent) {
        grouped.push({
          page,
          headings: group.headings,
          content: group.content,
        });
      } else {
        pagesWithoutContent.push(page);
      }
    }

    return {
      pagesOnly: pagesWithoutContent,
      groupedResults: grouped,
    };
  }, [results]);

  // Auto-focus container when results change and set initial selection
  useEffect(() => {
    if (results.length > 0 && containerRef.current) {
      // Set initial selection to first item
      const firstItem = containerRef.current.querySelector<HTMLElement>(
        '[data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );
      const firstId = firstItem?.getAttribute('data-item-id');
      if (firstId) {
        setSelectedId(firstId);
      }
    } else {
      setSelectedId(null);
    }
  }, [results]);

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
  }, [selectedId]);

  // Keyboard navigation: map arrow keys to focus navigation (like tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if event is from within our container
      const target = e.target as HTMLElement;
      if (!containerRef.current?.contains(target)) {
        return;
      }

      // Check if target is one of our accordion items
      const isAccordionItem = target.getAttribute('data-slot') === 'accordion-menu-item' ||
                              target.getAttribute('data-slot') === 'accordion-menu-sub-trigger';
      
      if (!isAccordionItem && target !== containerRef.current) {
        return;
      }

      const isTrigger = target.getAttribute('data-slot') === 'accordion-menu-sub-trigger';

      // Map arrow keys to focus navigation (like tab)
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
        // Expand accordion if it's closed
        e.preventDefault();
        e.stopPropagation();
        const accordionItem = target.closest('[data-state]');
        const isOpen = accordionItem?.getAttribute('data-state') === 'open';
        if (!isOpen) {
          target.click();
        }
      } else if (e.key === 'ArrowLeft' && isTrigger) {
        // Collapse accordion if it's open
        e.preventDefault();
        e.stopPropagation();
        const accordionItem = target.closest('[data-state]');
        const isOpen = accordionItem?.getAttribute('data-state') === 'open';
        if (isOpen) {
          target.click();
        }
      } else if (e.key === ' ' && isTrigger) {
        // Toggle accordion
        e.preventDefault();
        e.stopPropagation();
        target.click();
      }
    };

    // Use capture phase to intercept before Radix handles it
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Cmd+A (Mac) or Ctrl+A (Windows/Linux) to focus input
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
      {pagesOnly.length > 0 && (
        <>
          <div className='px-3 py-2 font-medium text-muted-foreground text-xs'>
            Pages
          </div>
          <div className="px-2 pb-2">
            <AccordionMenu type="multiple">
              <AccordionMenuGroup>
                {pagesOnly.map((page) => {
                  const itemId = `page-${page.id}`;
                  return (
                    <AccordionMenuItem
                      key={itemId}
                      onClick={() => page.href && onSelect(page.href)}
                      value={page.href || page.id}
                      data-item-id={itemId}
                      data-selected={selectedId === itemId}
                    >
                    <File className="h-4 w-4" />
                    <div className='min-w-0 flex-1'>
                      <div className="font-medium text-sm">
                        {page.title || 'Untitled'}
                      </div>
                      {page.breadcrumbs && page.breadcrumbs.length > 0 && (
                        <div className="mt-0.5 text-muted-foreground text-xs">
                          {page.breadcrumbs.join(' › ')}
                        </div>
                      )}
                    </div>
                  </AccordionMenuItem>
                  );
                })}
              </AccordionMenuGroup>
            </AccordionMenu>
          </div>
        </>
      )}

      {groupedResults.length > 0 && (
        <>
          <div className='px-3 py-2 font-medium text-muted-foreground text-xs'>
            Content
          </div>
          <div className="px-2">
            <AccordionMenu type="multiple">
              <AccordionMenuGroup>
                {groupedResults.map(({ page, headings, content }) => {
                  const pageHref = page.href?.split('#')[0] || '';
                  const triggerId = `trigger-${pageHref}`;
                  
                  return (
                    <AccordionMenuSub key={`page-${pageHref}`} value={pageHref}>
                      <AccordionMenuSubTrigger
                        data-item-id={triggerId}
                        data-selected={selectedId === triggerId}
                      >
                        <File className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {page.title || 'Untitled'}
                        </span>
                        <AccordionMenuIndicator />
                      </AccordionMenuSubTrigger>
                      <AccordionMenuSubContent
                        parentValue={pageHref}
                        type="multiple"
                      >
                        <AccordionMenuGroup>
                          {headings.map((heading) => {
                            const itemId = `heading-${pageHref}-${heading.id}`;
                            return (
                              <AccordionMenuItem
                                key={itemId}
                                onClick={() =>
                                  heading.href && onSelect(heading.href)
                                }
                                value={`${pageHref}-heading-${heading.id}`}
                                data-item-id={itemId}
                                data-selected={selectedId === itemId}
                              >
                                <Hash className="h-4 w-4" />
                                <span className="text-sm">{heading.title}</span>
                              </AccordionMenuItem>
                            );
                          })}
                          {content.map((item) => {
                            const itemId = `content-${pageHref}-${item.id}`;
                            return (
                              <AccordionMenuItem
                                key={itemId}
                                onClick={() => item.href && onSelect(item.href)}
                                value={`${pageHref}-content-${item.id}`}
                                data-item-id={itemId}
                                data-selected={selectedId === itemId}
                              >
                                <FileText className="h-4 w-4" />
                                <div className='line-clamp-2 flex-1 text-muted-foreground text-xs'>
                                  {highlightText(
                                    item.title || item.summary || '',
                                    searchTerm
                                  )}
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
            </AccordionMenu>
          </div>
        </>
      )}
    </div>
  );
}
