// Utilities to translate and synchronize expansion state between
// the graph (Set<string>) and the sidebar TreeProvider (string[])

/**
 * Convert graph expansion state (Set of ids) to sidebar format (sorted array of ids).
 */
export function graphExpandedToSidebarExpanded(
  expanded: Set<string>
): string[] {
  return Array.from(expanded).sort();
}

/**
 * Merge sidebar expansion state (array of ids) into current graph state (Set of ids).
 * Returns a new Set representing the desired expansion state.
 */
export function mergeSidebarExpandedIntoGraph(
  _currentExpanded: Set<string>,
  sidebarExpandedIds: string[]
): Set<string> {
  return new Set<string>(sidebarExpandedIds);
}

// Tree-aware index helpers for robust syncing (optional use)
export type TreeIndex = {
  presentIds: Set<string>;
  parentById: Map<string, string | null>;
  hasChildrenById: Map<string, boolean>;
};

export function buildTreeIndex(
  treeData: Array<{ id: string; children?: any[] }>
): TreeIndex {
  const presentIds = new Set<string>();
  const parentById = new Map<string, string | null>();
  const hasChildrenById = new Map<string, boolean>();

  const walk = (
    node: { id: string; children?: any[] },
    parentId: string | null
  ) => {
    presentIds.add(node.id);
    parentById.set(node.id, parentId);
    const hasChildren =
      Array.isArray(node.children) && node.children.length > 0;
    hasChildrenById.set(node.id, hasChildren);
    if (hasChildren) {
      for (const child of node.children!) {
        walk(child, node.id);
      }
    }
  };
  for (const root of treeData) {
    walk(root, null);
  }
  return { presentIds, parentById, hasChildrenById };
}

export function graphExpandedToSidebarExpandedWithTree(
  expanded: Set<string>,
  index: TreeIndex
): string[] {
  const toOpen = new Set<string>();
  const missing: string[] = [];
  for (const id of expanded) {
    if (!index.presentIds.has(id)) {
      missing.push(id);
      continue;
    }
    if (index.hasChildrenById.get(id) === true) {
      toOpen.add(id);
    }
    let p = index.parentById.get(id) ?? null;
    while (p) {
      toOpen.add(p);
      p = index.parentById.get(p) ?? null;
    }
  }
  return Array.from(toOpen).sort();
}
