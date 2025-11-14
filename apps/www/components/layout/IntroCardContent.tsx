"use client";

import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IntroCardContentProps {
	title: string;
	text?: string;
	icon?: LucideIcon;
	children?: ReactNode;
	className?: string;
	titleClassName?: string;
	textClassName?: string;
}

/**
 * IntroCardContent - Content component for intro cards
 * Title at top, text/children at bottom
 * Text is selectable and properly aligned
 */
export function IntroCardContent({
	title,
	text,
	icon: Icon,
	children,
	className,
	titleClassName,
	textClassName,
}: IntroCardContentProps) {
	return (
		<div className={cn("flex h-full min-h-0 flex-col", className)}>
			{/* Title - Top aligned */}
			<div className={cn("text-left flex-shrink-0", titleClassName)}>
				{Icon && (
					<div className="mb-4 flex items-center justify-start">
						<div className="rounded-md border border-accent/20 bg-accent/10 p-2">
							<Icon className="h-6 w-6 text-accent" strokeWidth={2} />
						</div>
					</div>
				)}
				<h2 className="font-medium text-2xl tracking-tight md:text-3xl lg:text-4xl">
					{title}
				</h2>
			</div>

			{/* Spacer to push content to bottom */}
			<div className="flex-1" />

			{/* Text/Content - Bottom aligned */}
			<div className={cn("text-left flex-shrink-0", textClassName)}>
				{text && (
					<p className="font-light text-lg text-muted-foreground leading-relaxed md:text-xl lg:text-2xl">
						{text}
					</p>
				)}
				{children}
			</div>
		</div>
	);
}

