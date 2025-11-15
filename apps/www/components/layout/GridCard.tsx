"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useUIStore } from "@recurse/ui";

interface GridCardProps {
	children: ReactNode;
	className?: string;
	enableHoverEffect?: boolean;
	enableSpotlight?: boolean;
}

/**
 * GridCard - Card component for use within the 8-column grid
 * Use Tailwind spacing utilities (px-2col, py-1col, etc.) for grid-based padding
 * Optional border glow hover effect and global spotlight cursor effect
 */
export function GridCard({ children, className, enableHoverEffect = false, enableSpotlight = false }: GridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const setSpotlightActive = useUIStore((state) => state.setSpotlightActive);

	useEffect(() => {
		if (!enableHoverEffect || !cardRef.current) return;

		const card = cardRef.current;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = card.getBoundingClientRect();
			const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
			const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

			card.style.setProperty('--glow-x', `${relativeX}%`);
			card.style.setProperty('--glow-y', `${relativeY}%`);
			card.style.setProperty('--glow-intensity', '1');
		};

		const handleMouseLeave = () => {
			card.style.setProperty('--glow-intensity', '0');
		};

		card.addEventListener('mousemove', handleMouseMove);
		card.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			card.removeEventListener('mousemove', handleMouseMove);
			card.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [enableHoverEffect]);

	// Spotlight effect - activate global spotlight on hover
	useEffect(() => {
		if (!enableSpotlight || !cardRef.current) return;

		const card = cardRef.current;

		const handleMouseEnter = () => {
			setSpotlightActive(true);
		};

		const handleMouseLeave = () => {
			setSpotlightActive(false);
		};

		card.addEventListener('mouseenter', handleMouseEnter);
		card.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			card.removeEventListener('mouseenter', handleMouseEnter);
			card.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [enableSpotlight, setSpotlightActive]);

	return (
		<div
			ref={cardRef}
			className={cn(
				"relative rounded-lg border border-border bg-card",
				enableHoverEffect && "grid-card-glow",
				className
			)}
			style={
				enableHoverEffect
					? ({
							'--glow-x': '50%',
							'--glow-y': '50%',
							'--glow-intensity': '0',
							'--glow-radius': '400px',
							'--glow-color': '132, 0, 255',
						} as React.CSSProperties)
					: undefined
			}
		>
			{children}
		</div>
	);
}

