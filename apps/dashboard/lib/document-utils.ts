// Shared utilities for processing document/node data from the API

export type MetadataFields = {
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
	is_cited?: boolean;
	citation_index?: number;
	cited_frame_ids?: string[];
};

export type DocumentLike = {
	id: string;
	title: string;
	type: string;
	summary?: string | null;
	text?: string | null;
	created_at?: string;
	updated_at?: string;
	metadata?: MetadataFields;
	// API may also return metadata fields at top level
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
};

/**
 * Formats a type label from the API response.
 * Handles prefixed types like "Document:technical_documentation" or "Frame:section".
 */
export function formatTypeLabel(rawType: string | undefined): string {
	if (!rawType) return "—";

	// If type contains a ":", take the part after it
	const [, secondPart] = rawType.split(":", 2);
	const base = (secondPart ?? rawType).replace(/_/g, " ").trim();

	if (!base) return "—";

	// Headline case: capitalize each word
	return base
		.split(/\s+/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Normalizes metadata from either nested or top-level location.
 * The API may return metadata in either format, so we check both.
 */
export function normalizeMetadata(node: DocumentLike): MetadataFields | undefined {
	// Check nested metadata first
	if (node.metadata) {
		// Preserve citation fields even if other metadata is empty
		if (node.metadata.tags?.length || node.metadata.hypernyms?.length || node.metadata.hyponyms?.length || 
		    node.metadata.is_cited !== undefined || node.metadata.citation_index !== undefined) {
			return node.metadata;
		}
	}
	// Check top-level fields
	if (node.tags?.length || node.hypernyms?.length || node.hyponyms?.length) {
		return {
			tags: node.tags,
			hypernyms: node.hypernyms,
			hyponyms: node.hyponyms,
		};
	}
	// Return nested metadata even if empty (for consistency), preserving citation fields
	return node.metadata;
}

