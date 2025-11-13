import { Slot } from "@radix-ui/react-slot";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@recurse/ui/components/tooltip";
import { cn } from "@recurse/ui/lib";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground/90 shadow-xs hover:bg-primary/90 hover:text-primary-foreground",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
				outline:
					"border bg-background shadow-xs backdrop-blur-xs hover:border hover:border-border hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 text-sm has-[>svg]:px-3",
				sm: "h-8 gap-1.5 rounded-md px-3 text-xs has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 text-base has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	tooltip,
	tooltipSide = "top",
	tooltipSideOffset = 0,
	icon,
	iconSide = "left",
	showIconOnHover = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		tooltip?: React.ReactNode;
		tooltipSide?: "top" | "right" | "bottom" | "left";
		tooltipSideOffset?: number;
		icon?: React.ReactNode;
		iconSide?: "left" | "right";
		showIconOnHover?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	const button = (
		<Comp
			className={cn(
				buttonVariants({ variant, size, className }),
				showIconOnHover && "group relative overflow-hidden",
			)}
			data-slot="button"
			{...props}
		>
			{icon ? (
				showIconOnHover ? (
					<div className="flex w-full items-center">
						{iconSide === "left" && (
							<>
								<span className="-translate-x-4 flex-shrink-0 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:opacity-100">
									{icon}
								</span>
								<span className="group-hover:-translate-x-1 flex-1 text-center transition-transform duration-300 ease-in-out">
									{props.children}
								</span>
							</>
						)}
						{iconSide === "right" && (
							<>
								<span className="flex-1 text-center transition-transform duration-300 ease-in-out group-hover:translate-x-1">
									{props.children}
								</span>
								<span className="flex-shrink-0 translate-x-4 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:opacity-100">
									{icon}
								</span>
							</>
						)}
					</div>
				) : (
					<div className="flex w-full items-center">
						{iconSide === "left" && (
							<span className="mr-2 flex-shrink-0">{icon}</span>
						)}
						{props.children && (
							<span
								className={
									iconSide === "right"
										? "flex-1 text-left"
										: "flex-1 text-right"
								}
							>
								{props.children}
							</span>
						)}
						{iconSide === "right" && (
							<span className="ml-2 flex-shrink-0">{icon}</span>
						)}
					</div>
				)
			) : (
				props.children
			)}
		</Comp>
	);

	if (!tooltip) {
		return button;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent side={tooltipSide} sideOffset={tooltipSideOffset}>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	);
}

export { Button, buttonVariants };
