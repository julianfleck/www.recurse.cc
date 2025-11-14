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
import type {
	Audience,
	BuildItem,
	Capability,
	ComparisonRow,
} from "@/components/sections/homepage";

/**
 * Homepage content data
 * Structured data matching homepage.md content
 */
export const homepageContent = {
	hero: {
		headline: "The Reasoning Substrate for Humans and AI",
		subheadline:
			"Recurse transforms unstructured content into living knowledge graphs that you and your AI can navigate, explore, and reason through.",
		introText:
			"Most systems return similar chunks and call it memory—doesn't help you understand, can't discover connections, can't trace how arguments unfold. Recurse is memory infrastructure for systems that actually understand. Ingest unstructured content from anywhere, transform it into a living knowledge graph that AI (and you) can reason through and act on.",
		learnMoreHref: "/about",
		learnMoreText: "Learn More",
		docsText: "Read the docs",
	},

	intro: {
		title: "Yet Another AI Memory System? Not quite.",
		text: "Recurse is built on different principles: structure over similarity, relationships over rankings, evolution over static storage.",
		content: {
			top: "Most AI memory systems optimize for one thing: similarity. Ask a question, get the most similar chunks back. This works if you know what you're looking for. But it systematically prevents the kind of exploration that leads to genuine understanding.",
			bottom: "You can't discover connections you didn't know existed. Can't stumble onto relevant context from unexpected sources. Can't follow threads that diverge from your initial question. The infrastructure is optimized for retrieval, not exploration.",
		},
	},

	coreCapabilities: {
		title: "Core Capabilities",
		description:
			"",
		capabilities: [
			{
				title: "Structure Over Similarity",
				description:
					"Extract semantic structure—arguments, evidence, decisions—and map how they connect. Your knowledge becomes navigable relationships, not isolated chunks.",
				icon: Network,
				features: [
					"Trace reasoning chains, not just similar text",
					"Surface connections across sources",
					"Navigate by meaning, not keywords",
				],
			},
			{
				title: "Exploration + Retrieval",
				description:
					'Ask "what\'s related but different?" not just "what\'s most similar?" Follow weak connections to discover adjacent ideas. Surface contradictions automatically.',
				icon: GitGraph,
				features: [
					"Discovery through divergence",
					"Contradiction surfacing",
					"Evolution tracking",
				],
			},
			{
				title: "Living Memory",
				description:
					"Knowledge that evolves without losing history. Updates preserve timestamps, diffs, and explanations. See how understanding changed over time.",
				icon: Clock,
				features: [
					"Current + historical context",
					"Temporal queries",
					"Evidence trails",
				],
			},
			{
				title: "Tap Into Expert Brains",
				description:
					"Subscribe to Context Streams and instantly access years of expert curation. Their sources, their synthesis, their connections—all queryable.",
				icon: Brain,
				features: [
					"Expertise without the work",
					"Team knowledge infrastructure",
					"Curator economy",
				],
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

