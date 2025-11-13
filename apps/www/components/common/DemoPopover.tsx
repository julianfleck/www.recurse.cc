"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import DemoPage from "@/app/demo/page";
import AnimatedContent from "@/components/animations/AnimatedContent/AnimatedContent";
import { DemoAppProvider } from "@/contexts/DemoAppContext";
import { useDemo } from "@/contexts/DemoContext";

export function DemoPopover() {
	const { isDemoOpen, closeDemo } = useDemo();
	const pathname = usePathname();

	// Handle escape key to close demo
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isDemoOpen) {
				closeDemo();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isDemoOpen, closeDemo]);

	// Prevent body scroll when demo is open
	useEffect(() => {
		if (isDemoOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isDemoOpen]);

	// Don't render the popover if we're on the actual demo page
	if (pathname === "/demo") {
		return null;
	}

	if (!isDemoOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[100]">
			{/* Backdrop with blur - animated fade in */}
			<AnimatedContent distance={0} duration={0.15} initialOpacity={0}>
				<div
					className="absolute inset-0 bg-background/50 backdrop-blur-md"
					onClick={closeDemo}
				/>
			</AnimatedContent>

			{/* Demo content */}
			<div
				className="relative z-[101] flex min-h-screen items-center justify-center p-4"
				onClick={closeDemo}
			>
				<AnimatedContent
					blur={true}
					delay={0.05}
					direction="vertical"
					distance={40}
					duration={0.25}
					initialBlur={4}
					scale={0.98}
				>
					<div
						className="flex h-[90vh] w-[95vw] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<DemoAppProvider>
							<DemoPage />
						</DemoAppProvider>
					</div>
				</AnimatedContent>
			</div>
		</div>
	);
}
