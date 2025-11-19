"use client";

import { useEffect, useState } from "react";
import Particles from "./Particles/Particles";

export function ParticlesBackground() {
	// Calculate initial opacity based on current scroll position
	const getOpacityForScroll = (scrollPercentage: number) => {
		if (scrollPercentage < 0.05) {
			return 1;
		} else if (scrollPercentage < 0.15) {
			const fadeProgress = (scrollPercentage - 0.05) / 0.1;
			return 1 - (fadeProgress * 0.6);
		} else if (scrollPercentage < 0.7) {
			return 0.4;
		} else if (scrollPercentage < 0.85) {
			const fadeProgress = (scrollPercentage - 0.7) / 0.15;
			return 0.4 + (fadeProgress * 0.6);
		} else {
			return 1;
		}
	};

	const [opacity, setOpacity] = useState(1); // Always start with 1 for SSR
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const viewportHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			
			// Calculate scroll percentage (0 to 1)
			const maxScroll = documentHeight - viewportHeight;
			const scrollPercentage = maxScroll > 0 ? scrollY / maxScroll : 0;
			
			const newOpacity = getOpacityForScroll(scrollPercentage);
			setOpacity(newOpacity);
		};

		// Run on mount and scroll
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div className="pointer-events-none fixed inset-0 z-0">
			{/* Particles with dynamic opacity */}
			<div 
				className="absolute inset-0 transition-opacity duration-500 ease-in-out"
				style={{ opacity }}
			>
			<Particles
				className="text-red-orange-300 dark:text-white"
				enableMouseFollow={true}
				parallaxStrength={0.15}
				particleColor="currentColor"
				particleCount={80}
				particleSize={3}
				speed={0.3}
			/>
			</div>
			
		{/* Gradient mask at top only - always at full opacity */}
		<div className="absolute inset-x-0 top-0 h-120 bg-linear-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" />
		</div>
	);
}

