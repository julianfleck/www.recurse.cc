"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useUIStore } from "@recurse/ui";

/**
 * Spotlight - Cursor-following spotlight effect
 * Shows when hovering over cards, extends across card boundaries
 * Uses yellow/green in light mode, violet/purple in dark mode
 */
export function Spotlight() {
	const spotlightRef = useRef<HTMLDivElement>(null);
	const spotlightActive = useUIStore((state) => state.spotlightActive);

	useEffect(() => {
		const spotlight = spotlightRef.current;
		if (!spotlight) return;

		const handleMouseMove = (e: MouseEvent) => {
			spotlight.style.left = `${e.clientX}px`;
			spotlight.style.top = `${e.clientY}px`;
		};

		document.addEventListener("mousemove", handleMouseMove);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<div
			ref={spotlightRef}
			className="pointer-events-none fixed z-50 transition-opacity duration-300 spotlight-effect"
			style={{
				width: "600px",
				height: "600px",
				marginLeft: "-300px",
				marginTop: "-300px",
				opacity: spotlightActive ? 1 : 0,
				willChange: "opacity",
			}}
		/>
	);
}

