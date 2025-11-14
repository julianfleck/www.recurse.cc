"use client";

/**
 * GridOverlay - Global 8-column grid overlay for the entire page
 * Place this in the layout to show gridlines across all sections
 */
export function GridOverlay() {
	return (
		<div className="pointer-events-none fixed inset-0 z-50">
			<div className="mx-auto grid h-full max-w-7xl grid-cols-8 px-6 md:px-32 lg:px-40">
				{/* Create a line at the start of each column, plus one at the end */}
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className="relative border-muted border-l last:border-r"
					/>
				))}
			</div>
		</div>
	);
}

