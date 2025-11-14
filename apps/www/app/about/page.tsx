import { Brain, GitGraph, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedContent from "@/components/animations/AnimatedContent/AnimatedContent";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { FeatureCard } from "@/components/layout/FeatureCard";
import { Button } from "@recurse/ui/components";
import {
	GridCell,
	GridLayout,
	SingleColumnSection,
	ThreeColumnSection,
} from "@/components/layout/GridLayout";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function AboutPage() {
	return (
		<>
			{/* Header Section - Above Grid */}
			<div className="relative z-10 mx-auto max-w-4xl pb-16">
				<div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
					<div className="mx-auto max-w-6xl text-left">
						<h1 className="mb-8 font-medium text-3xl leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
							Why Recurse Exists
						</h1>
						<p className="mx-auto mb-8 max-w-4xl font-light text-muted-foreground text-xl leading-relaxed md:text-2xl">
							AI promised to amplify human intelligence. Instead, we got vendor lock-in and context amnesia.
						</p>
						<p className="mx-auto mb-12 max-w-4xl font-light text-muted-foreground text-xl leading-relaxed md:text-2xl">
							Every conversation starts from zero. Every insight lives in a walled garden. Your accumulated understanding? Trapped in whatever AI you happened to use that day.
						</p>
					</div>
				</div>
			</div>

			{/* Main Content with Grid Layout */}
			<ScrollAnimation enableFadeOut={true} exitBlur={6} exitScale={0.98}>
				<div className="relative z-10">
					<AnimatedContent
						blur={true}
						delay={0.3}
						direction="vertical"
						distance={60}
						duration={0.8}
						initialBlur={4}
					>
						<GridLayout maxWidth="lg">
							{/* The Problem */}
							<SingleColumnSection>
								<div className="mx-auto max-w-4xl text-left">
									<h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
										The Universal Memory Layer Is Missing
									</h2>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										You spend hours building understanding with Claude. Then you switch to ChatGPT for a different task. All that context? Gone. You're explaining yourself again from scratch.
									</p>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										This isn't just inconvenient—it's architectural. Current AI systems treat memory as a feature, not infrastructure. Each provider builds their own context management. None of it transfers. Your intellectual work stays locked to whoever you happened to talk to that day.
									</p>
									<p className="font-light text-lg text-muted-foreground leading-relaxed">
										Meanwhile, the actual knowledge you're building—the connections, the understanding, the accumulated insights—lives nowhere. It exists only as conversation history in various corporate databases. You can't explore it. You can't build on it. You certainly can't own it.
									</p>
								</div>
							</SingleColumnSection>

							{/* What We Believe */}
							<SingleColumnSection>
								<div className="mx-auto max-w-4xl text-left">
									<h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
										What We Believe
									</h2>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										Memory shouldn't belong to AI providers. It should be infrastructure you control—portable across any AI system, queryable by any agent, owned by you.
									</p>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										Intelligence isn't just pattern matching on text chunks. It's understanding how ideas connect, how arguments develop, how knowledge evolves over time. That requires structure, not just similarity scores.
									</p>
									<p className="font-light text-lg text-muted-foreground leading-relaxed">
										True AI collaboration happens when systems can build on accumulated understanding rather than starting from zero every time. When they can navigate relationships between concepts rather than just retrieving similar text. When your intellectual work compounds instead of fragmenting across vendors.
									</p>
								</div>
							</SingleColumnSection>

							{/* Our Approach */}
							<SingleColumnSection>
								<div className="mx-auto max-w-4xl text-left">
									<h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
										Our Approach: RAGE
									</h2>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										We built Recursive, Agentic Graph Embeddings (RAGE) to solve this. Not as a better RAG system. Not as another knowledge graph. As universal memory infrastructure that treats knowledge as living structure rather than static text.
									</p>
								</div>
							</SingleColumnSection>

							{/* Three Core Principles */}
							<ThreeColumnSection>
								<GridCell>
									<FeatureCard
										description="Human cognition isn't linear—it's recursive. We interpret ideas, abstract them into summaries, reuse them in new contexts, continuously refining our mental models. RAGE models this explicitly."
										icon={Brain}
										iconStrokeWidth={1.5}
										title="Recursive by Design"
									/>
								</GridCell>

								<GridCell>
									<FeatureCard
										description="Knowledge graphs shouldn't be passive storage. RAGE frames carry executable instructions—guiding agents through relationships, validating claims against evidence, tracing decisions back to constraints."
										icon={GitGraph}
										iconStrokeWidth={1.5}
										title="Agentic Memory"
									/>
								</GridCell>

								<GridCell>
									<FeatureCard
										description="You accumulate understanding over time. Your knowledge base should too—updating with new information while preserving evolution history, tracking how understanding changed and why."
										icon={Layers}
										iconStrokeWidth={1.5}
										title="Living Structure"
									/>
								</GridCell>
							</ThreeColumnSection>

							{/* The Vision */}
							<SingleColumnSection>
								<div className="mx-auto max-w-4xl text-left">
									<h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
										The Long-Term Vision
									</h2>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										Today, you use Recurse to make your knowledge portable. Upload documents once, query from anywhere. Route requests through our proxy, get automatic context injection with any AI provider.
									</p>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										Tomorrow, this becomes universal memory infrastructure. Your knowledge graph follows you across AI systems. Experts share structured understanding through Context Streams—subscribe to domain expertise maintained by people you trust. Teams build shared knowledge substrates where decisions link to discussions, claims connect to evidence, understanding evolves collaboratively.
									</p>
									<p className="mb-6 font-light text-lg text-muted-foreground leading-relaxed">
										Eventually, this enables genuine AI collaboration. Not autocomplete that forgets. Not chatbots that restart every conversation. But systems that accumulate understanding, navigate complex relationships, build on what came before. Intellectual partners, not corporate assistants.
									</p>
									<p className="font-light text-lg text-muted-foreground leading-relaxed">
										The infrastructure already works. The mechanisms exist. The path forward is clear. What we're building isn't just better memory—it's the foundation for how humans and AI will work together as knowledge compounds instead of fragments.
									</p>
								</div>
							</SingleColumnSection>

							{/* CTA to Technical Deep Dive */}
							<SingleColumnSection>
								<div className="mx-auto max-w-4xl text-center">
									<h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
										Want the Technical Details?
									</h2>
									<p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
										Explore how RAGE works under the hood—frame semantics, recursive graphs, adaptive schemas, and how it all fits together.
									</p>
									<div className="flex justify-center gap-4">
										<Button asChild size="lg" variant="default">
											<Link href="https://docs.recurse.cc/docs/concepts/rage">
												Read the Technical Docs
												<ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
										<Button asChild size="lg" variant="outline">
											<Link href="https://docs.recurse.cc/docs/introduction">
												View All Concepts
											</Link>
										</Button>
									</div>
								</div>
							</SingleColumnSection>
						</GridLayout>
					</AnimatedContent>
				</div>
			</ScrollAnimation>

			{/* CTA Section */}
			<CTASection />
		</>
	);
}
