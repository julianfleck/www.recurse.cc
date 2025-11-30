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
	Package,
	Rss,
} from "lucide-react";
import { IconSparkles, IconGitBranch } from "@tabler/icons-react";

// Type definitions for homepage content
export type Capability = {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
	features: string[];
	docLink?: string;
	comingSoon?: boolean;
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

export const homepageContent = {
	hero: {
		headline: "The Memory Substrate for Sense-making, not just Similarity Search",
		introText:
			"Most systems return similar chunks and call it memory – doesn’t help you understand, can’t discover connections, can't trace how arguments unfold. Recurse is memory infrastructure for systems that actually understand. Ingest unstructured content from anywhere, transform it into a living knowledge graph that AI (and you) can reason through and act on.",
		learnMoreHref: "/about",
		learnMoreText: "Learn More",
		docsText: "Read the docs",
		headlines: [
			"The memory layer that explores connections, not just similar looking chunks",
			"The memory layer that updates its understanding, not just keys and values",
			"The knowledge substrate that explores, instead of retrieving similar stuff",
			"The knowledge substrate that understands, instead of assuming facts",
			"The knowledge graph that connects semantic structure, instead of entities",
			"The knowledge graph that navigates meaning, instead of next neighbors",
			"Context engineering that enables navigation, not just answering questions",
			"Context engineering that finds contradictions, not just similar looking chunks",
		],
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
				title: "Learns your structure automatically",
				description:
					"Drop in any content—research papers, meeting notes, code documentation—and watch structure emerge. <mark>Recurse learns the patterns</mark> in your material and creates meaningful relationships automatically. No schemas to define, no categories to maintain.",
				icon: IconSparkles,
				features: [
					"Adapts to any content type",
					"Zero configuration needed",
					"Learns your domain automatically",
				],
				docLink: "/concepts/adaptive-schemas",
			},
			{
				title: "Assembles context bundles that enrich your inquiries",
				description:
					"When you need information, Recurse assembles <mark>complete context bundles</mark>—not scattered chunks. Copy with one click for any AI tool, or connect your agents directly. Context arrives pre-assembled with sources cited and relationships preserved.",
				icon: Package,
				features: [
					"One-click context export",
					"Direct agent injection",
					"Sources always cited",
				],
				docLink: "/concepts/frames", // TODO: update to context-assembly docs when created
			},
			{
				title: "Lets you navigate semantic structure",
				description:
					"Follow how ideas actually connect. Arguments link to evidence, decisions trace back to discussions. <mark>Both you and your AI agents</mark> can navigate these reasoning chains, discovering relationships that similarity search would miss.",
				icon: Network,
				features: [
					"Typed relationship traversal",
					"Agent-accessible navigation",
					"Multi-hop exploration",
				],
				docLink: "/concepts/frames",
			},
			{
				title: "Evolves your knowledge base over time",
				description:
					"Your knowledge graph isn't static—it <mark>grows and refines</mark> as you add content. Recurse preserves complete history with timestamps and explanations of what changed, so you can trace how understanding developed.",
				icon: GitGraph,
				features: [
					"Complete version history",
					"Track knowledge evolution",
					"Query past states",
				],
				docLink: "/concepts/temporal-versioning",
			},
			{
				title: "Keeps your knowledge base always up to date",
				description:
					"Subscribe to RSS feeds, documentation sites, and newsletters. <mark>New content flows in automatically</mark>, gets processed, and connects to your existing knowledge. Stay current without manual uploads.",
				icon: Rss,
				features: [
					"Automatic ingestion",
					"Monitor any feed or URL",
					"Continuous updates",
				],
				docLink: "/concepts/subscriptions",
				comingSoon: true,
			},
			{
				title: "Lets you tap into expert knowledge",
				description:
					"Subscribe to domain experts' curated knowledge bases directly—their sources, synthesis, and connections become part of your context. <mark>Your AI draws from their expertise</mark> automatically, updating as they publish.",
				icon: Brain,
				features: [
					"Access expert knowledge",
					"Share curated collections",
					"Automatic updates",
				],
				docLink: "/concepts/streams",
				comingSoon: true,
			},
		] as Capability[],
	},

	whatYouCanBuild: {
		title: "Build with Recurse",
		claim: "Context-aware agents with just one line of code",
		leftHeadline: "Get started in minutes",
		description:
			"Point your OpenAI SDK to the Recurse proxy. When you send a request, Recurse retrieves relevant context from your knowledge graph and injects it into your prompt. After your AI provider responds, Recurse extracts semantic frames from the response and stores them back in your knowledge graph. Your code sees a standard OpenAI-compatible response—the context enrichment and knowledge extraction happen transparently.",
		ctaText: "Get started",
		ctaLink: "/docs/getting-started/using-the-proxy",
		codeExamples: [
			{
				label: "JavaScript",
				language: "javascript",
				code: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.recurse.cc/proxy/https://api.openai.com/v1/',
  defaultHeaders: {
    'X-API-Key': process.env.RECURSE_API_KEY,
    'X-Recurse-Scope': 'my_project'
  }
});

// Use normally—context gets injected automatically
const completion = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'What did we decide?' }]
});`,
			},
			{
				label: "Python",
				language: "python",
				code: `from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url="https://api.recurse.cc/proxy/https://api.openai.com/v1/",
    default_headers={
        "X-API-Key": os.environ["RECURSE_API_KEY"],
        "X-Recurse-Scope": "my_project"
    }
)

# Use normally—context gets injected automatically
completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "What did we decide?"}]
)`,
			},
			{
				label: "cURL",
				language: "bash",
				code: `curl https://api.recurse.cc/proxy/https://api.openai.com/v1/chat/completions \\
  -H "X-API-Key: $RECURSE_API_KEY" \\
  -H "X-Recurse-Scope: my_project" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "What did we decide?"}]
  }'`,
			},
		],
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
		detailedComparisonHref: "/docs/concepts/rage#how-rage-compares",
	},
};

