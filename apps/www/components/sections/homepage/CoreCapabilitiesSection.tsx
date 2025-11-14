"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { BentoCard } from "@/components/layout/GridLayout";
import { SingleColumnSection } from "@/components/layout/GridLayout";

export interface Capability {
	title: string;
	description: string;
	icon?: LucideIcon;
	iconName?: string; // For content-driven approach
	href?: string;
	features?: string[];
}

interface CoreCapabilitiesSectionProps {
	title: string;
	description: string;
	capabilities: Capability[];
}

/**
 * CoreCapabilitiesSection - 2x2 grid of capability cards
 * Content-driven component for marketing website
 */
export function CoreCapabilitiesSection({
	title,
	description,
	capabilities,
}: CoreCapabilitiesSectionProps) {
	return (
		<>
			{/* Header */}
			<SingleColumnSection id="core-capabilities">
				<div className="max-w-2xl text-left">
					<h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
						{title}
					</h2>
					<p className="font-light text-lg text-muted-foreground leading-relaxed">
						{description}
					</p>
				</div>
			</SingleColumnSection>

			{/* Capabilities Grid */}
			<div className="col-span-full grid grid-cols-1 gap-6 md:grid-cols-2">
				{capabilities.map((capability, index) => {
					const CardContent = (
						<BentoCard key={index}>
							<div className="space-y-4">
								{capability.icon && (
									<div className="flex items-center justify-start">
										<div className="rounded-md border border-accent/20 bg-accent/10 p-2">
											<capability.icon
												className="h-6 w-6 text-accent"
												strokeWidth={2}
											/>
										</div>
									</div>
								)}

								<div className="space-y-3">
									<h3 className="font-medium text-lg group-hover:text-primary">
										{capability.title}
									</h3>
									<p className="font-light text-muted-foreground text-sm leading-relaxed">
										{capability.description}
									</p>

									{capability.features && capability.features.length > 0 && (
										<ul className="mt-4 space-y-2">
											{capability.features.map((feature, idx) => (
												<li
													key={idx}
													className="font-light text-muted-foreground text-sm"
												>
													{feature}
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						</BentoCard>
					);

					return capability.href ? (
						<Link
							href={capability.href}
							className="group block"
							key={index}
						>
							{CardContent}
						</Link>
					) : (
						CardContent
					);
				})}
			</div>
		</>
	);
}

