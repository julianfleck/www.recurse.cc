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
}: VisibleNodesParams): Set<string> {
  // 1) Derive visible content nodes from treeData + expandedNodes (same rule as side panel)
  const contentVisible = new Set<string>();
  const walkTreeVisible = (
    nodes: Array<DataNode & { children?: DataNode[] }>
  ) => {
    for (const n of nodes) {
      const id = String(n.id);
      contentVisible.add(id);
      const isExpanded = expandedNodes.has(id);
      if (isExpanded && Array.isArray(n.children) && n.children.length > 0) {
        walkTreeVisible(n.children);
      }
    }
  };

  // Build a local tree to avoid temporal-dead-zone issues with declaration order
  const localTree = buildTreeFromNodes(allNodes, allLinks);
  walkTreeVisible(Array.isArray(localTree) ? localTree : []);

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

  // 2) Compute metadata connections
  const metaConnections = new Map<string, Set<string>>(); // metaId -> set(contentId)
  for (const l of allLinks) {
    if (!(l?.source && l.target)) {
      continue;
    }
    const s = typeof l.source === "string" ? l.source : l.source.id;
    const t = typeof l.target === "string" ? l.target : l.target.id;
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

  const set = new Set<string>(contentVisible);

  // 3) Add shared metadata (degree > 1) connected to at least one visible content node
  for (const [metaId, contents] of metaConnections.entries()) {
    if (contents.size > 1) {
      for (const c of contents) {
        if (contentVisible.has(c)) {
          set.add(metaId);
          break;
        }
      }
    }
  }

  // 4) Add single-connection metadata only when its content parent is expanded
  for (const [metaId, contents] of metaConnections.entries()) {
    if (contents.size === 1) {
      const parentId = Array.from(contents)[0];
      if (expandedNodes.has(parentId) && contentVisible.has(parentId)) {
        set.add(metaId);
      }
    }
  }

  // Ensure collapsing children remain rendered during animation
  if (collapsingChildIds.size > 0) {
    for (const id of collapsingChildIds) {
      set.add(id);
    }
  }

  return set;
}
