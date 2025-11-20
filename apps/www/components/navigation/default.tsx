"use client";

import { Button } from "@recurse/ui/components";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@recurse/ui/components/navigation-menu";
import { IconQuestionMark } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent } from "react";
import { SearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useScroll } from "@/contexts/ScrollContext";
import { cn } from "@/lib/utils";
import { DropdownGrid, HeroCard, ItemCard } from "./DropdownGrid";

interface DefaultNavigationProps {
	isCompact: boolean;
	isHovered: boolean;
}

// Accept isCompact and isHovered props
export function DefaultNavigation({
	isCompact,
	isHovered,
}: DefaultNavigationProps) {
	const pathname = usePathname();
	const { scrollToElement } = useScroll();

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
				paddingLeft: '2rem',
				paddingRight: isCompact ? '0.5rem' : '2rem'
			}}
		>
			{/* Left side: Logo, Wordmark and navigation */}
			<div className={cn(
				"flex items-center transition-all duration-300",
				isCompact ? "gap-20" : "gap-6"
			)}>
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
							>
								About
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<DropdownGrid rows={2} hasHero={true}>
									<HeroCard
										href="/#about"
										onClick={(e) => handleAnchorClick(e, "about")}
										icon={
											<svg
												className="h-12 w-12"
												viewBox="0 0 100 100"
												xmlns="http://www.w3.org/2000/svg"
												aria-hidden="true"
											>
												<path d="M27.3,50c0-7.5-6.1-13.6-13.6-13.6,5.1,0,9.8-1.7,13.6-4.5,1.7-1.3,3.3-2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6s-6.1,13.6-13.6,13.6c-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6Z" fill="currentColor"/>
												<circle cx="86.9" cy="86.9" r="13.1" fill="currentColor"/>
												<path d="M50,64.6c-7.5,0-13.6-6.1-13.6-13.6,0-7.5,6.1-13.6,13.6-13.6,5.1,0,9.8-1.7,13.6-4.5,1.7-1.3,3.3,2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6s-6.1,13.6-13.6,13.6c-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6,0,7.5-6.1,13.6-13.6,13.6Z" fill="currentColor"/>
												<path d="M50,100c-7.5,0-13.6-6.1-13.6-13.6,0-5.1-1.7-9.8-4.5-13.6-1.3-1.7-2.8-3.3-4.5-4.5-3.8-2.9-8.5-4.5-13.6-4.5-7.5,0-13.6-6.1-13.6-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6,0,5.1,1.7,9.8,4.5,13.6,1.3,1.7,2.8,3.3,4.5,4.5,3.8,2.9,8.5,4.5,13.6,4.5s9.8-1.7,13.6-4.5c1.7-1.3,3.3-2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6,0,7.5-6.1,13.6-13.6,13.6-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6,0,7.5-6.1,13.6-13.6,13.6Z" fill="currentColor"/>
											</svg>
										}
										title="Context Infrastructure"
										description="Memory substrate for AI systems that understand"
									/>
									<ItemCard
										href="/faq"
										title="FAQ"
										description="Common questions"
									/>
									<ItemCard
										href="https://docs.recurse.cc/getting-started/beta"
										title="Beta Access"
										description="Join the beta"
									/>
									<ItemCard
										href="/#comparison"
										onClick={(e) => handleAnchorClick(e, "comparison")}
										title="RAGE vs. RAG"
										description="How we're different"
									/>
									<ItemCard
										href="/about"
										title="Technology"
										description="How it works"
									/>
								</DropdownGrid>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Features Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
							>
								Features
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<DropdownGrid rows={2} hasHero={false}>
									<ItemCard
										href="/#features"
										onClick={(e) => handleAnchorClick(e, "features")}
										title="Semantic Navigation"
										description="Navigate meaning through typed relationships"
									/>
									<ItemCard
										href="/#features"
										onClick={(e) => handleAnchorClick(e, "features")}
										title="Adaptive Schemas"
										description="Automatic pattern discovery, zero config"
									/>
									<ItemCard
										href="/#features"
										onClick={(e) => handleAnchorClick(e, "features")}
										title="Temporal Versioning"
										description="Living memory with complete history"
									/>
									<ItemCard
										href="/#build"
										onClick={(e) => handleAnchorClick(e, "build")}
										title="Proxy Integration"
										description="Change one line—your base URL—for automatic context injection"
									/>
								</DropdownGrid>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Blog Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
							>
								Blog
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<DropdownGrid rows={2} hasHero={true}>
									<HeroCard
										href="/blog"
										title="Blog"
										description="Updates, insights, and deep dives into context infrastructure"
										footer={
											<div className="text-accent-foreground text-sm font-medium">
												Read articles →
											</div>
										}
									/>
									<ItemCard
										href="https://docs.recurse.cc/concepts/rage"
										title="Understanding RAGE"
										description="Core technology"
									/>
									<ItemCard
										href="https://docs.recurse.cc/concepts/frames"
										title="Frame Semantics"
										description="Structured knowledge"
									/>
									<ItemCard
										href="https://docs.recurse.cc/guides/using-the-api"
										title="API Guide"
										description="Build with Recurse"
									/>
									<ItemCard
										href="https://docs.recurse.cc/guides/api-vs-proxy"
										title="API vs Proxy"
										description="Choose your approach"
									/>
								</DropdownGrid>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Docs */}
						<NavigationMenuItem>
							<NavigationMenuLink asChild>
								<Link
									className={cn(
										navigationMenuTriggerStyle(),
										"transition-none",
										isCompact ? "h-9 px-2 text-sm" : ""
									)}
									href="/docs"
								>
									Docs
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>

			{/* Right side: Utility buttons */}
			<TooltipProvider delayDuration={0}>
				<div className={cn(
					"flex items-center transition-all duration-300",
					isCompact ? "gap-1" : "gap-2"
				)}>
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
							"p-0 transition-all duration-300",
							isCompact ? "h-9 w-9" : "h-10 w-10"
						)}
						enableHotkey={true}
						placeholder="Search documentation..."
						size="icon"
						variant="outline"
					/>

					<Link href="/faq">
						<Button
							className={cn(
								"p-0 transition-all duration-300",
								isCompact ? "h-9 w-9" : "h-10 w-10"
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
