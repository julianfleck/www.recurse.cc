"use client";

import { BentoCard } from "@/components/layout/BentoCard";
import { SingleColumnSection } from "@/components/layout/GridLayout";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

export interface ComparisonRow {
	feature: string;
	traditionalRAG: string;
	graphRAG: string;
	recurse: string;
}

interface ComparisonSectionProps {
	title: string;
	rows: ComparisonRow[];
	detailedComparisonHref?: string;
}

/**
 * ComparisonSection - Comparison table showing Recurse vs alternatives
 * Content-driven component for marketing website
 */
export function ComparisonSection({
	title,
	rows,
	detailedComparisonHref,
}: ComparisonSectionProps) {
	return (
		<SingleColumnSection>
			<BentoCard span={4}>
				<div className="max-w-full text-left">
					<h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
						{title}
					</h2>

					{/* Comparison Table */}
					<div className="max-w-full overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell className="font-medium">Feature</TableCell>
									<TableCell className="font-medium">Traditional RAG</TableCell>
									<TableCell className="font-medium">GraphRAG</TableCell>
									<TableCell className="font-medium">Recurse</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row, index) => (
									<TableRow key={index}>
										<TableCell className="font-medium">{row.feature}</TableCell>
										<TableCell className="font-light text-muted-foreground">
											{row.traditionalRAG}
										</TableCell>
										<TableCell className="font-light text-muted-foreground">
											{row.graphRAG}
										</TableCell>
										<TableCell className="font-medium">
											{row.recurse}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{detailedComparisonHref && (
						<div className="mt-6">
							<a
								href={detailedComparisonHref}
								className="font-medium text-primary text-sm hover:underline"
							>
								Detailed comparison →
							</a>
						</div>
					)}
				</div>
			</BentoCard>
		</SingleColumnSection>
	);
}


