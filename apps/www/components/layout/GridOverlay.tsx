"use client";

/**
 * GridOverlay - 8-column grid overlay at all breakpoints
 * Always shows 8 gridlines to match the grid container
 */
export function GridOverlay() {
	return (
		<div className="pointer-events-none fixed inset-0 z-50">
			<div className="mx-auto grid h-full max-w-7xl grid-cols-8 px-6 md:px-32 lg:px-40">
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

