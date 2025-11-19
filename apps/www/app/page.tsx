"use client";

import { Button } from "@recurse/ui/components";
import { ArrowRight, Brain, GitGraph, Layers, Network, Search, Clock } from "lucide-react";
import { IconCircleCheck, IconCircleCheckFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { CTASection } from "@/components/common/CTASection";
import { DocsLinkButton } from "@/components/common/DocsLinkButton";
import { AnimatedGraphExample } from "@/components/examples/graphs/AnimatedGraphExample";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { ChatOrCodeSection } from "@/components/landingpage/chat-or-code";
import { BuildWithRecurseSection } from "@/components/landingpage/build-with-recurse";
import { ComparisonSection } from "@/components/landingpage/comparison";
import { SignupSection } from "@/components/landingpage/signup";
import { homepageContent } from "@/content/homepage";
import { Badge } from "@recurse/ui/components";

export default function HomePage() {
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
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
								<p className="font-medium text-foreground text-xl leading-relaxed">Recurse turns raw input into structured, actionable context
								</p>
								<p className="font-light text-muted-foreground text-base leading-relaxed">Add any type of content and we transform it into a living, semantically typed knowledge graph that you (and your AI agents) can act on, reason through, and build on top of. <br className="hidden md:block" /><br className="hidden md:block" /><mark>Zero config needed.</mark> Change just one line of code to make your AI context-aware.
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
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
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
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
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
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8 gap-8">
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
										<h3 className="text-muted-foreground! dark:group-hover/build-card:text-chart-1! group-hover/build-card:text-foreground! leading-relaxed text-lg transition-colors duration-300">
										{item.what}
									</h3>
										<p className="font-light text-muted-foreground group-hover/build-card:text-foreground text-sm leading-relaxed transition-colors duration-300">
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
							{/* Claim */}
							<h3 className="text-2xl md:text-3xl font-light! leading-tight mb-6">
								Make your AI context-aware with just one line of code
							</h3>
							
							{/* Code block */}
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

											{/* Stage 1: https:// */}
											{typingStage === 0 && (
												<TypingText 
													key={`${typingKey}-stage1`}
													text="https://"
													speed={50}
													delay={1000}
													showCursor={false}
													className="inline"
													once={false}
													onComplete={() => setTypingStage(1)}
												/>
											)}

											{/* Show completed stage 1 text */}
											{typingStage > 0 && "https://"}

											{/* Stage 2: api.recurse.cc/ */}
											{typingStage === 1 && (
												<TypingText 
													key={`${typingKey}-stage2`}
													text="api.recurse.cc/"
													speed={50}
													delay={400}
													showCursor={false}
													className="inline"
													once={false}
													onComplete={() => setTypingStage(2)}
												/>
											)}

											{/* Show completed stage 2 text */}
											{typingStage > 1 && "api.recurse.cc/"}

											{/* Stage 3: proxy/ with cursor */}
											{typingStage === 2 && (
												<TypingText 
													key={`${typingKey}-stage3`}
													text="proxy/"
													speed={50}
													delay={400}
													showCursor={true}
													cursor="|"
													cursorClassName="text-foreground w-auto! -ms-[0.2em]"
													className="inline"
													once={false}
												/>
											)}

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
						</GridCard>
					</GridCell>

					{/* CTA Cards - Three cards (2-4-2) */}
					{/* Left: Headline (2 columns) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex flex-col justify-between h-full p-6 md:p-8">
							<h3 className="text-xl text-foreground leading-tight">
								Automatic context injection
							</h3>
							<p className="font-light text-muted-foreground text-lg leading-relaxed mt-auto pt-4">
								No need for manual context engineering. Use our proxy to get started in minutes.
							</p>
						</GridCard>
					</GridCell>

					{/* Center: Description text (4 columns) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<GridCard enableHoverEffect enableSpotlight className="flex flex-col justify-center h-full p-6 md:p-8">
							<p className="font-light text-foreground text-base max-w-sm leading-relaxed">
								Swap your base URL to point to the Recurse proxy. When you send a request to your AI provider, Recurse retrieves context from your knowledge graph and injects it into the request. When your model responds, Recurse extracts semantic frames and stores them back. Your code sees a standard response. Enrichment and extraction happen automatically.
							</p>
						</GridCard>
					</GridCell>

					{/* Right: CTA button (2 columns) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex items-center justify-center h-full p-6 md:p-8">
							<Link href="/docs/getting-started/using-the-proxy">
								<Button size="lg" className="group">
									Get started
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
							</GridCard>
						</GridCell>
				</Grid8Col>
				</div>
			</ScrollAnimation>

			{/* Who This Is For Section - Non-Developer Focus */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<div className="py-16 md:py-24">
					<Grid8Col>
						{/* Header - spans all columns */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
							<HeaderCard title="Chat or Code — Your Choice" enableSpotlight />
						</GridCell>

						{/* Left: Big card with interface preview/image (4 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect className="flex h-full flex-col p-8 md:p-12 group overflow-hidden relative min-h-[300px] md:min-h-[400px]">
								<FeatureCardUIPreview />
							</GridCard>
						</GridCell>

						{/* Right: Use case cards in 2x2 grid (4 cols total) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<div className="grid grid-cols-2 gap-0 h-full">
								{/* Card 1: Content Upload (top-left) */}
								<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col p-6 md:p-8">
									<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-chart-1! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
										Content Upload
									</h4>
									<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
										Drop PDFs, text files, markdown, or paste URLs directly. Recurse extracts semantic structure and makes content queryable within seconds.
									</p>
								</GridCard>

								{/* Card 2: Chat & Query (top-right) */}
								<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col p-6 md:p-8">
									<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-chart-1! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
										Chat & Query
									</h4>
									<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
										Ask questions naturally and get answers grounded in your sources. Works like ChatGPT but connected to your knowledge graph—no code required.
									</p>
								</GridCard>

								{/* Card 3: Visual Exploration (bottom-left) */}
								<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col p-6 md:p-8">
									<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-chart-1! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
										Explore Visually
									</h4>
									<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
										See how your ideas connect. Navigate relationships between concepts, discover patterns, and trace reasoning chains through your knowledge.
									</p>
								</GridCard>

								{/* Card 4: Developer Teaser (bottom-right) */}
								<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col p-6 md:p-8">
									<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-chart-1! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
										For Developers
									</h4>
									<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
										Stop reinventing memory infrastructure. Integrate Recurse with one line of code—works with any AI provider.
									</p>
								</GridCard>
							</div>
						</GridCell>

						{/* CTA Cards - 2-4-2 layout */}
						{/* Left Card: Headline (2 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
								<h3 className="text-2xl font-medium text-foreground">
									Start exploring
								</h3>
								<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto pt-6">
									Access the chat interface, graph visualizer, and source management tools—no coding required.
								</p>
							</GridCard>
						</GridCell>

						{/* Center Card: Description (4 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full items-center p-6 md:p-8">
								<p className="font-light text-muted-foreground text-base leading-relaxed">
									Use whichever fits your workflow—or both. Chat interface for exploration and discovery. Full API access for building custom experiences on top of your knowledge substrate.
								</p>
							</GridCard>
						</GridCell>

						{/* Right Card: Button (2 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full items-center justify-center p-6 md:p-8">
								<Button
									asChild
									size="lg"
									className="group w-full"
								>
									<Link href="/docs/getting-started/using-the-ui">
										Get started
										<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</div>
			</ScrollAnimation>

			{/* Comparison Section */}
			<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
				<Grid8Col className="py-12">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title={homepageContent.comparison.title} enableSpotlight />
					</GridCell>

					{/* Description Card - Mobile: 8/8, Tablet: 8/8, Desktop: 2/8 */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex flex-col h-full items-start p-6 md:p-8 justify-between gap-8 md:gap-4">
							<p className="font-light text-muted-foreground leading-relaxed">
								{homepageContent.comparison.description}
							</p>
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
						</GridCard>
					</GridCell>

					{/* Comparison Table - Mobile: 8/8, Tablet: 8/8, Desktop: 6/8 */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={6}>
						<GridCard enableHoverEffect enableSpotlight className="h-full p-6 md:p-8">
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
			<ScrollAnimation enableFadeOut={true} exitBlur={2} exitScale={0.99}>
				<div className="py-16 md:py-24">
					<Grid8Col>
						{/* Column 1: Title and intro (2 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
								<h2 className="text-2xl md:text-3xl font-medium text-foreground leading-tight">
									Start using Recurse
								</h2>
								<p className="font-light text-muted-foreground text-xl leading-relaxed mt-auto pt-6">
									We are looking for teams that want to put our approach to the test
								</p>
							</GridCard>
						</GridCell>

						{/* Column 2: Description (2 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between p-6 md:p-8">
								<p className="font-light text-foreground text-base leading-relaxed">
									Are you building AI assistants, managing extensive knowledge bases, or streamlining research workflows?
								</p>
								<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto pt-6">
									Tell us a bit about your use case and join our beta. We are currently onboarding new users on a bring your own key basis<Link href="/docs/getting-started/using-the-ui">(learn more).</Link>.
								</p>
							</GridCard>
						</GridCell>

						{/* Column 3: Form (4 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<SignupForm />
						</GridCell>
					</Grid8Col>
				</div>
			</ScrollAnimation>

			{/* Final CTA Section */}
			<CTASection />
		</>
	);
}

// Feature Card Component
function FeatureCard({ capability }: { capability: { title: string; description: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; features: string[]; docLink?: string; comingSoon?: boolean } }) {
	const IconComponent = capability.icon;
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);
	const [isCardHovered, setIsCardHovered] = useState(false);

	const cardContent = (
		<GridCard 
			enableHoverEffect 
			enableSpotlight 
			className="flex h-full flex-col p-6 md:p-8 group/feature-card relative"
		>
			{/* Icon and Coming Soon Badge */}
			<div className="flex justify-between items-center pb-6">
				<div className="rounded-md border border-accent/20 bg-accent/10">
					<IconComponent
						className={`size-8 text-muted-foreground dark:group-hover/feature-card:text-chart-1 group-hover/feature-card:text-foreground transition-colors duration-300 ${capability.comingSoon ? 'opacity-60' : ''}`}
						strokeWidth={1}
					/>
				</div>
				{capability.comingSoon && (
					<Badge 
						variant="secondary" 
						appearance="outline" 
						size="sm"
						className="bg-chart-3/20 dark:bg-chart-3/10 border-chart-3/40 dark:border-chart-3/20 dark:text-chart-3/60 text-chart-3"
					>
						Soon
					</Badge>
				)}
			</div>

			{/* Headline - reserve 2 lines */}
			<h3 className={`text-muted-foreground! dark:group-hover/feature-card:text-chart-1! group-hover/feature-card:text-foreground! leading-relaxed line-clamp-2 min-h-14 transition-colors duration-300 ${capability.comingSoon ? 'opacity-60' : ''}`}>
				{capability.title}
			</h3>

			{/* Description Text */}
			<p 
				className={`font-light text-muted-foreground group-hover/feature-card:text-foreground text-sm hyphens-auto leading-relaxed pt-4 pb-6 transition-colors duration-300 ${capability.comingSoon ? 'opacity-60' : ''}`}
				dangerouslySetInnerHTML={{ __html: capability.description }}
			/>

			{/* Table at bottom */}
			{capability.features && capability.features.length > 0 && (
				<div className={`mt-auto space-y-4 ${capability.comingSoon ? 'opacity-60' : ''}`}>
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
						<div className={`transition-opacity duration-200 ${isCardHovered ? 'opacity-100' : 'opacity-0'} ${capability.comingSoon ? 'opacity-100!' : ''}`}>
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
