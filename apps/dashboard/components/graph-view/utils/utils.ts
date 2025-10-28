import { NODE_STYLES } from "../config/config";
import type { GraphLink, GraphNode } from "../types/types";

export function getId(node: string | GraphNode): string {
  return typeof node === "string" ? node : node.id;
}

export function getNodeStyle(type: string) {
  if (type === "Document" || type === "article") {
    return NODE_STYLES.document;
  }
  if (type === "heading_section") {
    return NODE_STYLES.heading_section;
  }
  return NODE_STYLES.default;
}

export function createNodeFromData(data: {
  id: string;
  title: string;
  type: string;
  summary?: string | null;
}): GraphNode {
  return {
    id: data.id,
    title: data.title,
    type: data.type,
    summary: data.summary,
  };
}

export function createLinkFromData(source: string, target: string): GraphLink {
  return { source, target };
}

export function findAncestors(
  nodeId: string,
  parentByChildId: Map<string, string>
): string[] {
  const ancestors: string[] = [];
  let current = parentByChildId.get(nodeId);

  while (current) {
    ancestors.push(current);
    current = parentByChildId.get(current);
  }

  return ancestors;
}

export function isNodeInTree(
  nodeId: string,
  parentId: string,
  children: Set<string>
): boolean {
  return nodeId === parentId || children.has(nodeId);
}

export function calculateTransform(
  nodePosition: { x: number; y: number },
  containerSize: { width: number; height: number },
  scale: number
) {
  const centerX = containerSize.width / 2;
  const centerY = containerSize.height / 2;

  return {
    x: centerX - nodePosition.x * scale,
    y: centerY - nodePosition.y * scale,
    k: scale,
  };
}
