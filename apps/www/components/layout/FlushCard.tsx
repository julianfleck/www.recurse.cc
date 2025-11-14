"use client";

import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";

interface FlushCardProps {
	children: ReactNode;
	className?: string;
}

/**
 * FlushCard - Card wrapper based on Evervault Card but without animations
 * Cards sit flush with + crosses in corners to separate them
 */
export function FlushCard({ children, className }: FlushCardProps) {
	return (
		<div
			className={cn(
				"group relative overflow-hidden border border-border bg-card h-full w-full transition-colors",
				"hover:border-border-accent hover:bg-accent/5",
				className,
			)}
		>
			{/* Corner + crosses - positioned at card boundaries */}
			{/* Top Left */}
			<div className="absolute left-0 top-0 z-10">
				<div className="h-4 w-4 -translate-x-1/2 -translate-y-1/2">
					<svg
						className="h-4 w-4 text-border-accent opacity-60"
						fill="none"
						viewBox="0 0 16 16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 2 L8 14 M2 8 L14 8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
				</div>
			</div>

			{/* Top Right */}
			<div className="absolute right-0 top-0 z-10">
				<div className="h-4 w-4 translate-x-1/2 -translate-y-1/2">
					<svg
						className="h-4 w-4 text-border-accent opacity-60"
						fill="none"
						viewBox="0 0 16 16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 2 L8 14 M2 8 L14 8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
				</div>
			</div>

			{/* Bottom Left */}
			<div className="absolute bottom-0 left-0 z-10">
				<div className="h-4 w-4 -translate-x-1/2 translate-y-1/2">
					<svg
						className="h-4 w-4 text-border-accent opacity-60"
						fill="none"
						viewBox="0 0 16 16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 2 L8 14 M2 8 L14 8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
				</div>
			</div>

			{/* Bottom Right */}
			<div className="absolute bottom-0 right-0 z-10">
				<div className="h-4 w-4 translate-x-1/2 translate-y-1/2">
					<svg
						className="h-4 w-4 text-border-accent opacity-60"
						fill="none"
						viewBox="0 0 16 16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 2 L8 14 M2 8 L14 8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
				</div>
			</div>

			{/* Content - zoom only the content on hover, not the card */}
			<div className="relative z-0 flex h-full p-6 transition-transform duration-300 group-hover:scale-[1.02]" style={{ userSelect: 'text' }}>
				{children}
			</div>
		</div>
	);
}


