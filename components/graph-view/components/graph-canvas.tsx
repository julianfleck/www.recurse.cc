"use client";

import type {
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/components/auth/auth-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { graphApiClient } from "../api";
import {
  buildTreeIndex,
  graphExpandedToSidebarExpandedWithTree,
  mergeSidebarExpandedIntoGraph,
} from "../core/graph-state";
import {
  collapseLevel as collapseLevelUtil,
  expandLevel as expandLevelUtil,
} from "../hooks/use-expansion";
// depth-based expand/collapse will be handled locally (store-driven)
import {
  applyFocusChange as applyFocusChangeUtil,
  createBackgroundClickHandler as createBackgroundClickHandlerUtil,
} from "../hooks/use-focus";
import { useGraphData } from "../hooks/use-graph-data";
import { useGraphInteractions } from "../hooks/use-graph-interactions";
import { useGraphState } from "../hooks/use-graph-state";
import {
  healLayout as healLayoutUtil,
  updateHierarchicalLayout as updateHierarchicalLayoutUtil,
} from "../hooks/use-layout";
import {
  renderEdges as renderEdgesUtil,
  renderNodePositions as renderNodePositionsUtil,
  scheduleRender as scheduleRenderUtil,
} from "../hooks/use-render";
import {
  buildSimData as buildSimDataUtil,
  calculateDynamicLinkDistance as calculateDynamicLinkDistanceUtil,
  createForceSimulation as createForceSimulationUtil,
} from "../hooks/use-simulation";
import {
  applyTransform as applyTransformUtil,
  fitAll as fitAllUtil,
  recenterToCurrentZoom as recenterToCurrentZoomUtil,
  resetZoomToFit as resetZoomToFitUtil,
  scheduleFitToView as scheduleFitToViewUtil,
  zoomIn as zoomInUtil,
  zoomOut as zoomOutUtil,
} from "../hooks/use-zoom";
import { useUIStore } from "../store/ui-store";
// Standalone version - no store dependencies
// import { useGraphFocusStore } from '@/hooks/use-graph';
// import { useUIStore } from '@/hooks/use-ui';
// import { ApiService } from '@/services/api';
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from "../utils/data/data-manager";
import { GraphDataManager } from "../utils/data/data-manager";
import {
  buildParentChildMaps,
  findRootDocumentIds,
  getNodeDepth,
  isMetadata,
} from "../utils/data/relationship-utils";
import { calculateDescendantsByDepth } from "../utils/descendants-utils";
// Note: expansion helpers no longer imported; main's expand/collapse logic is inlined below
import type { HierarchicalLayout } from "../utils/layout/tree-layout";
import {
  computeEdgeStrokeWidth,
  computeNodeSize,
  computeNodeStyle,
  getControlsContainerClasses,
  getEdgeTailwindClass,
  getGraphContainerClasses,
  getGraphContentClasses,
  getLoadingContentClasses,
  getLoadingOverlayClasses,
  getLoadingSubtitleClasses,
  getLoadingTitleClasses,
  getNodeLayerClasses,
  getNodeTailwindClasses,
  getSvgContainerClasses,
} from "../utils/styling/node-styles";
import { GraphControls } from "./controls-panel";
import { GraphNodeRenderer } from "./node-renderer";
import { GraphTreeSidebar } from "./tree-sidebar";

// metadata identification is implemented inside the component to leverage node types

// (removed) legacy id-only shared metadata computation; replaced with type-aware logic inside component

// API interactions are handled in SimpleGraphView via GraphDataManager

type Point = { x: number; y: number };

// Local simulation node/link types to avoid unsafe casts
type SimNode = SimulationNodeDatum & {
  id: string;
  title: string;
  type: string;
  summary: string | null;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};
type SimLink = SimulationLinkDatum<SimNode> & {
  source: string;
  target: string;
};

// Helper types for expansion visibility computations
// type ParentChildMaps was unused; removed for cleanliness

// bezierPath is now provided by hooks/use-render via utils/layout/bezier

// Props for standalone graph view
export interface GraphViewProps {
  data?: unknown; // JSON data to load
  dataUrl?: string; // URL to fetch JSON data from
  className?: string;
  withSidebar?: boolean; // Whether to show the sidebar
  // Initial expansion depth: expand all non-metadata nodes up to this level (roots are level 0)
  depth?: number | string;
  // When true, hides the fullscreen button/control (used for nested fullscreen view)
  disableFullscreenControl?: boolean;
  // Optional modifier required for wheel zoom (trackpad). When 'cmd', only meta/ctrl + wheel zooms
  zoomModifier?: "" | "cmd";
}

export function GraphView({
  data,
  dataUrl,
  className = "",
  withSidebar = false,
  depth,
  disableFullscreenControl = false,
  zoomModifier = "",
}: GraphViewProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  // Graph state management
  const graphState = useGraphState();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    svgRef,
    zoomSurfaceRef,
    htmlLayerRef,
    edgesGroupRef,
    zoomBehaviorRef,
    selectionRef,
    transformRef,
    simulationRef,
    positionsRef,
    rafRef,
    layoutRef,
    nodeElsRef,
    isDraggingRef,
    dragEndedRef,
    suppressNextFitRef,
    hoverHideTimeoutRef,
    isZoomingRef,
    _prevExpandedNodesRef,
    localCollapseGuardRef,
    edgesToFadeRef,
    collapsingChildIdsRef,
    isAnimatingCollapseRef,
    collapsingNodesRef,
    dataManagerRef,
    expansionCleanupRef,
    collapsingCleanupRef,
    suppressFocusRef,
    suppressSidebarSelectRef,
    layoutTransitionRef,
    _layoutFitTimerRef,
    suppressLayoutFitUntilRef,
    didInitialFitRef,
    lastFocusedAppliedRef,
    isInitialized,
    setIsInitialized,
    isExpanding,
    setIsExpanding,
    isCollapsing,
    setIsCollapsing,
    expansionProgress,
    setExpansionProgress,
    isBatchOperation,
    setIsBatchOperation,
    simulationPaused,
    setSimulationPaused,
    nodesById,
    setNodesById,
    edges,
    setEdges,
    expandedNodes,
    setExpandedNodes,
    highlightedNodeId,
    setHighlightedNodeId,
    focusedNodeId,
    setFocusedNodeId,
    layoutMode,
    setLayoutMode,
  } = graphState;

  // Build a tree index once the hierarchical treeData is ready
  // Declare a lazy builder that will be reassigned after treeData is initialized
  // This avoids referencing treeData before its declaration below.

  // Graph data management
  const [filteredIds, setFilteredIds] = useState<Set<string> | null>(null);
  const graphData = useGraphData({
    nodesById,
    edges,
    expandedNodes,
    filteredNodeIds: filteredIds,
    collapsingChildIds: collapsingChildIdsRef.current,
    allNodes: [], // Will be computed by the hook
    allLinks: [], // Will be computed by the hook
  });
  const {
    allNodes,
    allLinks,
    visibleNodeIds,
    visibleNodes,
    treeData,
    visibleLinks,
    computeSubgraphIds,
  } = graphData;
  // Debug: track expansion state changes in one place
  useEffect(() => {
    // keep hook; no debug output
  }, []);

  // Apply initial expansion depth once when tree data is available
  const appliedInitialDepthRef = useRef(false);
  const depthInitInProgressRef = useRef(false);
  const markManualOverride = useCallback(() => {
    appliedInitialDepthRef.current = true;
  }, []);
  const initialDepth = (() => {
    if (depth === undefined) {
      return;
    }
    const n = Number(depth);
    if (!Number.isFinite(n)) {
      return;
    }
    const d = Math.floor(n);
    return d < 0 ? 0 : d;
  })();

  useEffect(() => {
    if (appliedInitialDepthRef.current) {
      return;
    }
    if (!Number.isFinite(initialDepth as number)) {
      return;
    }
    const target = Number(initialDepth || 0);
    if (target <= 0) {
      appliedInitialDepthRef.current = true;
      return;
    }
    if (allNodes.length === 0 || allLinks.length === 0) {
      return;
    }

    const { parentByChild } = buildParentChildMaps(allLinks);
    let maxDepth = 0;
    for (const id of visibleNodeIds) {
      if (isMetadata(id)) continue;
      const d = getNodeDepth(id, parentByChild);
      if (d > maxDepth) maxDepth = d;
    }
    if (maxDepth >= target) {
      appliedInitialDepthRef.current = true;
      return;
    }

    if (depthInitInProgressRef.current) {
      return;
    }
    depthInitInProgressRef.current = true;
    const runStep = async () => {
      try {
        const localFitAll = () =>
          fitAllUtil(
            {
              svgRef,
              edgesGroupRef,
              htmlLayerRef,
              transformRef,
              selectionRef,
              zoomBehaviorRef,
              positionsRef,
            },
            160
          );
        await expandLevelUtil({
          treeData,
          visibleNodeIds,
          expandedNodes,
          // Expand only the currently focused/hovered root if present
          targetRootId: focusedNodeId ?? null,
          setExpandedNodes,
          setIsExpanding,
          setIsBatchOperation,
          suppressNextFitRef,
          dataManagerRef,
          fitAll: localFitAll,
        });
      } finally {
        depthInitInProgressRef.current = false;
      }
    };
    void runStep();
  }, [
    initialDepth,
    allNodes,
    allLinks,
    visibleNodeIds,
    expandedNodes,
    treeData,
    setExpandedNodes,
    setIsExpanding,
    setIsBatchOperation,
    suppressNextFitRef,
    dataManagerRef,
    // Do not depend on fitAll to avoid TDZ; we use a local wrapper instead
  ]);

  // Initialize GraphDataManager with API service
  useEffect(() => {
    if (!dataManagerRef.current) {
      dataManagerRef.current = new GraphDataManager(
        graphApiClient, // Use the API service for data loading
        (updatedData) => {
          // Handle data updates
          if (updatedData.nodes) {
            const newNodesById = new Map<string, DataNode>();
            for (const node of updatedData.nodes) {
              newNodesById.set(node.id, node);
            }
            setNodesById(newNodesById);
          }
          if (updatedData.links) {
            setEdges(updatedData.links);
          }
        },
        (_error) => {
          // Error handling for data updates - intentionally empty as errors are handled elsewhere
        }
      );
    }
  }, [dataManagerRef, setNodesById, setEdges]);

  // Track if we've already loaded data to prevent duplicate loads
  const hasLoadedDataRef = useRef(false);

  // Load data from props (always reload on change)
  useEffect(() => {
    const loadData = async () => {
      if (!dataManagerRef.current) {
        return;
      }

      if (dataUrl) {
        try {
          const response = await fetch(dataUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
          }
          const jsonData = await response.json();
          await dataManagerRef.current.loadFromJSON(jsonData);
        } catch (_error) {
          // Error handling for data loading - intentionally empty as errors are handled elsewhere
        }
      } else if (data) {
        await dataManagerRef.current.loadFromJSON(data);
      }
    };

    void loadData();
  }, [data, dataUrl, dataManagerRef]);

  // Listen for authentication changes and load data when auth becomes ready
  useEffect(() => {
    const loadDataWhenAuthReady = async () => {
      if (!dataManagerRef.current || hasLoadedDataRef.current || data || dataUrl) {
        console.log("[GraphCanvas] Skipping API load:", {
          hasDataManager: !!dataManagerRef.current,
          hasLoadedData: hasLoadedDataRef.current,
          hasStaticData: !!(data || dataUrl),
        });
        return; // Skip if we have static data or already loaded
      }

      const accessToken = useAuthStore.getState().accessToken;
      console.log("[GraphCanvas] Checking auth for API load. Token available:", !!accessToken);
      
      if (accessToken) {
        console.log("[GraphCanvas] Loading data from API...");
        await dataManagerRef.current.loadInitialDocuments();
        hasLoadedDataRef.current = true;
        console.log("[GraphCanvas] API data load completed");
      } else {
        console.log("[GraphCanvas] No auth token available, waiting...");
      }
    };

    // Subscribe to auth store changes
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      console.log("[GraphCanvas] Auth store changed:", {
        hadToken: !!prevState.accessToken,
        hasToken: !!state.accessToken,
        tokenChanged: !prevState.accessToken && state.accessToken,
      });
      
      // Only trigger if accessToken changed from undefined to defined
      if (!prevState.accessToken && state.accessToken) {
        console.log("[GraphCanvas] Auth token became available, loading data...");
        loadDataWhenAuthReady();
      }
    });

    // Also check immediately in case auth is already ready
    console.log("[GraphCanvas] Initial auth check...");
    loadDataWhenAuthReady();

    return unsubscribe;
  }, [data, dataUrl]);

  // Local action functions to replace store actions
  const _setHighlightedNode = useCallback(
    (nodeId: string | null, _source?: "graph" | "sidepanel") => {
      setHighlightedNodeId(nodeId);
      // no-op for highlightSource in standalone mode
    },
    [setHighlightedNodeId]
  );

  const toggleNodeExpansion = useCallback(
    (nodeId: string) => {
      // Any user-triggered expansion/collapse should disable initial depth enforcement
      markManualOverride();
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    },
    [setExpandedNodes, markManualOverride]
  );

  // For graph clicks, do not set focus to avoid subgraph centering from clicks
  const setScrollTargetId = useCallback((_nodeId: string) => {
    // no-op: reserved for future sidebar scroll syncing
  }, []);

  const setIsBulkOperation = useCallback(
    (isBulk: boolean) => {
      setIsBatchOperation(isBulk);
    },
    [setIsBatchOperation]
  );

  // Type-aware metadata predicate

  // removed legacy global shared-metadata computation

  // Visible nodes: expansion-driven gating + filters
  // removed: unused computeMaxDepthFromRoot

  // removed: unused collectNodesAtDepthToExpand

  // removed: unused collectNodesAtDepthToCollapse

  // Helper: compute shared metadata nodes (degree > 1 across entire graph),
  // but only include those that connect to at least one currently visible content node

  // Helper function to get all descendants in depth order (deepest first)
  const getDescendantsByDepth = useCallback(
    (rootId: string): Array<{ id: string; depth: number }> => {
      return calculateDescendantsByDepth({
        rootId,
        allLinks,
        visibleNodeIds,
      });
    },
    [allLinks, visibleNodeIds]
  ); // Helper function to get edges connected to nodes being collapsed
  const getConnectedEdges = useCallback(
    (nodeIds: string[]): Array<{ source: string; target: string }> => {
      return allLinks
        .filter((link) => {
          const sourceId =
            typeof link.source === "string" ? link.source : link.source.id;
          const targetId =
            typeof link.target === "string" ? link.target : link.target.id;
          return nodeIds.includes(sourceId) || nodeIds.includes(targetId);
        })
        .map((link) => ({
          source:
            typeof link.source === "string" ? link.source : link.source.id,
          target:
            typeof link.target === "string" ? link.target : link.target.id,
        }));
    },
    [allLinks]
  );

  // Compute and publish current expansion level to the UI store
  const computeAndSetCurrentLevel = useCallback(() => {
    if (!allLinks || allLinks.length === 0 || visibleNodeIds.size === 0) {
      useUIStore.getState().setCurrentLevel(0);
      return;
    }
    const { parentByChild } = buildParentChildMaps(allLinks);
    let maxDepth = 0;
    for (const id of visibleNodeIds) {
      if (isMetadata(id)) {
        continue;
      }
      const d = getNodeDepth(id, parentByChild);
      if (d > maxDepth) {
        maxDepth = d;
      }
    }
    useUIStore.getState().setCurrentLevel(maxDepth);
  }, [allLinks, visibleNodeIds]);

  // Collapse animation functions are defined later

  // Helpers declared before side effects
  const applyTransform = useCallback(() => {
    applyTransformUtil({
      svgRef,
      edgesGroupRef,
      htmlLayerRef,
      transformRef,
      selectionRef,
      zoomBehaviorRef,
      positionsRef,
    });
  }, [
    svgRef,
    edgesGroupRef,
    htmlLayerRef,
    transformRef,
    selectionRef,
    zoomBehaviorRef,
    positionsRef,
  ]);

  // removed unused local calculateDynamicLinkDistance

  const updateLinkForceForZoom = useCallback(
    (k: number, opts: { reheat?: boolean } = {}) => {
      const sim = simulationRef.current;
      if (!sim) {
        return;
      }
      const linkForce = sim.force("link") as
        | ForceLink<SimNode, SimLink>
        | undefined;
      if (!linkForce) {
        return;
      }
      linkForce.distance(calculateDynamicLinkDistanceUtil(k));
      const shouldReheat = opts.reheat !== false;
      if (shouldReheat) {
        // Nudge the simulation so it reflows with the updated distance
        sim.alpha(0.4).alphaTarget(0.12).restart();
        window.setTimeout(() => {
          if (simulationRef.current) {
            simulationRef.current.alphaTarget(0);
          }
        }, 250);
      }
    },
    []
  );

  const pinAllSimulationNodes = useCallback(() => {
    const sim = simulationRef.current;
    if (!sim) {
      return;
    }
    const nodes = sim.nodes() as SimNode[];
    for (const n of nodes) {
      const p = positionsRef.current.get(n.id);
      const x = typeof n.x === "number" ? n.x : (p?.x ?? 0);
      const y = typeof n.y === "number" ? n.y : (p?.y ?? 0);
      n.fx = x;
      n.fy = y;
    }
  }, [simulationRef, positionsRef]);

  const unpinAllSimulationNodes = useCallback(() => {
    const sim = simulationRef.current;
    if (!sim) {
      return;
    }
    const nodes = sim.nodes() as SimNode[];
    for (const n of nodes) {
      n.fx = undefined;
      n.fy = undefined;
    }
  }, [simulationRef]);

  // Simulation control functions for batch operations

  const resumeSimulation = useCallback(() => {
    if (simulationRef.current && simulationPaused) {
      unpinAllSimulationNodes();
      simulationRef.current.alpha(0.3).alphaTarget(0.1).restart();
      setSimulationPaused(false);
    }
  }, [simulationPaused, unpinAllSimulationNodes]);

  const healLayout = useCallback(() => {
    healLayoutUtil(
      {
        simulationRef:
          simulationRef as unknown as React.MutableRefObject<Simulation<
            unknown,
            unknown
          > | null>,
      },
      layoutMode
    );
  }, [layoutMode]);

  // Build sim arrays from visible graph
  const buildSimData = useCallback(
    (nodesIn: DataNode[], linksIn: DataLink[]) =>
      buildSimDataUtil(
        nodesIn.map((n) => ({
          id: n.id,
          title: n.title,
          type: n.type,
          summary: n.summary ?? null,
        })),
        linksIn.map((l) => ({
          source: typeof l.source === "string" ? l.source : l.source.id,
          target: typeof l.target === "string" ? l.target : l.target.id,
        }))
      ),
    []
  );

  // Helpers for seeding initial positions
  const buildParentMap = useCallback((links: SimLink[]) => {
    const parentByChild = new Map<string, string>();
    for (const l of links) {
      parentByChild.set(l.target, l.source);
    }
    return parentByChild;
  }, []);

  const computeSeedPosition = useCallback(
    (id: string, parentByChild: Map<string, string>) => {
      const prev = positionsRef.current.get(id);
      if (prev) {
        return { x: prev.x, y: prev.y } as Point;
      }
      const parentId = parentByChild.get(id);
      const parentPos = parentId
        ? positionsRef.current.get(parentId)
        : undefined;
      if (parentPos) {
        const jitter = 10;
        return {
          x: parentPos.x + (Math.random() - 0.5) * jitter,
          y: parentPos.y + (Math.random() - 0.5) * jitter,
        } as Point;
      }
      const r = 80 + Math.random() * 40;
      const a = Math.random() * Math.PI * 2;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r } as Point;
    },
    []
  );

  // Seed initial positions to avoid jumpiness; reuse previous or parent
  const seedInitialPositions = useCallback(
    (nodes: SimNode[], links: SimLink[]) => {
      const parentByChild = buildParentMap(links);
      for (const n of nodes) {
        const p = computeSeedPosition(n.id, parentByChild);
        n.x = p.x;
        n.y = p.y;
        positionsRef.current.set(n.id, { x: p.x, y: p.y });
      }
    },
    [buildParentMap, computeSeedPosition]
  );

  const buildParentMapFromLinks = useCallback((): Map<string, string> => {
    const parentByChild = new Map<string, string>();
    for (const l of allLinks) {
      const s = typeof l.source === "string" ? l.source : l.source.id;
      const t = typeof l.target === "string" ? l.target : l.target.id;
      parentByChild.set(t, s);
    }
    return parentByChild;
  }, [allLinks]);

  // draw edges via utility
  const renderEdges = useCallback(() => {
    renderEdgesUtil({
      svgRef,
      edgesGroupRef,
      nodeElsRef,
      transformRef,
      positionsRef,
      collapsingChildIdsRef,
      rafRef,
      visibleLinks,
      layoutMode,
      computeSeedPosition,
      buildParentMapFromLinks,
      computeEdgeStrokeWidth,
      getEdgeTailwindClass,
      computeNodeSize,
      computeNodeStyle,
    });
  }, [
    visibleLinks,
    layoutMode,
    computeSeedPosition,
    buildParentMapFromLinks,
    computeEdgeStrokeWidth,
    getEdgeTailwindClass,
    computeNodeSize,
    computeNodeStyle,
  ]);

  // position node elements via utility
  const renderNodePositions = useCallback(() => {
    renderNodePositionsUtil({
      svgRef,
      edgesGroupRef,
      nodeElsRef,
      transformRef,
      positionsRef,
      collapsingChildIdsRef,
      rafRef,
      visibleLinks,
      layoutMode,
      computeSeedPosition,
      buildParentMapFromLinks,
      computeEdgeStrokeWidth,
      getEdgeTailwindClass,
      computeNodeSize,
      computeNodeStyle,
    });
  }, [layoutMode, computeNodeSize, computeNodeStyle]);

  // schedule combined render via utility
  const scheduleRender = useCallback(() => {
    scheduleRenderUtil({
      svgRef,
      edgesGroupRef,
      nodeElsRef,
      transformRef,
      positionsRef,
      collapsingChildIdsRef,
      rafRef,
      visibleLinks,
      layoutMode,
      computeSeedPosition,
      buildParentMapFromLinks,
      computeEdgeStrokeWidth,
      getEdgeTailwindClass,
      computeNodeSize,
      computeNodeStyle,
    });
  }, [renderEdges, renderNodePositions, layoutMode, visibleLinks]);

  // Collapse helpers and animation
  const addEdgesToFade = useCallback(
    (edgesIn: Array<{ source: string; target: string }>) => {
      for (const e of edgesIn) {
        edgesToFadeRef.current.add(`${e.source}->${e.target}`);
      }
    },
    []
  );

  const applyEdgeFadeStyles = useCallback(
    (
      edgesIn: Array<{ source: string; target: string }>,
      durationMs: number
    ) => {
      const svgElement = svgRef.current;
      if (!svgElement) {
        return;
      }
      for (const e of edgesIn) {
        const edgeKey = `${e.source}->${e.target}`;
        const pathElement = svgElement.querySelector(
          `path[data-edge="${edgeKey}"]`
        ) as SVGPathElement | null;
        if (pathElement) {
          pathElement.style.transition = `opacity ${durationMs}ms ease-out`;
          pathElement.style.opacity = "0";
        }
      }
    },
    []
  );

  const animateNodesTowardParents = useCallback(
    (
      _descendants: Array<{ id: string; depth: number }>,
      _parentByChild: Map<string, string>,
      _fallbackTarget: Point,
      _edgeFadeDurationMs: number
    ) => {
      // No collapse motion; just report minimal duration for sequencing
      return { totalAnimationTime: 0 };
    },
    []
  );

  const cleanupAfterCollapse = useCallback(
    (
      nodeId: string,
      _descendants: Array<{ id: string; depth: number }>,
      connectedEdges: Array<{ source: string; target: string }>,
      onComplete?: () => void
    ) => {
      collapsingNodesRef.current.delete(nodeId);
      collapsingChildIdsRef.current.clear();
      // Preserve descendant positions and DOM refs for smooth re-expand
      if (dataManagerRef.current) {
        dataManagerRef.current.resetFetchedStatus(nodeId);
      }
      if (layoutMode === "force") {
        unpinAllSimulationNodes();
      }
      // Important: first trigger the underlying visibility change via callback
      onComplete?.();
      // Keep edges faded until visibility/state recomputes; then clear marks next frame
      window.requestAnimationFrame(() => {
        for (const edge of connectedEdges) {
          edgesToFadeRef.current.delete(`${edge.source}->${edge.target}`);
        }
        scheduleRender();
        healLayout();
        isAnimatingCollapseRef.current = false;
      });
    },
    [layoutMode, unpinAllSimulationNodes, scheduleRender, healLayout]
  );

  const animateCollapse = useCallback(
    (nodeId: string, onComplete?: () => void) => {
      const _startTime = performance.now();
      const descendants = getDescendantsByDepth(nodeId);
      if (descendants.length === 0) {
        if (dataManagerRef.current) {
          dataManagerRef.current.resetFetchedStatus(nodeId);
        }
        return;
      }
      const allNodeIds = [nodeId, ...descendants.map((d) => d.id)];
      collapsingNodesRef.current.set(nodeId, {
        children: descendants.map((d) => d.id),
        startTime: _startTime,
      });
      collapsingChildIdsRef.current = new Set(descendants.map((d) => d.id));
      isAnimatingCollapseRef.current = true;
      const collapseTargetPos = positionsRef.current.get(nodeId);
      if (!collapseTargetPos) {
        return;
      }
      if (layoutMode === "force") {
        pinAllSimulationNodes();
      }
      // Mark this collapse as local to avoid double-trigger by external watcher
      localCollapseGuardRef.current.add(nodeId);
      const connectedEdges = getConnectedEdges(allNodeIds);
      // Build a helper to detect shared metadata (connected to >1 content node)
      const isSharedMetadata = (metaId: string): boolean => {
        if (!isMetadata(metaId)) {
          return false;
        }
        let contentConnections = 0;
        for (const link of allLinks) {
          const s =
            typeof link.source === "string" ? link.source : link.source.id;
          const t =
            typeof link.target === "string" ? link.target : link.target.id;
          if (s === metaId && !isMetadata(t)) {
            contentConnections++;
          }
          if (t === metaId && !isMetadata(s)) {
            contentConnections++;
          }
          if (contentConnections > 1) {
            return true;
          }
        }
        return false;
      };

      // Fade edges wholly inside the collapsing subtree, and edges from subtree to
      // non-shared metadata or to outside content; but KEEP edges to shared metadata
      // so shared meta remain visually connected.
      const parentByChild = buildParentMapFromLinks();
      const edgesToFade = connectedEdges.filter((e) => {
        const inSubtreeSource = allNodeIds.includes(e.source);
        const inSubtreeTarget = allNodeIds.includes(e.target);
        if (inSubtreeSource && inSubtreeTarget) {
          return true; // internal edges
        }
        let otherId: string | null = null;
        if (inSubtreeSource) {
          otherId = e.target;
        } else if (inSubtreeTarget) {
          otherId = e.source;
        }
        if (!otherId) {
          return false;
        }
        // If other end is metadata: keep if shared, fade if single-connection
        if (isMetadata(otherId)) {
          return !isSharedMetadata(otherId);
        }
        // Other end is content outside subtree: fade
        return true;
      });
      addEdgesToFade(edgesToFade);
      scheduleRender();
      const edgeFadeDuration = 240; // edges disappear first, linger nodes a bit
      applyEdgeFadeStyles(edgesToFade, edgeFadeDuration);
      // Reuse parentByChild for node targeting
      const { totalAnimationTime } = animateNodesTowardParents(
        descendants,
        parentByChild,
        collapseTargetPos,
        edgeFadeDuration
      );
      window.setTimeout(() => {
        cleanupAfterCollapse(nodeId, descendants, edgesToFade, onComplete);
        // Clear local guard once done
        localCollapseGuardRef.current.delete(nodeId);
      }, totalAnimationTime);
    },
    [
      getDescendantsByDepth,
      getConnectedEdges,
      layoutMode,
      pinAllSimulationNodes,
      scheduleRender,
      addEdgesToFade,
      applyEdgeFadeStyles,
      buildParentMapFromLinks,
      animateNodesTowardParents,
      cleanupAfterCollapse,
      allLinks,
    ]
  );

  // Create and wire the simulation
  const createForceSimulation = useCallback(
    (nodes: SimNode[], links: SimLink[], currentK: number) =>
      createForceSimulationUtil(
        {
          positionsRef,
          simulationRef:
            simulationRef as unknown as React.MutableRefObject<Simulation<
              SimNode,
              SimLink
            > | null>,
          scheduleRender,
        },
        nodes,
        links,
        currentK
      ),
    [positionsRef, scheduleRender]
  );

  // remove duplicate accidental re-declarations

  // No store rehydration needed in standalone mode

  // Mark initialized when there are visible nodes
  useEffect(() => {
    if (!isInitialized && visibleNodes.length > 0) {
      setIsInitialized(true);
    }
  }, [isInitialized, visibleNodes]);

  // Setup zoom behavior on SVG surface
  useEffect(() => {
    if (!zoomSurfaceRef.current) {
      return;
    }
    const surfaceSel = select(zoomSurfaceRef.current as Element);
    selectionRef.current = surfaceSel;
    const behavior = zoom<Element, unknown>()
      .filter((event: any) => {
        // Disable zoom/pan while dragging a node
        if (isDraggingRef.current) {
          return false;
        }
        // If a modifier is required for zoom, allow pan but require meta/ctrl for wheel/dblclick zoom
        if (zoomModifier === "cmd" && event && !isFullscreenOpen) {
          const type = event.type as string | undefined;
          // Only restrict wheel-based zoom; allow double-click zoom regardless
          if (type === "wheel") {
            const hasCmd = !!(event.metaKey || event.ctrlKey);
            if (!hasCmd) {
              return false;
            }
          }
        }
        return true;
      })
      .scaleExtent([0.1, 3])
      .on("start", () => {
        isZoomingRef.current = true;
        if (layoutMode === "force") {
          pinAllSimulationNodes();
        }
      })
      .on("zoom", (event) => {
        const t = event.transform;
        transformRef.current = { x: t.x, y: t.y, k: t.k };
        applyTransform();
        // Refresh visuals that depend on zoom (sizes, offsets, stroke widths)
        renderNodePositions();
        renderEdges();
        if (layoutMode === "force") {
          // Keep link lengths in sync with zoom without reheating (no movement)
          updateLinkForceForZoom(t.k, { reheat: false });
        }
      })
      .on("end", () => {
        isZoomingRef.current = false;
        if (layoutMode === "force") {
          unpinAllSimulationNodes();
          const k = transformRef.current.k || 1;
          // Apply final distance and resume simulation to settle briefly
          updateLinkForceForZoom(k, { reheat: true });
        }
      });
    zoomBehaviorRef.current = behavior;
    surfaceSel.call(behavior);
    return () => {
      surfaceSel.on(".zoom", null);
    };
  }, [
    // Removed layoutMode to prevent zoom behavior recreation on layout changes
    // The zoom behavior should work consistently across layout modes
    applyTransform,
    renderEdges,
    renderNodePositions,
    updateLinkForceForZoom,
    pinAllSimulationNodes,
    unpinAllSimulationNodes,
    layoutMode,
    zoomModifier,
    isFullscreenOpen,
  ]);

  // Fit selected ids into view with padding
  const resetZoomToFit = useCallback(
    (ids: string[], padding = 120, _reason?: string) => {
      resetZoomToFitUtil(
        {
          svgRef,
          edgesGroupRef,
          htmlLayerRef,
          transformRef,
          selectionRef,
          zoomBehaviorRef,
          positionsRef,
        },
        ids,
        padding
      );
    },
    [applyTransform]
  );

  const fitAll = useCallback(() => {
    fitAllUtil(
      {
        svgRef,
        edgesGroupRef,
        htmlLayerRef,
        transformRef,
        selectionRef,
        zoomBehaviorRef,
        positionsRef,
      },
      160
    );
  }, [resetZoomToFit]);

  // Coalesce multiple fit requests within a short window
  // Guard to avoid competing fits during layout transitions
  const scheduleFitToView = useCallback(
    (ids: string[], padding: number, reason?: string) => {
      scheduleFitToViewUtil(
        {
          svgRef,
          edgesGroupRef,
          htmlLayerRef,
          transformRef,
          selectionRef,
          zoomBehaviorRef,
          positionsRef,
        },
        ids,
        padding,
        reason
      );
    },
    []
  );
  // Recenter stub: instrumentation only, no actual transform during debugging
  const recenterToCurrentZoom = useCallback(() => {
    recenterToCurrentZoomUtil({
      svgRef,
      edgesGroupRef,
      htmlLayerRef,
      transformRef,
      selectionRef,
      zoomBehaviorRef,
      positionsRef,
    });
  }, []);

  // Recenter on container resize to keep content centered at current zoom
  useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    const el = svgRef.current;
    const ro = new ResizeObserver(() => {
      recenterToCurrentZoom();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [recenterToCurrentZoom]);

  // Also recenter on window resize
  useEffect(() => {
    const handler = () => {
      recenterToCurrentZoom();
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [recenterToCurrentZoom]);

  // Request a single authoritative fit during a layout transition

  // Track if initial fit ran to avoid repeated runs on incremental updates
  // Force mode: build or update simulation when structure changes
  useEffect(() => {
    if (layoutMode !== "force") {
      return;
    }

    // During batch operations, don't recreate the simulation to prevent jiggly behavior
    if (isBatchOperation) {
      return;
    }

    const existing = simulationRef.current;
    if (existing) {
      existing.stop();
      simulationRef.current = null;
    }

    const { nodes, links } = buildSimData(visibleNodes, visibleLinks);
    seedInitialPositions(nodes, links);
    // Positions have been seeded; first scheduled render will align DOM
    scheduleRender();

    const currentK = transformRef.current.k || 1;
    const sim = createForceSimulation(nodes, links, currentK);
    simulationRef.current = sim as unknown as Simulation<
      SimulationNodeDatum & {
        x?: number;
        y?: number;
        fx?: number;
        fy?: number;
      },
      SimulationLinkDatum<
        SimulationNodeDatum & {
          x?: number;
          y?: number;
          fx?: number;
          fy?: number;
        }
      > & {
        source: string;
        target: string;
      }
    >;

    // If simulation was paused, keep it paused
    if (simulationPaused) {
      sim.alpha(0);
      pinAllSimulationNodes();
    }

    return () => {
      sim.stop();
    };
  }, [
    layoutMode,
    visibleNodes,
    visibleLinks,
    buildSimData,
    seedInitialPositions,
    scheduleRender,
    createForceSimulation,
    isBatchOperation,
    simulationPaused,
    pinAllSimulationNodes,
  ]);

  // Hierarchical mode: compute positions with layout utility
  useEffect(() => {
    if (layoutMode !== "hierarchical") {
      return;
    }
    updateHierarchicalLayoutUtil(
      {
        layoutRef:
          layoutRef as React.MutableRefObject<HierarchicalLayout | null>,
        positionsRef,
        scheduleRender,
      },
      visibleNodes,
      visibleLinks
    );
    // Fit handled by layout transition effect to avoid duplicate fits
  }, [layoutMode, visibleNodes, visibleLinks, scheduleRender]);

  // Render cycle: update SVG edges and HTML nodes declared above

  // Helper function to check if a node is expandable (not a metadata node)
  const isNodeExpandable = useCallback((nodeType: string) => {
    return !["tag", "hypernym", "hyponym"].includes(nodeType);
  }, []);

  const canCollapseNode = useCallback(
    (nodeId: string): boolean => {
      const isExpanded = expandedNodes.has(nodeId);
      let hasChildren = false;
      for (const link of allLinks) {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id;
        if (sourceId === nodeId) {
          hasChildren = true;
          break;
        }
      }
      return isExpanded && hasChildren;
    },
    [expandedNodes, allLinks]
  );

  // Node interactions hook
  const { onNodeClick, onNodeMouseEnter, onNodeMouseLeave, startDrag } =
    useGraphInteractions({
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
    });

  // Focus changes: center node or fit subgraph
  useEffect(() => {
    applyFocusChangeUtil({
      focusedNodeId,
      expandedNodes,
      isBatchOperation,
      lastFocusedAppliedRef,
      suppressFocusRef,
      suppressNextFitRef,
      computeSubgraphIds,
      scheduleFitToView,
    });
  }, [
    focusedNodeId,
    expandedNodes,
    computeSubgraphIds,
    scheduleFitToView,
    isBatchOperation,
  ]);

  // Removed hover-triggered fit behavior to avoid erratic zooms

  // After batch expansion/collapse completes, perform a single fit if needed
  useEffect(() => {
    const handler = (_e: Event) => {
      if (!svgRef.current) {
        return;
      }
      const delay = layoutMode === "force" ? 250 : 0;
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("fit:batchComplete:request", {
            detail: {
              visibleCount: visibleNodes.length,
              focusedNodeId,
            },
          })
        );
      }, delay);
    };
    window.addEventListener("graph:batchExpansionComplete", handler);
    return () => {
      window.removeEventListener("graph:batchExpansionComplete", handler);
    };
  }, [visibleNodes, layoutMode, focusedNodeId]);

  // Layout transitions: after switching layouts, fit entire graph once
  useEffect(() => {
    if (visibleNodes.length === 0) {
      return;
    }
    if (layoutTransitionRef.current === layoutMode) {
      return; // already handled this mode
    }
    layoutTransitionRef.current = layoutMode;
    const delay = layoutMode === "hierarchical" ? 0 : 800;
    const t = window.setTimeout(() => {
      // If a subgraph fit was requested recently, skip the layout fit
      if (Date.now() < suppressLayoutFitUntilRef.current) {
        layoutTransitionRef.current = null;
        return;
      }
      fitAll();
      layoutTransitionRef.current = null;
    }, delay);
    return () => window.clearTimeout(t);
  }, [layoutMode, visibleNodes.length, fitAll]);

  // Initial fit (instrumentation only)
  useEffect(() => {
    if (!isInitialized || visibleNodes.length === 0) {
      return;
    }
    if (didInitialFitRef.current) {
      return;
    }
    didInitialFitRef.current = true;
    // Logging removed for now
  }, [isInitialized, visibleNodes]);

  // Cleanup any pending hover hide timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverHideTimeoutRef.current !== null) {
        window.clearTimeout(hoverHideTimeoutRef.current);
        hoverHideTimeoutRef.current = null;
      }
    };
  }, []);

  // Controls with smooth transitions
  const zoomIn = useCallback(() => {
    zoomInUtil({
      svgRef,
      edgesGroupRef,
      htmlLayerRef,
      transformRef,
      selectionRef,
      zoomBehaviorRef,
      positionsRef,
    });
  }, []);

  const zoomOut = useCallback(() => {
    zoomOutUtil({
      svgRef,
      edgesGroupRef,
      htmlLayerRef,
      transformRef,
      selectionRef,
      zoomBehaviorRef,
      positionsRef,
    });
  }, []);
  // Canvas click: clear selection/focus when clicking the background (not a node)
  const onBackgroundClick = useCallback(
    createBackgroundClickHandlerUtil({
      isDraggingRef,
      isZoomingRef,
      suppressFocusRef,
      setFocusedNodeId,
      setHighlightedNodeId,
    }),
    []
  );

  // (duplicate recenterToCurrentZoom and ResizeObserver were removed above)

  // Current expansion level from centralized UI store
  const currentExpansionLevel = useUIStore((s) => s.currentLevel);

  // Helper: compute max visible content depth from tree, skipping metadata in depth count
  const computeExpansionLevelFromTree = useCallback(() => {
    if (!Array.isArray(treeData) || treeData.length === 0) {
      return 0;
    }
    let maxLevel = 0;
    const isContent = (n: any) => !isMetadata(n);
    const walk = (node: any, level: number) => {
      if (!isContent(node)) {
        // Do not count or traverse through metadata
        return;
      }
      const isExpandedHere = expandedNodes.has(node.id);
      if (!isExpandedHere) {
        return;
      }
      const children = Array.isArray(node.children) ? node.children : [];
      if (children.length === 0) {
        return;
      }
      const nextLevel = level + 1;
      if (nextLevel > maxLevel) {
        maxLevel = nextLevel;
      }
      for (const child of children) {
        walk(child, nextLevel);
      }
    };
    for (const root of treeData as any[]) {
      walk(root, 0);
    }
    return maxLevel;
  }, [treeData, expandedNodes]);

  // Keep store's currentLevel in sync with visible graph structure
  useEffect(() => {
    const setLevel = useUIStore.getState().setCurrentLevel;
    const level = computeExpansionLevelFromTree();
    setLevel(level);
  }, [computeExpansionLevelFromTree]);

  // Utility function to check if a node has children in the graph (regardless of visibility)
  const _hasChildrenInGraph = useCallback(
    (nodeId: string): boolean => {
      return allLinks.some(
        (link) =>
          (typeof link.source === "string" ? link.source : link.source.id) ===
          nodeId
      );
    },
    [allLinks]
  );

  // Level-based expand functionality (wired to utility)
  const expandLevel = useCallback(async () => {
    // Manual action overrides initial depth automation
    markManualOverride();
    await expandLevelUtil({
      treeData,
      visibleNodeIds,
      expandedNodes,
      targetRootId: highlightedNodeId ?? focusedNodeId ?? null,
      setExpandedNodes,
      setIsExpanding,
      setIsBatchOperation,
      suppressNextFitRef,
      dataManagerRef,
      fitAll,
    });
  }, [
    treeData,
    visibleNodeIds,
    expandedNodes,
    setExpandedNodes,
    setIsExpanding,
    setIsBatchOperation,
    suppressNextFitRef,
    dataManagerRef,
    fitAll,
    highlightedNodeId,
    focusedNodeId,
    markManualOverride,
  ]);

  const collapseLevel = useCallback(() => {
    // Manual action overrides initial depth automation
    markManualOverride();
    collapseLevelUtil({
      allNodes,
      allLinks,
      visibleNodeIds,
      expandedNodes,
      svgRef,
      nodeElsRef,
      setIsCollapsing,
      suppressNextFitRef,
      isNodeExpandable,
      getDescendantsByDepth,
      getConnectedEdges,
      toggleNodeExpansion,
      fitAll,
      isMetadata,
    });
  }, [
    allNodes,
    allLinks,
    visibleNodeIds,
    expandedNodes,
    svgRef,
    nodeElsRef,
    setIsCollapsing,
    suppressNextFitRef,
    isNodeExpandable,
    getDescendantsByDepth,
    getConnectedEdges,
    toggleNodeExpansion,
    fitAll,
    markManualOverride,
  ]);

  // Stop functions for interrupting ongoing operations
  const stopExpansion = useCallback(() => {
    setIsExpanding(false);
    setIsBulkOperation(false);
    setIsBatchOperation(false);
    setExpansionProgress(null);

    if (simulationPaused) {
      resumeSimulation();
    }

    if (expansionCleanupRef.current) {
      expansionCleanupRef.current();
      expansionCleanupRef.current = null;
    }
  }, [setIsBulkOperation, simulationPaused, resumeSimulation]);

  const stopCollapsing = useCallback(() => {
    setIsCollapsing(false);
    setIsBulkOperation(false);
    setIsBatchOperation(false);

    if (simulationPaused) {
      resumeSimulation();
    }

    if (collapsingCleanupRef.current) {
      collapsingCleanupRef.current();
      collapsingCleanupRef.current = null;
    }
  }, [setIsBulkOperation, simulationPaused, resumeSimulation]);

  // Simplified level-based expand/collapse possibility checks
  // Removed canExpand/canCollapse computations; controls no longer consume them

  // Layout toggle (fit handled by layout effects to avoid double fits)
  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(layoutMode === "force" ? "hierarchical" : "force");
  }, [layoutMode]);

  // Global keyboard shortcuts handler
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore modifier combinations (don't block copy/paste, etc.)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      // Ignore when typing in inputs or contenteditable
      const t = event.target as HTMLElement | null;
      if (t) {
        const tagNameRaw = (t as unknown as { tagName?: string }).tagName;
        const tag =
          typeof tagNameRaw === "string" ? tagNameRaw.toLowerCase() : "";
        const isEditable =
          t.isContentEditable || !!t.closest?.('[contenteditable="true"]');
        if (
          isEditable ||
          tag === "input" ||
          tag === "textarea" ||
          tag === "select"
        ) {
          return;
        }
      }
      // Handle keyboard shortcuts (lowercase only)
      if (event.key === "0") {
        const ae = document.activeElement as HTMLElement | null;
        if (ae && containerRef.current && containerRef.current.contains(ae)) {
          ae.blur();
        }
        event.preventDefault();
        fitAll();
      } else if (
        (event.shiftKey && event.key.toLowerCase() === "f") ||
        event.key === "F"
      ) {
        const ae = document.activeElement as HTMLElement | null;
        if (ae && containerRef.current && containerRef.current.contains(ae)) {
          ae.blur();
        }
        if (!isFullscreenOpen) {
          event.preventDefault();
          setIsFullscreenOpen(true);
        }
      } else if (event.key === "l") {
        const ae = document.activeElement as HTMLElement | null;
        if (ae && containerRef.current && containerRef.current.contains(ae)) {
          ae.blur();
        }
        event.preventDefault();
        toggleLayoutMode();
      } else if (event.key === "e") {
        const ae = document.activeElement as HTMLElement | null;
        if (ae && containerRef.current && containerRef.current.contains(ae)) {
          ae.blur();
        }
        event.preventDefault();
        expandLevel();
      } else if (event.key === "c") {
        const ae = document.activeElement as HTMLElement | null;
        if (ae && containerRef.current && containerRef.current.contains(ae)) {
          ae.blur();
        }
        event.preventDefault();
        collapseLevel();
      }
    },
    [fitAll, expandLevel, collapseLevel, toggleLayoutMode]
  );

  // Set up global keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // When toggling fullscreen, re-fit once after portal mount so zoom/pan feel correct
  const didFullscreenInitialFitRef = useRef(false);
  useEffect(() => {
    if (isFullscreenOpen) {
      if (didFullscreenInitialFitRef.current) {
        return;
      }
      didFullscreenInitialFitRef.current = true;
      // Allow a fresh initial-fit and clear any suppression
      didInitialFitRef.current = false;
      suppressLayoutFitUntilRef.current = 0;
      const runFitOpen = () => {
        try {
          const ids = Array.from(visibleNodeIds);
          if (ids.length > 0) {
            resetZoomToFit(ids, 140, "fullscreen-open");
          } else {
            fitAll();
          }
        } catch {}
      };
      const rafId = window.requestAnimationFrame(runFitOpen);
      const t = window.setTimeout(runFitOpen, 300);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.clearTimeout(t);
      };
    }
    // On close: perform one fit to the smaller container, then clear the gate
    if (didFullscreenInitialFitRef.current) {
      didInitialFitRef.current = false;
      suppressLayoutFitUntilRef.current = 0;
      const runFitClose = () => {
        try {
          const ids = Array.from(visibleNodeIds);
          if (ids.length > 0) {
            resetZoomToFit(ids, 120, "fullscreen-close");
          } else {
            fitAll();
          }
        } catch {}
        didFullscreenInitialFitRef.current = false;
      };
      const rafId = window.requestAnimationFrame(runFitClose);
      const t = window.setTimeout(runFitClose, 200);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.clearTimeout(t);
      };
    }
  }, [isFullscreenOpen]);

  const showSidebar = withSidebar || isFullscreenOpen;
  const content = (
    <TooltipProvider>
      <div
        aria-hidden="true"
        className={`${getGraphContainerClasses(showSidebar)} ${className}`}
        ref={containerRef}
        role="presentation"
        tabIndex={-1}
      >
        {showSidebar && (
          <GraphTreeSidebar
            allLinks={allLinks}
            // Provide links so search can include metadata linked by edges
            allNodes={allNodes}
            expandedIds={graphExpandedToSidebarExpandedWithTree(
              expandedNodes,
              buildTreeIndex(treeData)
            )}
            highlightedNodeId={highlightedNodeId}
            mode={data || dataUrl ? "json" : "api"}
            onExpandedIdsChange={(expandedIds) => {
              // Build a quick children map from current tree data
              const childrenById = new Map<string, string[]>();
              const walk = (nodes: DataNode[]) => {
                for (const n of nodes) {
                  if (Array.isArray(n.children) && n.children.length > 0) {
                    childrenById.set(
                      n.id,
                      n.children.map((c: DataNode) => c.id)
                    );
                    walk(n.children);
                  } else {
                    childrenById.set(n.id, []);
                  }
                }
              };
              walk(treeData);

              const collectDescendants = (rootId: string): Set<string> => {
                const out = new Set<string>();
                const stack = [...(childrenById.get(rootId) || [])];
                while (stack.length > 0) {
                  const cur = stack.pop() as string;
                  if (out.has(cur)) {
                    continue;
                  }
                  out.add(cur);
                  const kids = childrenById.get(cur) || [];
                  for (const k of kids) {
                    stack.push(k);
                  }
                }
                return out;
              };

              const prev = new Set(expandedNodes);
              const next = new Set<string>(expandedIds);

              // Find which ids were collapsed/expanded in this action
              const collapsedNow: string[] = [];
              const expandedNow: string[] = [];
              for (const id of prev) {
                if (!next.has(id)) {
                  collapsedNow.push(id);
                }
              }
              for (const id of next) {
                if (!prev.has(id)) {
                  expandedNow.push(id);
                }
              }

              // Remove all open descendants of each collapsed parent
              for (const parentId of collapsedNow) {
                const desc = collectDescendants(parentId);
                for (const d of desc) {
                  if (next.has(d)) {
                    next.delete(d);
                  }
                }
              }

              // Add collapsed ids to temporary selection suppression to prevent
              // sidebar selection from highlighting the collapsed parent
              if (collapsedNow.length > 0) {
                for (const id of collapsedNow) {
                  suppressSidebarSelectRef.current.add(id);
                  window.setTimeout(() => {
                    suppressSidebarSelectRef.current.delete(id);
                  }, 300);
                }
              }

              // Apply sanitized expansion set
              const finalSet = mergeSidebarExpandedIntoGraph(
                expandedNodes,
                Array.from(next)
              );
              // Focus rules:
              // - On collapse: if the currently focused node is inside the collapsed subtree,
              //   clear focus (do NOT move focus to the parent)
              // - On expansion: do not set focus (sidebar selection should not force focus)
              if (collapsedNow.length > 0) {
                // Clear focus if focused node is inside the collapsed subtree
                if (focusedNodeId) {
                  const shouldClearFocus = (() => {
                    for (const parentId of collapsedNow) {
                      const desc = collectDescendants(parentId);
                      if (desc.has(focusedNodeId)) {
                        return true;
                      }
                    }
                    return false;
                  })();
                  if (shouldClearFocus) {
                    suppressFocusRef.current = true;
                    setFocusedNodeId(null);
                    window.setTimeout(() => {
                      suppressFocusRef.current = false;
                    }, 0);
                  }
                }
                // Clear highlight if highlighted node is inside the collapsed subtree
                if (highlightedNodeId) {
                  let shouldClearHighlight = false;
                  for (const parentId of collapsedNow) {
                    const desc = collectDescendants(parentId);
                    if (desc.has(highlightedNodeId)) {
                      shouldClearHighlight = true;
                      break;
                    }
                  }
                  if (shouldClearHighlight) {
                    setHighlightedNodeId(null);
                  }
                }
              }
              if (finalSet.size !== expandedNodes.size) {
                setExpandedNodes(finalSet);
                const delay = layoutMode === "force" ? 250 : 0;
                if (collapsedNow.length > 0) {
                  window.setTimeout(() => {
                    fitAll();
                  }, delay);
                } else if (expandedNow.length > 0) {
                  const targetId = expandedNow.at(-1) as string | undefined;
                  window.setTimeout(() => {
                    // Suppress layout-fit briefly so it doesn't override this subgraph fit
                    suppressLayoutFitUntilRef.current = Date.now() + 1500;
                    if (targetId) {
                      const ids = computeSubgraphIds([targetId]);
                      resetZoomToFit(Array.from(ids), 140, "sidebar-expand");
                    }
                  }, delay);
                }
                return;
              }
              for (const id of finalSet) {
                if (!expandedNodes.has(id)) {
                  setExpandedNodes(finalSet);
                  const delay = layoutMode === "force" ? 250 : 0;
                  if (collapsedNow.length > 0) {
                    window.setTimeout(() => {
                      fitAll();
                    }, delay);
                  } else if (expandedNow.length > 0) {
                    const targetId = expandedNow.at(-1) as string | undefined;
                    window.setTimeout(() => {
                      suppressLayoutFitUntilRef.current = Date.now() + 1500;
                      if (targetId) {
                        const ids = computeSubgraphIds([targetId]);
                        resetZoomToFit(Array.from(ids), 140, "sidebar-expand");
                      }
                    }, delay);
                  }
                  return;
                }
              }
            }}
            onFilterIdsChange={(ids) => {
              setFilteredIds(ids);
            }}
            setHighlightedNodeId={(id) => {
              if (id && suppressSidebarSelectRef.current.has(id)) {
                return;
              }
              setHighlightedNodeId(id);
            }}
            treeData={treeData}
          />
        )}

        <div className={getGraphContentClasses(showSidebar)}>
          <div className={getControlsContainerClasses()}>
            <GraphControls
              expansionProgress={expansionProgress}
              isCollapsing={isCollapsing}
              isExpanding={isExpanding}
              layoutMode={layoutMode}
              onCollapseLevel={collapseLevel}
              onExpandLevel={expandLevel}
              onFitAll={fitAll}
              onOpenFullscreen={
                disableFullscreenControl || isFullscreenOpen
                  ? undefined
                  : () => setIsFullscreenOpen(true)
              }
              onStopCollapsing={stopCollapsing}
              onStopExpansion={stopExpansion}
              onToggleLayoutMode={toggleLayoutMode}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
            />
          </div>

          {/* Zoom surface wrapping edges and nodes */}
          <div
            className={getSvgContainerClasses()}
            data-graph-element
            onClick={onBackgroundClick}
            ref={zoomSurfaceRef}
            role="presentation"
            tabIndex={-1}
          >
            {/* Edges underlay */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              ref={svgRef}
            >
              <g ref={edgesGroupRef} />
            </svg>

            {/* Node layer */}
            <div className={getNodeLayerClasses()} ref={htmlLayerRef}>
              {visibleNodes.map((n) => (
                <GraphNodeRenderer
                  canCollapseNode={canCollapseNode}
                  edges={edges}
                  filteredNodeIds={new Set<string>()}
                  getNodeTailwindClasses={getNodeTailwindClasses}
                  highlightedNodeId={highlightedNodeId}
                  isNodeExpandable={isNodeExpandable}
                  key={n.id}
                  layoutMode={layoutMode}
                  node={n}
                  nodeElsRef={nodeElsRef}
                  nodesById={nodesById}
                  onNodeClick={onNodeClick}
                  onNodeMouseEnter={onNodeMouseEnter}
                  onNodeMouseLeave={onNodeMouseLeave}
                  startDrag={startDrag}
                  transformRef={transformRef}
                  visibleNodeIds={visibleNodeIds}
                />
              ))}
            </div>
          </div>

          {!isInitialized && (
            <div className={getLoadingOverlayClasses()}>
              <Spinner size={32} />
            </div>
          )}

          {/* Debug pill for current expansion level (lower-right) */}
          <div className="pointer-events-none absolute right-4 bottom-4 z-20">
            <output
              aria-live="polite"
              className="pointer-events-auto rounded-full border border-border bg-background/80 px-3 py-1 text-muted-foreground text-xs shadow backdrop-blur"
            >
              Level: {currentExpansionLevel}
            </output>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
  if (isFullscreenOpen) {
    return (
      <Dialog onOpenChange={setIsFullscreenOpen} open={true}>
        <DialogContent
          className="p-0 outline-none outline-offset-0 focus:outline-none focus-visible:outline-none"
          style={{ width: "90vw", maxWidth: "90vw", height: "90vh" }}
        >
          <DialogTitle className="sr-only">Graph visualization</DialogTitle>
          {content}
        </DialogContent>
      </Dialog>
    );
  }
  return content;
}
