"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DefaultNavigation } from "@/components/navigation/default";
import { MobileNavigation } from "@/components/navigation/mobile";
import { Grid8Col } from "@/components/layout/Grid8Col";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/content/navigation";

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

interface HeaderClientProps {
	blogItems: NavigationItem[];
}

export function HeaderClient({ blogItems }: HeaderClientProps) {
	const pathname = usePathname();
	const isSpecialPage =
		pathname.startsWith("/api-test") || pathname === "/split-text-demo";

	const isMobile = useIsMobile();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const shrinkThreshold = 50; // Pixels scrolled down before shrinking/sticking

	const handleScroll = useCallback(() => {
		const debouncedScroll = debounce(() => {
			setIsScrolled(window.scrollY > shrinkThreshold);
		}, 50);
		debouncedScroll();
	}, []);

	const isCompact = isSpecialPage || isScrolled || isMobile;

	useEffect(() => {
		setIsScrolled(window.scrollY > shrinkThreshold);
		window.addEventListener("scroll", handleScroll);
		document.body.classList.toggle('header-compact', isCompact);
		document.body.classList.toggle('header-expanded', !isCompact);
		return () => {
			window.removeEventListener("scroll", handleScroll);
			document.body.classList.remove('header-compact');
			document.body.classList.remove('header-expanded');
		};
	}, [handleScroll, isCompact]);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
				// Top padding: 1 grid unit in expanded, 0.2 in compact
				isCompact 
					? "pt-[calc(var(--spacing-halfcol-abs)*0.2)]" 
					: "pt-[calc(var(--spacing-halfcol-abs)*1)]",
				// Bottom padding: 0.5 grid unit in expanded, 0.2 in compact
				isCompact 
					? "pb-[calc(var(--spacing-halfcol-abs)*0.2)]"
					: "pb-[calc(var(--spacing-halfcol-abs)*0.5)]",
				// Border at bottom for collapsed mode
				isCompact && "border-border border-b",
				// Minimum height
				"min-h-[40px]",
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Background */}
			<div
				className={cn(
					"absolute inset-0 bg-background/80 backdrop-blur-lg transition-opacity duration-300 ease-in-out z-[-1]",
					isCompact ? "opacity-100" : "opacity-0",
				)}
			/>
			{/* Content */}
			<Grid8Col className="relative z-[1] h-full flex items-center">
				<div className="w-full">
					<div className="hidden md:block">
						<DefaultNavigation
							isCompact={isCompact}
							isHovered={isHovered}
							blogItems={blogItems}
						/>
					</div>
					<div className="block md:hidden">
						<MobileNavigation
							isCompact={isCompact}
							blogItems={blogItems}
						/>
					</div>
				</div>
			</Grid8Col>
		</header>
	);
}

