"use client";

/**
 * GridOverlay - 8-column grid overlay at all breakpoints
 * Mobile: full width (no padding)
 * Tablet+: matches Grid8Col padding
 */
export function GridOverlay() {
	return (
		<div className="pointer-events-none fixed inset-0 z-50">
			<div className="mx-auto grid h-full max-w-7xl grid-cols-8 md:px-32 lg:px-40">
				{/* Create a line at the start of each column, plus one at the end */}
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className={
							i === 0
								? "relative border-muted border-l"
								: i === 7
									? "relative border-muted/60 border-l border-muted border-r"
									: "relative border-muted/60 border-l"
						}
					/>
				))}
			</div>
		</div>
	);
}

