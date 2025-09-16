'use client';

import { useCallback } from 'react';
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from '../utils/data/data-manager';

interface UseGraphInteractionsProps {
  visibleNodes: DataNode[];
  allNodes: DataNode[];
  allLinks: DataLink[];
  expandedNodes: Set<string>;
  layoutMode: 'force' | 'hierarchical';
  isDraggingRef: React.MutableRefObject<boolean>;
  dragEndedRef: React.MutableRefObject<boolean>;
  hoverHideTimeoutRef: React.MutableRefObject<number | null>;
  positionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>;
  transformRef: React.MutableRefObject<{ x: number; y: number; k: number }>;
  simulationRef: React.MutableRefObject<any>;
  setHighlightedNodeId: (id: string | null) => void;
  setFocusedNodeId: (id: string | null) => void;
  toggleNodeExpansion: (nodeId: string) => void;
  setScrollTargetId: (nodeId: string) => void;
  isNodeExpandable: (type: string) => boolean;
  findRootDocumentIds: (nodes: DataNode[], links: DataLink[]) => string[];
  animateCollapse: (id: string, callback: () => void) => void;
}

export function useGraphInteractions({
  visibleNodes,
  allNodes,
  allLinks,
  expandedNodes,
  layoutMode,
  isDraggingRef,
  dragEndedRef,
  hoverHideTimeoutRef,
  positionsRef,
  transformRef,
  simulationRef,
  setHighlightedNodeId,
  setFocusedNodeId,
  toggleNodeExpansion,
  setScrollTargetId,
  isNodeExpandable,
  findRootDocumentIds,
  animateCollapse,
}: UseGraphInteractionsProps) {
  const onNodeClick = useCallback(
    (id: string) => {
      window.dispatchEvent(
        new CustomEvent('graph:nodeClick', { detail: { id } })
      );
      // Don't trigger expand/collapse if user was dragging
      if (isDraggingRef.current || dragEndedRef.current) {
        dragEndedRef.current = false; // Reset the flag
        return;
      }

      // Find the node to check its type
      const node = visibleNodes.find((n) => n.id === id);
      if (!node) {
        return;
      }

      if (!isNodeExpandable(node.type)) {
        return;
      }

      // Check if we're collapsing (node is currently expanded)
      const isCurrentlyExpanded = expandedNodes.has(id);
      if (isCurrentlyExpanded) {
        // Check if node has any children to collapse
        const hasChildren = allLinks.some((link) => {
          const sourceId =
            typeof link.source === 'string' ? link.source : link.source.id;
          return sourceId === id;
        });

        if (hasChildren) {
          // No fancy collapse animation; collapse immediately for consistent behavior
          const roots = findRootDocumentIds(allNodes, allLinks);
          const isRoot = roots.includes(id);
          if (isRoot) {
            setFocusedNodeId(null);
          }

          toggleNodeExpansion(id);

          if (isRoot) {
            window.dispatchEvent(
              new CustomEvent('graph:batchExpansionComplete', {
                detail: { reason: 'collapse-root' },
              })
            );
          } else {
            setScrollTargetId(id);
          }
          return;
        }
      }

      // We're expanding or the node has no children to collapse
      toggleNodeExpansion(id);
      setScrollTargetId(id);
    },
    [
      visibleNodes,
      allNodes,
      allLinks,
      expandedNodes,
      isDraggingRef,
      dragEndedRef,
      isNodeExpandable,
      toggleNodeExpansion,
      setScrollTargetId,
      setFocusedNodeId,
      findRootDocumentIds,
    ]
  );

  const onNodeMouseEnter = useCallback(
    (id: string) => {
      // Don't highlight node while dragging
      if (isDraggingRef.current) {
        return;
      }
      if (hoverHideTimeoutRef.current !== null) {
        window.clearTimeout(hoverHideTimeoutRef.current);
        hoverHideTimeoutRef.current = null;
      }
      setHighlightedNodeId(id);
    },
    [isDraggingRef, hoverHideTimeoutRef, setHighlightedNodeId]
  );

  const onNodeMouseLeave = useCallback(() => {
    if (hoverHideTimeoutRef.current !== null) {
      window.clearTimeout(hoverHideTimeoutRef.current);
    }
    hoverHideTimeoutRef.current = window.setTimeout(() => {
      setHighlightedNodeId(null);
      hoverHideTimeoutRef.current = null;
    }, 120);
  }, [hoverHideTimeoutRef, setHighlightedNodeId]);

  const startDrag = useCallback(
    (id: string, e: React.PointerEvent<HTMLElement>) => {
      isDraggingRef.current = true;
      // Clear highlighted node to hide tooltip when dragging starts
      setHighlightedNodeId(null);
      const targetElement = e.currentTarget as HTMLElement;
      targetElement.setPointerCapture(e.pointerId);
      const start = positionsRef.current.get(id) || { x: 0, y: 0 };
      const { x: tx, y: ty, k } = transformRef.current;
      const origin = {
        clientX: e.clientX,
        clientY: e.clientY,
        startX: start.x,
        startY: start.y,
        tx,
        ty,
        k,
        targetElement, // Store reference to the element
        pointerId: e.pointerId, // Store the pointer ID
      };

      // Track if there was actual movement (drag vs click)
      let hasMoved = false;
      let movedDistance = 0;

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - origin.clientX) / origin.k;
        const dy = (ev.clientY - origin.clientY) / origin.k;
        const nx = origin.startX + dx;
        const ny = origin.startY + dy;

        // Calculate movement distance
        movedDistance = Math.sqrt(dx * dx + dy * dy);
        hasMoved = movedDistance > 3; // Threshold for considering it a drag

        if (layoutMode === 'force') {
          simulationRef.current?.force('x', null);
          simulationRef.current?.force('y', null);
          simulationRef.current?.force('center', null);
          simulationRef.current?.alpha(0.3).restart();
        }

        positionsRef.current.set(id, { x: nx, y: ny });
        transformRef.current = { x: origin.tx, y: origin.ty, k: origin.k };
      };

      const onEnd = () => {
        isDraggingRef.current = false;
        dragEndedRef.current = hasMoved; // Only set if there was actual movement
        try {
          if (origin.targetElement && document.contains(origin.targetElement)) {
            origin.targetElement.releasePointerCapture(origin.pointerId);
          }
        } catch (_error) {
          // Ignore errors if element is already removed or pointer capture is already released
        }

        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);

        // Re-enable forces after dragging in force mode
        if (layoutMode === 'force') {
          simulationRef.current?.force('x', null);
          simulationRef.current?.force('y', null);
          simulationRef.current?.force('center', null);
          simulationRef.current?.alpha(0.3).restart();
        }
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onEnd);
    },
    [
      isDraggingRef,
      dragEndedRef,
      positionsRef,
      transformRef,
      simulationRef,
      layoutMode,
      setHighlightedNodeId,
    ]
  );

  return {
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    startDrag,
  };
}
