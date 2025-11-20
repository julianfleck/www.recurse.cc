"use client";

import { Button } from "@recurse/ui/components";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";

export function CTASection() {
	return (
		<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
			<div className="relative z-10 pb-1col group/cta">
				<Grid8Col>
					{/* Main CTA Card - Full Width */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<GridCard enableHoverEffect enableSpotlight className="px-1col py-1col lg:px-2col">
							<div className="space-y-8">
								<h2 className="font-medium text-2xl leading-[1.1] tracking-tight md:text-3xl lg:text-4xl text-foreground">
									Context isn’t optional anymore
								</h2>

								<p className="max-w-3xl font-light text-base text-muted-foreground leading-relaxed md:text-xl">
									Whether you’re designing agents, research platforms, or
									adaptive interfaces — Recurse gives you the structure and semantic
									depth traditional tools lack. It’s the memory substrate for
									AI-native infrastructure.
								</p>

								<div className="flex flex-wrap gap-4">
									<Button
										asChild
										className="group rounded-full px-4 py-3 font-medium text-base"
										size="default"
										variant="default"
									>
										<Link href="/about">
											Learn More
											<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
										</Link>
									</Button>
									<Button
										asChild
										className="group rounded-full px-4 py-3 font-medium text-base"
										size="default"
										variant="outline"
									>
										<Link href="/docs">
											View Documentation
											<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
										</Link>
									</Button>
								</div>
							</div>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</div>
		</ScrollAnimation>
	);
}
