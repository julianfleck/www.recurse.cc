import { useCallback } from "react";
import type { DataLink } from "../utils/data/data-manager";

export type UseNodeManagementParams = {
  allLinks: DataLink[];
  expandedNodes: Set<string>;
  setExpandedNodes: (
    value: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
  setHighlightedNodeId: (value: string | null) => void;
  setIsBatchOperation: (value: boolean) => void;
};

export type NodeManagementResult = {
  toggleNodeExpansion: (nodeId: string) => void;
  setScrollTargetId: (nodeId: string) => void;
  setIsBulkOperation: (isBulk: boolean) => void;
  isNodeExpandable: (nodeType: string) => boolean;
  canCollapseNode: (nodeId: string) => boolean;
  _setHighlightedNode: (
    nodeId: string | null,
    source?: "graph" | "sidepanel"
  ) => void;
};

export function useNodeManagement({
  allLinks,
  expandedNodes,
  setExpandedNodes,
  setHighlightedNodeId,
  setIsBatchOperation,
}: UseNodeManagementParams): NodeManagementResult {
  const _setHighlightedNode = useCallback(
    (nodeId: string | null, _source?: "graph" | "sidepanel") => {
      setHighlightedNodeId(nodeId);
      // Note: setHighlightSource removed as it wasn't defined in the original
    },
    [setHighlightedNodeId]
  );

  const toggleNodeExpansion = useCallback(
    (nodeId: string) => {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    [setExpandedNodes]
  );

  // For graph clicks, do not set focus to avoid subgraph centering from clicks
  const setScrollTargetId = useCallback((_nodeId: string) => {
    // no-op: reserved for future sidebar scroll syncing
  }, []);

  const setIsBulkOperation = useCallback(
    (isBulk: boolean) => {
      setIsBatchOperation(isBulk);
    },
    [setIsBatchOperation]
  );

  const isNodeExpandable = useCallback((nodeType: string) => {
    return !["tag", "hypernym", "hyponym"].includes(nodeType);
  }, []);

  const canCollapseNode = useCallback(
    (nodeId: string): boolean => {
      const isExpanded = expandedNodes.has(nodeId);
      let hasChildren = false;
      for (const link of allLinks) {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id;
        if (sourceId === nodeId) {
          hasChildren = true;
          break;
        }
      }
      return isExpanded && hasChildren;
    },
    [expandedNodes, allLinks]
  );

  return {
    toggleNodeExpansion,
    setScrollTargetId,
    setIsBulkOperation,
    isNodeExpandable,
    canCollapseNode,
    _setHighlightedNode,
  };
}
