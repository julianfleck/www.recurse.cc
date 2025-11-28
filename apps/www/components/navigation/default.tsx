"use client";

import { Button } from "@recurse/ui/components";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@recurse/ui/components/navigation-menu";
import { IconQuestionMark } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent } from "react";
import { NavigationSection } from "@/components/navigation/NavigationSection";
import { SearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { navigationContent, type NavigationItem } from "@/content/navigation";
import { useScroll } from "@/contexts/ScrollContext";
import { cn } from "@/lib/utils";

// Map section keys to their primary hrefs
const SECTION_HREFS: Record<string, string> = {
	about: "/#about",
	features: "/#features",
	blog: "/blog",
	docs: "https://docs.recurse.cc",
};

interface DefaultNavigationProps {
	isCompact: boolean;
	isHovered: boolean;
	blogItems: NavigationItem[];
}

// Navigation sections configuration
const NAVIGATION_SECTIONS = {
	about: navigationContent.about,
	features: navigationContent.features,
	docs: navigationContent.docs,
} as const;

// Accept isCompact and isHovered props
export function DefaultNavigation({
	isCompact,
	isHovered,
	blogItems,
}: DefaultNavigationProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { scrollToElement } = useScroll();

	const handleTriggerClick = (e: MouseEvent, sectionKey: string) => {
		const href = SECTION_HREFS[sectionKey];
		if (!href) return;

		// For external links, open in new tab
		if (href.startsWith("http")) {
			window.open(href, "_blank", "noopener,noreferrer");
			return;
		}

		// For anchor links on the home page
		if (href.startsWith("/#")) {
			const anchor = href.substring(2);
			if (pathname === "/") {
				e.preventDefault();
				const header = document.querySelector("header");
				const headerHeight = header ? header.getBoundingClientRect().height : 0;
				const offset = anchor === "about" ? headerHeight : undefined;
				scrollToElement(anchor, offset);
			} else {
				router.push(href);
			}
			return;
		}

		// For internal pages
		router.push(href);
	};

	const handleBetaClick = (e: MouseEvent) => {
		e.preventDefault();
		if (pathname === "/") {
			// Calculate header height for proper offset
			const header = document.querySelector("header");
			const headerHeight = header ? header.getBoundingClientRect().height : 0;
			scrollToElement("signup", headerHeight);
		} else {
			window.location.href = "/#signup";
		}
	};

	const handleAnchorClick = (e: MouseEvent, anchor: string) => {
		e.preventDefault();
		if (pathname === "/") {
			// Calculate header height for proper offset
			const header = document.querySelector("header");
			const headerHeight = header ? header.getBoundingClientRect().height : 0;
			
			// For "about" anchor, use header height to account for fixed header
			// This ensures content appears just below the header, not hidden behind it
			const offset = anchor === "about" ? headerHeight : undefined;
			scrollToElement(anchor, offset);
		} else {
			window.location.href = `/#${anchor}`;
		}
	};

	return (
		<div 
			className="flex items-center justify-between h-full w-full transition-all duration-300"
			style={{
				paddingLeft: "2.5rem",
				paddingRight: isCompact ? "1.25rem" : "2.5rem",
			}}
		>
			{/* Left side: Logo, Wordmark and navigation */}
				<div
					className={cn(
						"flex items-center transition-all duration-300",
						isCompact ? "gap-16" : "gap-8",
					)}
				>
				<div className={cn("flex items-start gap-8")}>
				{/* Logo */}
				<Link
					href="/"
					className="flex items-center pl-2"
					aria-label="Recurse Logo"
				>
					<svg
						className={cn(
							"transition-all duration-300",
							isCompact ? "h-5 w-5" : "h-8 w-8"
						)}
						viewBox="0 0 100 100"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path d="M27.3,50c0-7.5-6.1-13.6-13.6-13.6,5.1,0,9.8-1.7,13.6-4.5,1.7-1.3,3.3-2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6s-6.1,13.6-13.6,13.6c-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6Z" fill="currentColor"/>
						<circle cx="86.9" cy="86.9" r="13.1" fill="currentColor"/>
						<path d="M50,64.6c-7.5,0-13.6-6.1-13.6-13.6,0-7.5,6.1-13.6,13.6-13.6,5.1,0,9.8-1.7,13.6-4.5,1.7-1.3,3.3,2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6s-6.1,13.6-13.6,13.6c-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6,0,7.5-6.1,13.6-13.6,13.6Z" fill="currentColor"/>
						<path d="M50,100c-7.5,0-13.6-6.1-13.6-13.6,0-5.1-1.7-9.8-4.5-13.6-1.3-1.7-2.8-3.3-4.5-4.5-3.8-2.9-8.5-4.5-13.6-4.5-7.5,0-13.6-6.1-13.6-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6,0,5.1,1.7,9.8,4.5,13.6,1.3,1.7,2.8,3.3,4.5,4.5,3.8,2.9,8.5,4.5,13.6,4.5s9.8-1.7,13.6-4.5c1.7-1.3,3.3-2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6,0,7.5-6.1,13.6-13.6,13.6-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6,0,7.5-6.1,13.6-13.6,13.6Z" fill="currentColor"/>
					</svg>
				</Link>

				{/* Wordmark */}
				<Link
					className={cn(
						"whitespace-nowrap font-bold flex items-center transition-all duration-300 pl-2",
						isCompact ? "text-[1rem]" : "text-[1.6rem]"
					)}
					href="/"
				>
					<span>recurse</span>
					<span className="font-normal">.cc</span>
				</Link>

				</div>

				{/* Navigation Menu */}
				<NavigationMenu
					className={cn(
						"transition-opacity duration-300",
						isCompact || isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
					)}
				>
					<NavigationMenuList className="flex gap-1">
						{/* About Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
								onClick={(e) => handleTriggerClick(e, "about")}
							>
								About
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<NavigationSection 
									section={NAVIGATION_SECTIONS.about}
									sectionKey="about"
									handleAnchorClick={handleAnchorClick}
								/>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Features Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
								onClick={(e) => handleTriggerClick(e, "features")}
							>
								Features
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<NavigationSection 
									section={NAVIGATION_SECTIONS.features}
									sectionKey="features"
									handleAnchorClick={handleAnchorClick}
								/>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Blog Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
								onClick={(e) => handleTriggerClick(e, "blog")}
							>
								Blog
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<NavigationSection 
									section={{ ...navigationContent.blog, items: blogItems }}
									sectionKey="blog"
									handleAnchorClick={handleAnchorClick}
								/>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Docs Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
								onClick={(e) => handleTriggerClick(e, "docs")}
							>
								Docs
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<NavigationSection 
									section={NAVIGATION_SECTIONS.docs}
									sectionKey="docs"
									handleAnchorClick={handleAnchorClick}
								/>
							</NavigationMenuContent>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>

			{/* Right side: Utility buttons */}
			<TooltipProvider delayDuration={0}>
				<div
					className={cn(
						"flex items-center transition-all duration-300",
						"gap-2",
					)}
				>
					<Button
						className={cn(
							"transition-all duration-300",
							isCompact ? "h-9 text-sm px-3" : "h-10"
						)}
						onClick={handleBetaClick}
						size={isCompact ? "sm" : "default"}
						variant="subtle"
					>
						Join Beta
					</Button>

					<SearchToggle
						className={cn(
							"transition-all duration-300",
							isCompact ? "h-9 w-9" : "h-10 w-10",
						)}
						enableHotkey={true}
						placeholder="Search documentation..."
						size="icon"
						variant="outline"
					/>

					<Link href="/faq">
						<Button
							className={cn(
								"transition-all duration-300",
								isCompact ? "h-9 w-9" : "h-10 w-10",
							)}
							size="icon"
							tooltip="Frequently Asked Questions"
							variant="outline"
						>
							<IconQuestionMark 
								className={cn(
									isCompact ? "size-4" : "size-5"
								)} 
								strokeWidth={1.5} 
							/>
						</Button>
					</Link>

					<ThemeToggle className={cn(
						"transition-all duration-300",
						isCompact ? "h-9 w-9" : "h-10 w-10"
					)} />
				</div>
			</TooltipProvider>
		</div>
	);
}
