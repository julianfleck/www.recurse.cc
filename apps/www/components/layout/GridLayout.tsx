"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridLayoutProps {
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
	columns?: 1 | 2 | 3 | 4 | 6;
	gap?: "sm" | "md" | "lg";
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
 * GridLayout - Main container for grid layout
 */
export function GridLayout({
	children,
	className,
	maxWidth = "xl",
	columns = 4,
	gap = "md",
}: GridLayoutProps) {
	return (
		<div
			className={cn(
				"grid w-full",
				maxWidthClasses[maxWidth],
				columnClasses[columns],
				gapClasses[gap],
				className,
			)}
		>
			{children}
		</div>
	);
}

/**
 * SingleColumnSection - Full-width single column section
 * Spans the full width of the grid
 */
export function SingleColumnSection({
	children,
	className,
	cellClassName,
	id,
}: {
	children: ReactNode;
	className?: string;
	cellClassName?: string;
	id?: string;
}) {
	return (
		<div className={cn("col-span-full", className)} id={id}>
			<div className={cellClassName}>{children}</div>
		</div>
	);
}




