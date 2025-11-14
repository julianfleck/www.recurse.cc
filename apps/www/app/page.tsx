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
import { MagicBentoGrid } from "@/components/layout/MagicBentoGrid";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { homepageContent } from "@/content/homepage";

export default function HomePage() {
	return (
		<>
			{/* Hero Section */}
			<ScrollAnimation
				enableFadeIn={true}
				enableFadeOut={true}
				exitBlur={12}
				exitScale={0.9}
			>
				<div className="relative z-10 mx-auto max-w-4xl pb-16">
					<div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
						<div className="mx-auto max-w-6xl text-left">
							<AnimatedContent
								blur={true}
								delay={0.3}
								direction="vertical"
								distance={80}
								duration={1.0}
								initialBlur={8}
							>
								<h1 className="mb-12 font-medium text-2xl leading-tight tracking-tight md:text-4xl lg:text-6xl">
									{homepageContent.hero.headline}
								</h1>
							</AnimatedContent>

							<AnimatedContent
								blur={true}
								delay={1.5}
								direction="vertical"
								distance={60}
								duration={0.8}
								initialBlur={6}
							>
								<div>
									<p className="mx-auto mb-2 max-w-5xl text-left font-medium text-foreground text-lg leading-normal md:text-2xl">
										{homepageContent.hero.subheadline}
									</p>
									<p className="mx-auto mb-12 max-w-5xl text-left font-light text-base text-muted-foreground leading-normal transition-colors duration-300 hover:text-foreground/80 md:text-2xl hyphens-auto">
										{homepageContent.hero.introText}
									</p>
									<div className="flex justify-start gap-4">
										<Button
											asChild
											className="group rounded-full px-4 py-3 font-medium text-base"
											size="default"
											variant="default"
										>
											<Link href={homepageContent.hero.learnMoreHref}>
												{homepageContent.hero.learnMoreText}
												<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
											</Link>
										</Button>
										<DocsLinkButton variant="subtle">
											{homepageContent.hero.docsText}
										</DocsLinkButton>
									</div>
								</div>
							</AnimatedContent>
						</div>
					</div>
				</div>
			</ScrollAnimation>

			{/* Main Content with Magic Bento Grid - Sections with Scroll Fade-in */}
			<div className="relative z-10 space-y-24 md:space-y-32">
				{/* Intro Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
					>
						{/* Title - Large card 2x2 */}
						<IntroCard
							title={homepageContent.intro.title}
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="2"
							data-row-span="2"
						/>

						{/* Intro paragraphs - Small cards 1x1 */}
						{homepageContent.intro.content
							.split("\n\n")
							.filter((p) => p.trim())
							.map((paragraph, index) => (
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
										<div className="text-left">
											<p className="font-light text-base text-muted-foreground leading-relaxed md:text-lg">
												{paragraph.trim()}
											</p>
										</div>
									</FlushCard>
								</div>
							))}
					</MagicBentoGrid>
				</ScrollAnimation>

				{/* Core Capabilities Section */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<MagicBentoGrid
						enableSpotlight={true}
						enableBorderGlow={true}
						enableStars={false}
						disableAnimations={false}
					>
						{/* Core Capabilities Header - Large card 2x2 */}
						<IntroCard
							title={homepageContent.coreCapabilities.title}
							text={homepageContent.coreCapabilities.description}
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="2"
							data-row-span="2"
						/>

						{/* Core Capabilities Cards - Small cards 1x1 */}
						{homepageContent.coreCapabilities.capabilities.map(
							(capability, index) => (
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
											{capability.icon && (
												<div className="flex items-center justify-start">
													<div className="rounded-md border border-accent/20 bg-accent/10 p-2">
														<capability.icon
															className="h-6 w-6 text-accent"
															strokeWidth={2}
														/>
													</div>
												</div>
											)}
											<div className="space-y-3">
												<h3 className="font-medium text-lg group-hover:text-primary">
													{capability.title}
												</h3>
												<p className="font-light text-muted-foreground text-sm leading-relaxed">
													{capability.description}
												</p>
												{capability.features &&
													capability.features.length > 0 && (
														<ul className="mt-4 space-y-2">
															{capability.features.map((feature, idx) => (
																<li
																	key={idx}
																	className="font-light text-muted-foreground text-sm"
																>
																	{feature}
																</li>
															))}
														</ul>
													)}
											</div>
										</div>
									</FlushCard>
								</div>
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
						{/* Comparison - Large card 2x2 */}
						<IntroCard
							title={homepageContent.comparison.title}
							data-col-span="1"
							data-md-col-span="2"
							data-lg-col-span="2"
							data-row-span="2"
						>
							<div className="max-w-full overflow-x-auto">
								<Table>
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
							</div>
							{homepageContent.comparison.detailedComparisonHref && (
								<div className="mt-6">
									<a
										href={homepageContent.comparison.detailedComparisonHref}
										className="font-medium text-primary text-sm hover:underline"
									>
										Detailed comparison →
									</a>
								</div>
							)}
						</IntroCard>
					</MagicBentoGrid>
				</ScrollAnimation>
			</div>

			{/* Signup Form Section */}
			<div className="relative z-10 py-16 md:py-24">
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
