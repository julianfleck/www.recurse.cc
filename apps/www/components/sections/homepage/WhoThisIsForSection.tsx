"use client";

import type { LucideIcon } from "lucide-react";
import { BentoCard } from "@/components/layout/BentoCard";
import { SingleColumnSection, ThreeColumnSection } from "@/components/layout/GridLayout";
import { FeatureCard } from "@/components/layout/FeatureCard";

export interface Audience {
	title: string;
	description: string;
	icon?: LucideIcon;
	iconName?: string; // For content-driven approach
}

interface WhoThisIsForSectionProps {
	title: string;
	audiences: Audience[];
}

/**
 * WhoThisIsForSection - 3-column cards showing target audiences
 * Content-driven component for marketing website
 */
export function WhoThisIsForSection({
	title,
	audiences,
}: WhoThisIsForSectionProps) {
	return (
		<>
			{/* Header */}
			<SingleColumnSection>
				<div className="max-w-2xl text-left">
					<h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
						{title}
					</h2>
				</div>
			</SingleColumnSection>

			{/* Audience Cards */}
			<ThreeColumnSection>
				{audiences.map((audience, index) => (
					<BentoCard key={index}>
						<FeatureCard
							description={audience.description}
							icon={audience.icon}
							iconStrokeWidth={1.5}
							title={audience.title}
						/>
					</BentoCard>
				))}
			</ThreeColumnSection>
		</>
	);
}


