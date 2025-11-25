"use client";

import { LinkButton } from "@recurse/ui/components";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { AnimatedGraphExample } from "@/components/examples/graphs/AnimatedGraphExample";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { homepageContent } from "@/content/homepage";
import { TextSwap } from "@/components/text-transitions/text-swap";
import { getDocsUrl } from "@/lib/utils";

export function Hero() {
	return (
		<div id="hero" className="relative z-10 group/hero pt-halfcol">
			{/* Hero Card */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col >
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<GridCard enableHoverEffect enableSpotlight className="px-1col py-1col lg:pl-2col lg:pr-2col">
							<div className="space-y-8 text-left">
								<div className="space-y-6">
									<div className="font-semibold text-2xl leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-[2.5rem] lg:max-w-xl h-40 overflow-hidden">
										<TextSwap
											texts={homepageContent.hero.headlines}
											interval={6000}
											durationMs={800}
										/>
									</div>
									<p className="text-base font-light text-muted-foreground md:text-lg">
										Recurse turns raw input into a living, semantically typed knowledge graph so you and your AI systems can
										explore, connect, and reason — not just retrieve.
									</p>
								</div>
								<div className="flex flex-wrap gap-4">
									<LinkButton href="/faq" variant="default">FAQ</LinkButton>
									<LinkButton href={`${getDocsUrl()}/introduction`} variant="subtle">{homepageContent.hero.docsText}</LinkButton>
								</div>
							</div>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</ScrollAnimation>

			{/* Example Graph Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col>
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between px-1col py-1col md:p-8">
							<p className="font-medium text-foreground text-xl leading-relaxed hyphens-auto">
								Recurse turns raw input into structured, actionable context
							</p>
							<p className="mt-3 font-light text-muted-foreground text-base leading-relaxed">
								Add any type of content and we transform it into a living, semantically typed knowledge graph that you (and
								your AI agents) can act on, reason through, and build on top of. <br className="hidden md:block" />
								<br className="hidden md:block" />
								<mark>Zero config needed.</mark> Change just one line of code to make your AI context-aware.
							</p>
						</GridCard>
					</GridCell>

					<GridCell colSpan={8} mdColSpan={8} lgColSpan={6}>
						<GridCard enableHoverEffect enableSpotlight>
							<AnimatedGraphExample className="rounded-none border-0 bg-background" showControls={false} showControlsOnHoverOnly={true} />
						</GridCard>
					</GridCell>
				</Grid8Col>
			</ScrollAnimation>
		</div>
	);
}

export function About() {
	return (
		<div id="about" className="relative z-10 group/about scroll-mt-[80px]">
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="">
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title="Yet Another AI Memory System?" enableSpotlight />
					</GridCell>

					<GridCell colSpan={8} mdColSpan={2} lgColSpan={2} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between px-1col py-1col md:p-8">
							<p className="font-light text-xl text-foreground md:text-2xl">
								Not quite.
								<br className="hidden md:block" /> It’s built a bit differently...
							</p>
							<p className="mt-3 font-light text-base text-foreground md:text-xl">
								Recurse is memory infrastructure for systems that actually <mark className=" underline-offset-6 text-foreground">understand</mark>.
							</p>
						</GridCard>
					</GridCell>

					<GridCell colSpan={8} mdColSpan={3} lgColSpan={3} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between px-1col py-1col md:p-8">
							<p className="font-light text-xl text-muted-foreground pb-8 leading-relaxed md:text-2xl">
								Most context management systems are optimized for retrieval, not exploration.
							</p>
							<p className="font-light text-base text-muted-foreground leading-relaxed md:text-lg">
								Ask a question, get back what looks most similar to your query. This works if you know what you're looking for.
								But it systematically prevents the kind of exploration that leads to genuine understanding and novel insights.
							</p>
						</GridCard>
					</GridCell>

					<GridCell colSpan={8} mdColSpan={3} lgColSpan={3} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between px-1col py-1col md:p-8 gap-8">
							<p className="font-light text-base text-foreground pb-8 leading-relaxed md:text-lg">
								Standard retrieval systems don't allow you to discover connections you didn't know existed, stumble onto relevant
								context from unexpected sources or follow threads that diverge from your initial question.
							</p>
							<p className="font-light text-base text-foreground leading-relaxed pr-8 md:text-xl">
								Recurse favors <mark>depth</mark> over similarity, <mark>relationships</mark> over rankings and <mark>evolution</mark> over
								static storage.
							</p>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</ScrollAnimation>
		</div>
	);
}

