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
	offset = 12,
	open: controlledOpen,
	onOpenChange,
}: MouseFollowerTooltipProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const [position, setPosition] = React.useState<{ x: number; y: number } | null>(
		null,
	);

	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = (next: boolean) => {
		if (controlledOpen === undefined) {
			setUncontrolledOpen(next);
		}
		onOpenChange?.(next);
	};

	return (
		<Tooltip open={open} onOpenChange={setOpen}>
			<TooltipTrigger asChild>
				<div
					onPointerEnter={() => setOpen(true)}
					onPointerLeave={() => {
						setOpen(false);
						setPosition(null);
					}}
					onPointerMove={(event) => {
						setPosition({ x: event.clientX, y: event.clientY });
					}}
				>
					{children}
				</div>
			</TooltipTrigger>

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


