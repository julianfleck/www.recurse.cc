"use client";

import React, { useMemo, useState } from "react";
import { Search, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@recurse/ui/components/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@recurse/ui/components/button";
import { getDocsUrl, cn } from "@/lib/utils";

interface FAQ {
	question: string;
	answer: string;
	tags: string[];
	docLink?: {
		label: string;
		href: string;
	};
}

interface FAQSection {
	section: string;
	faqs: FAQ[];
}

export default function FAQPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const faqSections: FAQSection[] = [
		{
			section: "Core Concepts",
			faqs: [
		{
			question: 'What do you mean by "recursive"?',
			answer:
				"Recurse structures knowledge in nested layers. A paragraph might contain claims → which contain concepts → which reference other documents — all linked. Outputs can be re-ingested to generate new context, which feeds back into the system. It's not just a static store — it grows as you use it.",
					tags: ["Core Concepts", "Technical"],
				},
				{
					question: "What is RAGE?",
					answer:
						"RAGE stands for Recursive, Agentic Graph Embeddings. It's the core technology that powers Recurse. Unlike traditional RAG (Retrieval Augmented Generation), RAGE builds a semantic graph with typed relationships, temporal versioning, and agent-friendly traversal patterns. It's designed for exploration and understanding, not just retrieval.",
					tags: ["Core Concepts", "Technical"],
					docLink: {
						label: "Read the RAGE documentation",
						href: "/docs/concepts/rage",
					},
				},
				{
					question: "What are Frames?",
					answer:
						"Frames are the fundamental building blocks of Recurse's knowledge graph. They're typed semantic units with named slots that capture meaning and relationships. Each frame can contain text, metadata, embeddings, and links to other frames — creating a rich, interconnected knowledge structure. Think of them as structured containers that reference each other and nest recursively.",
					tags: ["Core Concepts", "Technical"],
					docLink: {
						label: "Learn about Frames",
						href: "/docs/concepts/frames",
					},
				},
				{
					question: "How does structure over similarity work?",
					answer:
						"Most AI memory systems retrieve by similarity — finding text chunks that look similar to your query. Recurse extracts semantic structure — understanding what sources argue, what supports those arguments, how different pieces relate. This lets you navigate relationships, trace connections, and explore how ideas relate, not just find similar text.",
					tags: ["Core Concepts", "Technical"],
				},
				{
					question: 'What\'s "rehydration"?',
					answer:
						"Rehydration means taking a previously generated frame, answer, or insight and turning it *back into structured input* — ready to be used in a new generation or reasoning task. It closes the loop between input and output, allowing AI systems to build on their own work.",
					tags: ["Core Concepts", "Technical"],
				},
			],
		},
		{
			section: "Features",
			faqs: [
				{
					question: "What are Adaptive Schemas?",
					answer:
						"Adaptive Schemas automatically recognize and structure different types of content (research papers, meeting notes, code documentation) into semantically typed frames. The system learns frame patterns from your content automatically, creating emergent structure that adapts as you add sources across different domains — no predefined ontologies needed.",
					tags: ["Features", "Technical"],
					docLink: {
						label: "Learn about Adaptive Schemas",
						href: "/docs/concepts/adaptive-schemas",
					},
				},
				{
					question: "What is Temporal Versioning?",
					answer:
						"Temporal Versioning tracks how your knowledge evolves over time. When you update a document or add new information, Recurse doesn't just overwrite — it creates a new version while maintaining links to previous states. You can query current knowledge or trace how understanding evolved, with diffs showing what changed and why. It's evolution tracking with complete history preservation.",
					tags: ["Features", "Technical"],
					docLink: {
						label: "Learn about Temporal Versioning",
						href: "/docs/concepts/temporal-versioning",
					},
				},
				{
					question: "What are Source Subscriptions?",
					answer:
						"Source Subscriptions automatically monitor external sources (GitHub repos, Notion pages, Google Docs, URLs, RSS feeds) and ingest updates into your knowledge graph. Set it once and your context stays current without manual uploads. Temporal versioning maintains both current understanding and complete evolution history as sources change.",
					tags: ["Features", "Integration"],
				},
				{
					question: "What are Context Streams?",
					answer:
						"Context Streams let you subscribe to curated knowledge maintained by experts or organizations. Instead of building everything from scratch, subscribe to domain-specific context (legal frameworks, medical research, coding patterns) that stays updated over time. Experts share subgraphs of their knowledge bases—sources, documents, and semantic connections. Think RSS for semantic knowledge based on trust and authority.",
					tags: ["Features", "Streams"],
					docLink: {
						label: "Learn about Context Streams",
						href: "/docs/concepts/streams",
					},
				},
				{
					question: "Can I create my own Context Stream?",
					answer:
						"Yes! You can publish your own streams — sharing structured knowledge with your team, customers, or the community. Set access controls, versioning policies, and update schedules. Others can subscribe and automatically receive updates as your knowledge base evolves.",
					tags: ["Features", "Streams"],
				},
				{
					question: "What search capabilities are available?",
					answer:
						"Recurse offers multiple search modes: semantic search (meaning-based vector similarity), text search (keyword/fuzzy matching), frame search (by type/structure), tag search, document search, and candidate search (similar to existing nodes). You can combine filters for precision and navigate both hierarchical and associative relationships.",
					tags: ["Features", "API"],
				},
				{
					question: "Can I use automatic context persistence?",
					answer:
						"Yes. Add 'X-Recurse-Persist: true' to your proxy headers to automatically save useful outputs back into your knowledge graph. The assistant's responses become queryable content for future requests. Use this for summaries, knowledge base entries, and reference material — but not for temporary content.",
					tags: ["Features", "Proxy"],
				},
				{
					question: "What are Scopes?",
			answer:
						"Scopes organize your knowledge like folders or tags. Assign scopes when uploading to keep related content together: 'research-papers', 'team:engineering', 'project:website-redesign'. Use scopes to filter queries later, making retrieval more focused and relevant. You can query single or multiple scopes at once.",
					tags: ["Features", "Organization"],
				},
			],
		},
		{
			section: "Comparison",
			faqs: [
				{
					question: "Is this like ChatGPT memory?",
					answer:
						"Not really. ChatGPT's memory stores flat notes per user. Recurse builds a semantic graph of everything you've seen, ingested, and asked — with structure, relations, and traceability. Think personal memory vs. organizational cognition.",
					tags: ["Comparison"],
		},
		{
			question: "How is this different from a vector store?",
			answer:
						"Vector stores retrieve text that *looks similar*. Recurse retrieves nodes that *mean something similar* — with the added benefit of slot-level detail, type awareness, and multi-hop traversal. You can navigate relationships, not just find similar chunks. It's about exploration and discovery, not just retrieval.",
					tags: ["Comparison", "Technical"],
				},
				{
					question: "How does RAGE compare to RAG?",
					answer:
						"RAG (Retrieval Augmented Generation) retrieves similar chunks and feeds them to an LLM. RAGE builds a semantic graph with typed relationships, enabling exploration, multi-hop reasoning, and context that evolves over time. It's infrastructure for understanding, not just similarity search. You can discover connections that weren't even explicit in the original sources.",
					tags: ["Comparison", "Technical"],
				},
				{
					question: "What about GraphRAG?",
					answer:
						"GraphRAG extracts entities and relationships but treats them as static nodes. RAGE uses typed frames with semantic slots that can nest recursively, track temporal changes, and carry agentic instructions for traversal. It's designed for both navigation and evolution — creating living knowledge structures rather than static graphs.",
					tags: ["Comparison", "Technical"],
				},
			],
		},
		{
			section: "Getting Started",
			faqs: [
				{
					question: "How do I get started?",
					answer:
						"Three steps: 1) Get an AI provider key (OpenAI, Anthropic, DeepSeek, or OpenRouter). 2) Sign up for Recurse at dashboard.recurse.cc. 3) Configure your AI provider key in settings. Then choose your path: use the chat interface (no code), the proxy (one line change), or the API (full control).",
					tags: ["Getting Started"],
					docLink: {
						label: "View Quickstart Guide",
						href: "/docs/getting-started/quickstart",
					},
				},
				{
					question: "Do I have to install anything?",
					answer:
						"No. Hosted API access is available. For enterprise users, we offer on-prem deployment and full control of the stack.",
					tags: ["Getting Started"],
				},
				{
					question: "What's Bring Your Own Key (BYOK)?",
			answer:
						"While in beta, Recurse operates on a bring-your-own-key basis. You use your own AI provider keys (OpenAI, Anthropic, etc.), and we handle the context injection and knowledge management. This gives you control over costs and data routing. Post-beta, we'll offer managed options too.",
					tags: ["Getting Started", "Integration"],
		},
		{
					question: "How long does source processing take?",
			answer:
						"Typically 10-60 seconds depending on content size and complexity. Processing happens asynchronously — you get a job ID when uploading and can check status via API or the dashboard. You'll be able to query the content once processing completes.",
					tags: ["Getting Started", "Technical"],
				},
			],
		},
		{
			section: "Integration",
			faqs: [
				{
					question: "What's the difference between the API and Proxy?",
					answer:
						"The Proxy is the fastest way to add context — swap your AI provider endpoint and Recurse automatically injects relevant context from your knowledge graph. The API gives you direct control: upload documents, query the graph, build custom retrieval logic, navigate relationships. Most users start with the Proxy and add API calls as needed.",
					tags: ["Integration", "API", "Proxy"],
					docLink: {
						label: "Compare API vs Proxy",
						href: "/docs/getting-started/api-vs-proxy",
					},
				},
				{
					question: "Can I use multiple approaches together?",
					answer:
						"Absolutely. Many users combine the chat interface for exploration, the proxy for their main application, and direct API calls for specific operations. Your knowledge graph is accessible through all methods simultaneously.",
					tags: ["Integration"],
				},
				{
					question: "How does the Proxy work?",
			answer:
						"Point your AI SDK to Recurse's proxy endpoint instead of directly to OpenAI/Anthropic. The proxy intercepts requests, retrieves relevant context from your knowledge graph, injects it into the prompt, and forwards to your chosen LLM provider. Responses flow back through unchanged. It's transparent context injection with zero code changes beyond the endpoint.",
					tags: ["Integration", "Proxy"],
					docLink: {
						label: "Using the Proxy Guide",
						href: "/docs/getting-started/using-the-proxy",
					},
		},
		{
			question: "Can I use my own LLMs?",
			answer:
						"Yes. You can plug in your own models (via OpenRouter or direct API) and control how extraction, summarization, and generation behave. Any OpenAI-compatible API works with the proxy. For Anthropic's Claude, use the Anthropic base URL.",
					tags: ["Integration", "API"],
				},
				{
					question: "Can I use this with Claude, Gemini, or other providers?",
					answer:
						"Yes. Any OpenAI-compatible API works with the proxy. For Anthropic's Claude, use the Anthropic base URL. For other providers, adjust the base URL accordingly. Recurse works with all major AI providers.",
					tags: ["Integration"],
		},
		{
			question: "Is this just for text?",
			answer:
						"No. We support text, Markdown, PDFs, Word documents, code files, and URLs. We don't currently support image or video files, but we can process any text-based content including documents, notes, chat threads, and more.",
					tags: ["Integration", "Features"],
		},
		{
			question: "Can this power multi-agent systems?",
			answer:
						"Yes — and that's exactly what it's designed for. Agents need memory, context, and ways to reason across knowledge. Recurse provides that substrate with graph traversal, typed relationships, and temporal versioning. The frames carry agentic instructions for navigation and validation.",
					tags: ["Integration", "Features"],
		},
		{
			question: "Can I use this just for retrieval?",
			answer:
						"Absolutely. If you want a better way to index and search your documents semantically, without using LLMs for generation — that works too. Use the API directly for search and retrieval operations.",
					tags: ["Integration", "API"],
				},
			],
		},
		{
			section: "Technical Details",
			faqs: [
				{
					question: "Do I need to understand graphs to use this?",
					answer:
						"No. You can treat it like an API that gives you smarter retrieval and structured summaries. But if you *do* want to query the graph directly — you can. Navigate parent/child relationships, lateral connections, and semantic links with full control.",
					tags: ["Technical"],
				},
				{
					question: "How does the graph structure work?",
					answer:
						"The knowledge graph uses typed nodes (frames) with directed relationships. Each node can have parent/child relationships, neighbors (lateral connections), and semantic links. You can traverse the tree structure, query by depth, or navigate relationships — enabling both hierarchical and associative retrieval.",
					tags: ["Technical", "Core Concepts"],
				},
				{
					question: "What metadata is stored with each node?",
					answer:
						"Each node stores: content (text, embeddings), metadata (source, timestamps, tags, scope), relationships (parents, children, neighbors), schema type, summary, and versioning info. You can query any of these dimensions independently or combined using filters.",
					tags: ["Technical", "API"],
				},
				{
					question: "Can I batch process documents?",
					answer:
						"Yes. The API supports batch operations for uploading multiple documents, updating nodes, and triggering graph maintenance. Processing happens asynchronously with job tracking and status endpoints. You can monitor progress and get notifications when processing completes.",
					tags: ["Technical", "API"],
				},
				{
					question: "What file formats are supported?",
					answer:
						"We support: plain text, Markdown, PDF, Word documents (.doc, .docx), code files, and URLs (we fetch and parse the content). Upload via raw text (-F 'text=...'), files (-F 'file=@document.pdf'), or URLs (-F 'url=https://...'). Images and videos aren't supported yet.",
					tags: ["Technical", "Features"],
				},
				{
					question: "How do I filter search results?",
					answer:
						"Use query parameters: scope filters (&scope=project-name), frame type filters (&frame_types=Claim,Evidence), result limits (&limit=10), and combine multiple filters. The API supports semantic, text, frame, tag, and document search modes — each with its own filtering capabilities.",
					tags: ["Technical", "API"],
				},
			],
		},
		{
			section: "Misc",
			faqs: [
				{
					question: 'Why ".cc"?',
					answer:
						'Think "carbon copy" — you just copy everything into the system and it becomes your extended memory. Like how you\'d CC someone on an email to keep them in the loop, recurse.cc keeps your AI systems in the loop with all your knowledge and context.',
					tags: ["Misc"],
				},
				{
					question: "Is this available during beta?",
					answer:
						"Yes! We're in public beta. Sign up to get access. Beta users get early access to features, priority support, and grandfathered pricing when we launch publicly.",
					tags: ["Misc"],
				},
				{
					question: "What's the pricing model?",
			answer:
						"During beta, access is free. Post-beta pricing will be based on storage (nodes/documents), compute (processing/embeddings), and API calls. BYOK users pay less since they bring their own model costs. Enterprise plans include on-prem deployment and SLAs.",
					tags: ["Misc"],
				},
			],
		},
	];

	// Extract all unique tags
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		faqSections.forEach((section) => {
			section.faqs.forEach((faq) => {
				faq.tags.forEach((tag) => tags.add(tag));
			});
		});
		return Array.from(tags).sort();
	}, []);

	// Check if FAQ matches current filters
	const faqMatchesFilters = (faq: FAQ): boolean => {
		// Search filter
		const searchLower = searchQuery.toLowerCase();
		const matchesSearch =
			!searchQuery ||
			faq.question.toLowerCase().includes(searchLower) ||
			faq.answer.toLowerCase().includes(searchLower) ||
			faq.tags.some((tag) => tag.toLowerCase().includes(searchLower));

		// Tag filter
		const matchesTags =
			selectedTags.length === 0 ||
			selectedTags.some((selectedTag) => faq.tags.includes(selectedTag));

		return matchesSearch && matchesTags;
	};

	// Count matching questions
	const filteredCount = useMemo(() => {
		return faqSections.reduce((count, section) => {
			return count + section.faqs.filter((faq) => faqMatchesFilters(faq)).length;
		}, 0);
	}, [searchQuery, selectedTags]);

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedTags([]);
	};

	const totalQuestions = faqSections.reduce(
		(acc, section) => acc + section.faqs.length,
		0
	);

	return (
		<>
			{/* Hero Section */}
			<div className="relative z-10 group/hero pt-halfcol">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col>
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="px-1col py-1col lg:pl-2col lg:pr-1.5col"
							>
								<div className="space-y-8 text-left pl-6">
									<div className="space-y-8">
										<div className="lg:max-w-lg">
											<h1 className="font-semibold text-2xl leading-[1.15]! tracking-tight md:text-4xl lg:text-5xl text-accent-foreground lg:max-w-3xl">
							Frequently Asked Questions
						</h1>
										</div>
									</div>
									<div>
										<p className="max-w-4xl text-muted-foreground text-lg leading-relaxed md:text-xl lg:text-2xl">
											Find answers to common questions about Recurse, RAGE, memory infrastructure, and building context-aware AI.
						</p>
					</div>
				</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>
			</div>

			{/* Main Content Grid */}
			<div className="relative z-10">
				<Grid8Col>
					{/* Search and Filter Section - 2 columns, spans all rows */}
					<GridCell colSpan={8} lgColSpan={2} lgRowSpan="full">
							<div className="sticky top-16 z-20">
								<GridCard
									enableHoverEffect
									enableSpotlight
									className="p-6 space-y-6 min-h-[calc(100vh-64px)] flex flex-col justify-between"
								>
								<div>
									{/* Search Input */}
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="text"
											placeholder="Search..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 pr-10"
										/>
										{searchQuery && (
											<button
												type="button"
												onClick={() => setSearchQuery("")}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												<X className="h-4 w-4" />
											</button>
										)}
									</div>

									{/* Filter Tags */}
									<div className="space-y-3">
										<div className="flex items-center justify-between min-h-8">
											<Button
												variant="ghost"
												size="sm"
												onClick={clearFilters}
												className={`h-6 text-xs transition-opacity select-none ${
													searchQuery || selectedTags.length > 0
														? "opacity-100"
														: "opacity-0 pointer-events-none"
												}`}
											>
												Clear
											</Button>
										</div>
										<div className="flex flex-wrap gap-1.5">
											{allTags.map((tag) => {
												const isSelected = selectedTags.includes(tag);
												return (
													<Badge
														key={tag}
														variant={isSelected ? "primary" : "secondary"}
														appearance={isSelected ? "default" : "light"}
														size="sm"
														className={cn(
															"cursor-pointer select-none transition-all",
															!isSelected && "hover:border-primary/30 hover:bg-primary/20 hover:text-primary"
														)}
														onClick={() => toggleTag(tag)}
													>
														{tag}
													</Badge>
												);
											})}
										</div>
									</div>
								</div>

								{/* Results count */}
								<div className="text-xs text-muted-foreground select-none">
									Showing {filteredCount}/{totalQuestions} answers
								</div>
							</GridCard>
						</div>
					</GridCell>

					{/* FAQ Sections - 6 columns */}
					<GridCell colSpan={8} lgColSpan={6}>
						<div>
							{faqSections.map((section, sectionIndex) => {
								const matchingFaqsCount = section.faqs.filter((faq) =>
									faqMatchesFilters(faq)
								).length;
								const hasAnyMatch = matchingFaqsCount > 0;

								return (
									<div key={sectionIndex} className="grid grid-cols-subgrid lg:grid-cols-6 gap-x-px gap-y-px">
										{/* Section Label - 2 columns */}
										<div className="col-span-8 lg:col-span-2 flex flex-col">
											<GridCard
												enableHoverEffect
												enableSpotlight
												className={`h-full p-0 transition-opacity duration-300 ${
													!hasAnyMatch && (searchQuery || selectedTags.length > 0)
														? "opacity-30"
														: "opacity-100"
												}`}
											>
												<div className="sticky top-16 z-10 p-6 flex flex-col justify-start">
													<h2 className="font-semibold text-foreground text-lg md:text-xl">
														{section.section}
													</h2>
													<p className="text-xs text-muted-foreground mt-2">
														{searchQuery || selectedTags.length > 0
															? `${matchingFaqsCount}/${section.faqs.length}`
															: section.faqs.length}{" "}
														{section.faqs.length === 1 ? "question" : "questions"}
													</p>
												</div>
											</GridCard>
										</div>

										{/* Questions Accordion - 4 columns */}
										<div className="col-span-8 lg:col-span-4">
											<GridCard
												enableHoverEffect
												enableSpotlight
												className={`p-6 transition-opacity duration-300 ${
													!hasAnyMatch && (searchQuery || selectedTags.length > 0)
														? "opacity-30"
														: "opacity-100"
												}`}
											>
												<Accordion type="single" collapsible className="w-full">
													{section.faqs.map((faq, faqIndex) => {
														const matches = faqMatchesFilters(faq);
														return (
															<AccordionItem
																key={faqIndex}
																value={`${sectionIndex}-${faqIndex}`}
																className={`transition-opacity duration-300 ${
																	!matches && (searchQuery || selectedTags.length > 0)
																		? "opacity-30"
																		: "opacity-100"
																}`}
															>
																<AccordionTrigger className="text-left font-medium text-muted-foreground text-sm md:text-base hover:no-underline hover:text-accent-foreground transition-colors">
																	{faq.question}
																</AccordionTrigger>
																<AccordionContent className="space-y-4">
																	<p className="font-light text-muted-foreground text-xs leading-relaxed md:text-sm">
																		{faq.answer}
																	</p>
																	{faq.docLink && (
																		<Button
																			asChild
																			variant="outline"
																			size="sm"
																			className="rounded-full"
																		>
																			<Link href={`${getDocsUrl()}${faq.docLink.href}`}>
																				{faq.docLink.label}
																				<ExternalLink className="h-3 w-3" />
																			</Link>
																		</Button>
																	)}
																	<div className="flex flex-wrap gap-1.5 pt-2">
																		{faq.tags.map((tag) => (
																			<Badge
																				key={tag}
																				variant="secondary"
																				appearance="light"
																				size="xs"
																				className="cursor-pointer select-none"
																				onClick={() => toggleTag(tag)}
																			>
																				{tag}
																			</Badge>
								))}
							</div>
																</AccordionContent>
															</AccordionItem>
														);
													})}
											</Accordion>
										</GridCard>
									</div>
								</div>
							);
						})}
						</div>
					</GridCell>
				</Grid8Col>
			</div>

			{/* CTA Section */}
			<CTASection />
		</>
	);
}
