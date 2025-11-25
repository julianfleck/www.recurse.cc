"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";
import { useUIStore } from "@recurse/ui";
import Link from "next/link";

interface GridCardProps {
	children: ReactNode;
	className?: string;
	enableHoverEffect?: boolean;
	enableSpotlight?: boolean;
	href?: string;
	rounded?: boolean;
	glowColor?: "chart-1" | "chart-2";
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * GridCard - Card component for use within the 8-column grid
 * Use Tailwind spacing utilities (px-2col, py-1col, etc.) for grid-based padding
 * Optional border glow hover effect and global spotlight cursor effect
 * Optional href for clickable cards
 */
export function GridCard({
	children,
	className,
	enableHoverEffect = false,
	enableSpotlight = false,
	href,
	rounded = false,
	glowColor,
	onClick,
}: GridCardProps) {
	const setSpotlightActive = useUIStore((state) => state.setSpotlightActive);
	const isLinked = Boolean(href);

	const glowStyle =
		enableHoverEffect && glowColor
			? ({
					...(glowColor === "chart-1" && { "--glow-color-rgb": "166, 200, 46" }),
					...(glowColor === "chart-2" && { "--glow-color-rgb": "132, 0, 255" }),
			  } satisfies CSSProperties)
			: undefined;

	const cardContent = (
		<GlowCard
			asChild
			enableGlow={enableHoverEffect}
			borderGlowIntensity={0.42}
			backgroundGlowIntensity={0.025}
			style={glowStyle}
			onMouseEnter={enableSpotlight ? () => setSpotlightActive(true) : undefined}
			onMouseLeave={enableSpotlight ? () => setSpotlightActive(false) : undefined}
			className={cn(
				"relative z-20 -ml-px -mt-px border border-border backdrop-blur-2xl bg-background/35 dark:bg-background/60",
				rounded && "rounded-lg",
				isLinked && "cursor-pointer",
				className,
			)}
		>
			<div>{children}</div>
		</GlowCard>
	);

	if (href) {
		return (
			<Link href={href} className="block" onClick={onClick}>
				{cardContent}
			</Link>
		);
	}

	return cardContent;
}

