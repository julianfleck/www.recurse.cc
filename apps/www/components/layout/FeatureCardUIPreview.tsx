"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { CardStack } from "@/components/ui/card-stack";

export function FeatureCardUIPreview() {
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseEnter = useCallback(() => setIsHovered(true), []);
	const handleMouseLeave = useCallback(() => setIsHovered(false), []);

	const cardItems = useMemo(
		() => [
			{
				id: 1,
				content: (
					<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-card rounded-lg border">
						Image 1
					</div>
				),
				className: "",
			},
			{
				id: 2,
				content: (
					<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-card rounded-lg border">
						Image 2
					</div>
				),
				className: "",
			},
			{
				id: 3,
				content: (
					<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-card rounded-lg border">
						Image 3
					</div>
				),
				className: "",
			},
		],
		[],
	);

	return (
		<motion.div
			className="absolute inset-0 overflow-hidden flex items-center justify-center"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			initial={false}
		>
		{/* Background gradient blur - matching mouse follower colors and settings */}
		<div 
			className="absolute inset-0 -bottom-32 pointer-events-none opacity-[0.15] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen"
			style={{
				background: 'radial-gradient(circle 600px at 50% 100%, rgb(var(--glow-color-rgb)) 0%, transparent 60%)'
			}}
		/>

		{/* Headline at top */}
		<motion.h3
			className="absolute top-0 left-0 right-0 z-10 text-xl md:text-3xl font-light! leading-tight mb-4 tracking-tight px-1col py-1col md:p-8"
			animate={{
				opacity: isHovered ? 0.35 : 1,
				filter: isHovered ? "blur(4px)" : "blur(0px)",
			}}
			transition={{
				duration: 0.2,
				ease: "easeInOut",
			}}
		>
			Navigate your knowledge conversationally
		</motion.h3>

		{/* Card Stack - springs to center with scale on hover */}
		<motion.div
			className="absolute w-full px-1col md:px-8 top-1/2 left-1/2 -translate-x-1/2 z-20"
			style={{
				maxWidth: '600px',
			}}
			animate={{
				y: isHovered ? '-50%' : '20%',
				scale: isHovered ? 1.05 : 1,
			}}
			transition={{
				type: "spring",
				stiffness: 350,
				damping: 22,
			}}
		>
			<CardStack items={cardItems} isPaused={isHovered} isHovered={isHovered} />
		</motion.div>
		</motion.div>
	);
}

