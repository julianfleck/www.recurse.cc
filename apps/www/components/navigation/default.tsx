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
import {
	type MouseEvent,
} from "react";
import { SearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import navContent from "@/content/en/navigation.json" with { type: "json" };
import { useScroll } from "@/contexts/ScrollContext";
import { cn } from "@/lib/utils";
import { GridCard } from "@/components/layout/GridCard";

interface FeatureComponent {
	title: string;
	href: string;
	description: string;
}

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
			scrollToElement("beta");
		} else {
			window.location.href = "/#beta";
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
				<div className={cn("flex items-start gap-4", isCompact ? "gap-6" : "gap-8")}>
				{/* Logo */}
				<Link
					href="/"
					className="flex items-center"
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
						"whitespace-nowrap font-bold flex items-center transition-all duration-300",
						isCompact ? "text-[1rem]" : "text-[1.8rem]"
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
						{/* Home - only show when not on home page */}
						{pathname !== "/" && (
							<NavigationMenuItem>
								<NavigationMenuLink asChild>
									<Link
										className={cn(
											navigationMenuTriggerStyle(),
											"transition-none",
											isCompact ? "h-9 px-2 text-sm" : ""
										)}
										href="/"
									>
										Home
									</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						)}

						{/* About */}
						<NavigationMenuItem>
							<NavigationMenuLink asChild>
								<Link
									className={cn(
										navigationMenuTriggerStyle(),
										"transition-none",
										isCompact ? "h-9 px-2 text-sm" : ""
									)}
									href="/about"
								>
									About
								</Link>
							</NavigationMenuLink>
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
								<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
									{(navContent as any).featureDropdown.map((component: FeatureComponent) => (
										<li key={component.title}>
											<GridCard
												href={component.href}
												enableHoverEffect={true}
												rounded={true}
												className="p-3"
											>
												<div className="font-medium text-sm leading-none">{component.title}</div>
												<p className="line-clamp-4 pt-2 text-muted-foreground text-sm leading-snug">
													{component.description}
												</p>
											</GridCard>
										</li>
									))}
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>

						{/* Technology Dropdown */}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								className={cn(
									"transition-none",
									isCompact ? "h-9 px-2 text-sm" : ""
								)}
							>
								Technology
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
									<li>
										<GridCard
											href="/about#frame-semantics"
											enableHoverEffect={true}
											rounded={true}
											className="p-3"
										>
											<div className="font-medium text-sm leading-none">Frame Semantics</div>
											<p className="line-clamp-4 pt-2 text-muted-foreground text-sm leading-snug">
												Structured knowledge representation using semantic frames with defined roles and relationships.
											</p>
										</GridCard>
									</li>
									<li>
										<GridCard
											href="/about#recursive-graphs"
											enableHoverEffect={true}
											rounded={true}
											className="p-3"
										>
											<div className="font-medium text-sm leading-none">Recursive Graph Construction</div>
											<p className="line-clamp-4 pt-2 text-muted-foreground text-sm leading-snug">
												Dynamic graph building that learns from every interaction, creating self-improving knowledge structures.
											</p>
										</GridCard>
									</li>
									<li>
										<GridCard
											href="/about#operations-as-knowledge"
											enableHoverEffect={true}
											rounded={true}
											className="p-3"
										>
											<div className="font-medium text-sm leading-none">Operations as Knowledge</div>
											<p className="line-clamp-4 pt-2 text-muted-foreground text-sm leading-snug">
												How the system stores and uses knowledge about how to work with knowledge.
											</p>
										</GridCard>
									</li>
									<li>
										<GridCard
											href="/about#comparison"
											enableHoverEffect={true}
											rounded={true}
											className="p-3"
										>
											<div className="font-medium text-sm leading-none">RAGE vs. RAG</div>
											<p className="line-clamp-4 pt-2 text-muted-foreground text-sm leading-snug">
												Compare Recursive Agentic Graph Embeddings with traditional RAG approaches.
											</p>
										</GridCard>
									</li>
								</ul>
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
