"use client";

import React from "react";
import { Button } from "@recurse/ui/components";
import {
	ArrowRight,
	Brain,
	GitGraph,
	Layers,
	Network,
	Search,
	Clock,
} from "lucide-react";
import Link from "next/link";
import AnimatedContent from "@/components/animations/AnimatedContent/AnimatedContent";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { DocsLinkButton } from "@/components/common/DocsLinkButton";
import { SignupForm } from "@/components/forms/SignupForm";
import { FlushCard } from "@/components/layout/FlushCard";
import { IntroCard } from "@/components/layout/IntroCard";
import { IntroCardContent } from "@/components/layout/IntroCardContent";
import { TextCard } from "@/components/layout/TextCard";
import { MagicBentoGrid } from "@/components/layout/MagicBentoGrid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { homepageContent } from "@/content/homepage";

export default function HomePage() {
	return (
		<>
			{/* Hero Section - Combined Content */}
			<div className="relative z-10 space-y-24 md:space-y-32">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
						gridColumns={4}
					>
						{/* Hero Card 1 - Headline, subheadline, and buttons (full width) */}
						<div
							className="magic-bento-card magic-bento-card--border-glow"
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="4"
							data-row-span="1"
							style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
						>
							<FlushCard className="h-full">
								<div className="space-y-8 py-8 text-center md:py-12 lg:py-16">
									<div className="space-y-4">
										<h1 className="font-medium text-2xl leading-tight tracking-tight md:text-4xl lg:text-6xl">
											{homepageContent.hero.headline}
										</h1>
										<p className="mx-auto max-w-3xl font-medium text-foreground text-lg leading-normal md:text-xl lg:text-2xl">
											{homepageContent.hero.subheadline}
										</p>
									</div>
									<div className="flex flex-wrap justify-center gap-4">
										<Button
											asChild
											className="group rounded-full px-4 py-3 font-medium text-base"
											size="default"
											variant="default"
										>
											<Link href="#signup">
												Sign up
												<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
											</Link>
										</Button>
										<DocsLinkButton variant="subtle">
											{homepageContent.hero.docsText}
										</DocsLinkButton>
									</div>
								</div>
							</FlushCard>
						</div>
					</MagicBentoGrid>

					{/* Second row - 3 column grid with 4 cards */}
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
						gridColumns={3}
					>
						{/* Card 1 - IntroCard "Not quite" (left, 2 rows) */}
						<IntroCard
							title={homepageContent.intro.title}
							text="Recurse is memory infrastructure for systems that actually understand."
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="1"
							data-row-span="2"
						/>

						{/* Card 2 - The problem (center top, 1 row) */}
						<div
							className="magic-bento-card magic-bento-card--border-glow"
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="1"
							data-row-span="1"
							style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
						>
							<FlushCard className="h-full">
								<p className="font-light text-sm text-muted-foreground leading-relaxed md:text-base">
									Most AI memory systems optimize for similarity—ask a question, get the most similar chunks back. But you can't discover connections you didn't know existed, can't stumble onto relevant context from unexpected sources, can't follow threads that diverge from your initial question. The infrastructure is optimized for retrieval, not exploration.
								</p>
							</FlushCard>
						</div>

						{/* Card 4 - Action statement (right, 2 rows) */}
						<div
							className="magic-bento-card magic-bento-card--border-glow"
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="1"
							data-row-span="2"
							style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
						>
							<FlushCard className="h-full">
								<p className="font-medium text-base text-foreground leading-relaxed md:text-lg lg:text-xl">
									Ingest unstructured content from anywhere, transform it into a living knowledge graph that AI (and you) can reason through and act on.
								</p>
							</FlushCard>
						</div>

						{/* Card 3 - Principles (center bottom, 1 row) */}
						<div
							className="magic-bento-card magic-bento-card--border-glow"
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="1"
							data-row-span="1"
							style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
						>
							<FlushCard className="h-full">
								<p className="font-light text-sm text-muted-foreground leading-relaxed md:text-base">
									{homepageContent.intro.text}
								</p>
							</FlushCard>
						</div>
					</MagicBentoGrid>
				</ScrollAnimation>

				{/* Core Capabilities Section - 5 column grid (Icon:2, Text:2, Table:1) */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
						gridColumns={5}
					>
						{homepageContent.coreCapabilities.capabilities.map(
							(capability, index) => (
								<>
									{/* Icon Card (2/5) */}
									<div
										key={`${index}-icon`}
										className="magic-bento-card magic-bento-card--border-glow"
										data-col-span="1"
										data-md-col-span="2"
										data-lg-col-span="2"
										data-row-span="1"
										style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
									>
										<FlushCard className="h-full">
											<div className="flex h-full items-center justify-center">
												{capability.icon && (
													<div className="rounded-md border border-accent/20 bg-accent/10 p-6">
														<capability.icon
															className="h-12 w-12 text-accent md:h-16 md:w-16 lg:h-20 lg:w-20"
															strokeWidth={1.5}
														/>
													</div>
												)}
											</div>
										</FlushCard>
									</div>

									{/* Text Card (2/5) */}
									<div
										key={`${index}-text`}
										className="magic-bento-card magic-bento-card--border-glow"
										data-col-span="1"
										data-md-col-span="2"
										data-lg-col-span="2"
										data-row-span="1"
										style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
									>
										<FlushCard className="h-full">
											<div className="space-y-3">
												<h3 className="font-medium text-lg md:text-xl">
													{capability.title}
												</h3>
												<p className="font-light text-muted-foreground text-sm leading-relaxed md:text-base">
													{capability.description}
												</p>
											</div>
										</FlushCard>
									</div>

									{/* Feature Table Card (1/5) */}
									<div
										key={`${index}-features`}
										className="magic-bento-card magic-bento-card--border-glow"
										data-col-span="1"
										data-md-col-span="2"
										data-lg-col-span="1"
										data-row-span="1"
										style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
									>
										<FlushCard className="h-full">
											{capability.features && capability.features.length > 0 && (
												<Table className="w-full">
													<TableBody>
														{capability.features.map((feature, idx) => (
															<TableRow key={idx}>
																<TableCell className="font-light text-muted-foreground text-xs leading-relaxed md:text-sm">
																	{feature}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											)}
										</FlushCard>
									</div>
								</>
							),
						)}
					</MagicBentoGrid>
				</ScrollAnimation>

				{/* What You Can Build Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
					>
						{/* Header - Large card 2x2 */}
						<IntroCard
							title={homepageContent.whatYouCanBuild.title}
							text={homepageContent.whatYouCanBuild.description}
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="2"
							data-row-span="2"
						/>

						{/* Build Items as Individual Cards - Small cards 1x1 */}
						{homepageContent.whatYouCanBuild.items.map((item, index) => (
							<div
								key={index}
								className="magic-bento-card magic-bento-card--border-glow"
								data-col-span="1"
								data-md-col-span="2"
								data-lg-col-span="1"
								data-row-span="1"
								style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
							>
								<FlushCard className="h-full">
									<div className="space-y-3">
										<h3 className="font-medium text-lg group-hover:text-primary">
											{item.what}
										</h3>
										<p className="font-light text-muted-foreground text-sm leading-relaxed">
											{item.description}
										</p>
									</div>
								</FlushCard>
							</div>
						))}
					</MagicBentoGrid>
				</ScrollAnimation>

				{/* Who This Is For Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
					>
						{/* Who This Is For Header - Large card 2x2 */}
						<IntroCard
							title={homepageContent.whoThisIsFor.title}
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="2"
							data-row-span="2"
						/>

						{/* Who This Is For Cards - Small cards 1x1 */}
						{homepageContent.whoThisIsFor.audiences.map((audience, index) => (
							<div
								key={index}
								className="magic-bento-card magic-bento-card--border-glow"
								data-col-span="1"
								data-md-col-span="2"
								data-lg-col-span="1"
								data-row-span="1"
								style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
							>
								<FlushCard className="h-full">
									<div className="space-y-4">
										{audience.icon && (
											<div className="flex items-center justify-start">
												<div className="rounded-md border border-accent/20 bg-accent/10 p-2">
													<audience.icon
														className="h-6 w-6 text-accent"
														strokeWidth={1.5}
													/>
												</div>
											</div>
										)}
										<div className="space-y-3">
											<h3 className="font-semibold text-foreground text-xl">
												{audience.title}
											</h3>
											<p className="text-muted-foreground leading-relaxed">
												{audience.description}
											</p>
										</div>
									</div>
								</FlushCard>
							</div>
						))}
					</MagicBentoGrid>
				</ScrollAnimation>

				{/* Comparison Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
					>
						{/* Comparison Card 1 - Headline and button (1/4) */}
						<IntroCard
							title={homepageContent.comparison.title}
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="1"
							data-row-span="1"
						>
							{homepageContent.comparison.detailedComparisonHref && (
								<Button
									asChild
									className="group rounded-full px-4 py-3 font-medium text-sm"
									size="default"
									variant="outline"
								>
									<Link href={homepageContent.comparison.detailedComparisonHref}>
										Detailed comparison
										<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
							)}
						</IntroCard>

						{/* Comparison Card 2 - Description text (1/4) */}
						<div
							className="magic-bento-card magic-bento-card--border-glow"
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="1"
							data-row-span="1"
							style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
						>
							<FlushCard className="h-full">
								<p className="font-light text-muted-foreground leading-relaxed">
									{homepageContent.comparison.description}
								</p>
							</FlushCard>
						</div>

						{/* Comparison Card 3 - Table (2/4) */}
						<div
							className="magic-bento-card magic-bento-card--border-glow"
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="2"
							data-row-span="1"
							style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
						>
						<FlushCard className="h-full">
							<Table className="w-full">
								<TableHeader>
									<TableRow>
										<TableHead>Feature</TableHead>
										<TableHead>Traditional RAG</TableHead>
										<TableHead>Graph RAG</TableHead>
										<TableHead>Recurse</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{homepageContent.comparison.rows.map((row, index) => (
										<TableRow key={index}>
											<TableCell className="font-medium">
												{row.feature}
											</TableCell>
											<TableCell className="font-light text-muted-foreground">
												{row.traditionalRAG}
											</TableCell>
											<TableCell className="font-light text-muted-foreground">
												{row.graphRAG}
											</TableCell>
											<TableCell className="font-medium">
												{row.recurse}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</FlushCard>
						</div>
					</MagicBentoGrid>
				</ScrollAnimation>
			</div>

			{/* Signup Form Section */}
			<div id="signup" className="relative z-10 py-16 md:py-24">
				<ScrollAnimation enableFadeOut={true} exitBlur={2} exitScale={0.99}>
					<AnimatedContent
						delay={0.2}
						direction="vertical"
						distance={60}
						duration={0.8}
					>
						<div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20">
							<SignupForm />
						</div>
					</AnimatedContent>
				</ScrollAnimation>
			</div>

			{/* Final CTA Section */}
			<CTASection />
		</>
	);
}
