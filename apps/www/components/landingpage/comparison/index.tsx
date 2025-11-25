"use client";

import { LinkButton } from "@recurse/ui/components";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { homepageContent } from "@/content/homepage";

export function ComparisonSection() {
	return (
		<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
			<div id="comparison" className="pb-1col group/comparison">
			<Grid8Col className="">
				{/* Header - spans all columns */}
				<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
					<HeaderCard title={homepageContent.comparison.title} enableSpotlight />
				</GridCell>

				{/* Description Card - Mobile: 8/8, Tablet: 8/8, Desktop: 2/8 */}
				<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
					<GridCard
						enableHoverEffect
						enableSpotlight
						className="flex flex-col h-full items-start p-6 md:p-8 justify-between gap-8 md:gap-4"
					>
						<p className="font-light text-muted-foreground leading-relaxed">
							{homepageContent.comparison.description}
						</p>
						{homepageContent.comparison.detailedComparisonHref && (
							<LinkButton href={homepageContent.comparison.detailedComparisonHref} variant="outline" size="default" className="text-sm">
								Full comparison
							</LinkButton>
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
										<TableCell className="font-medium">{row.feature}</TableCell>
										<TableCell className="font-light text-muted-foreground">{row.traditionalRAG}</TableCell>
										<TableCell className="font-light text-muted-foreground">{row.graphRAG}</TableCell>
										<TableCell className="font-medium">{row.recurse}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</GridCard>
				</GridCell>
			</Grid8Col>
			</div>
		</ScrollAnimation>
	);
}

