"use client";

import { Badge } from "@recurse/ui/components/badge";
import { GlowCard } from "@recurse/ui/components/glow-card";
import { motion } from "framer-motion";
import { GenericTooltipLayout } from "@/components/graph-view";

type ContextCardProps = {
	id: string;
	title?: string;
	summary?: string;
	type?: string;
	metadata?: string[];
	similarity_score?: number;
	index: number;
	staggerDelay: number;
	animationDuration: number;
};

const SCORE_MULTIPLIER = 100;

export function ContextCard({
	id,
	title,
	summary,
	type,
	metadata = [],
	similarity_score,
	index,
	staggerDelay,
	animationDuration,
}: ContextCardProps) {
	return (
		<motion.div
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.8, y: -20 }}
			initial={{ opacity: 0, scale: 0.8, y: 20 }}
			key={id}
			transition={{
				delay: index * staggerDelay,
				duration: animationDuration,
				ease: "easeOut",
			}}
		>
			<GlowCard
				borderGlowIntensity={0}
				borderGlowHoverIntensity={0.4}
				backgroundGlowIntensity={0}
				backgroundGlowHoverIntensity={0.06}
				className="h-full border border-border bg-card p-0"
			>
				<div className="flex h-full flex-col">
					<div className="p-4">
						<GenericTooltipLayout
							metadata={metadata}
							showIcon={true}
							summary={summary}
							title={title || id}
							type={type}
						/>
					</div>

					{similarity_score ? (
						<div className="border-border border-t px-4 pt-2 pb-4">
							<div className="flex items-center justify-between text-muted-foreground text-xs">
								<span>Similarity</span>
								<Badge className="text-xs" variant="secondary">
									{(similarity_score * SCORE_MULTIPLIER).toFixed(1)}%
								</Badge>
							</div>
						</div>
					) : null}
				</div>
			</GlowCard>
		</motion.div>
	);
}
