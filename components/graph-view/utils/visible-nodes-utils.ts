import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from "./data/data-manager";
import { buildTreeFromNodes, isMetadata } from "./data/relationship-utils";

export type VisibleNodesParams = {
  allNodes: DataNode[];
  allLinks: DataLink[];
  expandedNodes: Set<string>;
  filteredNodeIds?: Set<string> | null;
  collapsingChildIds?: Set<string>;
  /** When true, excludes metadata nodes (tags, hypernyms, hyponyms) from the visible set */
  excludeMetadata?: boolean;
};

/**
 * Calculate which nodes should be visible based on expansion state and filters
 * This is extracted from the complex useMemo in graph-canvas.tsx to reduce cognitive complexity
 */
export function calculateVisibleNodeIds({
  allNodes,
  allLinks,
  expandedNodes,
  filteredNodeIds,
  collapsingChildIds = new Set(),
  excludeMetadata = false,
}: VisibleNodesParams): Set<string> {
  // Filter out null/undefined nodes first
  const validNodes = allNodes.filter(node => node && node.id);

  // Separate content nodes from metadata nodes
  const contentNodes = validNodes.filter(node => !isMetadata(node.id));
  const metadataNodes = validNodes.filter(node => isMetadata(node.id));

  // Separate parent-child links from metadata connection links
  const contentLinks: DataLink[] = [];
  const metadataLinks: DataLink[] = [];

  for (const link of allLinks) {
    if (!(link?.source && link.target)) {
      continue;
    }
    const s = typeof link.source === "string" ? link.source : (link.source as any)?.id;
    const t = typeof link.target === "string" ? link.target : (link.target as any)?.id;

    // Skip links with null/undefined IDs
    if (!s || !t) {
      continue;
    }

    // If either end is metadata, it's a metadata connection link
    if (isMetadata(s) || isMetadata(t)) {
      metadataLinks.push(link);
    } else {
      // Both ends are content nodes - parent-child relationship
      contentLinks.push(link);
    }
  }

  // 1) Build tree only from content nodes and content links
  const contentTree = buildTreeFromNodes(contentNodes, contentLinks);

  // 2) Derive visible content nodes from tree + expandedNodes (same rule as side panel)
  const contentVisible = new Set<string>();
  const walkContentTree = (
    nodes: Array<DataNode & { children?: DataNode[] }>
  ) => {
    for (const n of nodes) {
      const id = String(n.id);
      contentVisible.add(id);
      const isExpanded = expandedNodes.has(id);
      if (isExpanded && Array.isArray(n.children) && n.children.length > 0) {
        walkContentTree(n.children);
      }
    }
  };

  walkContentTree(Array.isArray(contentTree) ? contentTree : []);

  // Apply filtered nodes when a filter is active.
  // - null/undefined: no filter
  // - empty set: explicit "no matches" => show nothing
  if (filteredNodeIds !== null && filteredNodeIds !== undefined) {
    if (filteredNodeIds.size === 0) {
      return new Set<string>();
    }
    for (const id of Array.from(contentVisible)) {
      if (!filteredNodeIds.has(id)) {
        contentVisible.delete(id);
      }
    }
    for (const id of filteredNodeIds) {
      contentVisible.add(id);
    }
  }

  // If excluding metadata, return only content nodes
  if (excludeMetadata) {
    // Ensure collapsing children remain rendered during animation
    if (collapsingChildIds.size > 0) {
      for (const id of collapsingChildIds) {
        if (!isMetadata(id)) {
          contentVisible.add(id);
        }
      }
    }
    return contentVisible;
  }

  // 3) Compute metadata connections from metadata links only
  // metaId -> set(contentId) - tracks which content nodes each metadata node connects to
  const metaConnections = new Map<string, Set<string>>();
  for (const l of metadataLinks) {
    if (!(l?.source && l.target)) {
      continue;
    }
    const s = typeof l.source === "string" ? l.source : (l.source as any)?.id;
    const t = typeof l.target === "string" ? l.target : (l.target as any)?.id;

    // Skip links with null/undefined IDs
    if (!s || !t) {
      continue;
    }

    const sIsMeta = isMetadata(s);
    const tIsMeta = isMetadata(t);
    if (sIsMeta && !tIsMeta) {
      if (!metaConnections.has(s)) {
        metaConnections.set(s, new Set());
      }
      metaConnections.get(s)?.add(t);
    }
    if (tIsMeta && !sIsMeta) {
      if (!metaConnections.has(t)) {
        metaConnections.set(t, new Set());
      }
      metaConnections.get(t)?.add(s);
    }
  }

  const result = new Set<string>(contentVisible);

  // 4) Add ONLY shared metadata (connected to multiple different content nodes)
  // This shows metadata that creates meaningful connections between documents/sections.
  for (const [metaId, contents] of metaConnections.entries()) {
    // Only include metadata with shared connections (degree > 1)
    if (contents.size > 1) {
      // Check if this metadata node exists (should have been created by data manager)
      const metaNodeExists = metadataNodes.some(node => node.id === metaId);
      if (metaNodeExists) {
        result.add(metaId);
      }
    }
  }

  // Ensure collapsing children remain rendered during animation
  if (collapsingChildIds.size > 0) {
    for (const id of collapsingChildIds) {
      result.add(id);
    }
  }

  return result;
}
