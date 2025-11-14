"use client";

import type { ReactNode } from "react";
import { Button } from "@recurse/ui/components";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedContent from "@/components/animations/AnimatedContent/AnimatedContent";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { DocsLinkButton } from "@/components/common/DocsLinkButton";

interface HeroSectionProps {
	headline: string;
	subheadline: string;
	introText: string;
	learnMoreHref?: string;
	learnMoreText?: string;
	docsText?: string;
}

/**
 * HeroSection - Main hero section for homepage
 * Content-driven component for marketing website
 */
export function HeroSection({
	headline,
	subheadline,
	introText,
	learnMoreHref = "/about",
	learnMoreText = "Learn More",
	docsText = "Read the docs",
}: HeroSectionProps) {
	return (
		<ScrollAnimation
			enableFadeIn={true}
			enableFadeOut={true}
			exitBlur={12}
			exitScale={0.9}
		>
			<div className="relative z-10 mx-auto max-w-4xl pb-16">
				<div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
					<div className="mx-auto max-w-6xl text-left">
						{/* Main Headline */}
						<AnimatedContent
							blur={true}
							delay={0.3}
							direction="vertical"
							distance={80}
							duration={1.0}
							initialBlur={8}
						>
							<h1 className="mb-12 font-medium text-2xl leading-tight tracking-tight md:text-4xl lg:text-6xl">
								{headline}
							</h1>
						</AnimatedContent>

						{/* Intro Content */}
						<AnimatedContent
							blur={true}
							delay={1.5}
							direction="vertical"
							distance={60}
							duration={0.8}
							initialBlur={6}
						>
							<div>
								{/* Subheadline */}
								<p className="mx-auto mb-2 max-w-5xl text-left font-medium text-foreground text-lg leading-normal md:text-2xl">
									{subheadline}
								</p>

								{/* Main intro text */}
								<p className="mx-auto mb-12 max-w-5xl text-left font-light text-base text-muted-foreground leading-normal transition-colors duration-300 hover:text-foreground/80 md:text-2xl hyphens-auto">
									{introText}
								</p>

								<div className="flex justify-start gap-4">
									<Button
										asChild
										className="group rounded-full px-4 py-3 font-medium text-base"
										size="default"
										variant="default"
									>
										<Link href={learnMoreHref}>
											{learnMoreText}
											<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
										</Link>
									</Button>
									<DocsLinkButton variant="subtle">
										{docsText}
									</DocsLinkButton>
								</div>
							</div>
						</AnimatedContent>
					</div>
				</div>
			</div>
		</ScrollAnimation>
	);
}


