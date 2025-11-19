import type {
	Simulation,
	SimulationLinkDatum,
	SimulationNodeDatum,
} from "d3-force";
import type React from "react";
import { HierarchicalLayout } from "../utils/layout/tree-layout";

type Point = { x: number; y: number };

export function healLayout<
	T extends SimulationNodeDatum,
	L extends SimulationLinkDatum<T>,
>(
	deps: {
		simulationRef: React.MutableRefObject<Simulation<T, L> | null>;
	},
	layoutMode: "force" | "hierarchical",
): void {
	const { simulationRef } = deps;
	const sim = simulationRef.current;
	if (sim && layoutMode === "force") {
		sim.alpha(0.3).alphaTarget(0.1).restart();
		window.setTimeout(() => {
			if (simulationRef.current) {
				simulationRef.current.alphaTarget(0);
			}
		}, 1000);
	}
}

export function updateHierarchicalLayout(
	deps: {
		layoutRef: React.MutableRefObject<HierarchicalLayout | null>;
		positionsRef: React.MutableRefObject<Map<string, Point>>;
		scheduleRender: () => void;
	},
	visibleNodes: Array<{
		id: string;
		title: string;
		type: string;
		summary?: string | null;
	}>,
	visibleLinks: Array<{
		source: string | { id: string };
		target: string | { id: string };
	}>,
): void {
	const { layoutRef, positionsRef, scheduleRender } = deps;
	if (!layoutRef.current) {
		layoutRef.current = new HierarchicalLayout();
	}
	const layout = layoutRef.current;
	const nodes = visibleNodes.map((n) => ({
		id: n.id,
		title: n.title,
		type: n.type,
		summary: n.summary ?? undefined,
	}));
	const links = visibleLinks.map((l) => ({
		source: typeof l.source === "string" ? l.source : l.source.id,
		target: typeof l.target === "string" ? l.target : l.target.id,
	}));
	layout.updateData(nodes, links);
	const positions = layout.getNodePositions();
	const map = new Map<string, Point>();
	for (const p of positions) {
		map.set(p.id, { x: p.x, y: p.y });
	}
	positionsRef.current = map;
	scheduleRender();
}
