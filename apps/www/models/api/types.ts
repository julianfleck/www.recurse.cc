/**
 * Common types for API interactions
 */

export interface FetchConfig {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers?: Record<string, string>;
	body?: unknown; // More type-safe than 'any'
}

export interface Post {
	id: number;
	title: string;
	body: string;
	userId: number;
}

export interface ApiError {
	message: string;
	status: number;
	code?: string;
}

export interface User {
	id: number;
	name: string;
	username: string;
	email: string;
	address?: {
		street: string;
		suite: string;
		city: string;
		zipcode: string;
		geo: {
			lat: string;
			lng: string;
		};
	};
	phone?: string;
	website?: string;
	company?: {
		name: string;
		catchPhrase: string;
		bs: string;
	};
}

export interface Comment {
	id: number;
	postId: number;
	name: string;
	email: string;
	body: string;
}

export interface Document {
	id: string;
	title: string;
	type: "document";
	inScope: boolean;
	sections: Section[];
	content?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Section {
	id: string;
	title: string;
	type: "section";
	inScope: boolean;
	frames: Frame[];
	content?: string;
	documentId: string;
}

export interface Frame {
	id: string;
	title: string;
	type: "concept" | "fact" | "relationship" | "claim";
	inScope: boolean;
	content?: string;
	sectionId: string;
	relatedFrames?: string[]; // IDs of related frames
}

export interface RelatedItem {
	id: string;
	title: string;
	type: "document" | "section" | "frame";
	relevanceScore: number;
	preview?: string;
	frameType?: "concept" | "fact" | "relationship" | "claim";
	wasUsedInContext?: boolean; // Whether this item was actually used to generate the answer
}

export interface Session {
	id: string;
	title: string;
	timestamp: Date;
	preview?: string;
	messageCount: number;
	messages: ChatMessage[];
	mainDocumentId?: string; // The primary document this session refers to
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	sessionId: string;
}

export interface KBNode {
	id: string;
	title: string;
	type?: string;
	summary?: string;
	index?: number;
	children?: KBNode[];
	inScope?: boolean;
	created_at?: string;
	updated_at?: string;
	// Add other fields as needed
}
