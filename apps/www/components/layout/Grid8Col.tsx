"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Grid8ColProps {
	children: ReactNode;
	className?: string;
}

/**
 * Simple 8-column grid container
 * Use GridOverlay component in layout for global gridlines
 */
export function Grid8Col({ children, className }: Grid8ColProps) {
	return (
		<div className={cn("mx-auto grid max-w-7xl grid-cols-8 px-6 md:px-32 lg:px-40", className)}>
			{children}
		</div>
	);
}

interface GridCellProps {
	children: ReactNode;
	className?: string;
	colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
	rowSpan?: 1 | 2 | 3 | 4;
}

/**
 * Simple grid cell with column and row span
 */
export function GridCell({ children, className, colSpan = 1, rowSpan = 1 }: GridCellProps) {
	return (
		<div
			className={cn(
				// Column spans
				colSpan === 1 && "col-span-1",
				colSpan === 2 && "col-span-2",
				colSpan === 3 && "col-span-3",
				colSpan === 4 && "col-span-4",
				colSpan === 5 && "col-span-5",
				colSpan === 6 && "col-span-6",
				colSpan === 7 && "col-span-7",
				colSpan === 8 && "col-span-8",
				// Row spans
				rowSpan === 1 && "row-span-1",
				rowSpan === 2 && "row-span-2",
				rowSpan === 3 && "row-span-3",
				rowSpan === 4 && "row-span-4",
				className
			)}
		>
			{children}
		</div>
	);
}

