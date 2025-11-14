"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface GridCardProps {
	children: ReactNode;
	className?: string;
	enableHoverEffect?: boolean;
	gridPadding?: {
		left?: number;
		right?: number;
		top?: number;
		bottom?: number;
	};
}

/**
 * GridCard - Card component for use within the 8-column grid
 * Optional border glow hover effect and grid-based padding
 */
export function GridCard({ children, className, enableHoverEffect = false, gridPadding }: GridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

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

	// Calculate padding based on grid units
	const paddingStyle = gridPadding ? {
		paddingLeft: gridPadding.left ? `calc(var(--grid-unit) * ${gridPadding.left})` : undefined,
		paddingRight: gridPadding.right ? `calc(var(--grid-unit) * ${gridPadding.right})` : undefined,
		paddingTop: gridPadding.top ? `calc(var(--grid-unit) * ${gridPadding.top})` : undefined,
		paddingBottom: gridPadding.bottom ? `calc(var(--grid-unit) * ${gridPadding.bottom})` : undefined,
	} : undefined;

	return (
		<div
			ref={cardRef}
			className={cn(
				"relative rounded-lg border border-border bg-card",
				!gridPadding && "p-6", // Default padding if no grid padding specified
				enableHoverEffect && "grid-card-glow",
				className
			)}
			style={{
				...(enableHoverEffect
					? {
							'--glow-x': '50%',
							'--glow-y': '50%',
							'--glow-intensity': '0',
							'--glow-radius': '200px',
							'--glow-color': '132, 0, 255',
						}
					: {}),
				...paddingStyle,
			} as React.CSSProperties}
		>
			{children}
		</div>
	);
}

