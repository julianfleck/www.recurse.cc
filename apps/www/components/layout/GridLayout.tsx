"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BentoCard } from "./BentoCard";
import { BentoGrid, BentoSection } from "./BentoGrid";

interface GridLayoutProps {
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
	columns?: 1 | 2 | 3 | 4 | 6;
	gap?: "sm" | "md" | "lg";
}

interface GridSectionProps {
	children: ReactNode;
	columns?: 1 | 2 | 3 | 4;
	className?: string;
}

interface GridCellProps {
	children: ReactNode;
	className?: string;
	span?: 1 | 2 | 3 | 4;
	rowSpan?: 1 | 2 | 3 | 4;
}

/**
 * GridLayout - Main container for bento grid layout
 * Wraps BentoGrid with backward-compatible API
 */
export function GridLayout({
	children,
	className,
	maxWidth = "xl",
	columns = 4,
	gap = "md",
}: GridLayoutProps) {
	return (
		<BentoGrid
			className={className}
			maxWidth={maxWidth}
			columns={columns}
			gap={gap}
		>
			{children}
		</BentoGrid>
	);
}

/**
 * GridSection - Section wrapper for grid content
 * Maps to BentoSection for consistency
 */
export function GridSection({
	children,
	columns = 1,
	className,
}: GridSectionProps) {
	// For backward compatibility, we'll wrap in a section
	// but the actual grid is handled by GridLayout
	return (
		<BentoSection className={className}>
			<div
				className={cn(
					"grid",
					columns === 1 && "grid-cols-1",
					columns === 2 && "grid-cols-1 md:grid-cols-2",
					columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
					columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
				)}
			>
				{children}
			</div>
		</BentoSection>
	);
}

/**
 * GridCell - Individual grid cell wrapper
 * For cards with corner crosses, use BentoCard directly
 */
export function GridCell({
	children,
	className,
	span = 1,
	rowSpan = 1,
}: GridCellProps) {
	return (
		<div
			className={cn(
				// Grid spans (only apply if used in a grid context)
				span === 1 && "col-span-1",
				span === 2 && "col-span-1 md:col-span-2",
				span === 3 && "col-span-1 md:col-span-2 lg:col-span-3",
				span === 4 && "col-span-1 md:col-span-2 lg:col-span-4",
				// Row spans
				rowSpan === 1 && "row-span-1",
				rowSpan === 2 && "row-span-1 md:row-span-2",
				rowSpan === 3 && "row-span-1 md:row-span-2 lg:row-span-3",
				rowSpan === 4 && "row-span-1 md:row-span-2 lg:row-span-4",
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

/**
 * TwoColumnSection - Two column section
 * Spans full width and creates a 2-column sub-grid
 */
export function TwoColumnSection({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("col-span-full", className)}>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{children}
			</div>
		</div>
	);
}

/**
 * ThreeColumnSection - Three column section
 * Spans full width and creates a 3-column sub-grid
 */
export function ThreeColumnSection({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("col-span-full", className)}>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{children}
			</div>
		</div>
	);
}

// Re-export Bento components for direct use
export { BentoCard, BentoGrid, BentoSection };
