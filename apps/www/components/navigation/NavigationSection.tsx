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
	const heroRowSpan = isGrid ? `row-span-${gridRows}` : "row-span-4";
	const needsScroll = isGrid && gridRows > 3; // Scroll if more than 3 rows (6 items)
	
	const gridConfig = isGrid
		? `w-[400px] md:w-[600px] lg:w-[700px] lg:grid-cols-[13rem_repeat(2,1fr)] lg:grid-rows-${gridRows}`
		: "w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-[13rem_1fr]";

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
					<div className="col-span-2 row-span-3 overflow-hidden">
						<ScrollArea className="h-[380px]">
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

		if (scrollable) {
			return (
				<ScrollArea className="h-[380px]">
					<div className="space-y-2 pr-4">
						{listItems}
					</div>
				</ScrollArea>
			);
		}

		return listItems;
	};

	return (
		<ul className={`grid gap-3 p-4 max-h-[400px] ${gridConfig}`}>
			<li className={needsScroll ? "row-span-3" : heroRowSpan}>
				<NavigationHeroCard
					href={hero.href}
					onClick={hero.href.startsWith("/#") ? (e) => handleAnchorClick(e, sectionKey) : undefined}
					title={hero.title}
					description={hero.description}
					footer={hero.footer}
				/>
			</li>
			{isGrid ? (
				// Grid layout - items are direct children of ul (or wrapped in ScrollArea div)
				renderItems()
			) : scrollable ? (
				// Scrollable list layout - items wrapped in ScrollArea
				<li className="row-span-4">
					{renderItems()}
				</li>
			) : (
				// Non-scrollable list layout - items are direct children
				renderItems()
			)}
		</ul>
	);
}

