import type {
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import type { Selection } from "d3-selection";
import type { ZoomBehavior } from "d3-zoom";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
  GraphDataManager,
} from "../utils/data/data-manager";
import type { HierarchicalLayout } from "../utils/layout/tree-layout";
import type { Point } from "../utils/styling/viewport-utils";

export type GraphState = {
  // Refs
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
  zoomSurfaceRef: React.MutableRefObject<HTMLDivElement | null>;
  htmlLayerRef: React.MutableRefObject<HTMLDivElement | null>;
  edgesGroupRef: React.MutableRefObject<SVGGElement | null>;
  zoomBehaviorRef: React.MutableRefObject<ZoomBehavior<
    Element,
    unknown
  > | null>;
  selectionRef: React.MutableRefObject<Selection<
    Element,
    unknown,
    null,
    undefined
  > | null>;
  transformRef: React.MutableRefObject<{ x: number; y: number; k: number }>;
  simulationRef: React.MutableRefObject<Simulation<
    SimulationNodeDatum & { x?: number; y?: number; fx?: number; fy?: number },
    SimulationLinkDatum<SimulationNodeDatum & { x?: number; y?: number; fx?: number; fy?: number }> & { source: string; target: string }
  > | null>;
  positionsRef: React.MutableRefObject<Map<string, Point>>;
  rafRef: React.MutableRefObject<number | null>;
  layoutRef: React.MutableRefObject<HierarchicalLayout | null>;
  nodeElsRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
  isDraggingRef: React.MutableRefObject<boolean>;
  dragEndedRef: React.MutableRefObject<boolean>;
  suppressNextFitRef: React.MutableRefObject<boolean>;
  hoverHideTimeoutRef: React.MutableRefObject<number | null>;
  isZoomingRef: React.MutableRefObject<boolean>;
  _prevExpandedNodesRef: React.MutableRefObject<Set<string>>;
  localCollapseGuardRef: React.MutableRefObject<Set<string>>;
  edgesToFadeRef: React.MutableRefObject<Set<string>>;
  collapsingChildIdsRef: React.MutableRefObject<Set<string>>;
  isAnimatingCollapseRef: React.MutableRefObject<boolean>;
  collapsingNodesRef: React.MutableRefObject<
    Map<string, { children: string[]; startTime: number }>
  >;
  dataManagerRef: React.MutableRefObject<GraphDataManager | null>;
  expansionCleanupRef: React.MutableRefObject<(() => void) | null>;
  collapsingCleanupRef: React.MutableRefObject<(() => void) | null>;
  suppressFocusRef: React.MutableRefObject<boolean>;
  suppressSidebarSelectRef: React.MutableRefObject<Set<string>>;
  layoutTransitionRef: React.MutableRefObject<"force" | "hierarchical" | null>;
  _layoutFitTimerRef: React.MutableRefObject<number | null>;
  suppressLayoutFitUntilRef: React.MutableRefObject<number>;
  didInitialFitRef: React.MutableRefObject<boolean>;
  lastFocusedAppliedRef: React.MutableRefObject<string | null>;

  // State
  isInitialized: boolean;
  setIsInitialized: Dispatch<SetStateAction<boolean>>;
  isExpanding: boolean;
  setIsExpanding: Dispatch<SetStateAction<boolean>>;
  isCollapsing: boolean;
  setIsCollapsing: Dispatch<SetStateAction<boolean>>;
  expansionProgress: { current: number; total: number } | null;
  setExpansionProgress: Dispatch<SetStateAction<{ current: number; total: number } | null>>;
  isBatchOperation: boolean;
  setIsBatchOperation: Dispatch<SetStateAction<boolean>>;
  simulationPaused: boolean;
  setSimulationPaused: Dispatch<SetStateAction<boolean>>;
  nodesById: Map<string, DataNode>;
  setNodesById: Dispatch<SetStateAction<Map<string, DataNode>>>;
  edges: DataLink[];
  setEdges: Dispatch<SetStateAction<DataLink[]>>;
  expandedNodes: Set<string>;
  setExpandedNodes: Dispatch<SetStateAction<Set<string>>>;
  highlightedNodeId: string | null;
  setHighlightedNodeId: Dispatch<SetStateAction<string | null>>;
  focusedNodeId: string | null;
  setFocusedNodeId: Dispatch<SetStateAction<string | null>>;
  filteredNodeIds: Set<string> | null;
  setFilteredNodeIds: Dispatch<SetStateAction<Set<string> | null>>;
  highlightSource: "graph" | "sidepanel" | null;
  setHighlightSource: Dispatch<SetStateAction<"graph" | "sidepanel" | null>>;
  layoutMode: "force" | "hierarchical";
  setLayoutMode: Dispatch<SetStateAction<"force" | "hierarchical">>;
};

export function useGraphState(): GraphState {
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomSurfaceRef = useRef<HTMLDivElement>(null);
  const htmlLayerRef = useRef<HTMLDivElement>(null);
  const edgesGroupRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<Element, unknown> | null>(null);
  const selectionRef = useRef<Selection<
    Element,
    unknown,
    null,
    undefined
  > | null>(null);
  const transformRef = useRef<{ x: number; y: number; k: number }>({
    x: 0,
    y: 0,
    k: 1,
  });
  const simulationRef = useRef<Simulation<
    SimulationNodeDatum & { x?: number; y?: number; fx?: number; fy?: number },
    SimulationLinkDatum<SimulationNodeDatum & { x?: number; y?: number; fx?: number; fy?: number }> & { source: string; target: string }
  > | null>(null);
  const positionsRef = useRef<Map<string, Point>>(new Map());
  const rafRef = useRef<number | null>(null);
  const layoutRef = useRef<HierarchicalLayout | null>(null);
  const nodeElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isDraggingRef = useRef<boolean>(false);
  const dragEndedRef = useRef<boolean>(false);
  const suppressNextFitRef = useRef<boolean>(false);
  const hoverHideTimeoutRef = useRef<number | null>(null);
  const isZoomingRef = useRef<boolean>(false);
  const _prevExpandedNodesRef = useRef<Set<string>>(new Set());
  const localCollapseGuardRef = useRef<Set<string>>(new Set());
  const edgesToFadeRef = useRef<Set<string>>(new Set());
  const collapsingChildIdsRef = useRef<Set<string>>(new Set());
  const isAnimatingCollapseRef = useRef<boolean>(false);
  const collapsingNodesRef = useRef<
    Map<string, { children: string[]; startTime: number }>
  >(new Map());
  const dataManagerRef = useRef<GraphDataManager | null>(null);
  const expansionCleanupRef = useRef<(() => void) | null>(null);
  const collapsingCleanupRef = useRef<(() => void) | null>(null);
  const suppressFocusRef = useRef<boolean>(false);
  const suppressSidebarSelectRef = useRef<Set<string>>(new Set());
  const layoutTransitionRef = useRef<"force" | "hierarchical" | null>(null);
  const _layoutFitTimerRef = useRef<number | null>(null);
  const suppressLayoutFitUntilRef = useRef<number>(0);
  const didInitialFitRef = useRef<boolean>(false);
  const lastFocusedAppliedRef = useRef<string | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [expansionProgress, setExpansionProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [isBatchOperation, setIsBatchOperation] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [nodesById, setNodesById] = useState<Map<string, DataNode>>(new Map());
  const [edges, setEdges] = useState<DataLink[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null
  );
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [filteredNodeIds, setFilteredNodeIds] = useState<Set<string> | null>(
    null
  );
  const [highlightSource, setHighlightSource] = useState<
    "graph" | "sidepanel" | null
  >(null);
  const [layoutMode, setLayoutMode] = useState<"force" | "hierarchical">(
    "force"
  );

  return {
    // Refs
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

    // State
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
    filteredNodeIds,
    setFilteredNodeIds,
    highlightSource,
    setHighlightSource,
    layoutMode,
    setLayoutMode,
  };
}
