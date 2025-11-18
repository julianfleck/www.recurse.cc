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
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { homepageContent } from "@/content/homepage";

export default function HomePage() {
	return (
		<>
			{/* Hero Section - Combined Content */}
			<div className="relative z-10 space-y-24 md:space-y-32">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="py-12">
						{/* Hero Card - Full width (8 columns) at all breakpoints */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard 
								enableHoverEffect 
								enableSpotlight
								className="px-1col py-1col lg:px-2col"
							>
								<div className="space-y-8 text-left">
									<div className="space-y-8">
										<h1 className="font-semibold text-2xl leading-[1.15]! tracking-tight md:text-4xl lg:text-5xl text-accent-foreground">
											{homepageContent.hero.headline}
										</h1>
										<p className="max-w-4xl text-muted-foreground text-lg leading-normal md:text-xl lg:text-2xl">
											{homepageContent.hero.subheadline}
										</p>
									</div>
									<div className="flex flex-wrap gap-4">
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
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>

			{/* About Section - Simple 8 column grid */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="py-12">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title="About" enableSpotlight />
					</GridCell>

					{/* Card 1 - Mobile: full width (8/8), Tablet: 2/8, Desktop: 2/8 columns */}
					<GridCell colSpan={8} mdColSpan={2} lgColSpan={2} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
							<h2 className="font-light text-xl md:text-2xl lg:text-2xl text-foreground">
								Yet Another AI Memory System?
							</h2>
							<p className="font-light text-xl md:text-2xl lg:text-2xl text-muted-foreground">
								Not quite.
							</p>
						</GridCard>
					</GridCell>

					{/* Card 2 - Mobile: full width (8/8), Tablet: 3/8, Desktop: 3/8 columns */}
					<GridCell colSpan={8} mdColSpan={3} lgColSpan={3} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
							<p className="font-light text-md text-foreground pb-8 leading-relaxed">
								Most AI memory systems optimize for one thing: similarity. Ask a question, get the most similar chunks back. This works if you know what you're looking for. But it systematically prevents the kind of exploration that leads to genuine understanding.
							</p>
							<p className="font-light text-md text-muted-foreground leading-relaxed">
								You can't discover connections you didn't know existed. Can't stumble onto relevant context from unexpected sources. Can't follow threads that diverge from your initial question. The infrastructure is optimized for retrieval, not exploration.
							</p>
						</GridCard>
					</GridCell>

					{/* Card 3 - Mobile: full width (8/8), Tablet: 3/8, Desktop: 3/8 columns */}
					<GridCell colSpan={8} mdColSpan={3} lgColSpan={3} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
							<p className="font-light text-xl md:text-2xl lg:text-2xl text-muted-foreground">
								Recurse is memory infrastructure for systems that actually understand.
							</p>
							<p className="font-light text-base md:text-xl lg:text-xl text-foreground">
								We are building on different principles: structure over similarity, relationships over rankings, evolution over static storage.
							</p>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</ScrollAnimation>

			{/* Core Capabilities Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="py-12">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title="Core Capabilities" enableSpotlight />
					</GridCell>

					{homepageContent.coreCapabilities.capabilities.map(
						(capability, index) => (
							<React.Fragment key={index}>
								{/* Icon Card - Mobile: 8/8, Tablet: 2/8, Desktop: 2/8 */}
								<GridCell colSpan={8} mdColSpan={2} lgColSpan={2}>
									<GridCard enableHoverEffect enableSpotlight className="flex h-full items-center justify-center p-6 md:p-8">
										{capability.icon && (
											<div className="rounded-md border border-accent/20 bg-accent/10 p-6">
												<capability.icon
													className="h-12 w-12 text-accent md:h-16 md:w-16 lg:h-20 lg:w-20"
													strokeWidth={1.5}
												/>
											</div>
										)}
									</GridCard>
								</GridCell>

								{/* Text Card - Mobile: 8/8, Tablet: 4/8, Desktop: 4/8 */}
								<GridCell colSpan={8} mdColSpan={4} lgColSpan={4}>
									<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-center p-4 md:p-6">
										<div className="space-y-3">
											<h3 className="font-medium text-lg md:text-xl">
												{capability.title}
											</h3>
											<p className="font-light text-muted-foreground text-sm leading-relaxed md:text-base">
												{capability.description}
											</p>
										</div>
									</GridCard>
								</GridCell>

								{/* Feature Table Card - Mobile: 8/8, Tablet: 2/8, Desktop: 2/8 */}
								<GridCell colSpan={8} mdColSpan={2} lgColSpan={2}>
									<GridCard enableHoverEffect enableSpotlight className="h-full p-4 md:p-6">
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
									</GridCard>
								</GridCell>
							</React.Fragment>
						),
					)}
				</Grid8Col>
			</ScrollAnimation>

			{/* What You Can Build Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="py-12">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title={homepageContent.whatYouCanBuild.title} enableSpotlight />
					</GridCell>

					{/* Build Items as Individual Cards - Mobile: 8/8, Tablet: 4/8, Desktop: 2/8 */}
					{homepageContent.whatYouCanBuild.items.map((item, index) => (
						<GridCell key={index} colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<div className="space-y-3">
									<h3 className="font-medium text-lg">
										{item.what}
									</h3>
									<p className="font-light text-muted-foreground text-sm leading-relaxed">
										{item.description}
									</p>
								</div>
							</GridCard>
						</GridCell>
					))}
				</Grid8Col>
			</ScrollAnimation>

			{/* Who This Is For Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="py-12">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title={homepageContent.whoThisIsFor.title} enableSpotlight />
					</GridCell>

					{/* Who This Is For Cards - Mobile: 8/8, Tablet: 4/8, Desktop: 2/8 */}
					{homepageContent.whoThisIsFor.audiences.map((audience, index) => (
						<GridCell key={index} colSpan={8} mdColSpan={4} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col p-4 md:p-6">
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
							</GridCard>
						</GridCell>
					))}
				</Grid8Col>
			</ScrollAnimation>

			{/* Comparison Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="py-12">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title={homepageContent.comparison.title} enableSpotlight>
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
						</HeaderCard>
					</GridCell>

					{/* Description Card - Mobile: 8/8, Tablet: 8/8, Desktop: 2/8 */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full items-center p-4 md:p-6">
							<p className="font-light text-muted-foreground leading-relaxed">
								{homepageContent.comparison.description}
							</p>
						</GridCard>
					</GridCell>

					{/* Comparison Table - Mobile: 8/8, Tablet: 8/8, Desktop: 6/8 */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={6}>
						<GridCard enableHoverEffect enableSpotlight className="h-full p-4 md:p-6">
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
						</GridCard>
					</GridCell>
				</Grid8Col>
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
