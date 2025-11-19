import { select } from "d3-selection";
import type React from "react";
import { bezierPath, orthogonalPath } from "../utils/layout/bezier";

export type RenderPoint = { x: number; y: number };

export type VisibleLink = {
	source: string | { id: string };
	target: string | { id: string };
};

export type RenderDeps = {
	svgRef: React.MutableRefObject<SVGSVGElement | null>;
	edgesGroupRef: React.MutableRefObject<SVGGElement | null>;
	nodeElsRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
	transformRef: React.MutableRefObject<{ x: number; y: number; k: number }>;
	positionsRef: React.MutableRefObject<Map<string, RenderPoint>>;
	collapsingChildIdsRef: React.MutableRefObject<Set<string>>;
	rafRef: React.MutableRefObject<number | null>;
	visibleLinks: VisibleLink[];
	layoutMode: "force" | "hierarchical";
	computeSeedPosition: (
		id: string,
		parentByChild: Map<string, string>,
	) => RenderPoint;
	buildParentMapFromLinks: () => Map<string, string>;
	computeEdgeStrokeWidth: (k: number) => number;
	getEdgeTailwindClass: () => string;
	computeNodeSize: (k: number) => number;
	computeNodeStyle: (args: {
		currentZoomLevel: number;
		state: "default";
		layout: "force" | "hierarchical";
		data: { id: string; title: string; type: string; summary: string };
	}) => { fontSize: number; borderWidth: number };
};

export function renderEdges(deps: RenderDeps): void {
	const {
		svgRef,
		edgesGroupRef,
		transformRef,
		positionsRef,
		visibleLinks,
		computeSeedPosition,
		buildParentMapFromLinks,
		computeEdgeStrokeWidth,
		getEdgeTailwindClass,
	} = deps;

	if (!(svgRef.current && edgesGroupRef.current)) {
		return;
	}

	const g = select(edgesGroupRef.current);
	const mappedData = visibleLinks.map((l) => {
		const s =
			typeof l.source === "string" ? l.source : (l.source as { id: string }).id;
		const t =
			typeof l.target === "string" ? l.target : (l.target as { id: string }).id;
		return { s, t };
	});

	// Defensive cleanup: remove any stale edge paths that no longer exist
	// according to the current visibleLinks key set. This avoids orphaned
	// edges after filter/collapse transitions.
	const currentKeySet = new Set(mappedData.map(({ s, t }) => `${s}->${t}`));
	g.selectAll<SVGPathElement, unknown>("path.edge").each(function onEach() {
		const key = this.getAttribute("data-edge") || "";
		if (!currentKeySet.has(key)) {
			this.remove();
		}
	});

	const parentMapForEdges = buildParentMapFromLinks();
	const edgeData = mappedData.map(({ s, t }) => {
		let a = positionsRef.current.get(s) as RenderPoint | undefined;
		let b = positionsRef.current.get(t) as RenderPoint | undefined;
		if (!a) {
			a = computeSeedPosition(s, parentMapForEdges);
			positionsRef.current.set(s, a);
		}
		if (!b) {
			b = computeSeedPosition(t, parentMapForEdges);
			positionsRef.current.set(t, b);
		}
		return { s, t, a: a as RenderPoint, b: b as RenderPoint };
	});

	const keyFn = (d: { s: string; t: string }) => `${d.s}->${d.t}`;
	const sel = g
		.selectAll<
			SVGPathElement,
			{ s: string; t: string; a: RenderPoint; b: RenderPoint }
		>("path.edge")
		.data(
			edgeData,
			keyFn as unknown as (d: {
				s: string;
				t: string;
				a: RenderPoint;
				b: RenderPoint;
			}) => string,
		);

	const k = transformRef.current.k || 1;
	const strokeWidth = computeEdgeStrokeWidth(k);
	const edgeClass = `edge ${getEdgeTailwindClass()}`;

	sel.exit().remove();
	sel
		.attr("d", (d) =>
			deps.layoutMode === "hierarchical"
				? orthogonalPath(d.a, d.b)
				: bezierPath(d.a, d.b),
		)
		.attr("class", edgeClass)
		.attr("stroke-width", strokeWidth)
		.attr("fill", "none")
		.attr("data-edge", (d) => `${d.s}->${d.t}`)
		.style("opacity", "1");

	sel
		.enter()
		.append("path")
		.attr("class", edgeClass)
		.attr("d", (d) =>
			deps.layoutMode === "hierarchical"
				? orthogonalPath(d.a, d.b)
				: bezierPath(d.a, d.b),
		)
		.attr("stroke-width", strokeWidth)
		.attr("fill", "none")
		.attr("data-edge", (d) => `${d.s}->${d.t}`)
		.style("opacity", "1");
}

export function renderNodePositions(deps: RenderDeps): void {
	const {
		nodeElsRef,
		positionsRef,
		transformRef,
		computeNodeSize,
		computeNodeStyle,
		layoutMode,
		collapsingChildIdsRef,
	} = deps;

	const collapsingChildren = collapsingChildIdsRef.current;
	const entries = Array.from(nodeElsRef.current.entries());
	entries.sort((a, b) => {
		if (a[0] < b[0]) {
			return -1;
		}
		if (a[0] > b[0]) {
			return 1;
		}
		return 0;
	});

	for (let idx = 0; idx < entries.length; idx++) {
		const [id, el] = entries[idx];
		if (collapsingChildren.has(id)) {
			continue;
		}

		const p = positionsRef.current.get(id);
		if (!p) {
			continue;
		}

		const k = transformRef.current.k || 1;
		const size = computeNodeSize(k);
		const newTransform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;

		if (el.style.transform !== newTransform) {
			const baseDelayMs = 15;
			const delayMs = baseDelayMs * (idx % 10);
			if (el.dataset.mounted) {
				el.style.transform = newTransform;
			} else {
				el.style.opacity = "0";
				el.style.transform = `${newTransform} scale(0.6)`;
				window.setTimeout(() => {
					window.requestAnimationFrame(() => {
						el.style.transition =
							"transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out";
						el.style.opacity = "1";
						el.style.transform = `${newTransform} scale(1)`;
						el.dataset.mounted = "1";
					});
				}, delayMs);
			}
		}

		el.style.width = `${size}px`;
		el.style.height = `${size}px`;
		el.style.padding = "0px";
		const style = computeNodeStyle({
			currentZoomLevel: k,
			state: "default",
			layout: layoutMode === "hierarchical" ? "hierarchical" : "force",
			data: { id, title: "", type: "", summary: "" },
		});
		el.style.borderWidth = `${style.borderWidth}px`;
		el.style.borderStyle = "solid";
		el.style.fontSize = `${style.fontSize}px`;
		el.style.borderRadius = "9999px";
		el.style.boxSizing = "border-box";
	}
}

export function scheduleRender(deps: RenderDeps): void {
	const { rafRef } = deps;
	if (rafRef.current !== null) {
		return;
	}
	rafRef.current = window.requestAnimationFrame((): void => {
		rafRef.current = null;
		renderEdges(deps);
		renderNodePositions(deps);
	});
}
