"use client";

import type { ReactNode } from "react";
import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GridCard } from "./GridCard";

interface HeaderCardProps {
	title: string;
	href?: string;
	children?: ReactNode;
	className?: string;
	enableSpotlight?: boolean;
}

/**
 * HeaderCard - Component for section headers using large headline typography
 * Spans full width with grid-based padding and optional hover arrow link
 */
export function HeaderCard({
	title,
	href,
	children,
	className,
	enableSpotlight = false,
}: HeaderCardProps) {
	const content = (
		<div className="relative flex items-center">
			<h2 className="font-medium text-4xl text-muted-foreground transition-colors duration-300 leading-tight tracking-tight group-hover:text-foreground max-w-xs pl-6">
				{title}
			</h2>
			<ArrowRight 
				className={cn(
					"absolute right-0 h-8 w-8 text-muted-foreground transition-all duration-300 group-hover:animate-pulse md:h-12 md:w-12 lg:h-16 lg:w-16",
					"opacity-0 -translate-x-12 group-hover:opacity-100 group-hover:translate-x-0"
				)}
				strokeWidth={1}
			/>
			{children}
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="block">
				<GridCard 
					enableHoverEffect
					enableSpotlight={enableSpotlight}
					className={cn("group cursor-pointer px-1col py-1col lg:px-2col lg:py-halfcol", className)}
				>
					{content}
				</GridCard>
			</Link>
		);
	}

	return (
		<GridCard 
			enableHoverEffect
			enableSpotlight={enableSpotlight}
			className={cn("group px-1col py-1col lg:px-2col lg:py-halfcol", className)}
		>
			{content}
		</GridCard>
	);
}
