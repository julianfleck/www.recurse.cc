import { NavigationMenuLink } from "@recurse/ui/components/navigation-menu";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

interface NavigationCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	className?: string;
	children: ReactNode;
}

function NavigationCard({ href, onClick, className = "", children }: NavigationCardProps) {
	return (
		<NavigationMenuLink asChild>
			<Link
				href={href}
				onClick={onClick}
				className={`block select-none rounded-md p-3 leading-none no-underline outline-none transition-all border! border-muted! bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent! focus:bg-accent focus:text-accent-foreground focus:border-accent! ${className}`}
			>
				{children}
			</Link>
		</NavigationMenuLink>
	);
}

interface NavigationHeroCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	title: string;
	description: string;
	footer?: string;
}

export function NavigationHeroCard({ title, description, footer, href, onClick }: NavigationHeroCardProps) {
	return (
		<NavigationCard href={href} onClick={onClick} className="flex h-full w-full select-none flex-col justify-between bg-linear-to-b from-muted/50 to-muted focus:shadow-md">
			<div className="text-lg font-medium">
				{title}
			</div>
			<div>
				<p className="text-sm leading-tight text-muted-foreground">
					{description}
				</p>
				{footer && (
					<div className="mt-4 text-accent-foreground text-sm font-medium">
						{footer}
					</div>
				)}
			</div>
		</NavigationCard>
	);
}

interface NavigationListCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	title: string;
	description: string;
}

export function NavigationListCard({ title, description, href, onClick }: NavigationListCardProps) {
	return (
		<NavigationCard href={href} onClick={onClick} className="flex flex-col justify-between space-y-1">
			<div className="text-sm font-medium leading-none">{title}</div>
			<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
				{description}
			</p>
		</NavigationCard>
	);
}

interface NavigationFeatureCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	title: string;
	description: string;
	icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export function NavigationFeatureCard({ title, description, icon: Icon, href, onClick }: NavigationFeatureCardProps) {
	return (
		<NavigationCard href={href} onClick={onClick} className="group flex h-full w-full select-none">
			<div className="grid grid-cols-6 gap-3 w-full">
				<div className="col-span-5 flex flex-col justify-between">
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
						{description}
					</p>
				</div>
				{Icon && (
					<div className="col-span-1 flex items-start justify-start">
						<Icon className="size-8 text-muted-foreground/40 transition-colors group-hover:text-accent-foreground/60" strokeWidth={1.2} />
					</div>
				)}
			</div>
		</NavigationCard>
	);
}

