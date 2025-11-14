"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { BentoCardGrid, GlobalSpotlight, type BentoProps } from "@/components/MagicBento";
import "@/components/MagicBento.css";

interface MagicBentoGridProps extends Partial<BentoProps> {
	children: ReactNode;
	className?: string;
	gridColumns?: 3 | 4 | 5 | 8;
}

/**
 * MagicBentoGrid - Uses the actual Magic Bento grid system from reactbits
 * Wraps BentoCardGrid with GlobalSpotlight for the full Magic Bento experience
 */
export function MagicBentoGrid({
	children,
	className,
	gridColumns = 4,
	enableSpotlight = true,
	enableStars = false,
	enableBorderGlow = true,
	disableAnimations = false,
	spotlightRadius = 300,
	glowColor = "132, 0, 255",
	...props
}: MagicBentoGridProps) {
	const gridRef = useRef<HTMLDivElement>(null);
	const gridClassName = gridColumns === 4 ? '' : `grid-cols-${gridColumns}`;

	return (
		<div className={className}>
			{enableSpotlight && (
				<GlobalSpotlight
					gridRef={gridRef}
					disableAnimations={disableAnimations}
					enabled={enableSpotlight}
					spotlightRadius={spotlightRadius}
					glowColor={glowColor}
				/>
			)}
			<BentoCardGrid gridRef={gridRef} className={gridClassName}>
				{children}
			</BentoCardGrid>
		</div>
	);
}

