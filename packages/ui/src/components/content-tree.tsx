'use client';

import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuIndicator,
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from './accordion-menu';
import { File, FileText, Hash } from 'lucide-react';
import { useMemo, useEffect, useRef } from 'react';

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

export function ContentTree({ results, searchTerm, onSelect }: ContentTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { pagesOnly, groupedResults } = useMemo(() => {
    const pages = results.filter(
      (r) => r.type === 'page' || !r.type || r.type === 'doc'
    );
    const headings = results.filter((r) => r.type === 'heading');
    const content = results.filter(
      (r) => r.type === 'text' || r.type === 'content'
    );

    const contentByPage = new Map<string, { headings: SearchItem[]; content: SearchItem[] }>();
    
    for (const result of [...headings, ...content]) {
      const pageHref = result.href?.split('#')[0];
      if (!pageHref) continue;

      if (!contentByPage.has(pageHref)) {
        contentByPage.set(pageHref, { headings: [], content: [] });
      }

      const group = contentByPage.get(pageHref)!;
      if (result.type === 'heading') {
        group.headings.push(result);
      } else {
        group.content.push(result);
      }
    }

    const grouped: Array<{ page: SearchItem; headings: SearchItem[]; content: SearchItem[] }> = [];
    const pagesWithoutContent: SearchItem[] = [];
    
    for (const page of pages) {
      const pageHref = page.href?.split('#')[0];
      if (!pageHref) continue;

      const group = contentByPage.get(pageHref);
      if (group && (group.headings.length > 0 || group.content.length > 0)) {
        grouped.push({ page, headings: group.headings, content: group.content });
      } else {
        pagesWithoutContent.push(page);
      }
    }

    return { 
      pagesOnly: pagesWithoutContent, 
      groupedResults: grouped
    };
  }, [results]);

  // Simple keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Find all focusable items
      const items = containerRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"], [data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );
      
      if (!items || items.length === 0) return;
      
      const itemsArray = Array.from(items);
      const currentIndex = itemsArray.indexOf(target);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextItem = currentIndex < itemsArray.length - 1 
          ? itemsArray[currentIndex + 1] 
          : itemsArray[0];
        
        // Remove focus from current item
        (target as HTMLElement).blur();
        
        // Focus next item
        nextItem?.focus();
        
        // Auto-expand if it's a closed parent trigger
        const trigger = nextItem.closest('[data-slot="accordion-menu-sub-trigger"]');
        if (trigger) {
          const item = trigger.closest('[data-state]');
          if (item?.getAttribute('data-state') === 'closed') {
            // Close all others first
            containerRef.current?.querySelectorAll('[data-slot="accordion-menu-sub-trigger"]').forEach((t) => {
              if (t !== trigger && t.closest('[data-state]')?.getAttribute('data-state') === 'open') {
                (t as HTMLElement).click();
              }
            });
            // Then open this one
            setTimeout(() => (trigger as HTMLElement).click(), 10);
          } else {
            // Still close others if this one is already open
            containerRef.current?.querySelectorAll('[data-slot="accordion-menu-sub-trigger"]').forEach((t) => {
              if (t !== trigger && t.closest('[data-state]')?.getAttribute('data-state') === 'open') {
                (t as HTMLElement).click();
              }
            });
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevItem = currentIndex > 0 
          ? itemsArray[currentIndex - 1] 
          : itemsArray[itemsArray.length - 1];
        
        // Check if leaving a parent's children
        const currentItem = target.closest('[data-slot="accordion-menu-item"]');
        const currentParent = currentItem?.closest('[data-slot="accordion-menu-sub-content"]');
        const prevParent = prevItem.closest('[data-slot="accordion-menu-sub-content"]');
        
        if (currentParent && currentParent !== prevParent) {
          const parentTrigger = currentParent.previousElementSibling?.querySelector('[data-slot="accordion-menu-sub-trigger"]') as HTMLElement;
          if (parentTrigger?.closest('[data-state]')?.getAttribute('data-state') === 'open') {
            parentTrigger.click();
          }
        }
        
        // Remove focus from current item
        (target as HTMLElement).blur();
        
        // Focus prev item
        prevItem?.focus();
        
        // Auto-expand if it's a closed parent trigger
        const trigger = prevItem.closest('[data-slot="accordion-menu-sub-trigger"]');
        if (trigger) {
          const item = trigger.closest('[data-state]');
          if (item?.getAttribute('data-state') === 'closed') {
            // Close all others first
            containerRef.current?.querySelectorAll('[data-slot="accordion-menu-sub-trigger"]').forEach((t) => {
              if (t !== trigger && t.closest('[data-state]')?.getAttribute('data-state') === 'open') {
                (t as HTMLElement).click();
              }
            });
            // Then open this one
            setTimeout(() => (trigger as HTMLElement).click(), 10);
          } else {
            // Still close others if this one is already open
            containerRef.current?.querySelectorAll('[data-slot="accordion-menu-sub-trigger"]').forEach((t) => {
              if (t !== trigger && t.closest('[data-state]')?.getAttribute('data-state') === 'open') {
                (t as HTMLElement).click();
              }
            });
          }
        }
      } else if (e.key === 'Enter') {
        const trigger = target.closest('[data-slot="accordion-menu-sub-trigger"]');
        if (!trigger) {
          e.preventDefault();
          (target as HTMLElement).click();
        }
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      // Focus the hovered element so keyboard nav continues from there
      const target = e.target as HTMLElement;
      const focusable = target.closest('[role="menuitem"], [data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]');
      if (focusable) {
        (focusable as HTMLElement).focus();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      container.addEventListener('mouseenter', handleMouseEnter, true); // Use capture phase
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        container.removeEventListener('mouseenter', handleMouseEnter, true);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="focus-within:[&_*:hover]:!bg-transparent [&_*:focus]:bg-accent [&_*:focus]:text-accent-foreground"
    >
      {pagesOnly.length > 0 && (
        <>
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Pages</div>
          <div className="px-2 pb-2">
            <AccordionMenu type="multiple">
              <AccordionMenuGroup>
                {pagesOnly.map((page) => (
                  <AccordionMenuItem
                    key={`page-${page.id}`}
                    value={page.href || page.id}
                    onClick={() => page.href && onSelect(page.href)}
                  >
                    <File className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{page.title || 'Untitled'}</div>
                      {page.breadcrumbs && page.breadcrumbs.length > 0 && (
                        <div className="mt-0.5 text-muted-foreground text-xs">
                          {page.breadcrumbs.join(' › ')}
                        </div>
                      )}
                    </div>
                  </AccordionMenuItem>
                ))}
              </AccordionMenuGroup>
            </AccordionMenu>
          </div>
        </>
      )}

      {groupedResults.length > 0 && (
        <>
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Content</div>
          <div className="px-2">
            <AccordionMenu type="multiple">
              <AccordionMenuGroup>
                {groupedResults.map(({ page, headings, content }) => {
                  const pageHref = page.href?.split('#')[0] || '';

                  return (
                    <AccordionMenuSub key={`page-${pageHref}`} value={pageHref}>
                      <AccordionMenuSubTrigger
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                            const trigger = e.currentTarget;
                            const item = trigger.closest('[data-state]');
                            const isOpen = item?.getAttribute('data-state') === 'open';
                            
                            if (e.key === 'ArrowRight' && !isOpen) {
                              e.preventDefault();
                              trigger.click();
                            } else if (e.key === 'ArrowLeft' && isOpen) {
                              e.preventDefault();
                              trigger.click();
                            }
                          }
                        }}
                      >
                        <File className="h-4 w-4" />
                        <span className="font-medium text-sm">{page.title || 'Untitled'}</span>
                        <AccordionMenuIndicator />
                      </AccordionMenuSubTrigger>
                      <AccordionMenuSubContent parentValue={pageHref}>
                        <AccordionMenuGroup>
                          {headings.map((heading, idx) => (
                            <AccordionMenuItem
                              key={`heading-${pageHref}-${idx}`}
                              value={`${pageHref}-heading-${idx}`}
                              onClick={() => heading.href && onSelect(heading.href)}
                            >
                              <Hash className="h-4 w-4" />
                              <span className="text-sm">{heading.title}</span>
                            </AccordionMenuItem>
                          ))}
                          {content.map((item, idx) => (
                            <AccordionMenuItem
                              key={`content-${pageHref}-${idx}`}
                              value={`${pageHref}-content-${idx}`}
                              onClick={() => item.href && onSelect(item.href)}
                            >
                              <FileText className="h-4 w-4" />
                              <div className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                {highlightText(item.title || item.summary || '', searchTerm)}
                              </div>
                            </AccordionMenuItem>
                          ))}
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
