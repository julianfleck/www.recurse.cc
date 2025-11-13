import type { JSX } from "react";
import { renderNodeIcon } from "../config/icon-config";
import type { NodeVisualProps } from "../types/visual-types";
import { computeNodeStyle } from "../utils/styling/node-styles";

// Re-export types for convenience
export type {
	NodeLayoutMode,
	NodeVisualData,
	NodeVisualProps,
	NodeVisualState,
} from "../types/visual-types";
// Re-export styling utilities from dedicated file
export {
	computeEdgeStrokeWidth,
	computeNodeSize,
	getEdgeTailwindClass,
} from "../utils/styling/node-styles";

export function NodeVisual({ data, currentZoomLevel, state }: NodeVisualProps) {
	const getNodeContent = (): string | JSX.Element | null => {
		const nodeType = (data.type || "").toLowerCase();

		// Use icons that fill the parent; size controlled by parent container
		return renderNodeIcon(nodeType);
	};

	const { borderWidth } = computeNodeStyle({
		currentZoomLevel,
		state: "default",
		layout: "force",
		data,
	});

	const content = getNodeContent();

	// Ring uses a single token color; background comes from container bg-* classes
	const ringColor = "var(--ring)";

	// Determine if this node should have the hover ring effect
	const shouldShowRing = state === "hovered" || state === "selected";
	const ringBoxShadow = shouldShowRing
		? `0 0 0 ${borderWidth}px ${ringColor}`
		: "none";

	return (
		<div
			className="flex h-full w-full cursor-crosshair items-center justify-center rounded-full border-0 bg-transparent p-[15%]"
			style={
				{
					transition: "box-shadow 0.2s ease",
					boxShadow: ringBoxShadow,
				} as React.CSSProperties
			}
		>
			{content}
		</div>
	);
}
