import type { GraphLink as DataLink } from "./data/data-manager";
import { isMetadata } from "./data/relationship-utils";

export interface DescendantsByDepthParams {
  rootId: string;
  allLinks: DataLink[];
  visibleNodeIds: Set<string>;
}

/**
 * Calculate descendants by depth for a given root node
 * This is extracted from the complex getDescendantsByDepth function to reduce cognitive complexity
 */
export function calculateDescendantsByDepth({
  rootId,
  allLinks,
  visibleNodeIds,
}: DescendantsByDepthParams): Array<{ id: string; depth: number }> {
  const result: Array<{ id: string; depth: number }> = [];
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [
    { id: rootId, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const { id: currentId, depth } = current;

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    // Find all children of current node
    const children = Array.from(allLinks)
      .filter((link) => {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id;
        return sourceId === currentId;
      })
      .map((link) =>
        typeof link.target === "string" ? link.target : link.target.id
      )
      .filter(
        (targetId) => !isMetadata(targetId) && visibleNodeIds.has(targetId)
      );

    // Add children to queue with increased depth
    for (const childId of children) {
      queue.push({ id: childId, depth: depth + 1 });
    }

    // Also include directly connected visible metadata so they collapse/fade too,
    // but only include non-shared (single-connection) metadata; shared stay
    const isSharedMetadata = (metaId: string): boolean => {
      let connections = 0;
      for (const link of allLinks) {
        const s =
          typeof link.source === "string" ? link.source : link.source.id;
        const t =
          typeof link.target === "string" ? link.target : link.target.id;
        if (s === metaId && !isMetadata(t)) {
          connections++;
        }
        if (t === metaId && !isMetadata(s)) {
          connections++;
        }
      }
      return connections > 1;
    };

    for (const link of allLinks) {
      const s = typeof link.source === "string" ? link.source : link.source.id;
      const t = typeof link.target === "string" ? link.target : link.target.id;
      if (
        s === currentId &&
        isMetadata(t) &&
        visibleNodeIds.has(t) &&
        !visited.has(t) &&
        !isSharedMetadata(t)
      ) {
        queue.push({ id: t, depth: depth + 1 });
      }
      if (
        t === currentId &&
        isMetadata(s) &&
        visibleNodeIds.has(s) &&
        !visited.has(s) &&
        !isSharedMetadata(s)
      ) {
        queue.push({ id: s, depth: depth + 1 });
      }
    }

    // Add current node to result (excluding root)
    if (currentId !== rootId) {
      result.push({ id: currentId, depth });
    }
  }

  // Sort by depth (deepest first)
  return result.sort((a, b) => b.depth - a.depth);
}
