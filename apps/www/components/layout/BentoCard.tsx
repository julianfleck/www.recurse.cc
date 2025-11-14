"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
	children: ReactNode;
	className?: string;
	span?: 1 | 2 | 3 | 4; // Grid span for responsive sizing
	rowSpan?: 1 | 2 | 3 | 4; // Row span for vertical sizing
}

/**
 * BentoCard - A card component with decorative crosses in corners
 * Inspired by Evervault Card but without animations
 */
export function BentoCard({
	children,
	className,
	span = 1,
	rowSpan = 1,
}: BentoCardProps) {
	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors",
				"hover:border-border-accent hover:bg-accent/5",
				// Grid spans
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
			{/* Corner crosses */}
			{/* Top Left */}
			<div className="absolute left-2 top-2">
				<svg
					className="h-3 w-3 text-border-accent opacity-40"
					fill="none"
					viewBox="0 0 12 12"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 2 L10 10 M10 2 L2 10"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
			</div>

			{/* Top Right */}
			<div className="absolute right-2 top-2">
				<svg
					className="h-3 w-3 text-border-accent opacity-40"
					fill="none"
					viewBox="0 0 12 12"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 2 L10 10 M10 2 L2 10"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
			</div>

			{/* Bottom Left */}
			<div className="absolute bottom-2 left-2">
				<svg
					className="h-3 w-3 text-border-accent opacity-40"
					fill="none"
					viewBox="0 0 12 12"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 2 L10 10 M10 2 L2 10"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
			</div>

			{/* Bottom Right */}
			<div className="absolute bottom-2 right-2">
				<svg
					className="h-3 w-3 text-border-accent opacity-40"
					fill="none"
					viewBox="0 0 12 12"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 2 L10 10 M10 2 L2 10"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
			</div>

			{/* Content */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}

