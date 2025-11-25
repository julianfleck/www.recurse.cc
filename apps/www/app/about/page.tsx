"use client";

import { useEffect } from "react";
import { Brain, GitGraph, Layers } from "lucide-react";
import React from "react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";

/**
 * About page - redirects to homepage anchor
 * Content preserved below but not displayed (returns early)
 */
export default function AboutPage() {
	useEffect(() => {
		// Redirect to homepage with anchor
		window.location.href = "/#about";
	}, []);

	// Return early - content preserved below but not rendered
	return null;

	// Original content preserved but not displayed:
	/* eslint-disable */
	return (
		<>
			{/* Hero Section */}
			<div className="relative z-10 space-y-24 md:space-y-32">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="px-1col py-1col lg:px-2col">
								<div className="space-y-8">
									<h1 className="font-medium text-3xl leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
										Why Recurse Exists
									</h1>
									<p className="max-w-4xl text-muted-foreground text-lg leading-relaxed md:text-xl lg:text-2xl">
										AI promised to amplify human intelligence. Instead, we got systems that forget, fragment understanding across vendors, and reduce knowledge work to similarity search. Recurse is infrastructure for a different approach—one that mirrors how we actually think.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* The Problem */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<HeaderCard title="The Problem" enableSpotlight />
						</GridCell>
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="prose prose-lg max-w-none dark:prose-invert">
									<p>
										You spend hours building understanding with Claude. Then you switch to ChatGPT for a different task. All that context? Gone. You're explaining yourself from scratch again.
									</p>
									<p>
										This is inconvenient. And it's an architectural problem baked into current AI systems. Each provider treats memory as their feature, not your infrastructure. None of it transfers. Your intellectual work stays locked to whoever you happened to talk to that day.
									</p>
									<p>
										But there's something deeper. Even if context were portable, most AI memory systems couldn't support genuine exploration. They're optimized for retrieval—find the most similar chunks, return them, generate an answer. If you know what you're looking for, this works. But it systematically prevents the kind of exploration that leads to breakthrough insights.
									</p>
									<p>
										You can't discover connections you didn't know existed. Can't follow threads that diverge from your initial query. Can't navigate knowledge by structure and relationship—only by keyword similarity. The infrastructure optimizes for answering questions, not exploring domains.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* How We Think About Knowledge */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<HeaderCard title="How We Think About Knowledge" enableSpotlight />
						</GridCell>
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="prose prose-lg max-w-none dark:prose-invert">
									<p>
										Human memory doesn't work through similarity search. When you try to remember something, you don't scan through a mental database of text chunks. You follow associations—reconstructing context, playing memory chords that trigger related thoughts, navigating a web of connections until you find what you're looking for.
									</p>
									<p>
										Our minds are auto-associative. Information doesn't live in isolated categories. It exists in rich networks of relationships: temporal connections (when did I learn this?), spatial associations (where was I?), conceptual links (what else relates to this?), emotional context (how did I feel about it?). We think in movements between these connections, shifting fluidly between different levels of abstraction.
									</p>
									<p>
										This is fundamental to how understanding develops. You don't learn by filing facts into predefined categories. You learn by building mental models that evolve over time: connecting new information to existing knowledge, refining understanding as you encounter contradictions, maintaining history of how your thinking changed.
									</p>
									<p>
										Knowledge work should be supported by systems that mirror this process. Not rigid hierarchies that force multi-dimensional relationships into linear structures. Not similarity search that collapses exploration into retrieval. Infrastructure that creates dynamic connections, preserves context, enables navigation by relationship, and evolves with use.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* Our Approach: RAGE */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<HeaderCard title="Our Approach: RAGE" enableSpotlight />
						</GridCell>
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<p className="prose prose-lg max-w-none dark:prose-invert">
									We built Recursive, Agentic Graph Embeddings (RAGE) to solve this. Not as a better RAG system. Not as another knowledge graph. As memory infrastructure that treats knowledge as living structure rather than static text.
								</p>
							</GridCard>
						</GridCell>

						{/* Recursive by Design */}
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="flex items-start gap-6">
									<div className="shrink-0 rounded-md border border-accent/20 bg-accent/10 p-3">
										<Brain className="h-10 w-10 text-accent md:h-12 md:w-12" strokeWidth={1.5} />
									</div>
									<div className="prose prose-lg max-w-none dark:prose-invert">
										<h3 className="mt-0 font-semibold text-foreground text-xl md:text-2xl">
											Recursive by Design
										</h3>
										<p>
											Human cognition is recursive. We interpret ideas, abstract them into patterns, reuse them in new contexts, continuously refining our mental models. We navigate between different scales of abstraction: detailed technical knowledge in one moment, broad conceptual patterns in another, personal experiences in yet another.
										</p>
										<p>
											RAGE models this explicitly. Frames nest inside frames, creating structures of arbitrary depth. An argument references evidence, that evidence was gathered using specific methods, those methods depend on theoretical assumptions, those assumptions connect back to other arguments. You can traverse down to examine details or move up to see broader context. Knowledge at multiple scales simultaneously.
										</p>
									</div>
								</div>
							</GridCard>
						</GridCell>

						{/* Agentic Memory */}
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="flex items-start gap-6">
									<div className="shrink-0 rounded-md border border-accent/20 bg-accent/10 p-3">
										<GitGraph className="h-10 w-10 text-accent md:h-12 md:w-12" strokeWidth={1.5} />
									</div>
									<div className="prose prose-lg max-w-none dark:prose-invert">
										<h3 className="mt-0 font-semibold text-foreground text-xl md:text-2xl">
											Agentic Memory
										</h3>
										<p>
											Most knowledge graphs store passive information—nodes and edges representing facts that sit there. RAGE frames carry executable instructions that guide how agents navigate relationships, validate claims against evidence, and trace reasoning chains.
										</p>
										<p>
											This transforms the knowledge graph from storage into substrate. A <code>Claim</code> frame knows how to validate itself by checking its <code>Evidence</code> slots and following connections to supporting <code>Method</code> frames. A <code>Decision</code> frame can trace back through the <code>Discussion</code> and <code>Constraint</code> frames that shaped it. The graph becomes infrastructure for reasoning, not just retrieval.
										</p>
										<p>
											Think Minsky's frames-with-slots, but each frame is executable—carrying both semantic structure and behavioral instructions for agents that traverse it.
										</p>
									</div>
								</div>
							</GridCard>
						</GridCell>

						{/* Living Structure */}
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="flex items-start gap-6">
									<div className="shrink-0 rounded-md border border-accent/20 bg-accent/10 p-3">
										<Layers className="h-10 w-10 text-accent md:h-12 md:w-12" strokeWidth={1.5} />
									</div>
									<div className="prose prose-lg max-w-none dark:prose-invert">
										<h3 className="mt-0 font-semibold text-foreground text-xl md:text-2xl">
											Living Structure
										</h3>
										<p>
											You accumulate understanding over time. Your knowledge base should too—updating with new information while preserving evolution history, tracking how understanding changed and why.
										</p>
										<p>
											When new content arrives, RAGE doesn't just add it or delete old information. It identifies related frames, recognizes updates, and rewrites understanding while maintaining links to previous versions. Timestamps show when changes happened. Diffs show what changed. Explanations capture why the update occurred. You can query current knowledge or trace how understanding evolved over months.
										</p>
										<p>
											This mirrors how we learn: not by replacing mental models entirely, but by refining them while preserving the context of previous understanding.
										</p>
									</div>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* The Vision */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<HeaderCard title="The Vision" enableSpotlight />
						</GridCell>
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="prose prose-lg max-w-none dark:prose-invert">
									<p>
										Today, you use Recurse to make your knowledge portable. Upload documents once, query from anywhere. Route requests through our proxy, get automatic context injection with any AI provider. Your intellectual work isn't locked to specific vendors—it's infrastructure you control.
									</p>
									<p>
										Tomorrow, this becomes universal memory infrastructure. Your knowledge graph follows you across AI systems. Experts share structured understanding through Context Streams—subscribe to domain expertise maintained by people you trust. Teams build shared knowledge substrates where decisions link to discussions, claims connect to evidence, understanding evolves collaboratively.
									</p>
									<p>
										Eventually, this enables genuine AI collaboration. Not autocomplete that forgets. Not chatbots that restart every conversation. Systems that accumulate understanding, navigate complex relationships, and build on what came before. Systems that support inquiry, not just question-answering. That enable discovery, not just retrieval. That compound knowledge instead of fragmenting it across vendors.
									</p>
									<p>
										The infrastructure already works. The mechanisms exist. What we're building is the foundation for how humans and AI work together as understanding accumulates instead of resets.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* Who's Building This */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<HeaderCard title="Who's Building This" enableSpotlight />
						</GridCell>
						<GridCell colSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8">
								<div className="prose prose-lg max-w-none dark:prose-invert">
									<p>
										Recurse is built by{" "}
										<a
											href="https://julianfleck.net"
											className="font-medium text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
											target="_blank"
											rel="noopener noreferrer"
										>
											Julian Fleck
										</a>
										, a designer and researcher who's spent years exploring interface paradigms for navigating complex information spaces.
									</p>
									<p>
										The work spans spatial knowledge interfaces (Metasphere, Trails), embodied cognition in digital environments, frame-based semantics, and systems that mirror how we actually think rather than forcing us into rigid structures.
									</p>
									<p>
										Recurse is the practical implementation of ideas developed across projects like auto-associative workspaces, divergence engines, and cognitive cartography—years of research on how knowledge systems can better support human cognition and collaborative understanding.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* Read More */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8}>
							<HeaderCard title="Read More" enableSpotlight />
						</GridCell>
						<GridCell colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard href="https://docs.recurse.cc/concepts/rage" enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-3">
									<h3 className="font-medium text-lg">
										Technical Documentation
									</h3>
									<p className="font-light text-muted-foreground text-sm leading-relaxed">
										Understand how RAGE works
									</p>
								</div>
							</GridCard>
						</GridCell>
						<GridCell colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard href="https://docs.recurse.cc/concepts" enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-3">
									<h3 className="font-medium text-lg">
										Core Concepts
									</h3>
									<p className="font-light text-muted-foreground text-sm leading-relaxed">
										Frames, schemas, temporal versioning
									</p>
								</div>
							</GridCard>
						</GridCell>
						<GridCell colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard href="https://julianfleck.net/articles/divergence-engines" enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-3">
									<h3 className="font-medium text-lg">
										Divergence Engines
									</h3>
									<p className="font-light text-muted-foreground text-sm leading-relaxed">
										Why exploration matters
									</p>
								</div>
							</GridCard>
						</GridCell>
						<GridCell colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard href="https://julianfleck.net/concepts/auto-associative-workspaces" enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-3">
									<h3 className="font-medium text-lg">
										Auto-Associative Workspaces
									</h3>
									<p className="font-light text-muted-foreground text-sm leading-relaxed">
										Mirroring human memory
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>
			</div>

			{/* CTA Section */}
			<CTASection />
		</>
	);
	/* eslint-enable */
}
