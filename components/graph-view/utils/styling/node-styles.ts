import { getVisualForLabel } from "../../config/visual-config";
import type {
  NodeLayoutMode,
  NodeVisualData,
  NodeVisualState,
} from "../types/visual-types";

// Node styling utilities
export function computeEdgeStrokeWidth(currentZoomLevel: number): number {
  const k = Math.max(0.001, currentZoomLevel);
  return Math.max(1, Math.round(1 / k));
}

export function getEdgeTailwindClass(): string {
  // Use border color token for edge stroke via arbitrary value
  return "stroke-[var(--border)]";
}

export function computeNodeSize(currentZoomLevel: number): number {
  const k = Math.max(0.001, currentZoomLevel);
  return Math.max(10, Math.round(24 / k));
}

export function computeNodeStyle(args: {
  currentZoomLevel: number;
  state: NodeVisualState;
  layout: NodeLayoutMode;
  data: NodeVisualData;
}): {
  borderWidth: number;
  fontSize: number;
} {
  const { currentZoomLevel } = args;
  const k = Math.max(0.001, currentZoomLevel);
  const borderWidth = Math.max(1, Math.round(2 / k));
  const fontSize = Math.max(8, Math.round(12 / k));
  return { borderWidth, fontSize };
}

export function getNodeTailwindClasses(data: NodeVisualData): string {
  const base = "border-foreground/20";
  const spec = getVisualForLabel(data.type || "");
  const colorClass = spec?.colorClass ?? "bg-card";
  return `${base} ${colorClass}`;
}

// Graph container styling
export function getGraphContainerClasses(withSidebar: boolean): string {
  return `relative h-full w-full overflow-hidden ${withSidebar ? "flex" : ""}`;
}

export function getGraphContentClasses(withSidebar: boolean): string {
  return `relative ${withSidebar ? "flex-1" : "h-full w-full"}`;
}

export function getControlsContainerClasses(): string {
  return "flex w-full justify-between pt-8 pr-6 pb-2 pl-6";
}

export function getSvgContainerClasses(): string {
  return "absolute inset-0 overflow-hidden";
}

export function getNodeLayerClasses(): string {
  return "absolute inset-0 origin-top-left will-change-transform";
}

export function getLoadingOverlayClasses(): string {
  return "absolute inset-0 flex items-center justify-center";
}

export function getLoadingContentClasses(): string {
  return "text-center";
}

export function getLoadingTitleClasses(): string {
  return "font-semibold text-foreground text-lg";
}

export function getLoadingSubtitleClasses(): string {
  return "text-muted-foreground text-sm";
}

// Cursor styling based on node interaction state
export function getNodeCursorClass(
  canCollapseNode: (nodeId: string) => boolean,
  isNodeExpandable: (type: string) => boolean,
  nodeId: string,
  nodeTypeInput: string
): string {
  if (canCollapseNode(nodeId)) {
    return "cursor-grab";
  }
  if (isNodeExpandable(nodeTypeInput)) {
    return "cursor-crosshair";
  }
  return "cursor-default";
}
