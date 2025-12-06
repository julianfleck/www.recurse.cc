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
	 * Pixel offset from the pointer position.
	 * Defaults to 12px diagonally down/right.
	 */
	offset?: number;
	/**
	 * Optional controlled open state override.
	 */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

/**
 * MouseFollowerTooltip
 *
 * Thin wrapper around the standard Tooltip that:
 * - Tracks pointer position within the trigger
 * - Positions the tooltip near the pointer using fixed positioning
 *
 * Useful for dense UIs (tables, graphs) where you want tooltips to
 * follow the cursor instead of being anchored to the trigger box.
 */
export function MouseFollowerTooltip({
	children,
	content,
	offset = 0,
	open: controlledOpen,
	onOpenChange,
}: MouseFollowerTooltipProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const [position, setPosition] = React.useState<{ x: number; y: number } | null>(
		null,
	);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const handleOpenChange = (next: boolean) => {
		if (!isControlled) {
			setUncontrolledOpen(next);
		}
		if (!next) {
			setPosition(null);
		}
		onOpenChange?.(next);
	};

	// Ensure we don't wrap table rows / other semantic elements in extra DOM
	const child = React.isValidElement(children) ? children : <span>{children}</span>;

	const patchedChild = React.cloneElement(child, {
		onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
			(child.props as { onPointerEnter?: (e: React.PointerEvent<HTMLElement>) => void })
				.onPointerEnter?.(event);
			handleOpenChange(true);
		},
		onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
			(child.props as { onPointerLeave?: (e: React.PointerEvent<HTMLElement>) => void })
				.onPointerLeave?.(event);
			handleOpenChange(false);
		},
		onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
			(child.props as { onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void })
				.onPointerMove?.(event);
			setPosition({ x: event.clientX, y: event.clientY });
		},
	});

	return (
		<Tooltip open={open} onOpenChange={handleOpenChange}>
			<TooltipTrigger asChild>{patchedChild}</TooltipTrigger>

			{position && (
				<TooltipContent
					avoidCollisions={false}
					// We override positioning with fixed coords below
					side="top"
					align="start"
					sideOffset={0}
					className="pointer-events-none"
					style={{
						position: "fixed",
						left: position.x + offset,
						top: position.y + offset,
						transform: "none",
					}}
				>
					{content}
				</TooltipContent>
			)}
		</Tooltip>
	);
}


