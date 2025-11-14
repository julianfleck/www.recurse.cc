"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { BentoCardGrid, GlobalSpotlight, type BentoProps } from "@/components/MagicBento";
import "@/components/MagicBento.css";

interface MagicBentoGridProps extends Partial<BentoProps> {
	children: ReactNode;
	className?: string;
}

/**
 * MagicBentoGrid - Uses the actual Magic Bento grid system from reactbits
 * Wraps BentoCardGrid with GlobalSpotlight for the full Magic Bento experience
 */
export function MagicBentoGrid({
	children,
	className,
	enableSpotlight = true,
	enableStars = false,
	enableBorderGlow = true,
	disableAnimations = false,
	spotlightRadius = 300,
	glowColor = "132, 0, 255",
	...props
}: MagicBentoGridProps) {
	const gridRef = useRef<HTMLDivElement>(null);

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
			<BentoCardGrid gridRef={gridRef}>
				{children}
			</BentoCardGrid>
		</div>
	);
}

