"use client";

/**
 * GridOverlay - Responsive grid overlay for the entire page
 * - Mobile: 4 columns
 * - Tablet: 6 columns
 * - Desktop: 8 columns
 * Place this in the layout to show gridlines across all sections
 */
export function GridOverlay() {
	return (
		<div className="pointer-events-none fixed inset-0 z-50">
			<div className="mx-auto grid h-full max-w-7xl grid-cols-4 px-6 md:grid-cols-6 md:px-32 lg:grid-cols-8 lg:px-40">
				{/* Mobile: 4 lines, Tablet: 6 lines, Desktop: 8 lines */}
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className={
							i === 0
								? "relative border-muted border-l"
								: i === 7
									? "relative hidden border-muted/60 border-l border-muted border-r lg:block"
									: i === 6
										? "relative hidden border-muted/60 border-l md:block lg:border-muted/60 lg:border-r-0"
										: i === 5
											? "relative hidden border-muted/60 border-l border-muted border-r md:block md:border-muted/60 md:border-r-0 lg:border-muted/60 lg:border-r-0"
											: i > 3
												? "relative hidden border-muted/60 border-l md:block"
												: i === 3
													? "relative border-muted/60 border-l border-muted border-r md:border-muted/60 md:border-r-0"
													: "relative border-muted/60 border-l"
						}
					/>
				))}
			</div>
		</div>
	);
}

