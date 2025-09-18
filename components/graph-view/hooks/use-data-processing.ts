"use client";

import { useCallback } from "react";
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from "../utils/data/data-manager";
import {
  buildParentChildMaps,
  findRootDocumentIds,
  isMetadata,
} from "../utils/data/relationship-utils";

interface UseGraphDataProcessingProps {
  allNodes: DataNode[];
  allLinks: DataLink[];
  expandedNodes: Set<string>;
  visibleNodeIds?: Set<string>;
}

export function useGraphDataProcessing({
  allNodes,
  allLinks,
  expandedNodes,
  visibleNodeIds = new Set(),
}: UseGraphDataProcessingProps) {
  // Helper function to find the root document for a given node
  const findRootDocumentForNode = useCallback(
    (nodeId: string, links: DataLink[]): string | null => {
      // Build parent-child map
      const { parentByChild } = buildParentChildMaps(links);

      // Walk up the hierarchy to find the root
      let current = nodeId;
      while (true) {
        const parent = parentByChild.get(current);
        if (!parent) {
          // Found root - check if it's a document
          const node = allNodes.find((n) => n.id === current);
          if (node && !isMetadata(current)) {
            return current;
          }
          return null;
        }
        current = parent;
      }
    },
    [allNodes]
  );

  const computeSharedMetadataLimited = useCallback(
    (
      _nodes: DataNode[],
      links: DataLink[],
      visibleIds: Set<string>,
      expandedIds: Set<string>
    ): Set<string> => {
      const _visibleSet = new Set(visibleIds);
      const sharedMeta = new Set<string>();

      // First, count connections for each metadata node
      const metadataConnections = new Map<string, string[]>();

      for (const l of links) {
        if (!(l.source && l.target)) {
          continue;
        }

        const s = typeof l.source === "string" ? l.source : l.source.id;
        const t = typeof l.target === "string" ? l.target : l.target.id;

        const sIsMeta = isMetadata(s);
        const tIsMeta = isMetadata(t);

        // Track connections for metadata nodes (only to content nodes)
        if (sIsMeta && !tIsMeta) {
          // s is metadata, t is content
          if (!metadataConnections.has(s)) {
            metadataConnections.set(s, []);
          }
          if (!metadataConnections.get(s)?.includes(t)) {
            metadataConnections.get(s)?.push(t);
          }
        }
        if (tIsMeta && !sIsMeta) {
          // t is metadata, s is content
          if (!metadataConnections.has(t)) {
            metadataConnections.set(t, []);
          }
          if (!metadataConnections.get(t)?.includes(s)) {
            metadataConnections.get(t)?.push(s);
          }
        }
      }

      // Now decide which metadata nodes to show
      for (const [metaId, connectedIds] of metadataConnections) {
        const connectionCount = connectedIds.length;

        // Find the root documents that contain this metadata
        const rootDocuments = new Set<string>();
        for (const connectedId of connectedIds) {
          const rootDoc = findRootDocumentForNode(connectedId, links);
          if (rootDoc) {
            rootDocuments.add(rootDoc);
          }
        }

        const hasExpandedRoot = Array.from(rootDocuments).some((rootId) =>
          expandedIds.has(rootId)
        );

        if (connectionCount > 1) {
          // Shared metadata: always include (root-level)
          sharedMeta.add(metaId);
        } else if (connectionCount === 1) {
          // Single-connection metadata: include only when its document is expanded
          if (hasExpandedRoot) {
            sharedMeta.add(metaId);
          }
        }
      }

      return sharedMeta;
    },
    [findRootDocumentForNode]
  );

  const computeSubgraphIds = useCallback(
    (rootId: string): string[] => {
      const toFit = new Set<string>([rootId]);
      const queue: string[] = [rootId];
      const edgeSet = allLinks
        .filter((l) => {
          if (!(l.source && l.target)) {
            return false;
          }
          return true;
        })
        .map((l) => ({
          s: typeof l.source === "string" ? l.source : l.source.id,
          t: typeof l.target === "string" ? l.target : l.target.id,
        }));
      while (queue.length > 0) {
        const cur = queue.shift() as string;
        for (const e of edgeSet) {
          if (
            e.s === cur &&
            (visibleNodeIds.size === 0 || visibleNodeIds.has(e.t)) &&
            !toFit.has(e.t)
          ) {
            toFit.add(e.t);
            queue.push(e.t);
          }
        }
      }
      return Array.from(toFit);
    },
    [allLinks, visibleNodeIds]
  );

  const computeFocusTransform = useCallback(
    (nodeId: string, _padding = 50): { x: number; y: number; k: number } => {
      const node = allNodes.find((n) => n.id === nodeId);
      if (!node) {
        return { x: 0, y: 0, k: 1 };
      }

      const position = { x: node.x || 0, y: node.y || 0 };
      return {
        x: -position.x,
        y: -position.y,
        k: 1,
      };
    },
    [allNodes]
  );

  const computeExpandedVisibleNodeIds = useCallback(
    (
      nodes: DataNode[],
      links: DataLink[],
      expanded: Set<string>,
      filtered?: Set<string>
    ): Set<string> => {
      const { childrenByParent } = buildParentChildMaps(links);
      const rootDocuments = findRootDocumentIds(nodes, links);
      const allowed = (() => {
        const acc = new Set<string>();
        const queue = [...rootDocuments];
        while (queue.length > 0) {
          const cur = queue.shift() as string;
          if (acc.has(cur)) {
            continue;
          }
          if (isMetadata(cur)) {
            continue;
          }
          acc.add(cur);
          if (!expanded.has(cur)) {
            continue;
          }
          const children = childrenByParent.get(cur) || [];
          for (const c of children) {
            queue.push(c);
          }
        }
        return acc;
      })();

      const set = new Set<string>();

      // Include all allowed nodes
      for (const n of nodes) {
        if (allowed.has(n.id)) {
          set.add(n.id);
        }
      }

      // Include filtered nodes if any
      if (filtered && filtered.size > 0) {
        for (const id of filtered) {
          set.add(id);
        }
      }

      // Include metadata nodes connected to visible nodes
      const sharedVisibleMeta = computeSharedMetadataLimited(
        nodes,
        links,
        set,
        expanded
      );
      for (const metaId of sharedVisibleMeta) {
        set.add(metaId);
      }

      return set;
    },
    [computeSharedMetadataLimited]
  );

  return {
    computeExpandedVisibleNodeIds,
    computeSharedMetadataLimited,
    computeSubgraphIds,
    computeFocusTransform,
  };
}
