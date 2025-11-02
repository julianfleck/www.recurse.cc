'use client';

import { CommandGroup } from './command';
import { Tree, TreeItem, TreeItemLabel } from './tree';
import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { File, Hash } from 'lucide-react';
import { useMemo } from 'react';

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

interface TreeNode {
  id: string;
  name: string;
  type: 'page' | 'heading' | 'content';
  href?: string;
  content?: string;
  children?: string[];
}

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
  const { treeData, rootIds } = useMemo(() => {
    const items: Record<string, TreeNode> = {};
    const roots: string[] = [];
    
    const pageMap = new Map<string, { page: SearchItem; headings: SearchItem[]; content: SearchItem[] }>();
    
    for (const result of results) {
      const pageId = result.href?.split('#')[0] || result.id;
      
      if (!pageMap.has(pageId)) {
        let pageTitle = 'Untitled';
        if (result.pageTitle) {
          pageTitle = result.pageTitle;
        } else if (result.breadcrumbs && result.breadcrumbs.length > 0) {
          pageTitle = result.breadcrumbs[result.breadcrumbs.length - 1];
        } else if (result.title && result.type === 'page') {
          pageTitle = result.title;
        }
        
        pageMap.set(pageId, {
          page: { ...result, title: pageTitle, href: pageId },
          headings: [],
          content: [],
        });
      }
      
      const group = pageMap.get(pageId)!;
      
      if (result.type === 'heading') {
        group.headings.push(result);
      } else if (result.type === 'text' || result.type === 'content') {
        group.content.push(result);
      }
    }
    
    for (const [pageId, group] of pageMap) {
      const pageNodeId = `page-${pageId}`;
      const childIds: string[] = [];
      
      for (let i = 0; i < group.headings.length; i++) {
        const heading = group.headings[i];
        const headingId = `heading-${pageId}-${i}`;
        childIds.push(headingId);
        
        items[headingId] = {
          id: headingId,
          name: heading.title || 'Untitled',
          type: 'heading',
          href: heading.href,
          children: [],
        };
      }
      
      for (let i = 0; i < group.content.length; i++) {
        const content = group.content[i];
        const contentId = `content-${pageId}-${i}`;
        childIds.push(contentId);
        
        items[contentId] = {
          id: contentId,
          name: content.title || content.summary || '',
          type: 'content',
          href: content.href,
          content: content.title || content.summary || '',
          children: undefined,
        };
      }
      
      items[pageNodeId] = {
        id: pageNodeId,
        name: group.page.title || 'Untitled',
        type: 'page',
        href: group.page.href,
        children: childIds.length > 0 ? childIds : undefined,
      };
      
      roots.push(pageNodeId);
    }
    
    return { treeData: items, rootIds: roots };
  }, [results]);
  
  const tree = useTree<TreeNode>({
    initialState: {
      expandedItems: rootIds,
    },
    indent: 20,
    rootItemId: 'root',
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => {
      const children = item.getItemData()?.children;
      return Array.isArray(children) && children.length > 0;
    },
    dataLoader: {
      getItem: (itemId) => {
        if (itemId === 'root') {
          return { id: 'root', name: 'Root', type: 'page', children: rootIds } as TreeNode;
        }
        return treeData[itemId];
      },
      getChildren: (itemId) => {
        if (itemId === 'root') return rootIds;
        return treeData[itemId]?.children ?? [];
      },
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });
  
  const renderIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <File className="h-4 w-4" />;
      case 'heading':
        return <Hash className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <CommandGroup heading="Content">
      <div className="px-2 py-1">
        <Tree indent={20} tree={tree} toggleIconType="chevron">
          {tree.getItems().map((item) => {
            const data = item.getItemData();
            
            if (data.id === 'root') return null;
            
            return (
              <TreeItem
                key={item.getId()}
                item={item}
                onClick={() => {
                  if (data.href) {
                    onSelect(data.href);
                  }
                }}
              >
                <TreeItemLabel>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {renderIcon(data.type)}
                    <div className="flex-1 min-w-0">
                      {data.type === 'content' ? (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {highlightText(data.content || '', searchTerm)}
                        </div>
                      ) : (
                        <span className="font-medium text-sm">{data.name}</span>
                      )}
                    </div>
                  </div>
                </TreeItemLabel>
              </TreeItem>
            );
          })}
        </Tree>
      </div>
    </CommandGroup>
  );
}

