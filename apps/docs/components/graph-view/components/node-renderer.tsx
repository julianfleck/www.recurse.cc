"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@recurse/ui/components/tooltip";
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from "../utils/data/data-manager";
import { getNodeCursorClass } from "../utils/styling/node-styles";
import {
  deriveConnectedMetadataTitles,
  GraphTooltipLayout,
} from "./node-tooltip";
import { NodeVisual } from "./node-visual";

export type NodeLayoutMode = "force" | "hierarchical";
export type NodeVisualState = "default" | "selected" | "hovered" | "dimmed";

type GraphNodeRendererProps = {
  node: DataNode;
  nodesById: Map<string, DataNode>;
  edges: DataLink[];
  highlightedNodeId?: string;
  transformRef: React.MutableRefObject<{ x: number; y: number; k: number }>;
  layoutMode: "force" | "hierarchical";
  nodeElsRef: React.MutableRefObject<Map<string, HTMLElement>>;
  filteredNodeIds?: Set<string>;
  visibleNodeIds: Set<string>;
  canCollapseNode: (nodeId: string) => boolean;
  isNodeExpandable: (type: string) => boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  startDrag: (nodeId: string, event: React.PointerEvent<HTMLElement>) => void;
  getNodeTailwindClasses: (props: {
    id: string;
    title: string;
    type: string;
    summary?: string | null;
  }) => string;
};

export function GraphNodeRenderer({
  node: n,
  nodesById,
  edges,
  highlightedNodeId,
  transformRef,
  layoutMode,
  nodeElsRef,
  filteredNodeIds,
  visibleNodeIds,
  canCollapseNode,
  isNodeExpandable,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  startDrag,
  getNodeTailwindClasses,
}: GraphNodeRendererProps) {
  // Calculate node state
  const isDimmed =
    filteredNodeIds && filteredNodeIds.size > 0 && !visibleNodeIds.has(n.id);
  const isSelected = highlightedNodeId === n.id;
  let nodeState: NodeVisualState = "default";
  if (isSelected) {
    nodeState = "selected";
  } else if (highlightedNodeId === n.id) {
    nodeState = "hovered";
  } else if (isDimmed) {
    nodeState = "dimmed";
  }

  // Check if node has highlighted flag in metadata (for knowledge base connections)
  const nodeWithMetadata = n as typeof n & { metadata?: { highlighted?: boolean } };
  const isHighlighted = nodeWithMetadata.metadata?.highlighted === true;

  const layoutModeProp: NodeLayoutMode =
    layoutMode === "hierarchical" ? "hierarchical" : "force";
  const zoomLevel = transformRef.current.k || 1;

  // Create tooltip content for this node
  const connectedMetadataTitles = deriveConnectedMetadataTitles(
    n,
    nodesById,
    edges
  );

  // Calculate cursor style
  const cursorClass = getNodeCursorClass(
    canCollapseNode,
    isNodeExpandable,
    n.id,
    n.type
  );

  return (
    <TooltipProvider delayDuration={300} key={n.id}>
      <Tooltip open={highlightedNodeId === n.id}>
        <TooltipTrigger asChild>
          <div
            className={`absolute select-none ${getNodeTailwindClasses({
              id: n.id,
              title: n.title,
              type: n.type,
              summary: n.summary,
            })} ${isDimmed ? "opacity-30" : "opacity-100"}`}
            data-node-id={n.id}
            ref={(el) => {
              if (el) {
                nodeElsRef.current.set(n.id, el);
              } else {
                nodeElsRef.current.delete(n.id);
              }
            }}
            style={{}}
          >
            <button
              aria-label={n.title}
              className={`block h-full w-full origin-center transition-transform duration-200 ${cursorClass}`}
              onBlur={onNodeMouseLeave}
              onClick={() => onNodeClick(n.id)}
              onFocus={() => onNodeMouseEnter(n.id)}
              onMouseEnter={() => onNodeMouseEnter(n.id)}
              onMouseLeave={onNodeMouseLeave}
              onPointerDown={(e) => {
                // Allow dragging for all nodes, including metadata
                startDrag(n.id, e);
              }}
              type="button"
            >
              <NodeVisual
                currentZoomLevel={zoomLevel}
                data={{
                  id: n.id,
                  title: n.title,
                  type: n.type,
                  summary: n.summary,
                }}
                isHighlighted={isHighlighted}
                layout={layoutModeProp}
                state={nodeState}
              />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          avoidCollisions={true}
          className="max-h-[400px] max-w-xs overflow-auto whitespace-pre-wrap break-words border border-border"
          collisionPadding={8}
          sideOffset={8}
        >
          <GraphTooltipLayout
            connectedMetadataTitles={connectedMetadataTitles}
            nodeData={n}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
