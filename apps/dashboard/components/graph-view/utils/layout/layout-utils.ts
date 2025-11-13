"use client";

// Utilities shared across graph components for layout-related sync

export type GraphNode = { id: string };
export type GraphEdge = { source: string; target: string };

export function findNodeToExpand(
	currentNodes: GraphNode[],
	currentEdges: GraphEdge[],
	expandedDocs: Set<string>,
): string | undefined {
	const currentNodeIds = new Set(currentNodes.map((n) => n.id));
	const expandedIds = Array.from(expandedDocs);
	return expandedIds.find((expandedId) => {
		const hasNode = currentNodeIds.has(expandedId);
		const hasChildren = currentEdges.some((edge) => edge.source === expandedId);
		return hasNode && !hasChildren;
	});
}

export function findNodeToCollapse(
	currentNodes: GraphNode[],
	currentEdges: GraphEdge[],
	expandedDocs: Set<string>,
): string | undefined {
	const currentNodeIds = new Set(currentNodes.map((n) => n.id));
	return Array.from(currentNodeIds).find((nodeId) => {
		const shouldBeExpanded = expandedDocs.has(nodeId);
		const hasChildren = currentEdges.some((edge) => edge.source === nodeId);
		return !shouldBeExpanded && hasChildren;
	});
}

export function collapseSubtree(
	currentNodes: GraphNode[],
	currentEdges: GraphEdge[],
	parentId: string,
): { remainingNodes: GraphNode[]; remainingEdges: GraphEdge[] } {
	const nodesToRemove = new Set<string>();
	const findDescendants = (pid: string) => {
		const directChildren = currentEdges
			.filter((edge) => edge.source === pid)
			.map((edge) => edge.target);
		for (const childId of directChildren) {
			if (!nodesToRemove.has(childId)) {
				nodesToRemove.add(childId);
				findDescendants(childId);
			}
		}
	};
	findDescendants(parentId);

	const remainingNodes = currentNodes.filter((n) => !nodesToRemove.has(n.id));
	const remainingEdges = currentEdges.filter(
		(e) => !(nodesToRemove.has(e.source) || nodesToRemove.has(e.target)),
	);
	return { remainingNodes, remainingEdges };
}

export function createStructureSignature(
	nodes: GraphNode[],
	edges: GraphEdge[],
	isHierarchical: boolean,
): string {
	const sigNodes = [...new Set(nodes.map((n) => n.id))].sort().join("|");
	const sigEdges = [...new Set(edges.map((e) => `${e.source}->${e.target}`))]
		.sort()
		.join("|");
	return `${sigNodes}__${sigEdges}__mode:${isHierarchical ? "h" : "f"}`;
}
