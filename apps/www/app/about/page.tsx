import { Brain, GitGraph, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { Button } from "@recurse/ui/components";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";

export default function AboutPage() {
	return (
		<>
			{/* Hero Section */}
			<div className="relative z-10 space-y-24 md:space-y-32">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						{/* Hero Card - Full width */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="px-1col py-1col lg:px-2col">
								<div className="space-y-8 text-left">
									<h1 className="font-medium text-3xl leading-[1.15] tracking-tight md:text-5xl lg:text-6xl text-foreground">
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

				{/* The Problem Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="The Problem" enableSpotlight />
						</GridCell>

						{/* Main problem statement */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<p className="font-light text-base text-muted-foreground leading-relaxed">
									You spend hours building understanding with Claude. Then you switch to ChatGPT for a different task. All that context? Gone. You're explaining yourself from scratch again.
								</p>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<p className="font-light text-base text-muted-foreground leading-relaxed">
									This is inconvenient. And it's an architectural problem baked into current AI systems. Each provider treats memory as their feature, not your infrastructure. None of it transfers.
								</p>
							</GridCard>
						</GridCell>

						{/* Deeper issues */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={5}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										The Retrieval Trap
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Even if context were portable, most AI memory systems couldn't support genuine exploration. They're optimized for retrieval—find the most similar chunks, return them, generate an answer.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={3}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										What You Can't Do
									</h3>
									<ul className="space-y-2 font-light text-base text-muted-foreground leading-relaxed">
										<li>→ Discover unexpected connections</li>
										<li>→ Follow divergent threads</li>
										<li>→ Navigate by structure</li>
									</ul>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* How We Think About Knowledge Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="How We Think About Knowledge" enableSpotlight />
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={3}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Memory Chords
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Human memory doesn't work through similarity search. You follow associations—reconstructing context, playing memory chords that trigger related thoughts, navigating a web of connections.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={5}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Auto-Associative Networks
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Our minds are auto-associative. Information exists in rich networks of relationships: temporal connections (when?), spatial associations (where?), conceptual links (what else?), emotional context (how did I feel?).
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Evolving Models
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										You don't learn by filing facts into predefined categories. You build mental models that evolve: connecting new information, refining understanding, maintaining history.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										What We Need
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Infrastructure that creates dynamic connections, preserves context, enables navigation by relationship, and evolves with use. Not rigid hierarchies or similarity search.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* Our Approach: RAGE Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="Our Approach: RAGE" enableSpotlight />
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-6 md:p-8 lg:p-10">
								<p className="font-light text-base text-muted-foreground leading-relaxed md:text-lg">
									We built Recursive, Agentic Graph Embeddings (RAGE) to solve this. Not as a better RAG system. Not as another knowledge graph. As memory infrastructure that treats knowledge as living structure rather than static text.
								</p>
							</GridCard>
						</GridCell>

						{/* Three Core Principles */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col p-6 md:p-8">
								<div className="mb-4 flex items-center justify-start">
									<div className="rounded-md border border-accent/20 bg-accent/10 p-3">
										<Brain className="h-8 w-8 text-accent md:h-10 md:w-10" strokeWidth={1.5} />
									</div>
								</div>
								<div className="space-y-4">
									<h3 className="font-semibold text-foreground text-xl md:text-2xl">
										Recursive by Design
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Human cognition is recursive. We interpret ideas, abstract them into patterns, reuse them in new contexts, continuously refining our mental models. We navigate between different scales of abstraction: detailed technical knowledge in one moment, broad conceptual patterns in another, personal experiences in yet another.
									</p>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										RAGE models this explicitly. Frames nest inside frames, creating structures of arbitrary depth. An argument references evidence, that evidence was gathered using specific methods, those methods depend on theoretical assumptions, those assumptions connect back to other arguments. You can traverse down to examine details or move up to see broader context. Knowledge at multiple scales simultaneously.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col p-6 md:p-8">
								<div className="mb-4 flex items-center justify-start">
									<div className="rounded-md border border-accent/20 bg-accent/10 p-3">
										<GitGraph className="h-8 w-8 text-accent md:h-10 md:w-10" strokeWidth={1.5} />
									</div>
								</div>
								<div className="space-y-4">
									<h3 className="font-semibold text-foreground text-xl md:text-2xl">
										Agentic Memory
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Most knowledge graphs store passive information—nodes and edges representing facts that sit there. RAGE frames carry executable instructions that guide how agents navigate relationships, validate claims against evidence, and trace reasoning chains.
									</p>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										This transforms the knowledge graph from storage into substrate. A <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Claim</code> frame knows how to validate itself by checking its <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Evidence</code> slots and following connections to supporting <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Method</code> frames. A <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Decision</code> frame can trace back through the <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Discussion</code> and <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Constraint</code> frames that shaped it. The graph becomes infrastructure for reasoning, not just retrieval.
									</p>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Think Minsky's frames-with-slots, but each frame is executable—carrying both semantic structure and behavioral instructions for agents that traverse it.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col p-6 md:p-8">
								<div className="mb-4 flex items-center justify-start">
									<div className="rounded-md border border-accent/20 bg-accent/10 p-3">
										<Layers className="h-8 w-8 text-accent md:h-10 md:w-10" strokeWidth={1.5} />
									</div>
								</div>
								<div className="space-y-4">
									<h3 className="font-semibold text-foreground text-xl md:text-2xl">
										Living Structure
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										You accumulate understanding over time. Your knowledge base should too—updating with new information while preserving evolution history, tracking how understanding changed and why.
									</p>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										When new content arrives, RAGE doesn't just add it or delete old information. It identifies related frames, recognizes updates, and rewrites understanding while maintaining links to previous versions. Timestamps show when changes happened. Diffs show what changed. Explanations capture why the update occurred. You can query current knowledge or trace how understanding evolved over months.
									</p>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										This mirrors how we learn: not by replacing mental models entirely, but by refining them while preserving the context of previous understanding.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* The Vision Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="The Vision" enableSpotlight />
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={3}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Today
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										You use Recurse to make your knowledge portable. Upload documents once, query from anywhere. Route requests through our proxy, get automatic context injection with any AI provider.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={5}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Tomorrow
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										This becomes universal memory infrastructure. Your knowledge graph follows you across AI systems. Experts share structured understanding through Context Streams. Teams build shared knowledge substrates where decisions link to discussions, claims connect to evidence.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Eventually
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										Systems that accumulate understanding, navigate complex relationships, and build on what came before. That support inquiry, not just question-answering. That enable discovery, not just retrieval.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										The Foundation
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										The infrastructure already works. The mechanisms exist. What we're building is the foundation for how humans and AI work together as understanding accumulates instead of resets.
									</p>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* Who's Building This Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="Who's Building This" enableSpotlight />
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={5}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										<a
											href="https://julianfleck.net"
											className="text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
											target="_blank"
											rel="noopener noreferrer"
										>
											Julian Fleck
										</a>
									</h3>
									<p className="font-light text-base text-muted-foreground leading-relaxed">
										A designer and researcher who's spent years exploring interface paradigms for navigating complex information spaces.
									</p>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={3}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-4">
									<h3 className="font-medium text-lg text-foreground">
										Research Areas
									</h3>
									<ul className="space-y-2 font-light text-base text-muted-foreground leading-relaxed">
										<li>→ Spatial knowledge interfaces</li>
										<li>→ Embodied cognition</li>
										<li>→ Frame-based semantics</li>
										<li>→ Auto-associative systems</li>
									</ul>
								</div>
							</GridCard>
						</GridCell>

						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard enableHoverEffect enableSpotlight className="p-4 md:p-6">
								<p className="font-light text-base text-muted-foreground leading-relaxed">
									Recurse is the practical implementation of ideas developed across projects like auto-associative workspaces, divergence engines, and cognitive cartography—years of research on how knowledge systems can better support human cognition and collaborative understanding.
								</p>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

				{/* Read More Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="Read More" enableSpotlight />
						</GridCell>

						<GridCell colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard href="https://docs.recurse.cc/docs/concepts/rage" enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
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
							<GridCard href="https://docs.recurse.cc/docs/concepts" enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
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
}
