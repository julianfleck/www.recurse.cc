"use client";

import { Button } from "@recurse/ui/components";
import { IconMenu2 } from "@tabler/icons-react";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { GridCard } from "@/components/layout/GridCard";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navigationContent, type NavigationItem, type NavigationSection as NavigationSectionType } from "@/content/navigation";
import { useScroll } from "@/contexts/ScrollContext";
import { cn } from "@/lib/utils";

// Map section keys to their primary hrefs
const SECTION_HREFS: Record<string, string> = {
	about: "/#about",
	features: "/#features",
	blog: "/blog",
	docs: "https://docs.recurse.cc",
};

// Section display names
const SECTION_LABELS: Record<string, string> = {
	about: "About",
	features: "Features",
	blog: "Blog",
	docs: "Docs",
};

interface MobileNavigationProps {
	isCompact: boolean;
	blogItems: NavigationItem[];
}

type NavigationSectionKey = "about" | "features" | "blog" | "docs";

interface MobileSectionProps {
	sectionKey: NavigationSectionKey;
	section: NavigationSectionType;
	onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
	onSectionClick: (sectionKey: NavigationSectionKey) => void;
}

function MobileNavigationSection({ sectionKey, section, onNavigate, onSectionClick }: MobileSectionProps) {
	const { hero, items } = section;
	const href = SECTION_HREFS[sectionKey];
	const isExternal = href.startsWith("http");

	return (
		<AccordionItem value={sectionKey}>
			{/* Custom accordion trigger with clickable link */}
			<AccordionPrimitive.Header className="flex">
				<div className="flex flex-1 items-center justify-between py-4">
					{/* Clickable link label */}
					{isExternal ? (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-left font-medium text-muted-foreground text-sm hover:text-accent-foreground transition-colors"
							onClick={() => onSectionClick(sectionKey)}
						>
							{SECTION_LABELS[sectionKey]}
						</a>
					) : (
						<button
							type="button"
							className="text-left font-medium text-muted-foreground text-sm hover:text-accent-foreground transition-colors"
							onClick={() => onSectionClick(sectionKey)}
						>
							{SECTION_LABELS[sectionKey]}
						</button>
					)}
					{/* Expand/collapse chevron */}
					<AccordionPrimitive.Trigger
						className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors [&[data-state=open]>svg]:rotate-180"
					>
						<ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200" />
					</AccordionPrimitive.Trigger>
				</div>
			</AccordionPrimitive.Header>
			<AccordionContent>
				<div className="space-y-4 pt-1">
					{/* Hero card */}
					<GridCard
						href={hero.href}
						onClick={(event) => onNavigate(event, hero.href)}
						rounded
						enableHoverEffect
						className="px-1col py-1col"
					>
						<div className="flex flex-col gap-2">
							<div className="text-base font-semibold leading-snug">
								{hero.title}
							</div>
							<p className="text-sm text-muted-foreground leading-normal">
								{hero.description}
							</p>
							{hero.footer && (
								<div className="text-sm font-medium text-accent-foreground mt-1">
									{hero.footer}
								</div>
							)}
						</div>
					</GridCard>

					{/* Items */}
					<nav className="space-y-1">
						{items.map((item) => (
							<Link
								key={item.title}
								href={item.href}
								onClick={(event) => onNavigate(event, item.href)}
								className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
							>
								<div className="font-medium">
									{item.title}
								</div>
								{item.description && (
									<p className="mt-1 text-xs text-muted-foreground">
										{item.description}
									</p>
								)}
							</Link>
						))}
					</nav>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

export function MobileNavigation({ isCompact, blogItems }: MobileNavigationProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { scrollToElement } = useScroll();
	const [isOpen, setIsOpen] = useState(false);

	const sections: Record<NavigationSectionKey, NavigationSectionType> = {
		about: navigationContent.about,
		features: navigationContent.features,
		blog: {
			...navigationContent.blog,
			items: blogItems,
		},
		docs: navigationContent.docs,
	};

	const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
		event.preventDefault();
		setIsOpen(false);

		if (pathname === "/") {
			const header = document.querySelector("header");
			const headerHeight = header ? header.getBoundingClientRect().height : 0;

			const offset = anchor === "about" ? headerHeight : undefined;
			scrollToElement(anchor, offset);
		} else {
			window.location.href = `/#${anchor}`;
		}
	};

	const handleSectionClick = (sectionKey: NavigationSectionKey) => {
		const href = SECTION_HREFS[sectionKey];
		if (!href) return;

		setIsOpen(false);

		// For external links, handled by the <a> tag
		if (href.startsWith("http")) {
			return;
		}

		// For anchor links on the home page
		if (href.startsWith("/#")) {
			const anchor = href.substring(2);
			if (pathname === "/") {
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

	const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
		// Handle in-page anchors with scroll behavior
		if (href.startsWith("/#")) {
			const anchor = href.substring(2);
			handleAnchorClick(event, anchor);
			return;
		}

		// For normal links, close the sheet and allow navigation
		setIsOpen(false);
	};

	return (
		<div
			className="flex items-center justify-between h-full w-full"
			style={{
				// Use generous, symmetric horizontal padding in the compact header used on mobile.
				paddingLeft: "2.25rem",
				paddingRight: "2.25rem",
			}}
		>
			{/* Left: Logo and wordmark */}
			<Link
				href="/"
				className="flex items-center gap-2 pl-4"
				aria-label="Recurse Home"
			>
				<svg
					className={cn(
						"transition-all duration-300",
						isCompact ? "h-6 w-6" : "h-7 w-7",
					)}
					viewBox="0 0 100 100"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						d="M27.3,50c0-7.5-6.1-13.6-13.6-13.6,5.1,0,9.8-1.7,13.6-4.5,1.7-1.3,3.3-2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6s-6.1,13.6-13.6,13.6c-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6Z"
						fill="currentColor"
					/>
					<circle cx="86.9" cy="86.9" r="13.1" fill="currentColor" />
					<path
						d="M50,64.6c-7.5,0-13.6-6.1-13.6-13.6,0-7.5,6.1-13.6,13.6-13.6,5.1,0,9.8-1.7,13.6-4.5,1.7-1.3,3.3,2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6s-6.1,13.6-13.6,13.6c-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6,0,7.5-6.1,13.6-13.6,13.6Z"
						fill="currentColor"
					/>
					<path
						d="M50,100c-7.5,0-13.6-6.1-13.6-13.6,0-5.1-1.7-9.8-4.5-13.6-1.3-1.7-2.8-3.3-4.5-4.5-3.8-2.9-8.5-4.5-13.6-4.5-7.5,0-13.6-6.1-13.6-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6,0,5.1,1.7,9.8,4.5,13.6,1.3,1.7,2.8,3.3,4.5,4.5,3.8,2.9,8.5,4.5,13.6,4.5s9.8-1.7,13.6-4.5c1.7-1.3,3.3-2.8,4.5-4.5,2.9-3.8,4.5-8.5,4.5-13.6,0-7.5,6.1-13.6,13.6-13.6,7.5,0,13.6,6.1,13.6,13.6,0,7.5-6.1,13.6-13.6,13.6-5.1,0-9.8,1.7-13.6,4.5-1.7,1.3-3.3,2.8-4.5,4.5-2.9,3.8-4.5,8.5-4.5,13.6,0,7.5-6.1,13.6-13.6,13.6Z"
						fill="currentColor"
					/>
				</svg>
				<span
					className={cn(
						"whitespace-nowrap font-bold flex items-center transition-all duration-300 text-[1.25rem]",
						isCompact && "text-[1.1rem]",
					)}
				>
					<span>recurse</span>
					<span className="font-normal">.cc</span>
				</span>
			</Link>

			{/* Right: search, theme, and menu */}
			<div className="flex items-center gap-3">
				<SearchToggle
					className={cn(
						"p-0 h-9 w-9",
						isCompact && "h-8 w-8",
					)}
					enableHotkey={true}
					placeholder="Search documentation..."
					size="icon"
					variant="outline"
				/>
				<ThemeToggle
					className={cn(
						"h-9 w-9",
						isCompact && "h-8 w-8",
					)}
				/>

				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<Button
						type="button"
						size="icon"
						variant="outline"
						className={cn(
							"h-9 w-9",
							isCompact && "h-8 w-8",
						)}
						onClick={() => setIsOpen(true)}
						aria-label="Open navigation menu"
					>
						<IconMenu2 className="size-4" strokeWidth={1.5} />
					</Button>
					<SheetContent
						side="right"
						className="w-full max-w-sm border-l px-2 pb-4 pt-3 flex flex-col"
					>
						<SheetHeader className="px-4 pb-2 pt-3">
							<SheetTitle>Menu</SheetTitle>
						</SheetHeader>
						<div className="flex-1 overflow-y-auto px-4">
							<Accordion type="single" collapsible>
								{(Object.keys(sections) as NavigationSectionKey[]).map((key) => (
									<MobileNavigationSection
										key={key}
										sectionKey={key}
										section={sections[key]}
										onNavigate={handleNavigate}
										onSectionClick={handleSectionClick}
									/>
								))}
							</Accordion>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}


