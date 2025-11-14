"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Grid8ColProps {
	children: ReactNode;
	className?: string;
}

/**
 * 8-column grid container at all breakpoints
 * Mobile: full width (no padding), cards handle their own padding
 * Tablet+: horizontal margins for centered layout
 */
export function Grid8Col({ children, className }: Grid8ColProps) {
	return (
		<div className={cn("mx-auto grid max-w-7xl grid-cols-8 md:px-32 lg:px-40", className)}>
			{children}
		</div>
	);
}

interface GridCellProps {
	children: ReactNode;
	className?: string;
	colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
	mdColSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
	lgColSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
	rowSpan?: 1 | 2 | 3 | 4;
}

/**
 * Grid cell with responsive column and row span
 * Grid is always 8 columns, use colSpan/mdColSpan/lgColSpan for responsive layouts
 */
export function GridCell({ children, className, colSpan = 1, mdColSpan, lgColSpan, rowSpan = 1 }: GridCellProps) {
	return (
		<div
			className={cn(
				// Mobile column spans
				colSpan === 1 && "col-span-1",
				colSpan === 2 && "col-span-2",
				colSpan === 3 && "col-span-3",
				colSpan === 4 && "col-span-4",
				colSpan === 5 && "col-span-5",
				colSpan === 6 && "col-span-6",
				colSpan === 7 && "col-span-7",
				colSpan === 8 && "col-span-8",
				// Tablet column spans
				mdColSpan === 1 && "md:col-span-1",
				mdColSpan === 2 && "md:col-span-2",
				mdColSpan === 3 && "md:col-span-3",
				mdColSpan === 4 && "md:col-span-4",
				mdColSpan === 5 && "md:col-span-5",
				mdColSpan === 6 && "md:col-span-6",
				mdColSpan === 7 && "md:col-span-7",
				mdColSpan === 8 && "md:col-span-8",
				// Desktop column spans
				lgColSpan === 1 && "lg:col-span-1",
				lgColSpan === 2 && "lg:col-span-2",
				lgColSpan === 3 && "lg:col-span-3",
				lgColSpan === 4 && "lg:col-span-4",
				lgColSpan === 5 && "lg:col-span-5",
				lgColSpan === 6 && "lg:col-span-6",
				lgColSpan === 7 && "lg:col-span-7",
				lgColSpan === 8 && "lg:col-span-8",
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

