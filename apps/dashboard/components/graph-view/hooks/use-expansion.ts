import type React from "react";
import type {
	GraphLink as DataLink,
	GraphNode as DataNode,
	GraphDataManager,
} from "../utils/data/data-manager";

export type ExpansionDeps = {
	// Graph structure/state
	visibleNodeIds: Set<string>;
	expandedNodes: Set<string>;
	// Tree data for determining expansion levels
	treeData: DataNode[];
	// Optional: when provided, expand only this root (if it is a root)
	targetRootId?: string | null;
	// State setters/refs
	setExpandedNodes: (next: Set<string>) => void;
	setIsExpanding: (value: boolean) => void;
	setIsBatchOperation: (value: boolean) => void;
	suppressNextFitRef: React.MutableRefObject<boolean>;
	dataManagerRef: React.MutableRefObject<GraphDataManager | null>;
	// Utilities
	fitAll: () => void;
};

export type CollapseDeps = {
	// Graph structure/state
	allNodes: DataNode[];
	allLinks: DataLink[];
	visibleNodeIds: Set<string>;
	expandedNodes: Set<string>;
	// DOM/refs
	svgRef: React.MutableRefObject<SVGSVGElement | null>;
	nodeElsRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
	// State setters/refs
	setIsCollapsing: (value: boolean) => void;
	suppressNextFitRef: React.MutableRefObject<boolean>;
	// Utilities
	isNodeExpandable: (type: string) => boolean;
	getDescendantsByDepth: (
		rootId: string,
	) => Array<{ id: string; depth: number }>;
	getConnectedEdges: (
		nodeIds: string[],
	) => Array<{ source: string; target: string }>;
	toggleNodeExpansion: (nodeId: string) => void;
	fitAll: () => void;
	isMetadata: (nodeId: string) => boolean;
};

export async function expandLevel(deps: ExpansionDeps): Promise<void> {
	const {
		treeData,
		visibleNodeIds,
		expandedNodes,
		targetRootId,
		setExpandedNodes,
		setIsExpanding,
		setIsBatchOperation,
		suppressNextFitRef,
		dataManagerRef,
		fitAll,
	} = deps;

	setIsExpanding(true);
	suppressNextFitRef.current = true;

	// Build child map and root list from treeData
	const childMap = new Map<string, string[]>();
	const rootIds: string[] = [];
	const walkTree = (
		nodes: Array<DataNode & { children?: DataNode[] }>,
		parentId?: string,
	) => {
		for (const n of nodes) {
			const id = n.id as string;
			if (parentId) {
				const arr = childMap.get(parentId) || [];
				arr.push(id);
				childMap.set(parentId, arr);
			} else {
				rootIds.push(id);
			}
			if (Array.isArray(n.children) && n.children.length > 0) {
				walkTree(n.children, id);
			}
		}
	};
	walkTree(treeData);

	// Filter visible roots
	const roots = rootIds.filter((id) => visibleNodeIds.has(id));

	// If a target root is provided and is a visible root, expand only that root
	if (targetRootId && roots.includes(targetRootId)) {
		// Fetch children if needed
		if (
			dataManagerRef.current &&
			!dataManagerRef.current.hasFetched(targetRootId)
		) {
			setIsBatchOperation(true);
			try {
				await (dataManagerRef.current
					? dataManagerRef.current.fetchChildren(targetRootId)
					: Promise.resolve(null));
			} finally {
				setIsBatchOperation(false);
			}
		}

		const next = new Set(expandedNodes);
		next.add(targetRootId);
		setExpandedNodes(next);

		setIsExpanding(false);
		window.setTimeout(() => {
			fitAll();
			window.setTimeout(() => {
				suppressNextFitRef.current = false;
			}, 600);
		}, 300);
		return;
	}
	// BFS to compute minimal depth
	const depth = new Map<string, number>();
	const queue: string[] = [...roots];
	for (const r of roots) {
		depth.set(r, 0);
	}
	while (queue.length > 0) {
		const cur = queue.shift() as string;
		const d = depth.get(cur) ?? 0;
		const children = childMap.get(cur) || [];
		for (const c of children) {
			if (!depth.has(c)) {
				depth.set(c, d + 1);
				queue.push(c);
			}
		}
	}

	// Find frontier: shallowest nodes with children that are not yet expanded
	let minD = Number.POSITIVE_INFINITY;
	const frontier: string[] = [];
	for (const [id, d] of depth.entries()) {
		if (!visibleNodeIds.has(id)) {
			continue;
		}
		if (expandedNodes.has(id)) {
			continue;
		}
		const children = childMap.get(id) || [];
		if (children.length === 0) {
			continue;
		}
		if (d < minD) {
			minD = d;
			frontier.length = 0;
			frontier.push(id);
		} else if (d === minD) {
			frontier.push(id);
		}
	}

	if (frontier.length === 0) {
		setIsExpanding(false);
		return;
	}

	// Fetch children for nodes that need it
	const nodesToFetch: string[] = [];
	for (const nodeId of frontier) {
		if (dataManagerRef.current && !dataManagerRef.current.hasFetched(nodeId)) {
			nodesToFetch.push(nodeId);
		}
	}
	if (nodesToFetch.length > 0) {
		setIsBatchOperation(true);
		try {
			await Promise.all(
				nodesToFetch.map((nodeId) =>
					dataManagerRef.current
						? dataManagerRef.current.fetchChildren(nodeId)
						: Promise.resolve(null),
				),
			);
		} finally {
			setIsBatchOperation(false);
		}
	}

	// Apply expansion
	if (frontier.length > 0) {
		const next = new Set(expandedNodes);
		for (const nodeId of frontier) {
			next.add(nodeId);
		}
		setExpandedNodes(next);
	}

	setIsExpanding(false);

	// Fit to screen after expansion
	window.setTimeout(() => {
		fitAll();
		window.setTimeout(() => {
			suppressNextFitRef.current = false;
		}, 600);
	}, 300);
}

export function collapseLevel(deps: CollapseDeps): void {
	const {
		allNodes,
		allLinks,
		visibleNodeIds,
		expandedNodes,
		svgRef,
		nodeElsRef,
		setIsCollapsing,
		suppressNextFitRef,
		isNodeExpandable,
		getDescendantsByDepth,
		getConnectedEdges,
		toggleNodeExpansion,
		fitAll,
		isMetadata,
	} = deps;

	setIsCollapsing(true);
	suppressNextFitRef.current = true;

	// Determine the deepest expanded nodes among visible nodes
	const deepestNodes: string[] = [];
	for (const node of allNodes) {
		if (!(visibleNodeIds.has(node.id) && expandedNodes.has(node.id))) {
			continue;
		}
		// Check if this node has expanded children
		const children = ((): string[] => {
			const out: string[] = [];
			for (const link of allLinks) {
				const sourceId =
					typeof link.source === "string" ? link.source : link.source.id;
				if (sourceId === node.id) {
					out.push(
						typeof link.target === "string" ? link.target : link.target.id,
					);
				}
			}
			return out;
		})();
		const hasExpandedChildren = children.some(
			(childId) => visibleNodeIds.has(childId) && expandedNodes.has(childId),
		);
		if (!hasExpandedChildren && isNodeExpandable(node.type)) {
			deepestNodes.push(node.id);
		}
	}

	if (deepestNodes.length === 0) {
		setIsCollapsing(false);
		return;
	}

	const baseDelayMs = 15;
	const fadeDurationMs = 180;

	const collapseOne = (nodeId: string) => {
		const descendants = getDescendantsByDepth(nodeId);
		const descendantIds = descendants.map((d) => d.id);

		// Determine edges to remove immediately:
		// - internal edges inside descendants
		// - edges from a descendant to non-shared metadata
		const isSharedMetadata = (metaId: string): boolean => {
			if (!isMetadata(metaId)) {
				return false;
			}
			let contentConnections = 0;
			for (const L of allLinks) {
				const ss = typeof L.source === "string" ? L.source : L.source.id;
				const tt = typeof L.target === "string" ? L.target : L.target.id;
				if (ss === metaId && !isMetadata(tt)) {
					contentConnections++;
				}
				if (tt === metaId && !isMetadata(ss)) {
					contentConnections++;
				}
				if (contentConnections > 1) {
					return true;
				}
			}
			return false;
		};

		const rawEdges = getConnectedEdges(descendantIds);
		const edgesToRemove = rawEdges.filter((e) => {
			const inDescS = descendantIds.includes(e.source);
			const inDescT = descendantIds.includes(e.target);
			if (inDescS && inDescT) {
				return true; // internal
			}
			let otherId: string | null = null;
			if (inDescS) {
				otherId = e.target;
			} else if (inDescT) {
				otherId = e.source;
			}
			if (!otherId) {
				return false;
			}
			if (isMetadata(otherId)) {
				return !isSharedMetadata(otherId);
			}
			return false;
		});

		const svgElement = svgRef.current;
		if (svgElement) {
			for (const e of edgesToRemove) {
				const edgeKey = `${e.source}->${e.target}`;
				const pathElement = svgElement.querySelector(
					`path[data-edge="${edgeKey}"]`,
				) as SVGPathElement | null;
				if (pathElement) {
					pathElement.remove();
				}
			}
		}

		// Staggered node fade-out (descendants only)
		const entries = descendantIds
			.map((id) => [id, nodeElsRef.current.get(id)] as const)
			.filter(([, el]) => Boolean(el)) as [string, HTMLDivElement][];
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
			const [, el] = entries[idx];
			const delayMs = baseDelayMs * (idx % 10);
			window.setTimeout(() => {
				el.style.transition = `opacity ${fadeDurationMs}ms ease-out`;
				el.style.opacity = "0";
			}, delayMs);
		}

		const totalWait =
			baseDelayMs * (Math.min(entries.length, 10) - 1) + fadeDurationMs + 10;
		window.setTimeout(() => {
			toggleNodeExpansion(nodeId);
		}, totalWait);
	};

	for (const nodeId of deepestNodes) {
		collapseOne(nodeId);
	}

	window.setTimeout(() => {
		setIsCollapsing(false);
		fitAll();
		window.setTimeout(() => {
			suppressNextFitRef.current = false;
		}, 600);
	}, 350);
}
