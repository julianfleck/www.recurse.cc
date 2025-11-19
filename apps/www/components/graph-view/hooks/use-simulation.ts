import {
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	type Simulation,
} from "d3-force";
import type React from "react";

export type SimPoint = { x: number; y: number };

export type SimNode = {
	id: string;
	title: string;
	type: string;
	summary: string | null;
	x?: number;
	y?: number;
	fx?: number;
	fy?: number;
};

export type SimLink = { source: string; target: string };

export type SimulationDeps = {
	positionsRef: React.MutableRefObject<Map<string, SimPoint>>;
	simulationRef: React.MutableRefObject<Simulation<SimNode, SimLink> | null>;
	scheduleRender: () => void;
};

export function buildSimData(
	nodesIn: Array<{
		id: string;
		title: string;
		type: string;
		summary: string | null;
	}>,
	linksIn: Array<{
		source: string | { id: string };
		target: string | { id: string };
	}>,
): { nodes: SimNode[]; links: SimLink[] } {
	const nodes: SimNode[] = nodesIn.map((n) => ({
		id: n.id,
		title: n.title,
		type: n.type,
		summary: n.summary ?? null,
	}));
	const links: SimLink[] = linksIn.map((l) => ({
		source: typeof l.source === "string" ? l.source : l.source.id,
		target: typeof l.target === "string" ? l.target : l.target.id,
	}));
	return { nodes, links };
}

export function createForceSimulation(
	deps: SimulationDeps,
	nodes: SimNode[],
	links: SimLink[],
	currentK: number,
): Simulation<SimNode, SimLink> {
	const simulation = forceSimulation(nodes)
		.force(
			"link",
			forceLink<SimNode, SimLink>(links)
				.id((d) => d.id)
				.distance(calculateDynamicLinkDistance(currentK)),
		)
		.force("charge", forceManyBody().strength(-300))
		.force("collide", forceCollide().radius(30))
		.force("center", forceCenter(0, 0));

	simulation.on("tick", () => {
		for (const n of nodes) {
			if (typeof n.x === "number" && typeof n.y === "number") {
				deps.positionsRef.current.set(n.id, { x: n.x, y: n.y });
			}
		}
		deps.scheduleRender();
	});

	simulation.alpha(0.3).restart();
	return simulation;
}

export function calculateDynamicLinkDistance(k: number): number {
	const base = 90;
	const kClamped = Math.max(0.1, Math.min(3, k));
	const width = 0.85;
	const outFactor = 0.45;
	const outExponent = 1.1;
	const inFactor = 0.06;
	const m = Math.abs(kClamped - 1);
	const u = 1 - Math.exp(-((m / width) ** 2));
	let delta = 0;
	if (kClamped < 1) {
		const growth = (1 / kClamped) ** outExponent - 1;
		delta = outFactor * u * growth;
	} else if (kClamped > 1) {
		delta = -inFactor * u;
	}
	const scale = 1 + delta;
	const raw = base * scale;
	const min = 30;
	const max = 900;
	return Math.max(min, Math.min(max, raw));
}
