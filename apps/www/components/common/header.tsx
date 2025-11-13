"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DefaultNavigation } from "@/components/navigation/default";

// Simple debounce function
function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;
	return (...args: Parameters<T>) => {
		const later = () => {
			timeout = null;
			func(...args);
		};
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

export function Header() {
	const pathname = usePathname();
	const isSpecialPage =
		pathname.startsWith("/api-test") || pathname === "/split-text-demo";

	const [isScrolled, setIsScrolled] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const shrinkThreshold = 50; // Pixels scrolled down before shrinking/sticking
	const initialHeight = 120; // Initial height in px
	const shrunkHeight = 60; // Shrunk height in px

	const handleScroll = useCallback(() => {
		const debouncedScroll = debounce(() => {
			setIsScrolled(window.scrollY > shrinkThreshold);
		}, 50);
		debouncedScroll();
	}, []);

	useEffect(() => {
		setIsScrolled(window.scrollY > shrinkThreshold);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	const isCompact = isSpecialPage || isScrolled;

	// Base classes - always fixed, handles transitions
	const baseHeaderClasses = `
        fixed top-0 left-0 right-0
        transition-all duration-300 ease-in-out
        z-50
    `;

	// Classes for the background/styling element - transitions opacity based on final isCompact
	const backgroundClasses = `
        absolute inset-0
        bg-background/80
        backdrop-blur-lg
        transition-opacity duration-300 ease-in-out
        z-[-1]
        ${isCompact ? "opacity-100" : "opacity-0"}
    `;

	// Determine dynamic height based on final isCompact
	const heightClass = isCompact
		? `h-[${shrunkHeight}px]`
		: `h-[${initialHeight}px]`;

	return (
		<>
			{/* Outer header element sets fixed position and height */}
			<header
				className={`${baseHeaderClasses} ${heightClass}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Inner element for background/styles with opacity transition */}
				<div className={backgroundClasses} />
				{/* Content container */}
				<div
					className={`container relative z-[1] mx-auto flex h-full items-center transition-all duration-300 ease-in-out ${isCompact ? "border-border border-b" : "pt-8"}`}
				>
					{/* Navigation controlled by final isCompact state */}
					<DefaultNavigation isCompact={isCompact} isHovered={isHovered} />
				</div>
			</header>
		</>
	);
}
