"use client";

import { BentoCard } from "@/components/layout/BentoCard";
import { SingleColumnSection } from "@/components/layout/GridLayout";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export interface BuildItem {
	what: string;
	description: string;
}

interface WhatYouCanBuildSectionProps {
	title: string;
	description: string;
	items: BuildItem[];
}

/**
 * WhatYouCanBuildSection - Table format showing what can be built
 * Content-driven component for marketing website
 */
export function WhatYouCanBuildSection({
	title,
	description,
	items,
}: WhatYouCanBuildSectionProps) {
	return (
		<SingleColumnSection>
			<BentoCard span={4}>
				<div className="max-w-2xl text-left">
					<h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
						{title}
					</h2>
					<p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
						{description}
					</p>

					{/* Examples Table */}
					<div className="max-w-full">
						<Table>
							<TableBody>
								{items.map((item, index) => (
									<TableRow key={index}>
										<TableCell className="w-1/3 font-medium">
											{item.what}
										</TableCell>
										<TableCell className="font-light text-muted-foreground">
											{item.description}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			</BentoCard>
		</SingleColumnSection>
	);
}


