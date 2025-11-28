"use client";

import { LinkButton } from "@recurse/ui/components";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { FeatureCardUIPreview } from "@/components/layout/FeatureCardUIPreview";

export function ChatOrCodeSection() {
	return (
		<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
			<div id="explore" className="group/chat-or-code">
				<Grid8Col>
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title="Built for Exploration" href="/docs/getting-started/user-interface" enableSpotlight openInNewTab />
					</GridCell>

					{/* Left: Big card with interface preview/image (4 cols) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<GridCard enableHoverEffect className="flex h-full flex-col px-1col py-1col md:p-12 group overflow-hidden relative min-h-[300px] md:min-h-[400px]">
							<FeatureCardUIPreview />
						</GridCard>
					</GridCell>

					{/* Right: Use case cards in 2x2 grid (4 cols total) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<div className="grid grid-cols-2 gap-0 h-full">
							{/* Card 1: Upload & Chat (merged - top-left) */}
							<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col px-1col py-1col md:p-8">
								<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-foreground! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
									Upload & Chat
								</h4>
								<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
									Drop PDFs, text files, or paste URLs. Then ask questions naturally—answers come grounded in your sources. Works like ChatGPT but connected to your knowledge.
								</p>
							</GridCard>

							{/* Card 2: Context Assembly (top-right) */}
							<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col px-1col py-1col md:p-8">
								<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-foreground! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
									Assemble Context
								</h4>
								<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
									Build context bundles with one click. Select what matters, export for any AI tool, or inject directly into your agent workflows. Sources cited, relationships intact.
								</p>
							</GridCard>

							{/* Card 3: Visual Exploration (bottom-left) */}
							<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col px-1col py-1col md:p-8">
								<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-foreground! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
									Explore Visually
								</h4>
								<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
									See how your ideas connect. Navigate relationships between concepts, discover patterns, and trace reasoning chains through your knowledge.
								</p>
							</GridCard>

							{/* Card 4: Developer Teaser (bottom-right) */}
							<GridCard enableHoverEffect enableSpotlight className="group/use-case flex flex-col px-1col py-1col md:p-8">
								<h4 className="font-normal text-muted-foreground! dark:group-hover/use-case:text-foreground! group-hover/use-case:text-foreground! leading-relaxed text-lg transition-colors duration-300 mb-2">
									For Developers
								</h4>
								<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto transition-colors duration-300 group-hover/use-case:text-foreground">
									Stop reinventing memory infrastructure. Integrate Recurse with one line of code. Works with any AI provider.
								</p>
							</GridCard>
						</div>
					</GridCell>

					{/* CTA Cards - 2-4-2 layout */}
					{/* Left Card: Headline (2 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col justify-between px-1col py-1col md:p-8">
							<h3 className="text-2xl font-medium text-foreground">
								Start Exploring
							</h3>
							<p className="font-light text-muted-foreground text-sm leading-relaxed mt-auto pt-6">
								Access the chat interface, graph visualizer, and source management tools. No coding required.
							</p>
						</GridCard>
					</GridCell>

					{/* Center Card: Description (4 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full items-center px-1col py-1col md:p-8">
							<p className="font-light text-muted-foreground text-lg leading-relaxed">
								Our interface makes your knowledge immediately explorable. Upload documents, ask questions in natural language, trace connections through your graph. And if you need programmatic access for building applications or custom integrations on top of your knowledge base, there's a full API underneath.
							</p>
						</GridCard>
					</GridCell>

					{/* Right Card: Button (2 cols) */}
						<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
							<GridCard enableHoverEffect enableSpotlight className="flex h-full items-center justify-center px-1col py-1col md:p-8">
							<LinkButton href="/docs/getting-started/quickstart" size="lg" className="w-full">
								Get started
							</LinkButton>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</div>
		</ScrollAnimation>
	);
}

