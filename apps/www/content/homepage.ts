import type React from "react";
import {
	Brain,
	GitGraph,
	InfinityIcon,
	Layers,
	Network,
	Search,
	SendToBack,
	Clock,
} from "lucide-react";
import { IconSparkles, IconGitBranch } from "@tabler/icons-react";

// Type definitions for homepage content
export type Capability = {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
	features: string[];
	docLink?: string;
};

export type BuildItem = {
	what: string;
	description: string;
};

export type Audience = {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

export type ComparisonRow = {
	feature: string;
	traditionalRAG: string;
	graphRAG: string;
	recurse: string;
};

/**
 * Homepage content data
 * Structured data matching homepage.md content
 */
export const homepageContent = {
	hero: {
		headline: "The Memory Substrate for Sense-making, not just Similarity Search",
		introText:
			"Most systems return similar chunks and call it memory—doesn't help you understand, can't discover connections, can't trace how arguments unfold. Recurse is memory infrastructure for systems that actually understand. Ingest unstructured content from anywhere, transform it into a living knowledge graph that AI (and you) can reason through and act on.",
		learnMoreHref: "/about",
		learnMoreText: "Learn More",
		docsText: "Read the docs",
	},

	graphExample: {
		description: {
			top: "Recurse transforms unstructured content into living knowledge graphs...",
			bottom: "...so that both you and your AI can navigate, explore, and reason through your knowledge base.",
		},
	},

	intro: {
		title: "Yet Another AI Memory System?",
		leftCard: {
			top: "Not quite...",
			bottom: "Recurse is memory infrastructure for systems that actually understand.",
		},
		middleCard: {
			top: "Most context management infrastructures are optimized for retrieval, not exploration.",
			bottom: "Ask a question, get the most similar chunks back. This works if you know what you're looking for. But it systematically prevents the kind of exploration that leads to genuine understanding.",
		},
		rightCard: {
			top: "You can't discover connections you didn't know existed. Can't stumble onto relevant context from unexpected sources. Can't follow threads that diverge from your initial question.",
			bottom: "That is why we are building on different principles: structure over similarity, relationships over rankings, evolution over static storage.",
		},
	},

	coreCapabilities: {
		title: "Core Capabilities",
		description:
			"",
		capabilities: [
			{
				title: "Let's You Navigate Semantic Structure",
				description:
					"Recurse creates typed relationships between semantic units—arguments link to evidence, decisions connect to discussions. Navigate meaning through actual reasoning chains, not keyword similarity.",
				icon: Network,
				features: [
					"Follow typed relationships",
					"Trace reasoning chains",
					"Multi-hop traversal",
				],
				docLink: "/docs/concepts/frames",
			},
			{
				title: "Discovers Schemas Automatically",
				description:
					"Recurse learns patterns from any content you add to it, be it research papers, bug reports, meeting notes, etc, and created relationships between them without needing any predefined ontologies. Source-agnostic schema discovery adapts to your domain.",
				icon: IconSparkles,
				features: [
					"Works with any content",
					"Zero configuration needed",
					"Adapts to your domain",
				],
				docLink: "/docs/concepts/adaptive-schemas",
			},
			{
				title: "Evolves Knowledge Graphs Over Time",
				description:
					"Recurse updates knowledge while preserving complete history with timestamps, diffs, and explanations of what changed. This turns your Recurse graphs into a living memory that maintains both current understanding and historical context.",
				icon: GitGraph,
				features: [
					"Preserve historical context",
					"Track knowledge evolution",
					"Query temporal changes",
				],
				docLink: "/docs/concepts/temporal-versioning",
			},
			{
				title: "Let's You Tap into Expert Knowledge",
				description:
					"Subscribe to domain experts' knowledge bases—their sources, synthesis, and connections become queryable. You and your AI agents can draw from their expertise with one click.",
				icon: Brain,
				features: [
					"Access expert knowledge",
					"Share curated subgraphs",
					"Automatic updates",
				],
				docLink: "/docs/concepts/streams",
			},
		] as Capability[],
	},

	whatYouCanBuild: {
		title: "What You Can Build",
		description:
			"From AI assistants to knowledge workspaces, build applications that understand context and adapt to how people actually think and work.",
		items: [
			{
				what: "AI Assistants",
				description:
					"that retain context across conversations and sources, trace reasoning chains, and build on accumulated understanding",
			},
			{
				what: "Knowledge Workspaces",
				description:
					"that adapt to your thought patterns, surface unexpected connections, and evolve as you learn",
			},
			{
				what: "Research Tools",
				description:
					"that navigate relationships between papers, track how understanding evolved, and discover cross-domain insights",
			},
			{
				what: "Collaborative Agents",
				description:
					"that share structured knowledge, reason through complex decisions, and maintain context across teams",
			},
		] as BuildItem[],
	},

	whoThisIsFor: {
		title: "Who This Is For",
		audiences: [
			{
				title: "For Developers",
				description:
					"Stop reinventing memory infrastructure. Plug Recurse into your applications for semantic extraction, relationship navigation, and context assembly. Works with any AI provider.",
				icon: Brain,
			},
			{
				title: "For Researchers",
				description:
					"Your research becomes explorable structure. Trace how papers connect, see how understanding evolved, query across everything without losing the thread.",
				icon: Search,
			},
			{
				title: "For Teams",
				description:
					"Capture decisions with the discussions behind them. New members trace why choices were made. Context surfaces automatically—linked, navigable, complete.",
				icon: Layers,
			},
		] as Audience[],
	},

	comparison: {
		title: "How Recurse Compares",
		description: "Recurse goes beyond traditional RAG and Graph RAG by creating living knowledge structures that adapt and evolve with your content.",
		rows: [
			{
				feature: "Understanding",
				traditionalRAG: "Similarity matching",
				graphRAG: "Entity extraction",
				recurse: "Semantic structure",
			},
			{
				feature: "Navigation",
				traditionalRAG: "Flat chunk retrieval",
				graphRAG: "Entity relationships",
				recurse: "Recursive traversal",
			},
			{
				feature: "Adaptation",
				traditionalRAG: "Static",
				graphRAG: "Fixed ontology",
				recurse: "Emergent schemas",
			},
			{
				feature: "Memory",
				traditionalRAG: "Session-based",
				graphRAG: "Static graph",
				recurse: "Living substrate",
			},
		] as ComparisonRow[],
		detailedComparisonHref: "/docs/concepts/rage",
	},
};

