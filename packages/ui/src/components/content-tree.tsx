'use client';

import { File, FileText, Hash } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
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
}: ContentTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

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

  // CSS-based keyboard navigation (much faster than focus manipulation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+A (Mac) or Ctrl+A (Windows/Linux) to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        onSelectAll?.();
        return;
      }

      // Find all selectable items
      const items = containerRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"], [data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );

      if (!items || items.length === 0) {
        return;
      }

      const itemsArray = Array.from(items);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => {
          const nextIndex = prev < itemsArray.length - 1 ? prev + 1 : 0;
          // Scroll into view
          itemsArray[nextIndex]?.scrollIntoView({ block: 'nearest' });
          return nextIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : itemsArray.length - 1;
          // Scroll into view
          itemsArray[nextIndex]?.scrollIntoView({ block: 'nearest' });
          return nextIndex;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = selectedIndex >= 0 ? itemsArray[selectedIndex] : null;
        if (selectedItem) {
          selectedItem.click();
        }
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      // Update selected index on hover
      const target = e.target as HTMLElement;
      const item = target.closest(
        '[role="menuitem"], [data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );
      
      if (item) {
        const items = containerRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"], [data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
        );
        if (items) {
          const itemsArray = Array.from(items);
          const index = itemsArray.indexOf(item as HTMLElement);
          if (index >= 0) {
            setSelectedIndex(index);
          }
        }
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
  }, [onSelectAll, selectedIndex]);

  return (
    <div
      className='[&_*[data-selected=true]]:bg-accent [&_*[data-selected=true]]:text-accent-foreground'
      ref={containerRef}
    >
      {pagesOnly.length > 0 && (
        <>
          <div className='px-3 py-2 font-medium text-muted-foreground text-xs'>
            Pages
          </div>
          <div className="px-2 pb-2">
            <AccordionMenu type="multiple">
              <AccordionMenuGroup>
                {pagesOnly.map((page, idx) => {
                  const itemIndex = idx;
                  return (
                    <AccordionMenuItem
                      key={`page-${page.id}`}
                      onClick={() => page.href && onSelect(page.href)}
                      value={page.href || page.id}
                      data-selected={selectedIndex === itemIndex}
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
                {groupedResults.map(({ page, headings, content }, groupIdx) => {
                  const pageHref = page.href?.split('#')[0] || '';
                  // Calculate base index for this group (pages + all previous groups)
                  let baseIndex = pagesOnly.length;
                  for (let i = 0; i < groupIdx; i++) {
                    baseIndex += 1; // trigger
                    baseIndex += groupedResults[i].headings.length;
                    baseIndex += groupedResults[i].content.length;
                  }
                  const triggerIndex = baseIndex;
                  
                  return (
                    <AccordionMenuSub key={`page-${pageHref}`} value={pageHref}>
                      <AccordionMenuSubTrigger
                        data-selected={selectedIndex === triggerIndex}
                        onKeyDown={(e) => {
                          const trigger = e.currentTarget;
                          const item = trigger.closest('[data-state]');
                          const isOpen =
                            item?.getAttribute('data-state') === 'open';

                          // Handle ArrowRight to expand
                          if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isOpen) {
                              trigger.click();
                            }
                            return;
                          }

                          // Handle ArrowLeft to collapse
                          if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isOpen) {
                              trigger.click();
                            }
                            return;
                          }

                          // Allow Space to toggle (Radix default behavior)
                          if (e.key === ' ') {
                            e.stopPropagation(); // Prevent parent handler from interfering
                            // Let Radix handle toggle
                            return;
                          }

                          // Prevent Enter from doing anything on triggers
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }

                          // For ArrowDown/ArrowUp, prevent default but DON'T stop propagation
                          // This allows the parent handler to manage navigation
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            // Don't stop propagation - let parent handle navigation
                          }
                        }}
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
                          {headings.map((heading, idx) => {
                            const itemIndex = triggerIndex + 1 + idx;
                            return (
                              <AccordionMenuItem
                                key={`heading-${pageHref}-${heading.id}`}
                                onClick={() =>
                                  heading.href && onSelect(heading.href)
                                }
                                value={`${pageHref}-heading-${heading.id}`}
                                data-selected={selectedIndex === itemIndex}
                              >
                                <Hash className="h-4 w-4" />
                                <span className="text-sm">{heading.title}</span>
                              </AccordionMenuItem>
                            );
                          })}
                          {content.map((item, idx) => {
                            const itemIndex = triggerIndex + 1 + headings.length + idx;
                            return (
                              <AccordionMenuItem
                                key={`content-${pageHref}-${item.id}`}
                                onClick={() => item.href && onSelect(item.href)}
                                value={`${pageHref}-content-${item.id}`}
                                data-selected={selectedIndex === itemIndex}
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
