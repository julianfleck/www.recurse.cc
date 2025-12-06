"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type MouseFollowerTooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	/**
	 * Pixel offset from the pointer position (x, y).
	 * Defaults to { x: 12, y: 16 } to avoid obscuring the cursor.
	 */
	offset?: { x?: number; y?: number };
	/**
	 * Optional controlled open state override.
	 */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

/**
 * MouseFollowerTooltip
 *
 * Standalone mouse-following tooltip that:
 * - Tracks pointer position on the trigger element
 * - Renders a portal attached to document.body positioned in viewport space
 * - Does NOT alter DOM structure of the child (important for tables)
 *
 * Styling/layout is provided by the caller via `content` (e.g. GenericTooltipLayout).
 */
export function MouseFollowerTooltip({
	children,
	content,
	offset,
	open,
	onOpenChange,
}: MouseFollowerTooltipProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const hoverTimeoutRef = React.useRef<number | null>(null);
	const [position, setPosition] = React.useState<{ x: number; y: number } | null>(
		null,
	);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const isControlled = open !== undefined;
	const resolvedOpen = isControlled ? open : uncontrolledOpen;

	const handleOpenChange = (next: boolean) => {
		if (!isControlled) {
			setUncontrolledOpen(next);
		}
		if (!next) {
			setPosition(null);
		}
		onOpenChange?.(next);
	};

	const child = React.isValidElement(children) ? children : <span>{children}</span>;

	const patchedChild = React.cloneElement(child, {
		onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
			(child.props as { onPointerEnter?: (e: React.PointerEvent<HTMLElement>) => void })
				.onPointerEnter?.(event);
			// Delay tooltip appearance to avoid flicker
			if (hoverTimeoutRef.current !== null) {
				window.clearTimeout(hoverTimeoutRef.current);
			}
			hoverTimeoutRef.current = window.setTimeout(() => {
				handleOpenChange(true);
			}, 800);
		},
		onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
			(child.props as { onPointerLeave?: (e: React.PointerEvent<HTMLElement>) => void })
				.onPointerLeave?.(event);
			if (hoverTimeoutRef.current !== null) {
				window.clearTimeout(hoverTimeoutRef.current);
				hoverTimeoutRef.current = null;
			}
			handleOpenChange(false);
		},
		onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
			(child.props as { onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void })
				.onPointerMove?.(event);
			setPosition({ x: event.clientX, y: event.clientY });
		},
	});

	const offsetX = offset?.x ?? 12;
	const offsetY = offset?.y ?? 16;

	return (
		<>
			{patchedChild}
			{mounted &&
				typeof document !== "undefined" &&
				createPortal(
					<AnimatePresence>
						{resolvedOpen && position ? (
							<motion.div
								key="mouse-follower-tooltip"
								initial={{ opacity: 0, scale: 0.96, y: 4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.96, y: 4 }}
								transition={{ duration: 0.12, ease: "easeOut" }}
								style={{
									position: "fixed",
									left: position.x + offsetX,
									top: position.y + offsetY,
									zIndex: 60,
									pointerEvents: "none",
								}}
							>
								<div className="max-h-[400px] max-w-xs overflow-auto whitespace-pre-wrap wrap-break-word rounded-md border border-border bg-popover px-3 py-1.5 text-foreground text-xs shadow-md">
									{content}
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}


