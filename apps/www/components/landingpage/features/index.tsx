"use client";

import { useState } from "react";
import { Badge, LinkButton } from "@recurse/ui/components";
import { IconCircleCheck, IconCircleCheckFilled } from "@tabler/icons-react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { homepageContent } from "@/content/homepage";
import { getDocsUrl } from "@/lib/utils";

export function Features() {
	return (
		<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
			<div id="features" className="scroll-mt-[60px]">
			<Grid8Col className="">
				{/* Header - spans all columns */}
				<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
					<HeaderCard title="What Recurse does" href="/docs/concepts" enableSpotlight openInNewTab />
				</GridCell>
			</Grid8Col>

			{/* Feature cards in 3x2 grid */}
			<Grid8Col>
				<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{homepageContent.coreCapabilities.capabilities.map((capability, index) => (
							<div key={index} className="flex">
								<FeatureCard capability={capability} />
							</div>
						))}
					</div>
				</GridCell>
			</Grid8Col>
			</div>
		</ScrollAnimation>
	);
}

// Feature Card Component
function FeatureCard({
	capability,
}: {
	capability: {
		title: string;
		description: string;
		icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
		features: string[];
		docLink?: string;
		comingSoon?: boolean;
	};
}) {
	const IconComponent = capability.icon;
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);
	const [isCardHovered, setIsCardHovered] = useState(false);

	const cardContent = (
		<div className="group/feature-card h-full">
			<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col px-1col py-1col md:p-8 relative">
				{/* Icon and Coming Soon Badge */}
				<div className="flex justify-between items-center pb-6">
					<div className="rounded-md border border-accent/20 bg-accent/10">
						<IconComponent
							className={`size-8 text-muted-foreground dark:group-hover/feature-card:text-chart-1 group-hover/feature-card:text-foreground transition-colors duration-300 ${capability.comingSoon ? "opacity-60" : ""}`}
							strokeWidth={1}
						/>
					</div>
					{capability.comingSoon && (
						<Badge
							variant="secondary"
							appearance="outline"
							size="sm"
							className="bg-chart-3/20 dark:bg-chart-3/10 border-chart-3/40 dark:border-chart-3/20 dark:text-chart-3/60 text-chart-3 opacity-0 group-hover/feature-card:opacity-100 transition-opacity duration-200"
						>
							Soon
						</Badge>
					)}
				</div>

				{/* Headline - reserve 2 lines */}
				<h3
					className={`text-muted-foreground! dark:group-hover/feature-card:text-foreground! group-hover/feature-card:text-foreground! leading-relaxed line-clamp-2 min-h-14 transition-colors duration-300 ${capability.comingSoon ? "opacity-60" : ""}`}
				>
					{capability.title}
				</h3>

				{/* Description Text */}
				<p
					className={`font-light text-muted-foreground group-hover/feature-card:text-foreground text-sm hyphens-auto leading-relaxed pt-4 pb-6 transition-colors duration-300 ${capability.comingSoon ? "opacity-60" : ""}`}
					dangerouslySetInnerHTML={{ __html: capability.description }}
				/>

				{/* Table at bottom */}
				{capability.features && capability.features.length > 0 && (
					<div className={`mt-auto space-y-4 ${capability.comingSoon ? "opacity-60" : ""}`}>
						<Table className="w-full">
							<TableBody>
								{capability.features.map((feature, idx) => (
									<TableRow key={idx} onMouseEnter={() => setHoveredRow(idx)} onMouseLeave={() => setHoveredRow(null)}>
										<TableCell className="font-light text-muted-foreground text-xs leading-relaxed py-2 whitespace-normal wrap-break-word">
											{feature}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

					{/* Button - shown on card hover */}
					{capability.docLink && (
						<div
							className={`transition-opacity duration-200 ${isCardHovered ? "opacity-100" : "opacity-0"}`}
						>
							<LinkButton href={getDocsUrl(capability.docLink)} variant="outline" size="default" className="w-full text-sm">
								Learn more
							</LinkButton>
						</div>
					)}
					</div>
				)}
			</GridCard>
		</div>
	);

	return (
		<div 
			className="h-full" 
			onMouseEnter={() => setIsCardHovered(true)} 
			onMouseLeave={() => setIsCardHovered(false)}
		>
			{cardContent}
		</div>
	);
}

