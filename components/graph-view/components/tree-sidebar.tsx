'use client';

import { useCallback, useMemo, useState } from 'react';
import { getNodeIcons } from '../config/icon-config';
import {
  defaultGraphVisualConfig,
  getVisualForLabel,
  normalizeTypeLabel,
} from '../config/visual-config';
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from '../tree';
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from '../utils/data/data-manager';
import { SidebarSearch, type SidebarSearchMode } from './sidebar-search';

// Recursive component to render tree nodes
const TreeNodeComponent = ({
  node,
  level = 0,
  highlightedNodeId,
  onToggle,
}: TreeNodeComponentProps) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isHighlighted = highlightedNodeId === node.id;
  const spec = getVisualForLabel(
    String(node.type || node.label || ''),
    defaultGraphVisualConfig
  );

  const nodeTypeKey = normalizeTypeLabel(String(node.type || node.label || ''));
  const { iconClosed, iconOpen } = getNodeIcons(nodeTypeKey, {
    size: 'h-4 w-4',
    strokeWidth: 1.5,
  });

  return (
    <TreeNode level={level} nodeId={node.id}>
      <TreeNodeTrigger
        className={isHighlighted ? 'bg-accent' : ''}
        onToggleExpanded={() => {
          if (hasChildren && onToggle) {
            window.dispatchEvent(
              new CustomEvent('sidebar:toggleExpanded', {
                detail: { id: node.id },
              })
            );
            onToggle(node.id);
          }
        }}
      >
        <TreeExpander hasChildren={hasChildren} />
        <TreeIcon
          hasChildren={hasChildren}
          iconClosed={iconClosed}
          iconOpen={iconOpen}
        />
        <TreeLabel className="truncate">
          {String(
            node.title || node.name || node.label || spec?.uiLabel || node.id
          )}
        </TreeLabel>
        {/* <Badge
          className="ml-2 border border-border font-medium text-[8px] uppercase tracking-wider"
          variant="secondary"
        >
          {String(
            spec?.uiLabel ||
              normalizeTypeLabel(String(node.type || node.label || ''))
          )}
        </Badge> */}
      </TreeNodeTrigger>

      {Array.isArray(node.children) && node.children.length > 0 && (
        <TreeNodeContent hasChildren={hasChildren}>
          {node.children.map((child: TreeNodeData) => (
            <TreeNodeComponent
              highlightedNodeId={highlightedNodeId}
              key={child.id}
              level={level + 1}
              node={child}
              onToggle={onToggle}
            />
          ))}
        </TreeNodeContent>
      )}
    </TreeNode>
  );
};

type TreeNodeData = {
  id: string;
  children?: TreeNodeData[];
  title?: string;
  type?: string;
};

interface GraphTreeSidebarProps {
  treeData: TreeNodeData[];
  highlightedNodeId?: string;
  // Controlled expansion ids from parent (GraphView) in sidebar format
  expandedIds: string[];
  // Notify parent (GraphView) when user expands/collapses in the sidebar
  onExpandedIdsChange: (ids: string[]) => void;
  setHighlightedNodeId: (nodeId: string | null) => void;
  onFocusNode?: (nodeId: string) => void;
  // Search integration
  mode?: SidebarSearchMode;
  allNodes?: DataNode[];
  allLinks?: DataLink[];
  onFilterIdsChange?: (ids: Set<string> | null) => void;
}

interface TreeNodeComponentProps {
  node: TreeNodeData;
  level?: number;
  highlightedNodeId?: string;
  onToggle?: (id: string) => void;
  // no local expansion knowledge needed; TreeProvider is controlled by parent
}

export function GraphTreeSidebar({
  treeData,
  highlightedNodeId,
  expandedIds,
  onExpandedIdsChange,
  setHighlightedNodeId,
  onFocusNode,
  mode = 'json',
  allNodes = [],
  allLinks = [],
  onFilterIdsChange,
}: GraphTreeSidebarProps) {
  // no debug output
  // No local expansion state; fully controlled by parent

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      const id = selectedIds.length > 0 ? selectedIds[0] : null;
      window.dispatchEvent(
        new CustomEvent('sidebar:select', { detail: { id } })
      );
      setHighlightedNodeId(id);
      if (id && onFocusNode) {
        onFocusNode(id);
      }
    },
    [setHighlightedNodeId, onFocusNode]
  );

  // no debug output

  const [filteredIds, setFilteredIds] = useState<Set<string> | null>(null);

  const filteredTree = useMemo<TreeNodeData[]>(() => {
    if (!filteredIds) {
      return treeData;
    }
    if (filteredIds.size === 0) {
      return [];
    }
    const filterNodes = (nodes: TreeNodeData[]): TreeNodeData[] => {
      const out: TreeNodeData[] = [];
      for (const n of nodes) {
        const includeSelf = filteredIds.has(n.id);
        const kids = Array.isArray(n.children) ? filterNodes(n.children) : [];
        if (includeSelf || kids.length > 0) {
          out.push({ ...n, children: kids });
        }
      }
      return out;
    };
    return filterNodes(treeData);
  }, [treeData, filteredIds]);

  const visibleCount = useMemo(() => {
    let count = 0;
    const walk = (nodes: TreeNodeData[]) => {
      for (const n of nodes) {
        count += 1;
        if (Array.isArray(n.children) && n.children.length > 0) {
          walk(n.children);
        }
      }
    };
    walk(filteredTree);
    return count;
  }, [filteredTree]);

  return (
    <div className="flex w-80 flex-col border-border border-r bg-background">
      <div className="border-border border-b p-3">
        <SidebarSearch
          allLinks={allLinks}
          allNodes={allNodes}
          className=""
          mode={mode}
          onFilterIdsChange={(ids) => {
            setFilteredIds(ids);
            onFilterIdsChange?.(ids);
          }}
          onSearchApi={(raw) => {
            // Placeholder: API integration can be wired to call a search endpoint
            window.dispatchEvent(
              new CustomEvent('graph:sidebarSearch', { detail: { query: raw } })
            );
          }}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <TreeProvider
          expandedIds={expandedIds}
          multiSelect={false}
          onExpandedChange={onExpandedIdsChange}
          onSelectionChange={handleSelectionChange}
          selectable={true}
          selectedIds={highlightedNodeId ? [highlightedNodeId] : []}
          showIcons={true}
          showLines={true}
        >
          <TreeView>
            {filteredTree.map((node) => (
              <TreeNodeComponent
                highlightedNodeId={highlightedNodeId}
                key={node.id}
                node={node}
                onToggle={(id) => {
                  const set = new Set(expandedIds);
                  if (set.has(id)) {
                    set.delete(id);
                  } else {
                    set.add(id);
                  }
                  onExpandedIdsChange(Array.from(set).sort());
                }}
              />
            ))}
          </TreeView>
        </TreeProvider>
      </div>
      <div className="border-border border-t p-2 text-muted-foreground text-xs">
        {visibleCount}
      </div>
    </div>
  );
}
