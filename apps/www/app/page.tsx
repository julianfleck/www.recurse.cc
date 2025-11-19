"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { IconCircleCheck, IconCircleCheckFilled } from "@tabler/icons-react";
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
import { TypingText } from "@recurse/ui/components";
import { homepageContent } from "@/content/homepage";
import { AnimatedGraphExample } from "@/components/examples/graphs/AnimatedGraphExample";

export default function HomePage() {
	const [typingKey, setTypingKey] = useState(0);
	const sectionRef = useRef<HTMLDivElement>(null);

	// Reset typing animation when section comes into view
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setTypingKey((prev) => prev + 1);
					}
				});
			},
			{ threshold: 0.3 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<>
			{/* Hero Section - Combined Content */}
			<div className="relative z-10">
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col className="pt-12">
						{/* Hero Card - Full width (8 columns) at all breakpoints */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<GridCard 
								enableHoverEffect 
								enableSpotlight
								className="px-1col py-1col lg:pl-2col lg:pr-1.5col"
							>
								<div className="space-y-8 text-left pl-6">
									<div className="space-y-8">
										{/* TODO: place text swap component here */}
										<div className="lg:max-w-lg">
											<h1 className="font-semibold text-2xl leading-[1.15]! tracking-tight md:text-4xl lg:text-5xl text-accent-foreground lg:max-w-3xl">The Memory Substrate for Sense-making, not just Similarity Search
											</h1>
										</div>
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

				{/* Example Graph Section - Text card (2 cols) + Graph (6 cols) */}
				<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
					<Grid8Col>
						{/* Description Card - Mobile: 8/8, Tablet: 8/8, Desktop: 2/8 */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
								<p className="font-medium text-foreground text-xl leading-relaxed">Recurse turns raw input into structured, actionable context
								</p>
								<p className="font-light text-muted-foreground text-base leading-relaxed">Add any type of content and we transform it into a living, semantically typed knowledge graph that you (and your AI agents) can act on, reason through, and build on top of. Plug and play, no configuration needed, <mark>change just one line of code</mark> to get started.
								</p>
							</GridCard>
						</GridCell>

				{/* Graph Example - Mobile: 8/8, Tablet: 8/8, Desktop: 6/8 */}
				<GridCell colSpan={8} mdColSpan={8} lgColSpan={6}>
					<GridCard enableHoverEffect enableSpotlight>
						<AnimatedGraphExample className="rounded-none border-0 bg-background" showControls={false} showControlsOnHoverOnly={true} />
					</GridCard>
				</GridCell>
					</Grid8Col>
				</ScrollAnimation>
			</div>

			{/* About Section - Simple 8 column grid */}
			<div className="relative z-10 space-y-24 md:space-y-32">
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title="Yet Another AI Memory System?" enableSpotlight />
					</GridCell>

					{/* Card 1 - Mobile: full width (8/8), Tablet: 2/8, Desktop: 2/8 columns */}
					<GridCell colSpan={8} mdColSpan={2} lgColSpan={2} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
							<p className="font-light text-2xl text-foreground">
								Not quite.<br className="hidden md:block" /> We are a built a bit differently...
							</p>
							<p className="font-light text-xl text-foreground">
								Recurse is memory infrastructure for systems that actually <mark className=" underline-offset-6 text-foreground">understand</mark>.
							</p>
						</GridCard>
					</GridCell>

					{/* Card 2 - Mobile: full width (8/8), Tablet: 3/8, Desktop: 3/8 columns */}
					<GridCell colSpan={8} mdColSpan={3} lgColSpan={3} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6">
							<p className="font-light text-2xl text-muted-foreground pb-8 leading-relaxed">
								Most context management systems are optimized for retrieval, not exploration.
							</p>
							<p className="font-light text-lg text-muted-foreground leading-relaxed">
								Ask a question, get back what looks most similar to your query. This works if you know what you're looking for. But it systematically prevents the kind of exploration that leads to genuine  understanding and novel insights.
							</p>
						</GridCard>
					</GridCell>

					{/* Card 3 - Mobile: full width (8/8), Tablet: 3/8, Desktop: 3/8 columns */}
					<GridCell colSpan={8} mdColSpan={3} lgColSpan={3} rowSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-4 md:p-6 gap-8">
							<p className="font-light text-lg text-foreground pb-8 leading-relaxed">
								Standard retrieval systems don't allow you to discover connections you didn't know existed, stumble onto relevant context from unexpected sources or follow threads that diverge from your initial question.
							</p>
							<p className="font-light text-xl text-foreground leading-relaxed pr-8">
								Recurse favors <mark>depth</mark> over similarity, <mark>relationships</mark> over rankings and <mark>evolution</mark> over static storage.
							</p>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</ScrollAnimation>

			{/* Core Capabilities Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title="What Recurse does" enableSpotlight />
					</GridCell>
				</Grid8Col>

				{/* Feature cards in separate grid to control row heights */}
				<Grid8Col className="grid-rows-[repeat(auto-fill,minmax(0,1fr))]">
					{/* Four feature cards, each 2 columns wide */}
					{homepageContent.coreCapabilities.capabilities.map(
						(capability, index) => (
							<GridCell key={index} colSpan={8} mdColSpan={4} lgColSpan={2} className="flex">
								<FeatureCard capability={capability} />
								</GridCell>
						),
					)}
				</Grid8Col>
			</ScrollAnimation>

			{/* What You Can Build Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<div ref={sectionRef}>
					<Grid8Col className="">
						{/* Header - spans all columns */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title={homepageContent.whatYouCanBuild.title} enableSpotlight />
						</GridCell>

					{/* Build Items - 2x2 nested grid - Mobile: 8/8, Tablet: 8/8, Desktop: 4/8 (left half) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<div className="grid grid-cols-2 gap-0 h-full">
							{homepageContent.whatYouCanBuild.items.map((item, index) => (
								<GridCard 
									key={index} 
									enableHoverEffect 
									enableSpotlight 
									className="group/build-card flex flex-col justify-between p-6 md:p-8 rounded-none border-r border-b last:border-r-0 nth-2:border-r-0 nth-3:border-b-0 nth-4:border-b-0"
								>
									<div className="space-y-3">
										<h3 className="text-muted-foreground dark:group-hover/build-card:text-accent group-hover/build-card:text-foreground leading-relaxed text-lg">
											{item.what}
										</h3>
										<p className="font-light text-muted-foreground group-hover/build-card:text-foreground text-sm leading-relaxed">
											{item.description}
										</p>
									</div>
								</GridCard>
							))}
						</div>
					</GridCell>

					{/* Code Example Card - Mobile: 8/8, Tablet: 8/8, Desktop: 4/8 (right half) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col p-6 md:p-8">
							<div className="space-y-6 flex flex-col h-full">
								<p className="font-light text-foreground text-xl leading-relaxed">
									{homepageContent.whatYouCanBuild.description}
								</p>
								
								<div className="flex-1 relative">
									{/* Gradient mask top */}
									<div className="absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-background to-transparent z-10 pointer-events-none" />
									
									{/* Code block */}
									<div className="relative overflow-hidden">
										<pre className="text-xs font-mono overflow-x-auto min-h-[260px]">
											<code className="text-muted-foreground/50">
												{`import OpenAI from 'openai';\n\nconst client = new OpenAI({`}
											</code>
											<code className="text-muted-foreground">
												{`\n  apiKey: process.env.OPENAI_API_KEY,`}
											</code>
											
											{/* Highlighted line with typing animation */}
											<code className="block my-1 bg-accent/10 border-l-4 border-accent pl-2 text-foreground font-medium"><mark>
												{`baseURL: '`}

												<TypingText 
													key={typingKey}
													text="https://api.recurse.cc/proxy/"
													speed={50}
													delay={1000}
													showCursor={false}
													className="inline"
													once={false}
												/>
												{`https://api.openai.com/v1/',`}
												</mark>
											</code>
											
											<code className="text-muted-foreground">
												{`  defaultHeaders: {\n    'X-API-Key': process.env.RECURSE_API_KEY,\n    'X-Recurse-Scope': 'my_project'\n  }\n});`}
											</code>
											<code className="text-muted-foreground/50">
												{`\n\n// Use the client normally\nconst completion = await client.chat...`}
											</code>
										</pre>
									</div>
									
									{/* Gradient mask bottom */}
									<div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none" />
								</div>
							</div>
						</GridCard>
					</GridCell>
				</Grid8Col>
				</div>
			</ScrollAnimation>

			{/* Who This Is For Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="">
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

// Feature Card Component
function FeatureCard({ capability }: { capability: { title: string; description: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; features: string[]; docLink?: string } }) {
	const IconComponent = capability.icon;
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);
	const [isCardHovered, setIsCardHovered] = useState(false);

	const cardContent = (
		<GridCard 
			enableHoverEffect 
			enableSpotlight 
			className="flex h-full flex-col p-6 md:p-8 group/feature-card"
		>
			{/* Icon */}
			<div className="flex justify-start pb-6">
				<div className="rounded-md border border-accent/20 bg-accent/10">
					<IconComponent
						className="size-8 text-muted-foreground dark:group-hover/feature-card:text-chart-1 group-hover/feature-card:text-foreground"
						strokeWidth={1}
					/>
				</div>
			</div>

			{/* Headline - reserve 2 lines */}
			<h3 className="text-muted-foreground! dark:group-hover/feature-card:text-chart-1! group-hover/feature-card:text-foreground! leading-relaxed line-clamp-2 min-h-14">
				{capability.title}
			</h3>

			{/* Description Text */}
			<p className="font-light text-muted-foreground group-hover/feature-card:text-foreground text-sm hyphens-auto leading-relaxed pt-4 pb-6">
				{capability.description}
			</p>

			{/* Table at bottom */}
			{capability.features && capability.features.length > 0 && (
				<div className="mt-auto space-y-4">
					<Table className="w-full">
						<TableBody>
							{capability.features.map((feature, idx) => (
								<TableRow 
									key={idx}
									onMouseEnter={() => setHoveredRow(idx)}
									onMouseLeave={() => setHoveredRow(null)}
								>
									{/* <TableCell className="w-6 py-2">
										{hoveredRow === idx ? (
											<IconCircleCheckFilled className="size-4 text-foreground" />
										) : (
											<IconCircleCheck className="size-4 text-muted-foreground" />
										)}
									</TableCell> */}
									<TableCell className="font-light text-muted-foreground text-xs leading-relaxed py-2 whitespace-normal wrap-break-word">
										{feature}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					
					{/* Button - shown on card hover */}
					{capability.docLink && (
						<div className={`transition-opacity duration-200 ${isCardHovered ? 'opacity-100' : 'opacity-0'}`}>
							<Button
								asChild
								className="group/btn w-full rounded-full px-4 py-3 font-medium text-sm"
								size="default"
								variant="outline"
							>
								<span className="flex items-center justify-center">
									Learn more
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
								</span>
							</Button>
						</div>
					)}
				</div>
			)}
		</GridCard>
	);

	return (
		<div 
			className="h-full"
			onMouseEnter={() => setIsCardHovered(true)}
			onMouseLeave={() => setIsCardHovered(false)}
		>
			{capability.docLink ? (
				<Link href={capability.docLink} className="block h-full">
					{cardContent}
				</Link>
			) : (
				cardContent
			)}
		</div>
	);
}
