import { useMemo } from "react";
import type { GraphLink as DataLink, GraphNode as DataNode } from "../utils/data/data-manager";
import { buildTreeFromNodes } from "../utils/data/relationship-utils";
import { calculateVisibleNodeIds } from "../utils/visible-nodes-utils";
import { useGraphDataProcessing } from "./use-data-processing";

export type UseGraphDataParams = {
  nodesById: Map<string, DataNode>;
  edges: DataLink[];
  expandedNodes: Set<string>;
  filteredNodeIds: Set<string> | null;
  collapsingChildIds: Set<string>;
  allNodes: DataNode[];
  allLinks: DataLink[];
};

export type GraphDataResult = {
  allNodes: DataNode[];
  allLinks: DataLink[];
  visibleNodeIds: Set<string>;
  visibleNodes: DataNode[];
  treeData: DataNode[];
  visibleLinks: DataLink[];
  computeSubgraphIds: (rootId: string) => string[];
};

export function useGraphData({
  nodesById,
  edges,
  expandedNodes,
  filteredNodeIds,
  collapsingChildIds,
  allNodes,
  allLinks,
}: UseGraphDataParams): GraphDataResult {
  // Transform nodes and links for D3.js consumption
  const computedAllNodes = useMemo<DataNode[]>(() => {
    return Array.from(nodesById.values()).map((n) => ({
      id: n.id,
      title: n.title,
      type: n.type,
      summary: n.summary ?? undefined,
    }));
  }, [nodesById]);

  const computedAllLinks = useMemo<DataLink[]>(
    () => edges.map((e) => ({ source: e.source, target: e.target })),
    [edges]
  );

  // Use provided allNodes/allLinks if available, otherwise use computed ones
  const finalAllNodes = allNodes.length > 0 ? allNodes : computedAllNodes;
  const finalAllLinks = allLinks.length > 0 ? allLinks : computedAllLinks;

  // Data processing hook for subgraph computations
  const { computeSubgraphIds } = useGraphDataProcessing({
    allNodes: finalAllNodes,
    allLinks: finalAllLinks,
    expandedNodes,
  });

  // Calculate visible node IDs based on expansion state and filters
  const visibleNodeIds = useMemo<Set<string>>(() => {
    return calculateVisibleNodeIds({
      allNodes: finalAllNodes,
      allLinks: finalAllLinks,
      expandedNodes,
      filteredNodeIds,
      collapsingChildIds,
    });
  }, [
    finalAllNodes,
    finalAllLinks,
    expandedNodes,
    filteredNodeIds,
    collapsingChildIds,
  ]);

  // Filter nodes to only visible ones
  const visibleNodes = useMemo(() => {
    const result: DataNode[] = [];
    for (const node of finalAllNodes) {
      if (visibleNodeIds.has(node.id)) {
        result.push(node);
      }
    }
    return result;
  }, [finalAllNodes, visibleNodeIds]);

  // Build hierarchical tree data
  const treeData = useMemo(() => {
    return buildTreeFromNodes(finalAllNodes, finalAllLinks);
  }, [finalAllNodes, finalAllLinks]);

  // Filter links to only those connecting visible nodes
  const visibleLinks = useMemo(() => {
    const finalIds = new Set<string>(visibleNodes.map((n) => n.id));
    const filtered = finalAllLinks.filter((l) => {
      if (!(l && l.source && l.target)) {
        return false;
      }
      const sourceId = typeof l.source === "string" ? l.source : l.source.id;
      const targetId = typeof l.target === "string" ? l.target : l.target.id;
      return finalIds.has(sourceId) && finalIds.has(targetId);
    });
    return filtered;
  }, [finalAllLinks, visibleNodes]);

  return {
    allNodes: finalAllNodes,
    allLinks: finalAllLinks,
    visibleNodeIds,
    visibleNodes,
    treeData,
    visibleLinks,
    computeSubgraphIds,
  };
}
