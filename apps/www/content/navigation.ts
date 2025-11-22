import { getAllBlogPosts } from "@/lib/blog";

export type NavigationIconKey =
	| "network"
	| "sparkles"
	| "gitGraph"
	| "brain"
	| "sendToBack"
	| "layers"
	| "search"
	| "gitBranch"
	| "infinity"
	| "clock";

export type NavigationHero = {
	title: string;
	description: string;
	href: string;
	footer?: string;
};

export type NavigationItem = {
	title: string;
	description: string;
	href: string;
	icon?: NavigationIconKey;
};

export type NavigationLayout = "list" | "grid";

export type NavigationSection = {
	hero: NavigationHero;
	items: NavigationItem[];
	layout: NavigationLayout;
	scrollable: boolean;
};

export type NavigationContent = {
	about: NavigationSection;
	features: NavigationSection;
	blog: NavigationSection;
	docs: NavigationSection;
};

const BLOG_NAV_ITEMS: NavigationItem[] = getAllBlogPosts()
	.slice(0, 6)
	.map((post) => ({
		title: post.title,
		description: post.description ?? "",
		href: post.url,
	}));

const DEFAULT_BLOG_NAV_ITEMS: NavigationItem[] = [
	{ title: "Placeholder Article 1", description: "Coming soon", href: "/blog" },
	{ title: "Placeholder Article 2", description: "Coming soon", href: "/blog" },
	{ title: "Placeholder Article 3", description: "Coming soon", href: "/blog" },
	{ title: "Placeholder Article 4", description: "Coming soon", href: "/blog" },
	{ title: "Placeholder Article 5", description: "Coming soon", href: "/blog" },
	{ title: "Placeholder Article 6", description: "Coming soon", href: "/blog" },
];

const RESOLVED_BLOG_NAV_ITEMS =
	BLOG_NAV_ITEMS.length > 0 ? BLOG_NAV_ITEMS : DEFAULT_BLOG_NAV_ITEMS;

export const navigationContent: NavigationContent = {
	about: {
		hero: {
			title: "Substrate for Sense-making",
			description: "Recurse is memory infrastructure for systems that actually understand.",
			href: "/#about",
		},
		items: [
			{
				title: "Technology",
				description: "What Recurse does",
				href: "/about",
			},
			{
				title: "Beta Access",
				description: "How to join our beta program",
				href: "https://docs.recurse.cc/getting-started/beta",
			},
			{
				title: "How Recurse Compares",
				description: "RAGE vs. RAG and other approaches",
				href: "/#comparison",
			},
			{
				title: "FAQ",
				description: "Common questions and answers",
				href: "/faq",
			},
		],
		layout: "list",
		scrollable: true,
	},
	features: {
		hero: {
			title: "Transform Your Raw Data",
			description: "Turn raw input into structured, actionable context for you and your AI agents.",
			href: "/#features",
		},
		items: [
			{
				title: "Semantic Navigation",
				description: "Follow typed relationships through reasoning chains",
				href: "/#features",
				icon: "network",
			},
			{
				title: "Adaptive Schemas",
				description: "Works with any content, zero configuration needed",
				href: "/#features",
				icon: "sparkles",
			},
			{
				title: "Temporal Versioning",
				description: "Preserve historical context while tracking changes",
				href: "/#features",
				icon: "gitGraph",
			},
			{
				title: "Expert Knowledge",
				description: "Subscribe to expert knowledge bases directly",
				href: "/#features",
				icon: "brain",
			},
			{
				title: "Knowledge Substrate",
				description: "Tie agent memories together in one living fabric",
				href: "/#features",
				icon: "sendToBack",
			},
			{
				title: "Living Context",
				description: "Query fact tables or reasoning chains from one interface",
				href: "/#features",
				icon: "layers",
			},
			{
				title: "Intent Modeling",
				description: "Every query carries the questioner’s frame and desired outcome",
				href: "/#features",
				icon: "search",
			},
			{
				title: "Actionable Outputs",
				description: "Generate multi-step plans, not just single responses",
				href: "/#features",
				icon: "gitBranch",
			},
			{
				title: "Divergent Recall",
				description: "Surface contradictions and weak signals automatically",
				href: "/#features",
				icon: "infinity",
			},
			{
				title: "Realtime Synchronization",
				description: "Keep your graph alive with streaming updates",
				href: "/#features",
				icon: "clock",
			},
		],
		layout: "grid",
		scrollable: false,
	},
	blog: {
		hero: {
			title: "Blog",
			description: "Updates, insights, and deep dives into context infrastructure",
			href: "/blog",
			footer: "Read articles →",
		},
		items: RESOLVED_BLOG_NAV_ITEMS,
		layout: "list",
		scrollable: true,
	},
	docs: {
		hero: {
			title: "Read the fine manual",
			description: "Comprehensive guides, API references, and technical documentation",
			href: "https://docs.recurse.cc",
		},
		items: [
			{
				title: "Understanding RAGE",
				description: "Core technology and how it works",
				href: "https://docs.recurse.cc/concepts/rage",
			},
			{
				title: "Frame Semantics",
				description: "Structured patterns for knowledge representation",
				href: "https://docs.recurse.cc/concepts/frames",
			},
			{
				title: "Using the API",
				description: "Upload documents and query your knowledge",
				href: "https://docs.recurse.cc/guides/using-the-api",
			},
			{
				title: "API vs Proxy",
				description: "Choose the right integration approach",
				href: "https://docs.recurse.cc/getting-started/api-vs-proxy",
			},
			{
				title: "Adaptive Schemas",
				description: "Automatic pattern discovery from your content",
				href: "https://docs.recurse.cc/concepts/adaptive-schemas",
			},
			{
				title: "Temporal Versioning",
				description: "Track knowledge evolution over time",
				href: "https://docs.recurse.cc/concepts/temporal-versioning",
			},
		],
		layout: "list",
		scrollable: true,
	},
};

