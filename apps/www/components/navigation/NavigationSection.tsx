import { ScrollArea } from "@recurse/ui/components/scroll-area";
import type { MouseEvent } from "react";
import type { NavigationSection as NavigationSectionType } from "@/content/navigation";
import { NavigationHeroCard, NavigationListCard, NavigationGridCard } from "./NavigationCard";

interface NavigationSectionProps {
	section: NavigationSectionType;
	sectionKey: string;
	handleAnchorClick: (e: MouseEvent<HTMLAnchorElement>, hash: string) => void;
}

export function NavigationSection({ section, sectionKey, handleAnchorClick }: NavigationSectionProps) {
	const { hero, items, layout, scrollable } = section;

	// Calculate grid configuration based on layout and number of items
	const isGrid = layout === "grid";
	const gridRows = isGrid ? Math.ceil(items.length / 2) : 0; // 2 items per row for grid
	// Scroll if scrollable flag is set OR if more than 3 rows (6 items)
	const needsScroll = isGrid && (scrollable || gridRows > 3);
	
	// For list layout, check if scrolling is actually needed
	const listNeedsScroll = !isGrid && scrollable && items.length * 60 + (items.length - 1) * 8 > 320;
	
	// Determine if hero card should have fixed height (h-80) or natural height
	// Fixed height when scrolling is needed to match ScrollArea height
	const heroNeedsFixedHeight = needsScroll || listNeedsScroll;
	
	// Hero row span: for grid use calculated rows, for list layouts use number of items
	const heroRowSpan = isGrid ? `row-span-${gridRows}` : `row-span-${items.length}`;
	
	const gridConfig = isGrid
		? `w-[400px] md:w-[600px] lg:w-[700px] lg:grid-cols-[13rem_repeat(2,1fr)] lg:grid-rows-${gridRows}`
		: "w-[400px] md:w-[500px] lg:w-[600px]";

	const renderItems = () => {
		if (isGrid) {
		// Grid layout for features
		const gridItems = items.map((item) => (
			<li key={item.title}>
				<NavigationGridCard
					href={item.href}
					onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
					title={item.title}
					description={item.description}
					icon={item.icon}
					image={item.image}
				/>
			</li>
		));

			// Wrap in ScrollArea if more than 3 rows
			if (needsScroll) {
				return (
					<div className="col-span-2 row-span-3 overflow-hidden min-h-0">
						<ScrollArea className="h-80">
							<div className="grid grid-cols-2 gap-3 pr-4">
								{gridItems}
							</div>
						</ScrollArea>
					</div>
				);
			}

			return gridItems;
		}

	// List layout
	const listItems = items.map((item) => (
		<NavigationListCard
			key={item.title}
			href={item.href}
			onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
			title={item.title}
			description={item.description}
		/>
	));

		if (listNeedsScroll) {
			return (
				<ScrollArea className="h-80">
					<div className="space-y-2 pr-4 pb-2">
						{listItems}
					</div>
				</ScrollArea>
			);
		}

		// Non-scrolling list: wrap in container with vertical spacing
		return (
			<div className="space-y-2">
				{listItems}
			</div>
		);
	};

	if (isGrid) {
		// Grid layout for features/blog
		return (
			<ul className={`grid gap-3 p-4 max-h-[420px] items-start ${gridConfig}`}>
				<li className={needsScroll ? "row-span-3" : heroRowSpan}>
					<NavigationHeroCard
						href={hero.href}
						onClick={hero.href.startsWith("/#") ? (e) => handleAnchorClick(e, sectionKey) : undefined}
						title={hero.title}
						description={hero.description}
						footer={hero.footer}
						fixedHeight={heroNeedsFixedHeight}
					/>
				</li>
				{renderItems()}
			</ul>
		);
	}

	// List layout for about/docs - use flexbox so content determines height
	return (
		<div className={`flex items-start gap-3 p-4 max-h-[420px] ${gridConfig}`}>
			<NavigationHeroCard
				href={hero.href}
				onClick={hero.href.startsWith("/#") ? (e) => handleAnchorClick(e, sectionKey) : undefined}
				title={hero.title}
				description={hero.description}
				footer={hero.footer}
				fixedHeight={heroNeedsFixedHeight}
			/>
			<div className="flex-1 min-w-0">
				{renderItems()}
			</div>
		</div>
	);
}

