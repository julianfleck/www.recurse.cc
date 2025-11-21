import { NavigationMenuLink } from "@recurse/ui/components/navigation-menu";
import Link from "next/link";
import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
	href: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	className?: string;
	children: ReactNode;
	enableGlow?: boolean;
}

function NavigationCard({ href, onClick, className = "", children, enableGlow = true }: NavigationCardProps) {
	const cardRef = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		if (!enableGlow || !cardRef.current) return;

		const card = cardRef.current;

		const handleMouseMove = (e: globalThis.MouseEvent) => {
			const rect = card.getBoundingClientRect();
			const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
			const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

			card.style.setProperty('--glow-x', `${relativeX}%`);
			card.style.setProperty('--glow-y', `${relativeY}%`);
			card.style.setProperty('--glow-intensity', '1');
		};

		const handleMouseLeave = () => {
			card.style.setProperty('--glow-intensity', '0');
		};

		card.addEventListener('mousemove', handleMouseMove);
		card.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			card.removeEventListener('mousemove', handleMouseMove);
			card.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [enableGlow]);

	return (
		<NavigationMenuLink asChild>
			<Link
				ref={cardRef}
				href={href}
				onClick={onClick}
				className={cn(
					"block select-none rounded-md p-3 leading-none no-underline outline-none transition-all",
					// "backdrop-blur-3xl bg-background/50 dark:bg-background/70",
					"border! border-border!",
					"hover:border-chart-1! focus:border-chart-1!",
					"dark:hover:border-chart-1/20! dark:focus:border-chart-1/40!",
					"hover:bg-transparent focus:bg-transparent",
					enableGlow && "nav-card-glow",
					className
				)}
				style={
					enableGlow
						? ({
								'--glow-x': '20%',
								'--glow-y': '20%',
								'--glow-intensity': '0',
								'--glow-radius': '300px',
							} as React.CSSProperties)
						: undefined
				}
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
		<NavigationCard href={href} onClick={onClick} className="flex h-full w-52 select-none flex-col justify-between focus:shadow-md gap-y-8 min-h-72 bg-linear-to-b! to-accent/20 from-chart-1/10 shrink-0">
			<div className="text-2xl font-light max-w-xs leading-tight">
				{title}
			</div>
			<div>
				<p className="text-sm leading-normal text-muted-foreground pr-8 hyphens-auto">
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
}

export function NavigationGridCard({ title, description, icon: Icon, href, onClick }: NavigationGridCardProps) {
	return (
		<NavigationCard href={href} onClick={onClick} className="group flex h-full w-full select-none hover:bg-chart-1/20! dark:hover:bg-chart-1/10! focus:bg-chart-1/20!">
			<div className="grid grid-cols-6 gap-3 w-full h-full">
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

