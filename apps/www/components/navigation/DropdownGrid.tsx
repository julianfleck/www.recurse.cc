import { GridCard } from "@/components/layout/GridCard";
import type { ReactNode } from "react";

interface DropdownGridProps {
	children: ReactNode;
	/** Number of rows in the grid (hero card will span all rows) */
	rows?: 2 | 3 | 4;
	/** Whether to include a hero card (affects column layout) */
	hasHero?: boolean;
}

/**
 * Dropdown grid layout component
 * Creates a consistent grid for navigation dropdowns with optional hero card
 * 
 * Layout:
 * - If hasHero=true: 3 columns (hero spans column 1, items fill columns 2-3)
 * - If hasHero=false: 2 columns (items fill all columns)
 */
export function DropdownGrid({ children, rows = 2, hasHero = true }: DropdownGridProps) {
	const columns = hasHero ? 3 : 2;
	
	return (
		<div 
			className="w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px]"
			style={{ 
				display: 'grid',
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
				gridAutoFlow: 'row',
			}}
		>
			{children}
		</div>
	);
}

interface HeroCardProps {
	href: string;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
	icon?: ReactNode;
	title: string;
	description: string;
	footer?: ReactNode;
}

/**
 * Hero card that spans all rows in the first column
 */
export function HeroCard({ href, onClick, icon, title, description, footer }: HeroCardProps) {
	return (
		<div style={{ gridRow: '1 / -1', gridColumn: '1' }}>
			<GridCard
				href={href}
				enableHoverEffect={true}
				rounded={true}
				glowColor="chart-1"
				className="flex flex-col justify-between p-6 h-full"
				onClick={onClick}
			>
				{icon && <div className="mb-4">{icon}</div>}
				<div>
					<div className="mb-2 font-medium text-lg text-muted-foreground transition-colors group-hover/card:text-foreground">
						{title}
					</div>
					<p className="text-muted-foreground text-sm leading-tight">
						{description}
					</p>
				</div>
				{footer && <div className="mt-4">{footer}</div>}
			</GridCard>
		</div>
	);
}

interface ItemCardProps {
	href: string;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
	title: string;
	description: string;
}

/**
 * Single item card that spans 1 row and 1 column
 */
export function ItemCard({ href, onClick, title, description }: ItemCardProps) {
	return (
		<GridCard
			href={href}
			enableHoverEffect={true}
			rounded={true}
			glowColor="chart-1"
			className="group/card p-3 flex flex-col justify-between h-full"
			onClick={onClick}
		>
			<div className="font-medium text-sm leading-none text-muted-foreground transition-colors group-hover/card:text-foreground">
				{title}
			</div>
			<p className="pt-2 text-muted-foreground text-sm leading-snug">
				{description}
			</p>
		</GridCard>
	);
}

