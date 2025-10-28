import type { GraphNode as DataNode } from "./data/data-manager";

export type ExpandLevelParams = {
  treeData: DataNode[];
  visibleNodeIds: Set<string>;
  expandedNodes: Set<string>;
  toggleNodeExpansion: (nodeId: string) => void;
};

/**
 * Calculate which nodes should be expanded in the next level
 * This is extracted from the complex expandLevel function to reduce cognitive complexity
 */
export function calculateNodesToExpand({
  treeData,
  visibleNodeIds,
  expandedNodes,
}: Omit<ExpandLevelParams, "toggleNodeExpansion">): string[] {
  // Build child map from treeData so metadata children are included consistently
  const childMap = new Map<string, string[]>();
  const rootIds: string[] = [];
  const walkTree = (nodes: Array<DataNode & { children?: DataNode[] }>, parentId?: string) => {
    for (const n of nodes) {
      const id = n.id as string;
      if (parentId) {
        const arr = childMap.get(parentId) || [];
        arr.push(id);
        childMap.set(parentId, arr);
      } else {
        rootIds.push(id);
      }
      if (Array.isArray(n.children) && n.children.length > 0) {
        walkTree(n.children, id);
      }
    }
  };
  walkTree(treeData);

  // Filter roots to visible
  const roots = rootIds.filter((id) => visibleNodeIds.has(id));

  // BFS minimal depth
  const depth = new Map<string, number>();
  const queue: Array<{ id: string; d: number }> = roots.map((id) => ({
    id,
    d: 0,
  }));

  while (queue.length > 0) {
    const { id, d } = queue.shift()!;
    if (depth.has(id)) {
      continue;
    }
    depth.set(id, d);

    // Only traverse children of expanded nodes
    if (expandedNodes.has(id)) {
      const children = childMap.get(id) || [];
      for (const child of children) {
        queue.push({ id: child, d: d + 1 });
      }
    }
  }

  // Find minimum depth among unexpanded visible nodes
  let minD = Number.POSITIVE_INFINITY;
  const frontier: string[] = [];
  for (const [id, d] of depth.entries()) {
    if (!visibleNodeIds.has(id)) {
      continue;
    }
    if (expandedNodes.has(id)) {
      continue;
    }
    if (d < minD) {
      minD = d;
      frontier.length = 0;
      frontier.push(id);
    } else if (d === minD) {
      frontier.push(id);
    }
  }

  return frontier;
}

/**
 * Execute the level expansion operation
 */
export async function executeLevelExpansion({
  nodesToExpand,
  toggleNodeExpansion,
}: {
  nodesToExpand: string[];
  toggleNodeExpansion: (nodeId: string) => void;
}): Promise<void> {
  // Expand all nodes at this level
  for (const nodeId of nodesToExpand) {
    toggleNodeExpansion(nodeId);
  }

  // Small delay for UI feedback
  await new Promise((resolve) => setTimeout(resolve, 100));
}
