"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import MagicBento, { ParticleCard, type BentoProps } from "@/components/MagicBento";
import "@/components/MagicBento.css";

interface MagicBentoWrapperProps extends BentoProps {
	children: ReactNode;
	className?: string;
}

/**
 * MagicBentoWrapper - Wrapper around reactbits Magic Bento
 * Allows custom children while using the actual Magic Bento grid and animations
 */
export function MagicBentoWrapper({
	children,
	className,
	...bentoProps
}: MagicBentoWrapperProps) {
	const gridRef = useRef<HTMLDivElement>(null);

	return (
		<div className={`bento-section ${className || ""}`} ref={gridRef}>
			<div className="card-grid">
				{children}
			</div>
		</div>
	);
}

interface MagicBentoCardWrapperProps {
	children: ReactNode;
	className?: string;
	span?: 1 | 2 | 3 | 4;
	rowSpan?: 1 | 2 | 3 | 4;
	enableStars?: boolean;
	enableTilt?: boolean;
	enableMagnetism?: boolean;
	clickEffect?: boolean;
	disableAnimations?: boolean;
	glowColor?: string;
	particleCount?: number;
}

/**
 * MagicBentoCardWrapper - Wraps content in Magic Bento card with animations
 * Uses ParticleCard from the actual Magic Bento component
 */
export function MagicBentoCardWrapper({
	children,
	className = "",
	span = 1,
	rowSpan = 1,
	enableStars = false,
	enableTilt = false,
	enableMagnetism = false,
	clickEffect = false,
	disableAnimations = false,
	glowColor = "132, 0, 255",
	particleCount = 12,
}: MagicBentoCardWrapperProps) {
	const gridClasses = [
		span === 1 && "col-span-1",
		span === 2 && "col-span-1 md:col-span-2",
		span === 3 && "col-span-1 md:col-span-2 lg:col-span-3",
		span === 4 && "col-span-1 md:col-span-2 lg:col-span-4",
		rowSpan === 1 && "row-span-1",
		rowSpan === 2 && "row-span-1 md:row-span-2",
		rowSpan === 3 && "row-span-1 md:row-span-2 lg:row-span-3",
		rowSpan === 4 && "row-span-1 md:row-span-2 lg:row-span-4",
	]
		.filter(Boolean)
		.join(" ");

	const cardClassName = `magic-bento-card ${className} ${gridClasses}`;

	if (enableStars) {
		return (
			<ParticleCard
				className={cardClassName}
				disableAnimations={disableAnimations}
				particleCount={particleCount}
				glowColor={glowColor}
				enableTilt={enableTilt}
				clickEffect={clickEffect}
				enableMagnetism={enableMagnetism}
			>
				{children}
			</ParticleCard>
		);
	}

	return (
		<div className={cardClassName}>
			{children}
		</div>
	);
}

