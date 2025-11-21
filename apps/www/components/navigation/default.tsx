"use client";

import { Button } from "@recurse/ui/components";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@recurse/ui/components/navigation-menu";
import { ScrollArea } from "@recurse/ui/components/scroll-area";
import { IconQuestionMark } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent } from "react";
import { NavigationHeroCard, NavigationListCard, NavigationFeatureCard } from "@/components/navigation/NavigationCard";
import { SearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { navigationContent } from "@/content/homepage";
import { useScroll } from "@/contexts/ScrollContext";
import { cn } from "@/lib/utils";

// Transform navigation content for easier use
const NAVIGATION = {
	about: navigationContent.about,
	features: navigationContent.features,
	blog: {
		hero: navigationContent.blog.hero,
		articles: navigationContent.blog.items,
	},
	docs: navigationContent.docs,
};

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
								<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
									<li className="row-span-4">
										<NavigationHeroCard
											href={NAVIGATION.about.hero.href}
											onClick={(e) => handleAnchorClick(e, "about")}
											title={NAVIGATION.about.hero.title}
											description={NAVIGATION.about.hero.description}
										/>
									</li>
									<li className="row-span-4">
										<ScrollArea className="h-[280px]">
											<div className="space-y-2 pr-4">
												{NAVIGATION.about.items.map((item) => (
													<NavigationListCard
														key={item.title}
														href={item.href}
														onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
														title={item.title}
														description={item.description}
													/>
												))}
											</div>
										</ScrollArea>
									</li>
								</ul>
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
								<ul className="grid w-[400px] gap-3 p-4 md:w-[600px] lg:w-[700px] lg:grid-cols-[.75fr_repeat(2,1fr)] lg:grid-rows-2">
									<li className="row-span-2">
										<NavigationHeroCard
											href={NAVIGATION.features.hero.href}
											onClick={(e) => handleAnchorClick(e, "features")}
											title={NAVIGATION.features.hero.title}
											description={NAVIGATION.features.hero.description}
										/>
									</li>
									{NAVIGATION.features.items.map((item) => (
										<li key={item.title}>
											<NavigationFeatureCard
												href={item.href}
												onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
												title={item.title}
												description={item.description}
												icon={item.icon}
											/>
										</li>
									))}
								</ul>
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
								<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
									<li className="row-span-4">
										<NavigationHeroCard
											href={NAVIGATION.blog.hero.href}
											title={NAVIGATION.blog.hero.title}
											description={NAVIGATION.blog.hero.description}
											footer={NAVIGATION.blog.hero.footer}
										/>
									</li>
									<li className="row-span-4">
										<ScrollArea className="h-[280px]">
											<div className="space-y-2 pr-4">
												{NAVIGATION.blog.articles.map((article) => (
													<NavigationListCard
														key={article.title}
														href={article.href}
														title={article.title}
														description={article.description}
													/>
												))}
											</div>
										</ScrollArea>
									</li>
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Docs Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
							>
								Docs
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
									<li className="row-span-4">
										<NavigationHeroCard
											href={NAVIGATION.docs.hero.href}
											title={NAVIGATION.docs.hero.title}
											description={NAVIGATION.docs.hero.description}
										/>
									</li>
									<li className="row-span-4">
										<ScrollArea className="h-[280px]">
											<div className="space-y-2 pr-4">
												{NAVIGATION.docs.items.map((item) => (
													<NavigationListCard
														key={item.title}
														href={item.href}
														title={item.title}
														description={item.description}
													/>
												))}
											</div>
										</ScrollArea>
									</li>
								</ul>
							</NavigationMenuContent>
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
