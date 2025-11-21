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
import { ScrollArea } from "@recurse/ui/components/scroll-area";
import { IconQuestionMark } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent } from "react";
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
										<NavigationMenuLink asChild>
											<Link
												href={NAVIGATION.about.hero.href}
												onClick={(e) => handleAnchorClick(e, "about")}
												className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md border! border-muted!"
											>
												<div className="mb-2 mt-4 text-lg font-medium">
													{NAVIGATION.about.hero.title}
												</div>
												<p className="text-sm leading-tight text-muted-foreground">
													{NAVIGATION.about.hero.description}
												</p>
											</Link>
										</NavigationMenuLink>
									</li>
									<li className="row-span-4">
										<ScrollArea className="h-[280px]">
											<div className="space-y-2 pr-4">
												{NAVIGATION.about.items.map((item) => (
													<NavigationMenuLink key={item.title} asChild>
														<Link
															href={item.href}
															onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
															className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all border! border-muted! bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent! focus:bg-accent focus:text-accent-foreground focus:border-accent!"
														>
															<div className="text-sm font-medium leading-none">{item.title}</div>
															<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
																{item.description}
															</p>
														</Link>
													</NavigationMenuLink>
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
										<NavigationMenuLink asChild>
											<Link
												href={NAVIGATION.features.hero.href}
												onClick={(e) => handleAnchorClick(e, "features")}
												className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md border! border-muted!"
											>
												<div className="mb-2 mt-4 text-lg font-medium">
													{NAVIGATION.features.hero.title}
												</div>
												<p className="text-sm leading-tight text-muted-foreground">
													{NAVIGATION.features.hero.description}
												</p>
											</Link>
										</NavigationMenuLink>
									</li>
									{NAVIGATION.features.items.map((item) => (
										<li key={item.title}>
											<NavigationMenuLink asChild>
												<Link
													href={item.href}
													onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
													className="flex h-full w-full select-none flex-col justify-center rounded-md p-4 no-underline outline-none transition-all border! border-muted! bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent! focus:bg-accent focus:text-accent-foreground focus:border-accent!"
												>
													<div className="text-sm font-medium leading-none mb-2">{item.title}</div>
													<p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
														{item.description}
													</p>
												</Link>
											</NavigationMenuLink>
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
										<NavigationMenuLink asChild>
											<Link
												href={NAVIGATION.blog.hero.href}
												className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md border! border-muted!"
											>
												<div className="mb-2 mt-4 text-lg font-medium">
													{NAVIGATION.blog.hero.title}
												</div>
												<p className="text-sm leading-tight text-muted-foreground">
													{NAVIGATION.blog.hero.description}
												</p>
												{NAVIGATION.blog.hero.footer && (
													<div className="mt-4 text-accent-foreground text-sm font-medium">
														{NAVIGATION.blog.hero.footer}
													</div>
												)}
											</Link>
										</NavigationMenuLink>
									</li>
									<li className="row-span-4">
										<ScrollArea className="h-[280px]">
											<div className="space-y-2 pr-4">
												{NAVIGATION.blog.articles.map((article) => (
													<NavigationMenuLink key={article.title} asChild>
														<Link
															href={article.href}
															className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all border! border-muted! bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent! focus:bg-accent focus:text-accent-foreground focus:border-accent!"
														>
															<div className="text-sm font-medium leading-none">{article.title}</div>
															<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
																{article.description}
															</p>
														</Link>
													</NavigationMenuLink>
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
										<NavigationMenuLink asChild>
											<Link
												href={NAVIGATION.docs.hero.href}
												className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md border! border-muted!"
											>
												<div className="mb-2 mt-4 text-lg font-medium">
													{NAVIGATION.docs.hero.title}
												</div>
												<p className="text-sm leading-tight text-muted-foreground">
													{NAVIGATION.docs.hero.description}
												</p>
											</Link>
										</NavigationMenuLink>
									</li>
									<li className="row-span-4">
										<ScrollArea className="h-[280px]">
											<div className="space-y-2 pr-4">
												{NAVIGATION.docs.items.map((item) => (
													<NavigationMenuLink key={item.title} asChild>
														<Link
															href={item.href}
															className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all border! border-muted! bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent! focus:bg-accent focus:text-accent-foreground focus:border-accent!"
														>
															<div className="text-sm font-medium leading-none">{item.title}</div>
															<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
																{item.description}
															</p>
														</Link>
													</NavigationMenuLink>
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
