'use client';

import { useCallback } from 'react';
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

      {node.children && node.children.length > 0 && (
        <TreeNodeContent hasChildren={hasChildren}>
          {node.children.map((child: any) => (
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

interface GraphTreeSidebarProps {
  treeData: any[];
  highlightedNodeId?: string;
  // Controlled expansion ids from parent (GraphView) in sidebar format
  expandedIds: string[];
  // Notify parent (GraphView) when user expands/collapses in the sidebar
  onExpandedIdsChange: (ids: string[]) => void;
  setHighlightedNodeId: (nodeId: string | null) => void;
  onFocusNode?: (nodeId: string) => void;
}

interface TreeNodeComponentProps {
  node: any;
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

  return (
    <div className="flex w-80 flex-col border-border border-r bg-background">
      <div className="border-border border-b p-4">
        <h3 className="font-semibold text-sm">Node Tree</h3>
        <div className="mt-1 text-muted-foreground text-xs">
          {treeData.length} nodes in tree
        </div>
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
            {treeData.map((node) => (
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
    </div>
  );
}
