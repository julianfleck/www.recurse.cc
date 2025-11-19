"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

interface MouseFollowerTooltipProps {
	children: React.ReactNode;
	content: React.ReactNode;
	enabled?: boolean;
}

export function MouseFollowerTooltip({ 
	children, 
	content, 
	enabled = true 
}: MouseFollowerTooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!enabled) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (isVisible && containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				const isInside = 
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom;

				if (isInside) {
					setPosition({ x: e.clientX, y: e.clientY });
				}
			}
		};

		if (isVisible) {
			window.addEventListener("mousemove", handleMouseMove);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [isVisible, enabled]);

	if (!enabled) {
		return <>{children}</>;
	}

	return (
		<>
			<div
				ref={containerRef}
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
			>
				{children}
			</div>

			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						style={{
							position: "fixed",
							left: position.x + 12,
							top: position.y - 12,
							pointerEvents: "none",
							zIndex: 9999,
						}}
						className="max-w-sm"
					>
						<div className="rounded-md border border-border bg-popover px-4 py-3 shadow-lg backdrop-blur-sm">
							{content}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

