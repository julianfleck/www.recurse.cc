"use client";

import React, { useState, useEffect, useRef } from "react";
import { LinkButton } from "@recurse/ui/components";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { HeaderCard } from "@/components/layout/HeaderCard";
import { TypingText } from "@recurse/ui/components";
import { homepageContent } from "@/content/homepage";

export function BuildWithRecurseSection() {
	const [typingKey, setTypingKey] = useState(0);
	const [typingStage, setTypingStage] = useState(0);
	const sectionRef = useRef<HTMLDivElement>(null);

	// Reset typing animation when section comes into view
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setTypingKey((prev) => prev + 1);
						setTypingStage(0); // Reset to stage 0
					}
				});
			},
			{ threshold: 0.3 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => {
			if (sectionRef.current) {
				observer.unobserve(sectionRef.current);
			}
		};
	}, []);

	return (
		<ScrollAnimation enableFadeIn={true} exitBlur={4} exitScale={0.98}>
			<div ref={sectionRef} id="build" className="group/build-with-recurse scroll-mt-[60px]">
				<Grid8Col className="">
					{/* Header - spans all columns */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={8}>
						<HeaderCard title={homepageContent.whatYouCanBuild.title} href="/docs/getting-started/api-vs-proxy" enableSpotlight openInNewTab />
					</GridCell>

					{/* Build Items - 2x2 nested grid - Mobile: 8/8, Tablet: 8/8, Desktop: 4/8 (left half) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<div className="grid grid-cols-2 gap-0 h-full">
							{homepageContent.whatYouCanBuild.items.map((item, index) => (
								<GridCard
									key={index}
									enableHoverEffect
									enableSpotlight
									className="group/build-card flex flex-col justify-between px-1col py-1col md:p-8 rounded-none border-r border-b last:border-r-0 nth-2:border-r-0 nth-3:border-b-0 nth-4:border-b-0"
								>
									<div className="space-y-3">
										<h3 className="text-muted-foreground! dark:group-hover/build-card:text-foreground! group-hover/build-card:text-foreground! leading-relaxed text-lg transition-colors duration-300">
											{item.what}
										</h3>
										<p className="font-light text-muted-foreground group-hover/build-card:text-foreground text-sm leading-relaxed transition-colors duration-300">
											{item.description}
										</p>
									</div>
								</GridCard>
							))}
						</div>
					</GridCell>

					{/* Code Example Card - Mobile: 8/8, Tablet: 8/8, Desktop: 4/8 (right half) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<GridCard enableHoverEffect enableSpotlight className="flex h-full flex-col px-1col py-1col md:p-8">
							{/* Claim */}
							<h3 className="text-xl md:text-3xl font-light! leading-tight mb-6">
								Make your AI context-aware with just one line of code
							</h3>

							{/* Code block */}
							<div className="flex-1 relative">
								{/* Gradient mask top */}
								<div className="absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-background to-transparent z-10 pointer-events-none" />

								{/* Code block */}
								<div className="relative overflow-hidden">
									<pre className="text-xs font-mono overflow-x-auto min-h-[260px]">
										<code className="text-muted-foreground/50">
											{`import OpenAI from 'openai';\n\nconst client = new OpenAI({`}
										</code>
										<code className="text-muted-foreground">
											{`\n  apiKey: process.env.OPENAI_API_KEY,`}
										</code>

										{/* Highlighted line with typing animation */}
										<code className="block my-1 bg-accent/10 border-l-4 border-accent pl-2 text-foreground font-medium">
											<mark>
												{`baseURL: '`}

												{/* Stage 1: https:// */}
												{typingStage === 0 && (
													<TypingText
														key={`${typingKey}-stage1`}
														text="https://"
														speed={50}
														delay={1000}
														showCursor={false}
														className="inline"
														once={false}
														onComplete={() => setTypingStage(1)}
													/>
												)}

												{/* Show completed stage 1 text */}
												{typingStage > 0 && "https://"}

												{/* Stage 2: api.recurse.cc/ */}
												{typingStage === 1 && (
													<TypingText
														key={`${typingKey}-stage2`}
														text="api.recurse.cc/"
														speed={50}
														delay={400}
														showCursor={false}
														className="inline"
														once={false}
														onComplete={() => setTypingStage(2)}
													/>
												)}

												{/* Show completed stage 2 text */}
												{typingStage > 1 && "api.recurse.cc/"}

												{/* Stage 3: proxy/ with cursor */}
												{typingStage === 2 && (
													<TypingText
														key={`${typingKey}-stage3`}
														text="proxy/"
														speed={50}
														delay={400}
														showCursor={true}
														cursor="|"
														cursorClassName="text-foreground w-auto! -ms-[0.2em]"
														className="inline"
														once={false}
													/>
												)}

												{`https://api.openai.com/v1/',`}
											</mark>
										</code>

										<code className="text-muted-foreground">
											{`  defaultHeaders: {\n    'X-API-Key': process.env.RECURSE_API_KEY,\n    'X-Recurse-Scope': 'my_project'\n  }\n});`}
										</code>
										<code className="text-muted-foreground/50">
											{`\n\n// Use the client normally\nconst completion = await client.chat...`}
										</code>
									</pre>
								</div>

								{/* Gradient mask bottom */}
								<div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none" />
							</div>
						</GridCard>
					</GridCell>

					{/* CTA Cards - Three cards (2-4-2) */}
					{/* Left: Headline (2 columns) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex flex-col justify-between h-full px-1col py-1col md:p-8">
							<h3 className="text-xl text-foreground leading-tight">Automatic context injection</h3>
							<p className="font-light text-muted-foreground text-lg leading-relaxed mt-auto pt-4">
								No need for manual context engineering. Use our proxy to get started in minutes.
							</p>
						</GridCard>
					</GridCell>

					{/* Center: Description text (4 columns) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={4}>
						<GridCard enableHoverEffect enableSpotlight className="flex flex-col justify-center h-full px-1col py-1col md:p-8">
							<p className="font-light text-foreground text-base max-w-sm leading-relaxed">
								Swap your base URL to point to the Recurse proxy. When you send a request to your AI provider,
								Recurse retrieves context from your knowledge graph and injects it into the request. When your
								model responds, Recurse extracts semantic frames and stores them back. Your code sees a standard
								response. Enrichment and extraction happen automatically.
							</p>
						</GridCard>
					</GridCell>

					{/* Right: CTA button (2 columns) */}
					<GridCell colSpan={8} mdColSpan={8} lgColSpan={2}>
						<GridCard enableHoverEffect enableSpotlight className="flex items-center justify-center h-full px-1col py-1col md:p-8">
							<LinkButton href="/docs/getting-started/using-the-proxy" size="lg" className="w-full">
								Get started
							</LinkButton>
						</GridCard>
					</GridCell>
				</Grid8Col>
			</div>
		</ScrollAnimation>
	);
}

