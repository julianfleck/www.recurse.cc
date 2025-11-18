"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useUIStore } from "@recurse/ui";
import Link from "next/link";

interface GridCardProps {
	children: ReactNode;
	className?: string;
	enableHoverEffect?: boolean;
	enableSpotlight?: boolean;
	href?: string;
	rounded?: boolean;
}

/**
 * GridCard - Card component for use within the 8-column grid
 * Use Tailwind spacing utilities (px-2col, py-1col, etc.) for grid-based padding
 * Optional border glow hover effect and global spotlight cursor effect
 * Optional href for clickable cards
 */
export function GridCard({ children, className, enableHoverEffect = false, enableSpotlight = false, href, rounded = false }: GridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const setSpotlightActive = useUIStore((state) => state.setSpotlightActive);
	const isLinked = Boolean(href);

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

	const cardContent = (
		<div
			ref={cardRef}
			className={cn(
				"relative z-20",
				// Optional rounded corners
				rounded && "rounded-lg",
				// Standard border approach with negative margins to collapse adjacent borders
				"border border-border",
				// Negative margins collapse borders: -ml-px -mt-px collapses left and top borders
				"-ml-px -mt-px",
				enableHoverEffect && "grid-card-glow",
				enableHoverEffect && isLinked && "grid-card-glow--linked",
				isLinked && "cursor-pointer",
				className
			)}
			style={
				enableHoverEffect
					? ({
							'--glow-x': '50%',
							'--glow-y': '50%',
							'--glow-intensity': '0',
							'--glow-radius': '400px',
						} as React.CSSProperties)
					: undefined
			}
		>
			{children}
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="block">
				{cardContent}
			</Link>
		);
	}

	return cardContent;
}

