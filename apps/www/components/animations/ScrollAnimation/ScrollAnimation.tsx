"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type React from "react";
import { type ReactNode, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollAnimationProps {
	children: ReactNode;
	exitScale?: number;
	exitBlur?: number;
	enableFadeIn?: boolean; // Enable fade-in effect when entering viewport
	enableFadeOut?: boolean; // Enable fade-out effect when leaving viewport
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
	children,
	exitScale = 0.95,
	exitBlur = 8,
	enableFadeIn = false,
	enableFadeOut = true,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const isMobile = useIsMobile();

	// Use different offset tracking based on what effects are enabled
	const { scrollYProgress } = useScroll({
		target: ref,
		offset:
			enableFadeIn && enableFadeOut
				? (["start end", "end start"] as const) // Both fade in and fade out: track from when entering to when leaving
				: enableFadeIn
					? (["start end", "start center"] as const) // Only fade in: track entry into viewport
					: (["end end", "end start"] as const), // Only fade out: track exit from viewport
	});

	// Create all transforms unconditionally to satisfy React hooks rules
	const fadeInOutOpacity = useTransform(
		scrollYProgress,
		[0, 0.2, 0.6, 0.9],
		[0, 1, 1, 0],
	);
	const fadeInOutScale = useTransform(
		scrollYProgress,
		[0, 0.2, 0.6, 0.9],
		[exitScale, 1, 1, exitScale],
	);
	const fadeInOutBlur = useTransform(
		scrollYProgress,
		[0, 0.2, 0.6, 0.9],
		[exitBlur, 0, 0, exitBlur],
	);

	const fadeInOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
	const fadeInScale = useTransform(scrollYProgress, [0, 1], [exitScale, 1]);
	const fadeInBlur = useTransform(scrollYProgress, [0, 1], [exitBlur, 0]);

	const fadeOutOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
	const fadeOutScale = useTransform(scrollYProgress, [0, 0.75], [1, exitScale]);
	const fadeOutBlur = useTransform(scrollYProgress, [0, 0.75], [0, exitBlur]);

	// Select the appropriate transforms based on props
	let scrollOpacity, scrollScale, scrollBlur;

	if (enableFadeIn && enableFadeOut) {
		scrollOpacity = fadeInOutOpacity;
		scrollScale = fadeInOutScale;
		scrollBlur = fadeInOutBlur;
	} else if (enableFadeIn) {
		scrollOpacity = fadeInOpacity;
		scrollScale = fadeInScale;
		scrollBlur = fadeInBlur;
	} else {
		scrollOpacity = fadeOutOpacity;
		scrollScale = fadeOutScale;
		scrollBlur = fadeOutBlur;
	}

	// Create filter transform for blur
	const scrollFilter = useTransform(scrollBlur, (value) => `blur(${value}px)`);

	// On mobile, disable scroll-based blur/fade animations to avoid early content fade-out.
	if (isMobile) {
		return <div ref={ref}>{children}</div>;
	}

	return (
		<motion.div
			ref={ref}
			style={{
				opacity: scrollOpacity,
				scale: scrollScale,
				filter: scrollFilter,
			}}
		>
			{children}
		</motion.div>
	);
};

export default ScrollAnimation;
