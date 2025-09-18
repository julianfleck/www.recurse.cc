import { isMetadataType, normalizeTypeLabel } from "../../config/visual-config";
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from "./data-manager";

/**
 * Check if a node is metadata based on its type or ID
 */
export const isMetadata = (idOrNode: string | DataNode): boolean => {
  const id = typeof idOrNode === "string" ? idOrNode : idOrNode.id;
  const node = typeof idOrNode === "string" ? null : idOrNode;
  const type = node?.type?.toLowerCase();

  if (type && (type === "tag" || type === "hyponym" || type === "hypernym")) {
    return true;
  }

  const lower = id.toLowerCase();
  return (
    lower.startsWith("tag:") ||
    lower.startsWith("hyponym:") ||
    lower.startsWith("hypernym:") ||
    lower.startsWith("tag_") ||
    lower.startsWith("hyponym_") ||
    lower.startsWith("hypernym_") ||
    lower.includes(":metadata")
  );
};

/**
 * Build parent-child relationship maps from links
 */
export const buildParentChildMaps = (links: DataLink[]) => {
  const childrenByParent = new Map<string, string[]>();
  const parentByChild = new Map<string, string>();

  for (const link of links) {
    // Skip links with missing source or target
    if (!(link.source && link.target)) {
      continue;
    }

    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;

    // Add to childrenByParent
    if (!childrenByParent.has(sourceId)) {
      childrenByParent.set(sourceId, []);
    }
    childrenByParent.get(sourceId)?.push(targetId);

    // Add to parentByChild
    parentByChild.set(targetId, sourceId);
  }

  return { childrenByParent, parentByChild };
};

/**
 * Find root document IDs (documents that are not children of other documents)
 */
export const findRootDocumentIds = (
  nodes: DataNode[],
  links: DataLink[]
): string[] => {
  const { childrenByParent, parentByChild } = buildParentChildMaps(links);
  const hasNonMetaParent = new Set<string>();

  // Mark nodes that have non-metadata parents
  for (const link of links) {
    // Skip links with missing source or target
    if (!(link.source && link.target)) {
      continue;
    }

    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    if (sourceNode && !isMetadata(sourceNode)) {
      hasNonMetaParent.add(targetId);
    }
  }

  // Find root nodes
  const roots: string[] = [];
  for (const node of nodes) {
    if (isMetadata(node)) {
      continue;
    }
    if (!hasNonMetaParent.has(node.id)) {
      roots.push(node.id);
    }
  }

  return roots;
};

/**
 * Get the depth of a node in the hierarchy
 */
export const getNodeDepth = (
  nodeId: string,
  parentByChildId: Map<string, string>,
  visited = new Set<string>()
): number => {
  if (visited.has(nodeId)) {
    return 0;
  }
  visited.add(nodeId);

  const parentId = parentByChildId.get(nodeId);
  if (!parentId) {
    return 0;
  }

  return getNodeDepth(parentId, parentByChildId, visited) + 1;
};

/**
 * Check if a node has children in the graph structure
 */
export const hasChildrenInGraph = (
  nodeId: string,
  links: DataLink[]
): boolean => {
  return links.some((link) => {
    if (!link.source) {
      return false;
    }
    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    return sourceId === nodeId;
  });
};

/**
 * Get all descendant node IDs for a given node (recursive)
 */
export const getDescendantIds = (
  nodeId: string,
  links: DataLink[]
): string[] => {
  const descendants: string[] = [];
  const visited = new Set<string>();

  const findDescendants = (currentId: string): void => {
    if (visited.has(currentId)) {
      return;
    }
    visited.add(currentId);

    links.forEach((link) => {
      // Skip links with missing source or target
      if (!(link.source && link.target)) {
        return;
      }

      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;

      if (sourceId === currentId) {
        descendants.push(targetId);
        findDescendants(targetId);
      }
    });
  };

  findDescendants(nodeId);
  return descendants;
};

/**
 * Build hierarchical tree from flat graph data
 */

const sortChildren = (
  children: (DataNode & { children?: DataNode[] })[]
): (DataNode & { children?: DataNode[] })[] => {
  // Separate content nodes from metadata nodes
  const contentNodes: (DataNode & { children?: DataNode[] })[] = [];
  const metadataNodes: (DataNode & { children?: DataNode[] })[] = [];

  for (const child of children) {
    if (isMetadataType(child.type)) {
      metadataNodes.push(child);
    } else {
      contentNodes.push(child);
    }
  }

  // Sort content nodes alphabetically
  contentNodes.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  // Sort metadata nodes: first by category, then alphabetically
  const categoryOrder = ["tag", "hypernym", "hyponym", "metadata"];
  metadataNodes.sort((a, b) => {
    const aType = normalizeTypeLabel(a.type);
    const bType = normalizeTypeLabel(b.type);
    const aIndex = categoryOrder.indexOf(aType);
    const bIndex = categoryOrder.indexOf(bType);

    // If types are the same, sort alphabetically by title
    if (aIndex === bIndex) {
      return (a.title || "").localeCompare(b.title || "");
    }

    // Otherwise sort by category order
    return aIndex - bIndex;
  });

  // Recursively sort children of content nodes
  for (const node of contentNodes) {
    if (node.children && node.children.length > 0) {
      node.children = sortChildren(node.children);
    }
  }

  return [...contentNodes, ...metadataNodes];
};

export const buildTreeFromNodes = (
  nodes: DataNode[],
  links: DataLink[]
): (DataNode & { children?: DataNode[] })[] => {
  const nodeMap = new Map<string, DataNode & { children?: DataNode[] }>();
  const rootNodes: (DataNode & { children?: DataNode[] })[] = [];

  // Create a copy of nodes and add children array
  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  // Build the hierarchy
  for (const node of nodes) {
    const nodeWithChildren = nodeMap.get(node.id)!;

    // Check if this node has a parent
    const hasParent = links.some((link) => {
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;
      return targetId === node.id;
    });

    if (hasParent) {
      // Find parent and add as child
      const parentLink = links.find((link) => {
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id;
        return targetId === node.id;
      });

      if (parentLink) {
        const parentId =
          typeof parentLink.source === "string"
            ? parentLink.source
            : parentLink.source.id;
        const parentNode = nodeMap.get(parentId);
        if (parentNode?.children) {
          parentNode.children.push(nodeWithChildren);
        }
      }
    } else {
      rootNodes.push(nodeWithChildren);
    }
  }

  // Sort the root nodes and their children
  return sortChildren(rootNodes);
};
