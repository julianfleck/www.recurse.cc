"use client";

import { Button } from "@recurse/ui/components";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { FeatureCardUIPreview } from "@/components/layout/FeatureCardUIPreview";

export function ChatOrCodeSection() {
	return (
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
	);
}

