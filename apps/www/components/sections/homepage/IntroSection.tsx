"use client";

import type { ReactNode } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { SingleColumnSection } from "@/components/layout/GridLayout";

interface IntroSectionProps {
	title: string;
	content: string | ReactNode;
	id?: string;
}

/**
 * IntroSection - Introduction section explaining the problem/approach
 * Content-driven component for marketing website
 */
export function IntroSection({
	title,
	content,
	id,
}: IntroSectionProps) {
	// Split string content by double newlines to create paragraphs
	const paragraphs =
		typeof content === "string"
			? content.split("\n\n").filter((p) => p.trim())
			: null;

	return (
		<SingleColumnSection id={id}>
			<BentoCard span={4}>
				<div className="max-w-2xl text-left">
					<h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
						{title}
					</h2>
					{paragraphs ? (
						<div className="space-y-4 font-light text-lg text-muted-foreground leading-relaxed">
							{paragraphs.map((paragraph, index) => (
								<p key={index}>{paragraph.trim()}</p>
							))}
						</div>
					) : (
						<div className="font-light text-lg text-muted-foreground leading-relaxed">
							{content}
						</div>
					)}
				</div>
			</BentoCard>
		</SingleColumnSection>
	);
}

