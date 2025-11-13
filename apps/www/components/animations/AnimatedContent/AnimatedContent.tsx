/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

"use client";

import { motion } from "framer-motion";
import React, { type ReactNode } from "react";

interface AnimatedContentProps {
	children: ReactNode;
	distance?: number;
	direction?: "vertical" | "horizontal";
	reverse?: boolean;
	duration?: number;
	ease?:
		| "linear"
		| "easeIn"
		| "easeOut"
		| "easeInOut"
		| "circIn"
		| "circOut"
		| "circInOut"
		| "backIn"
		| "backOut"
		| "backInOut"
		| "anticipate";
	initialOpacity?: number;
	scale?: number;
	delay?: number;
	blur?: boolean;
	initialBlur?: number;
	staggerDelay?: number; // Delay between child animations
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
	children,
	distance = 100,
	direction = "vertical",
	reverse = false,
	duration = 0.8,
	ease = "easeOut",
	initialOpacity = 0,
	scale = 1,
	delay = 0,
	blur = false,
	initialBlur = 10,
	staggerDelay,
}) => {
	// Calculate initial transform values
	const offset = reverse ? -distance : distance;

	// Base animation variants
	const hiddenVariant = {
		opacity: initialOpacity,
		scale,
		filter: blur ? `blur(${initialBlur}px)` : "blur(0px)",
		...(direction === "horizontal" ? { x: offset } : { y: offset }),
	};

	const visibleVariant = {
		opacity: 1,
		scale: 1,
		filter: "blur(0px)",
		...(direction === "horizontal" ? { x: 0 } : { y: 0 }),
	};

	// If staggerDelay is specified, create container variants for staggered children
	if (staggerDelay) {
		const containerVariants = {
			hidden: {},
			visible: {
				transition: {
					staggerChildren: staggerDelay,
				},
			},
		};

		const childVariants = {
			hidden: hiddenVariant,
			visible: visibleVariant,
		};

		return (
			<motion.div
				initial="hidden"
				transition={{
					duration,
					ease,
					delay,
				}}
				variants={containerVariants}
				viewport={{ once: true, amount: 0.1 }}
				whileInView="visible"
			>
				{React.Children.map(children, (child, index) => (
					<motion.div
						key={index}
						transition={{
							duration,
							ease,
						}}
						variants={childVariants}
					>
						{child}
					</motion.div>
				))}
			</motion.div>
		);
	}

	// Simple single animation without staggering
	const variants = {
		hidden: hiddenVariant,
		visible: visibleVariant,
	};

	return (
		<motion.div
			initial="hidden"
			transition={{
				duration,
				ease,
				delay,
			}}
			variants={variants}
			viewport={{ once: true, amount: 0.1 }}
			whileInView="visible"
		>
			{children}
		</motion.div>
	);
};

export default AnimatedContent;
