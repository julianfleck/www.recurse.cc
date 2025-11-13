"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridLayoutProps {
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

interface GridSectionProps {
	children: ReactNode;
	columns?: 1 | 2 | 3 | 4;
	className?: string;
}

interface GridCellProps {
	children: ReactNode;
	className?: string;
}

const maxWidthClasses = {
	sm: "max-w-screen-sm",
	md: "max-w-screen-md",
	lg: "max-w-screen-lg",
	xl: "max-w-screen-xl",
	"2xl": "max-w-screen-2xl",
	full: "max-w-full",
};

// Main grid container
export function GridLayout({
	children,
	className,
	maxWidth = "xl",
}: GridLayoutProps) {
	return (
		<div
			className={cn(
				"mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20",
				maxWidthClasses[maxWidth],
				className,
			)}
		>
			<div className="border border-border-accent bg-background/80 backdrop-blur-2xl dark:bg-background/60">
				{children}
			</div>
		</div>
	);
}

// Grid section with configurable columns - now responsive
export function GridSection({
	children,
	columns = 1,
	className,
}: GridSectionProps) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("grid", gridCols[columns], className)}>{children}</div>
	);
}

// Individual grid cell - now with responsive borders
export function GridCell({ children, className }: GridCellProps) {
	return (
		<div
			className={cn(
				"border-border-accent border-b",
				"md:border-r md:last:border-r-0",
				"p-8 md:p-12",
				className,
			)}
		>
			{children}
		</div>
	);
}

// Static section component (no animations)
function StaticSection({
	children,
	className,
	columns,
	id,
}: {
	children: ReactNode;
	className?: string;
	columns: 1 | 2 | 3 | 4;
	id?: string;
}) {
	return (
		<div className={className} id={id}>
			<GridSection columns={columns}>{children}</GridSection>
		</div>
	);
}

// Specialized components for common layouts
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
		<StaticSection className={className} columns={1} id={id}>
			<GridCell className={cn("md:border-r-0", cellClassName)}>
				{children}
			</GridCell>
		</StaticSection>
	);
}

export function ThreeColumnSection({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<StaticSection className={className} columns={3}>
			{children}
		</StaticSection>
	);
}

export function TwoColumnSection({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<StaticSection className={className} columns={2}>
			{children}
		</StaticSection>
	);
}
