"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagicBentoProps {
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
	columns?: 1 | 2 | 3 | 4 | 6;
}

const maxWidthClasses = {
	sm: "max-w-screen-sm",
	md: "max-w-screen-md",
	lg: "max-w-screen-lg",
	xl: "max-w-screen-xl",
	"2xl": "max-w-screen-2xl",
	full: "max-w-full",
};

const columnClasses = {
	1: "grid-cols-1",
	2: "grid-cols-1 md:grid-cols-2",
	3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

/**
 * MagicBento - Animated bento grid layout
 * Based on reactbits.dev Magic Bento with smooth animations
 */
export function MagicBento({
	children,
	className,
	maxWidth = "xl",
	columns = 4,
}: MagicBentoProps) {
	return (
		<div
			className={cn(
				"mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20",
				maxWidthClasses[maxWidth],
				className,
			)}
		>
			<motion.div
				className={cn(
					"grid auto-rows-fr",
					columnClasses[columns],
					// No gap - cards sit flush
				)}
				initial="hidden"
				animate="visible"
				variants={{
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							staggerChildren: 0.1,
							delayChildren: 0.2,
						},
					},
				}}
			>
				{children}
			</motion.div>
		</div>
	);
}

interface MagicBentoCardProps {
	children: ReactNode;
	className?: string;
	span?: 1 | 2 | 3 | 4;
	rowSpan?: 1 | 2 | 3 | 4;
}

/**
 * MagicBentoCard - Individual card wrapper with animation
 * Cards sit flush with + crosses in corners
 */
export function MagicBentoCard({
	children,
	className,
	span = 1,
	rowSpan = 1,
}: MagicBentoCardProps) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: {
						duration: 0.5,
						ease: "easeOut",
					},
				},
			}}
			className={cn(
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
			{children}
		</motion.div>
	);
}

