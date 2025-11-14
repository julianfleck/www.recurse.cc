"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
	columns?: 1 | 2 | 3 | 4 | 6; // Grid columns
	gap?: "sm" | "md" | "lg"; // Gap between items
}

const maxWidthClasses = {
	sm: "max-w-screen-sm",
	md: "max-w-screen-md",
	lg: "max-w-screen-lg",
	xl: "max-w-screen-xl",
	"2xl": "max-w-screen-2xl",
	full: "max-w-full",
};

const gapClasses = {
	sm: "gap-4",
	md: "gap-6",
	lg: "gap-8",
};

const columnClasses = {
	1: "grid-cols-1",
	2: "grid-cols-1 md:grid-cols-2",
	3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

/**
 * BentoGrid - A flexible bento-style grid layout
 * Based on Magic Bento pattern with responsive columns
 */
export function BentoGrid({
	children,
	className,
	maxWidth = "xl",
	columns = 4,
	gap = "md",
}: BentoGridProps) {
	return (
		<div
			className={cn(
				"mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20",
				maxWidthClasses[maxWidth],
				className,
			)}
		>
			<div
				className={cn(
					"grid auto-rows-fr",
					columnClasses[columns],
					gapClasses[gap],
				)}
			>
				{children}
			</div>
		</div>
	);
}

/**
 * BentoSection - A section wrapper for bento grid content
 * Useful for grouping related cards with consistent spacing
 */
interface BentoSectionProps {
	children: ReactNode;
	className?: string;
	id?: string;
}

export function BentoSection({
	children,
	className,
	id,
}: BentoSectionProps) {
	return (
		<div className={className} id={id}>
			{children}
		</div>
	);
}



