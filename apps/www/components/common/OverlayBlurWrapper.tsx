"use client";

import type { ReactNode } from "react";
import { useDemo } from "@/contexts/DemoContext";

interface OverlayBlurWrapperProps {
	children: ReactNode;
}

export function OverlayBlurWrapper({ children }: OverlayBlurWrapperProps) {
	const { isDemoOpen } = useDemo();

	return (
		<div
			className={`transition-all duration-300 ${isDemoOpen ? "opacity-60 blur-sm" : "opacity-100 blur-0"}`}
		>
			{children}
		</div>
	);
}
