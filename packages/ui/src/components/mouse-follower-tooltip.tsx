"use client";

import * as React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@recurse/ui/components/tooltip";

type MouseFollowerTooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	/**
	 * Optional controlled open state override.
	 */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

/**
 * MouseFollowerTooltip
 *
 * For now this is a thin convenience wrapper around the standard Tooltip that:
 * - Uses the full child element as the trigger (typically a table row)
 * - Positions the tooltip near the trigger with Radix's default placement
 *
 * This keeps behavior predictable in complex layouts (nested scroll, transforms)
 * while still giving a "hover anywhere on the row to see details" experience.
 */
export function MouseFollowerTooltip({
	children,
	content,
	open,
	onOpenChange,
}: MouseFollowerTooltipProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isControlled = open !== undefined;

	const resolvedOpen = isControlled ? open : uncontrolledOpen;

	const handleOpenChange = (next: boolean) => {
		if (!isControlled) {
			setUncontrolledOpen(next);
		}
		onOpenChange?.(next);
	};

	const child = React.isValidElement(children) ? children : <span>{children}</span>;

	return (
		<Tooltip open={resolvedOpen} onOpenChange={handleOpenChange}>
			<TooltipTrigger asChild>{child}</TooltipTrigger>
			<TooltipContent
				side="top"
				align="start"
				sideOffset={6}
				className="max-h-[400px] max-w-xs overflow-auto whitespace-pre-wrap wrap-break-word"
			>
				{content}
			</TooltipContent>
		</Tooltip>
	);
}


