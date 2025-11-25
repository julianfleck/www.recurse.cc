import { GlowCard } from "@recurse/ui/components/glow-card";
import { NavigationMenuLink } from "@recurse/ui/components/navigation-menu";
import Link from "next/link";
import { type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	className?: string;
	children: ReactNode;
	enableGlow?: boolean;
}

function NavigationCard({ href, onClick, className = "", children, enableGlow = true }: NavigationCardProps) {
	return (
		<NavigationMenuLink asChild>
			<GlowCard
				asChild
				enableGlow={enableGlow}
				borderGlowIntensity={0.28}
				borderGlowHoverIntensity={0.9}
				backgroundGlowIntensity={0.01}
				backgroundGlowHoverIntensity={0.06}
				glowRadius="300px"
				className={cn(
					"block h-full select-none rounded-md border border-border/70 bg-background/40 p-3 leading-none no-underline outline-none transition-colors duration-300",
					className
				)}
			>
				<Link className="contents" href={href} onClick={onClick}>
					{children}
				</Link>
			</GlowCard>
		</NavigationMenuLink>
	);
}

interface NavigationHeroCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	title: string;
	description: string;
	footer?: string;
	fixedHeight?: boolean;
}

export function NavigationHeroCard({ title, description, footer, href, onClick, fixedHeight = false }: NavigationHeroCardProps) {
	return (
		<NavigationCard href={href} onClick={onClick} className={cn(
			"flex w-52 select-none flex-col justify-between focus:shadow-md gap-y-8 bg-linear-to-b! to-accent/20 from-chart-1/10 shrink-0",
			fixedHeight ? "h-80" : "min-h-72"
		)}>
			<div className="text-2xl font-light max-w-xs leading-tight">
				{title}
			</div>
			<div>
				<p className="text-sm leading-normal text-muted-foreground pr-8 hyphens-auto">
					{description}
				</p>
				{footer && (
					<div className="mt-4 text-accent-foreground text-base font-medium">
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
		<NavigationCard href={href} onClick={onClick} className="flex flex-col justify-between space-y-1 h-full hover:bg-chart-1/20! dark:hover:bg-chart-1/10! focus:bg-chart-1/20!">
			<div className="text-sm font-medium leading-none">{title}</div>
			<p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
				{description}
			</p>
		</NavigationCard>
	);
}

interface NavigationGridCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	title: string;
	description: string;
	icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
	image?: string;
}

export function NavigationGridCard({ title, description, icon: Icon, image, href, onClick }: NavigationGridCardProps) {
	return (
		<NavigationCard href={href} onClick={onClick} className="group flex h-full w-full select-none hover:bg-chart-1/20! dark:hover:bg-chart-1/10! focus:bg-chart-1/20!">
			<div className="flex gap-3 w-full h-full">
				{image && (
					<div className="shrink-0 w-20 rounded-md overflow-hidden border border-border/60">
						<img
							src={image}
							alt={title}
							className="w-full h-full object-cover"
						/>
					</div>
				)}
				<div className="flex flex-col justify-between flex-1 gap-1.5">
					<div className="text-sm font-medium leading-tight line-clamp-2">{title}</div>
					<p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
						{description}
					</p>
				</div>
				{Icon && !image && (
					<div className="shrink-0 flex items-start justify-start">
						<Icon className="size-4 text-muted-foreground/40 transition-colors group-hover:text-accent-foreground/60" strokeWidth={1.2} />
					</div>
				)}
			</div>
		</NavigationCard>
	);
}

