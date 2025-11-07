import { Badge } from "@recurse/ui/components/badge";
import { getNodeIcon } from "../config/icon-config";
import type { GraphLink, GraphNode } from "../utils/data/data-manager";
import { getTypeDisplayName } from "../utils/type-display";

// Generic tooltip layout component for consistent styling across the app
type GenericTooltipLayoutProps = {
  title?: string;
  type?: string;
  summary?: string;
  metadata?: string[];
  className?: string;
  showTypeBadge?: boolean;
  showIcon?: boolean;
};

export function GenericTooltipLayout({
  title,
  type,
  summary,
  metadata = [],
  className = "",
  showTypeBadge = true,
  showIcon = true,
}: GenericTooltipLayoutProps) {
  return (
    <div className={`py-2 ${className}`}>
      {(title || (type && showTypeBadge)) && (
        <div className="flex items-start justify-between">
          {/* Title */}
          {title && (
            <div className="pr-2">
              <div className="font-medium text-sm">{title}</div>
            </div>
          )}

          {/* Icon and badge container */}
          <div className="flex flex-col items-end gap-1">
            {/* Icon */}
            {showIcon && type && (
              <div className="h-4 w-4 flex-shrink-0">
                {getNodeIcon(type, { size: "h-4 w-4", strokeWidth: 2 }).icon}
              </div>
            )}

            {/* Type badge */}
            {type && showTypeBadge && (
              <Badge
                className="border border-border font-medium text-[8px] uppercase tracking-wider"
                variant="secondary"
              >
                {getTypeDisplayName(type)}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Summary text */}
      {summary && (
        <div className="my-4 pr-4 text-muted-foreground text-xs leading-tight">
          {summary.slice(0, 400)}
          {summary.length > 400 && "…"}
        </div>
      )}

      {/* Metadata tags at the bottom */}
      {metadata.length > 0 && (
        <div className="mt-3 border-border border-t pt-2">
          <div className="flex flex-wrap gap-1">
            {metadata.map((item: string, index: number) => (
              <Badge
                className="grow-0 border border-border bg-accent font-medium text-[8px] text-accent-foreground uppercase tracking-wider"
                key={`metadata-${index}-${item}`}
                variant="secondary"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type GraphTooltipLayoutProps = {
  nodeData: GraphNode;
  connectedMetadataTitles: string[];
  className?: string;
};

export function GraphTooltipLayout({
  nodeData,
  connectedMetadataTitles,
  className = "",
}: GraphTooltipLayoutProps) {
  return (
    <GenericTooltipLayout
      className={className}
      metadata={connectedMetadataTitles}
      showIcon={false}
      summary={nodeData.summary ?? undefined}
      title={nodeData.title || nodeData.id}
      type={nodeData.type}
    />
  );
}

// Helper function to check if a node is metadata
function isMetadataNode(node: GraphNode): boolean {
  const type = (node.type || "").toLowerCase();
  return (
    type === "tag" ||
    type === "hyponym" ||
    type === "hypernym" ||
    node.id.startsWith("tag:") ||
    node.id.startsWith("hyponym:") ||
    node.id.startsWith("hypernym:") ||
    node.id.startsWith("tag_") ||
    node.id.startsWith("hyponym_") ||
    node.id.startsWith("hypernym_")
  );
}

// Helper function to derive connected metadata nodes
export function deriveConnectedMetadataTitles(
  nodeData: GraphNode,
  nodesById: Map<string, GraphNode>,
  edges: GraphLink[]
): string[] {
  const result = new Set<string>();

  for (const e of edges) {
    if (!(e?.source && e.target)) {
      continue;
    }
    const sId =
      typeof e.source === "string"
        ? e.source
        : (e.source as { id?: string }).id;
    const tId =
      typeof e.target === "string"
        ? e.target
        : (e.target as { id?: string }).id;
    if (!(sId && tId)) {
      continue;
    }

    // Only consider edges that involve this node
    if (sId !== nodeData.id && tId !== nodeData.id) {
      continue;
    }

    const otherId = sId === nodeData.id ? tId : sId;
    if (!otherId || otherId === nodeData.id) {
      continue;
    }

    const other = nodesById.get(otherId);
    if (!other) {
      continue;
    }

    if (isMetadataNode(other)) {
      result.add(other.title || other.id);
    }
  }

  return Array.from(result);
}
