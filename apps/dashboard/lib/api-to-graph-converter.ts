/**
 * Converts API response formats to the graph view format with proper
 * deep nesting of children and explicit links.
 *
 * The graph view expects:
 * - `nodes`: Array of root nodes with recursively nested `children`
 * - `links`: Array of explicit { source, target } edges between all related nodes
 *
 * API formats handled:
 * 1. `/documents` endpoint: { documents: [...] } - documents with nested children
 * 2. `/search` endpoint: { nodes: [...] } - nodes with nested children
 */

export type GraphViewNode = {
	id: string;
	title: string;
	type: string;
	summary?: string | null;
	index?: number;
	score?: number;
	parent_id?: string | null;
	created_at?: string;
	updated_at?: string;
	metadata?: {
		tags?: string[];
		hypernyms?: string[];
		hyponyms?: string[];
	};
	children?: GraphViewNode[];
};

export type GraphViewLink = {
	source: string;
	target: string;
};

export type GraphViewData = {
	nodes: GraphViewNode[];
	links: GraphViewLink[];
};

// API response types - matches current backend format
type ApiNode = {
	id: string;
	title?: string | null;
	summary?: string | null;
	type?: string;
	index?: number | null;
	score?: number;
	parent_id?: string | null;
	url?: string | string[];
	created_at?: string;
	updated_at?: string;
	added_at?: string;
	metadata?: {
		tags?: string[];
		hypernyms?: string[];
		hyponyms?: string[];
	};
	// Legacy/alternative locations for metadata
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
	gist?: string;
	collection?: string | null;
	// Nested children (recursive structure)
	children?: ApiNode[];
};

type DocumentsApiResponse = {
	documents?: ApiNode[];
	nodes?: ApiNode[];
	total_found?: number;
	returned_count?: number;
	search_time_ms?: number;
	filters_applied?: string[];
	cutoff_applied?: string;
	pagination?: {
		page: number;
		limit: number;
		total_count: number;
		total_pages: number;
		has_next: boolean;
		has_previous: boolean;
	};
	metadata?: {
		filters?: Record<string, unknown>;
		total_tags?: number;
		total_hyponyms?: number;
		total_hypernyms?: number;
		tags?: string[];
		hyponyms?: string[];
		hypernyms?: string[];
	};
};

/**
 * Helper to extract and normalize metadata arrays from an API node.
 * Looks in both direct properties and nested metadata object.
 */
function extractMetadataArray(
	apiNode: ApiNode,
	key: "tags" | "hypernyms" | "hyponyms",
): string[] {
	const result: string[] = [];

	// Check nested metadata object first
	if (apiNode.metadata?.[key] && Array.isArray(apiNode.metadata[key])) {
		result.push(...apiNode.metadata[key]);
	}

	// Check direct properties (legacy format)
	const direct = apiNode[key];
	if (direct && Array.isArray(direct)) {
		result.push(...direct);
	}

	// Deduplicate case-insensitively while preserving display case
	const normalized = new Map<string, string>();
	for (const v of result) {
		if (typeof v !== "string") continue;
		const s = v.trim();
		if (!s) continue;
		const lower = s.toLowerCase();
		if (!normalized.has(lower)) {
			normalized.set(lower, s);
		}
	}

	return Array.from(normalized.values());
}

/**
 * Recursively converts an API node to a graph view node,
 * handling nested children of arbitrary depth.
 *
 * Includes metadata arrays (tags, hypernyms, hyponyms) so the graph view's
 * data manager can create metadata nodes when the "show metadata" toggle is enabled.
 * The visibility filtering in visible-nodes-utils.ts controls which metadata
 * nodes are actually displayed (only shared-connection metadata by default).
 */
function convertNode(apiNode: ApiNode): GraphViewNode {
	// Recursively convert children at all depths
	const children: GraphViewNode[] = [];
	if (apiNode.children && Array.isArray(apiNode.children)) {
		for (const child of apiNode.children) {
			// Recursively convert each child and its descendants
			children.push(convertNode(child));
		}
	}

	// Get index from the node
	const index =
		typeof apiNode.index === "number" ? apiNode.index : undefined;

	// Get created_at from either location
	const created_at = apiNode.created_at ?? apiNode.added_at ?? undefined;

	// Extract metadata arrays for the data manager to create metadata nodes
	const tags = extractMetadataArray(apiNode, "tags");
	const hypernyms = extractMetadataArray(apiNode, "hypernyms");
	const hyponyms = extractMetadataArray(apiNode, "hyponyms");

	// Build metadata object only if there are values
	const hasMetadata = tags.length > 0 || hypernyms.length > 0 || hyponyms.length > 0;
	const metadata = hasMetadata
		? {
				...(tags.length > 0 && { tags }),
				...(hypernyms.length > 0 && { hypernyms }),
				...(hyponyms.length > 0 && { hyponyms }),
			}
		: undefined;

	return {
		id: apiNode.id,
		title: apiNode.title ?? "Untitled",
		type: normalizeType(apiNode.type ?? "unknown"),
		summary: apiNode.summary,
		index,
		score: apiNode.score,
		parent_id: apiNode.parent_id,
		created_at,
		updated_at: apiNode.updated_at,
		// Flatten metadata arrays so data manager can create metadata nodes
		// The data manager expects tags/hypernyms/hyponyms as direct properties
		...metadata,
		children: children.length > 0 ? children : undefined,
	};
}

/**
 * Recursively collects all links from a node's children hierarchy.
 */
function collectLinksFromNode(
	node: GraphViewNode,
	links: GraphViewLink[],
): void {
	if (!node.children || node.children.length === 0) {
		return;
	}

	for (const child of node.children) {
		links.push({
			source: node.id,
			target: child.id,
		});

		// Recurse into child's children
		collectLinksFromNode(child, links);
	}
}


/**
 * Main conversion function: transforms API response to graph view format.
 *
 * Handles both /documents and /search endpoint formats, converting nested
 * children structures into flat nodes + explicit links for the graph view.
 *
 * @param apiResponse - The raw API response from /documents or /search
 * @returns GraphViewData with properly nested nodes and explicit links
 */
export function convertApiResponseToGraphData(
	apiResponse: DocumentsApiResponse | unknown,
): GraphViewData {
	const nodes: GraphViewNode[] = [];
	const links: GraphViewLink[] = [];

	if (!apiResponse || typeof apiResponse !== "object") {
		return { nodes, links };
	}

	const response = apiResponse as DocumentsApiResponse;

	// Handle /documents endpoint format: { documents: [...] }
	if ("documents" in response && Array.isArray(response.documents)) {
		for (const doc of response.documents) {
			const converted = convertNode(doc);
			nodes.push(converted);
			collectLinksFromNode(converted, links);
		}
		return { nodes, links };
	}

	// Handle /search endpoint format: { nodes: [...] }
	// Nodes have nested children arrays at arbitrary depth
	if ("nodes" in response && Array.isArray(response.nodes)) {
		for (const node of response.nodes) {
			const converted = convertNode(node);
			nodes.push(converted);
			collectLinksFromNode(converted, links);
		}
		return { nodes, links };
	}

	// Fallback: try to extract nodes from data property (wrapped response)
	if ("data" in response) {
		const data = (response as { data: DocumentsApiResponse }).data;
		return convertApiResponseToGraphData(data);
	}

	return { nodes, links };
}

/**
 * Helper to normalize type strings from API (e.g., "Document:technical_documentation" -> "document").
 */
export function normalizeType(type: string): string {
	if (!type) return "unknown";
	const lower = type.toLowerCase();

	// Handle prefixed types like "Document:technical_documentation" or "Frame:section"
	if (lower.startsWith("document:")) return "document";
	if (lower.startsWith("frame:")) return lower.split(":")[1] || "section";

	return lower;
}

/**
 * Validates the converted graph data.
 */
export function validateGraphData(data: GraphViewData): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];
	const nodeIds = new Set<string>();

	// Collect all node IDs (including nested)
	const collectIds = (nodes: GraphViewNode[]) => {
		for (const node of nodes) {
			if (nodeIds.has(node.id)) {
				errors.push(`Duplicate node ID: ${node.id}`);
			}
			nodeIds.add(node.id);
			if (node.children) {
				collectIds(node.children);
			}
		}
	};

	collectIds(data.nodes);

	// Validate links reference existing nodes
	for (const link of data.links) {
		if (!nodeIds.has(link.source)) {
			errors.push(`Link source not found: ${link.source}`);
		}
		if (!nodeIds.has(link.target)) {
			errors.push(`Link target not found: ${link.target}`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

