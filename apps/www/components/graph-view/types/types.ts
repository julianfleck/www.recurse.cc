import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export interface GraphNode extends SimulationNodeDatum {
	id: string;
	title: string;
	type: string;
	summary?: string | null;
	created_at?: string;
	updated_at?: string;
	index?: number;
	hasChildren?: boolean;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
	source: string | GraphNode;
	target: string | GraphNode;
}

export type GraphState = {
	nodes: GraphNode[];
	links: GraphLink[];
	expandedChildren: Map<string, Set<string>>;
	fetchedNodes: Set<string>;
	collapsingNodes: Set<string>;
	hoveredNodeId: string | null;
};

export type AnimationState = {
	isAnimating: boolean;
	currentTarget: string | null;
};

export type GraphConfig = {
	baseDistance: number;
	zoomScaleExtent: [number, number];
	collapseThreshold: number;
	expandThreshold: number;
	animationDuration: number;
};
