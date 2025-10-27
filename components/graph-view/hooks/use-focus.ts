import type React from "react";

export type FocusDeps = {
  // Inputs/state
  focusedNodeId: string | null;
  expandedNodes: Set<string>;
  isBatchOperation: boolean;

  // Refs
  lastFocusedAppliedRef: React.MutableRefObject<string | null>;
  suppressFocusRef: React.MutableRefObject<boolean>;
  suppressNextFitRef: React.MutableRefObject<boolean>;

  // Utilities
  computeSubgraphIds: (rootId: string) => string[];
  scheduleFitToView: (ids: string[], padding: number, reason?: string) => void;
};

// Call this inside a React effect when focusedNodeId changes
export function applyFocusChange(deps: FocusDeps): void {
  const {
    focusedNodeId,
    expandedNodes,
    isBatchOperation,
    lastFocusedAppliedRef,
    suppressFocusRef,
    suppressNextFitRef,
    computeSubgraphIds,
    scheduleFitToView,
  } = deps;

  if (!focusedNodeId) {
    lastFocusedAppliedRef.current = null;
    return;
  }
  if (suppressFocusRef.current) {
    lastFocusedAppliedRef.current = focusedNodeId;
    return;
  }
  if (lastFocusedAppliedRef.current === focusedNodeId) {
    return;
  }
  if (suppressNextFitRef.current) {
    return;
  }
  if (isBatchOperation) {
    return;
  }

  lastFocusedAppliedRef.current = focusedNodeId;
  const isExpanded = expandedNodes.has(focusedNodeId);
  scheduleFitToView(
    isExpanded
      ? computeSubgraphIds(focusedNodeId)
      : [focusedNodeId],
    isExpanded ? 140 : 80,
    "focus-change"
  );
}

export type BackgroundClickDeps = {
  isDraggingRef: React.MutableRefObject<boolean>;
  isZoomingRef: React.MutableRefObject<boolean>;
  suppressFocusRef: React.MutableRefObject<boolean>;
  setFocusedNodeId: (id: string | null) => void;
  setHighlightedNodeId: (id: string | null) => void;
};

// Returns a background click handler equivalent to the one in graph-canvas
export function createBackgroundClickHandler(
  deps: BackgroundClickDeps
): (e: unknown) => void {
  const {
    isDraggingRef,
    isZoomingRef,
    suppressFocusRef,
    setFocusedNodeId,
    setHighlightedNodeId,
  } = deps;
  return (e: unknown) => {
    if (isDraggingRef.current || isZoomingRef.current) {
      return;
    }
    const target =
      e && typeof e === "object" && e !== null
        ? (e as { target?: unknown }).target
        : null;
    const el = (target as Element | null) ?? null;
    if (el?.closest("[data-node-id]")) {
      return;
    }
    suppressFocusRef.current = true;
    setFocusedNodeId(null);
    setHighlightedNodeId(null);
    window.setTimeout(() => {
      suppressFocusRef.current = false;
    }, 0);
  };
}
