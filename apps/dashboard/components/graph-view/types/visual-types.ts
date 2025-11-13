export type NodeVisualState = "default" | "selected" | "dimmed" | "hovered";
export type NodeLayoutMode = "force" | "hierarchical";

export type NodeVisualData = {
	id: string;
	title: string;
	type: string;
	summary?: string | null | undefined;
};

export type NodeVisualProps = {
	state: NodeVisualState;
	currentZoomLevel: number;
	layout: NodeLayoutMode;
	data: NodeVisualData;
};
