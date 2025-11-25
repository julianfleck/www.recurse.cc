"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { GlowCard } from "@recurse/ui/components/glow-card";
import { ScrollArea } from "@recurse/ui/components/scroll-area";
import { Badge } from "@recurse/ui/components/badge";
import { Button, LinkButton } from "@recurse/ui/components";
import { Input } from "@/components/ui/input";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { TextSwap } from "@/components/text-transitions/text-swap";
import { CTASection } from "@/components/common/CTASection";
import { cn } from "@/lib/utils";
import type { BlogSummary } from "@recurse/blog";

const SUBSTACK_URL = "https://j0lian.substack.com";

const blogHeadlines = [
	"Living notes on meta-cognition and thinking alongside AI",
	"Living notes on divergence engines and exploration",
	"Living notes on auto-associative workspaces",
	"Living notes on context infrastructure affordances",
	"Living notes on knowledge work beyond similarity search",
	"Living notes on cognitive patterns for human-AI collaboration",
];

interface BlogClientProps {
	posts: BlogSummary[];
}

export function BlogClient({ posts }: BlogClientProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Check if post matches current filters
	const postMatchesFilters = (post: BlogSummary): boolean => {
		// Search filter only
		if (!searchQuery) return true;
		
		const searchLower = searchQuery.toLowerCase();
		return (
			post.title.toLowerCase().includes(searchLower) ||
			(post.description?.toLowerCase().includes(searchLower) ?? false)
		);
	};

	// Filter posts (only affects blog cards, not recent articles)
	const filteredPosts = useMemo(() => {
		return posts.filter(postMatchesFilters);
	}, [posts, searchQuery]);

	const clearFilters = () => {
		setSearchQuery("");
	};

	return (
		<>
			<div className="relative z-10 group/hero pt-halfcol">
				<ScrollAnimation enableFadeIn exitBlur={4} exitScale={0.98}>
					<Grid8Col>
						<GridCell colSpan={8}>
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="px-1col py-1col lg:px-2col lg:py-1col"
							>
								<div className="space-y-6 text-left">
									<div className="space-y-6">
										<div className="font-semibold text-2xl leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-[2.5rem] lg:max-w-xl h-40 overflow-hidden">
											<TextSwap
												texts={blogHeadlines}
												interval={6000}
												durationMs={800}
											/>
										</div>
										<p className="text-base font-light text-muted-foreground md:text-lg">
											Essays exploring how we (might) think alongside AI, how knowledge systems shape our understanding, and the technical affordances for context infrastructures that enable true human/AI collaboration.
										</p>
									</div>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>
			</div>

			<section className="mb-1col">
				<Grid8Col>
					{/* Sidebar - 3 columns, spans all rows */}
					<GridCell colSpan={8} lgColSpan={3} lgRowSpan="full">
						<div className="sticky top-16 z-20 space-y-px">
							{/* Search and Filter Card */}
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="px-1col py-1col md:p-6 space-y-6 rounded-none"
							>
								<div className="space-y-6">
									{/* Search Input */}
									<div className="space-y-4">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												type="text"
												placeholder="Search articles..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="pl-10 pr-10"
											/>
											{searchQuery && (
												<button
													type="button"
													onClick={() => setSearchQuery("")}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
												>
													<X className="h-4 w-4" />
												</button>
											)}
										</div>
									</div>

									{/* Clear search button */}
									{searchQuery && (
										<div className="flex items-center justify-end">
											<Button
												variant="ghost"
												size="sm"
												onClick={clearFilters}
												className="h-6 text-xs"
											>
												Clear
											</Button>
										</div>
									)}

									{/* Recent articles */}
									<div className="space-y-3 pt-4">
										<h3 className="text-base font-semibold text-foreground">Recent articles</h3>
										<ScrollArea className="h-[calc(100vh-500px)] pr-8">
											<div className="space-y-1">
												{posts.length > 0 ? (
													posts.slice(0, 10).map((post) => (
														<Link
															key={post.slug.join("/")}
															href={post.url}
															className="flex flex-col py-2 text-sm border-b border-border/30 transition text-muted-foreground hover:text-foreground group/article-link"
														>
															<span className="font-light text-sm pr-6">{post.title}</span>
															<span className="text-xs text-muted-foreground pr-6 mt-1">
																{new Date(post.publishedAt).toLocaleDateString(undefined, {
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																})}
															</span>
														</Link>
													))
												) : (
													<p className="text-sm text-muted-foreground">
														New posts will appear here after the next sync.
													</p>
												)}
											</div>
										</ScrollArea>
									</div>
								</div>

								{/* Results count */}
								<div className="text-xs text-muted-foreground select-none pt-4 border-t border-border/30">
									{filteredPosts.length}/{posts.length} {filteredPosts.length === 1 ? "article" : "articles"}
								</div>
							</GridCard>

							{/* Subscribe Card */}
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="px-1col py-1col md:p-6 space-y-4 rounded-none md:pr-12"
							>
								<h3 className="text-base font-medium text-foreground">Get updates</h3>
								<p className="text-sm text-muted-foreground">
									Follow our thinking on meta-cognition, tools for knowledge work, and human-AI collaboration. Delivered straight to your inbox.
								</p>
								<LinkButton href={SUBSTACK_URL} variant="default" size="sm" round={false} animateIcon={false}>
									Subscribe on Substack
								</LinkButton>
							</GridCard>
						</div>
					</GridCell>

					{/* Blog Posts - 5 columns */}
					<GridCell colSpan={8} lgColSpan={5}>
						<div>
							{filteredPosts.length > 0 ? (
								filteredPosts.map((post) => (
									<div key={post.slug.join("/")} className="grid grid-cols-subgrid lg:grid-cols-5 gap-x-px gap-y-px">
										<div className="col-span-8 lg:col-span-5">
											<GlowCard
												asChild
												enableGlow
												glowRadius="420px"
												borderGlowIntensity={0.35}
												borderGlowHoverIntensity={0.85}
												backgroundGlowIntensity={0.03}
												backgroundGlowHoverIntensity={0.12}
												className="border border-border/70 bg-background/80 px-1col py-1col md:p-6 rounded-none h-full md:min-h-[260px] transition-colors duration-300 group/article-card"
											>
												<Link href={post.url} className="group flex flex-col md:flex-row h-full gap-6">
													{post.heroImage ? (
														<div className="md:w-[200px] w-full h-[140px] md:h-full shrink-0 rounded-md overflow-hidden relative">
															<img
																src={post.heroImage}
																alt={post.title}
																loading="lazy"
																className="h-full w-full object-cover transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:scale-105"
															/>
															<Badge variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
																{new Date(post.publishedAt).toLocaleDateString(undefined, {
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																})}
															</Badge>
														</div>
													) : (
														<div className="md:w-[200px] w-full h-[140px] md:h-full shrink-0 flex items-center justify-center rounded-md border border-border/70 text-sm text-muted-foreground relative">
															&nbsp;
															<Badge variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
																{new Date(post.publishedAt).toLocaleDateString(undefined, {
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																})}
															</Badge>
														</div>
													)}
													<div className="flex flex-col justify-between flex-1 min-w-0">
														<h2 className="text-2xl font-semibold tracking-tight text-muted-foreground! group-hover/article-card:text-foreground! transition-colors duration-300 mb-2 md:mb-0">{post.title}</h2>
														{post.description ? (
															<p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
														) : null}
													</div>
												</Link>
											</GlowCard>
											</div>
										</div>
									)
								)
							) : (
								<div className="col-span-8 lg:col-span-5">
									<GlowCard
										glowRadius="420px"
										borderGlowIntensity={0.25}
										borderGlowHoverIntensity={0.55}
										backgroundGlowIntensity={0.01}
										backgroundGlowHoverIntensity={0.05}
										className="border border-border/70 bg-background/80 px-1col py-1col md:p-6 rounded-none"
									>
										<p className="text-muted-foreground">
											No articles match your filters. Try adjusting your search or tags.
										</p>
									</GlowCard>
								</div>
							)}
						</div>
					</GridCell>
				</Grid8Col>
			</section>

			{/* CTA Section */}
			<CTASection />
		</>
	);
}

