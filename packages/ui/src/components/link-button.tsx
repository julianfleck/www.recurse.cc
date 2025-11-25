"use client";

import { Button, buttonVariants } from "./button";
import { cn } from "../lib";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode, ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";

type ButtonProps = ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>;

interface LinkButtonProps extends Omit<ButtonProps, "asChild" | "children"> {
	href: string;
	children: ReactNode;
	/**
	 * Custom icon to use instead of the default (ArrowRight for internal, ArrowUpRight for external)
	 * If provided, you can control animation via animateIcon prop
	 */
	icon?: ReactNode;
	/**
	 * Whether to animate the icon on hover (translate-x-1 for ArrowRight, no animation for ArrowUpRight)
	 * Defaults to true for internal links, false for external links
	 */
	animateIcon?: boolean;
	/**
	 * Whether to use rounded-full styling (default: true)
	 * Set to false for rounded-md styling
	 * Can be passed as `<LinkButton round />` (true) or `<LinkButton round={false} />` (false)
	 */
	round?: boolean;
}

/**
 * Unified link button component that automatically handles internal vs external links.
 * - Internal links: Uses ArrowRight icon with optional animation
 * - External links: Uses ArrowUpRight icon without animation by default
 * - Supports rounded-full (default) or rounded-md styling via `round` prop
 * - Supports all Button variants and sizes (xs, sm, default, lg)
 */
export function LinkButton({
	href,
	children,
	icon,
	animateIcon,
	round = true,
	variant = "default",
	size = "default",
	className,
	...props
}: LinkButtonProps) {
	const isExternal = href.startsWith("http://") || href.startsWith("https://");
	const shouldAnimate = animateIcon ?? !isExternal; // Default: animate internal, don't animate external

	// Determine default icon if not provided
	const DefaultIcon = isExternal ? ArrowUpRight : ArrowRight;

	// Apply animation class only if shouldAnimate is true
	const iconClassName = shouldAnimate
		? "ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
		: "ml-2 h-4 w-4";

	// Size-based padding and text sizing
	// Note: Button component supports sm, default, lg - xs maps to sm with custom padding
	const sizeClasses: Record<string, string> = {
		xs: "px-2 py-1 text-xs h-7",
		sm: "px-3 py-1.5 text-sm",
		default: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	const sizeClass = sizeClasses[size as string] ?? sizeClasses.default;
	const roundedClass = round ? "rounded-full" : "rounded-md";
	
	// For xs size, use sm button size but override with custom classes
	// Button component only supports: "sm" | "default" | "lg" | "icon" | "icon-sm"
	const buttonSize = (size as string) === "xs" ? "sm" : (size === "sm" || size === "default" || size === "lg" ? size : "default");

	const content = (
		<>
			{children}
			{icon
				? (
					<span className={iconClassName}>{icon}</span>
				)
				: (
					<DefaultIcon className={iconClassName} />
				)}
		</>
	);

	return (
		<Button
			asChild
			className={cn("group", roundedClass, sizeClass, "font-medium", className)}
			size={buttonSize as "sm" | "default" | "lg"}
			variant={variant}
			{...props}
		>
			<Link href={href}>{content}</Link>
		</Button>
	);
}

