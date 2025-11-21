import { ScrollArea } from "@recurse/ui/components/scroll-area";
import type { MouseEvent } from "react";
import type { NavigationSection as NavigationSectionType } from "@/content/homepage";
import { NavigationHeroCard, NavigationListCard, NavigationFeatureCard } from "./NavigationCard";

interface NavigationSectionProps {
	section: NavigationSectionType;
	sectionKey: string;
	handleAnchorClick: (e: MouseEvent<HTMLAnchorElement>, hash: string) => void;
}

export function NavigationSection({ section, sectionKey, handleAnchorClick }: NavigationSectionProps) {
	const { hero, items, layout, scrollable } = section;

	// Determine grid configuration based on layout
	const gridConfig = layout === "grid" 
		? "w-[400px] md:w-[600px] lg:w-[700px] lg:grid-cols-[.75fr_repeat(2,1fr)] lg:grid-rows-2"
		: "w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]";

	const heroRowSpan = layout === "grid" ? "row-span-2" : "row-span-4";

	const renderItems = () => {
		if (layout === "grid") {
			// Grid layout for features
			return items.map((item) => (
				<li key={item.title}>
					<NavigationFeatureCard
						href={item.href}
						onClick={item.href.startsWith("/#") ? (e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href.substring(2)) : undefined}
						title={item.title}
						description={item.description}
						icon={item.icon}
					/>
				</li>
			));
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
				<ScrollArea className="h-[280px]">
					<div className="space-y-2 pr-4">
						{listItems}
					</div>
				</ScrollArea>
			);
		}

		return listItems;
	};

	return (
		<ul className={`grid gap-3 p-4 ${gridConfig}`}>
			<li className={heroRowSpan}>
				<NavigationHeroCard
					href={hero.href}
					onClick={hero.href.startsWith("/#") ? (e) => handleAnchorClick(e, sectionKey) : undefined}
					title={hero.title}
					description={hero.description}
					footer={hero.footer}
				/>
			</li>
			{layout === "grid" ? (
				// Grid layout - items are direct children of ul
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

