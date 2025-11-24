"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { GlowCard } from "@recurse/ui/components/glow-card";
import { ScrollArea } from "@recurse/ui/components/scroll-area";
import { Badge } from "@recurse/ui/components/badge";
import { Button } from "@recurse/ui/components/button";
import { Input } from "@/components/ui/input";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { TextSwap } from "@/components/text-transitions/text-swap";
import { CTASection } from "@/components/common/CTASection";
import { getAllBlogPosts } from "@/lib/blog";
import { cn } from "@/lib/utils";

const SUBSTACK_URL = "https://j0lian.substack.com";

const blogHeadlines = [
	"Living notes on meta-cognition and thinking alongside AI",
	"Living notes on divergence engines and exploration",
	"Living notes on auto-associative workspaces",
	"Living notes on context infrastructure affordances",
	"Living notes on knowledge work beyond similarity search",
	"Living notes on cognitive patterns for human-AI collaboration",
];

export default function BlogIndexPage() {
	const allPosts = getAllBlogPosts();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	// Extract all unique tags from posts
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		allPosts.forEach((post) => {
			if (post.tags) {
				const tagArray = Array.isArray(post.tags) ? post.tags : [post.tags];
				tagArray.forEach((tag) => tags.add(tag));
			}
		});
		return Array.from(tags).sort();
	}, [allPosts]);

	// Check if post matches current filters
	const postMatchesFilters = (post: typeof allPosts[0]): boolean => {
		// Search filter
		const searchLower = searchQuery.toLowerCase();
		const matchesSearch =
			!searchQuery ||
			post.title.toLowerCase().includes(searchLower) ||
			post.description?.toLowerCase().includes(searchLower) ||
			(post.tags && (Array.isArray(post.tags) ? post.tags : [post.tags]).some((tag) =>
				tag.toLowerCase().includes(searchLower)
			));

		// Tag filter
		const postTags = post.tags ? (Array.isArray(post.tags) ? post.tags : [post.tags]) : [];
		const matchesTags =
			selectedTags.length === 0 ||
			selectedTags.some((selectedTag) => postTags.includes(selectedTag));

		return matchesSearch && matchesTags;
	};

	// Filter posts (only affects blog cards, not recent articles)
	const filteredPosts = useMemo(() => {
		return allPosts.filter(postMatchesFilters);
	}, [allPosts, searchQuery, selectedTags]);

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedTags([]);
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
											Essays exploring how we (will) think alongside AI, how knowledge systems shape our understanding, and the technical affordances for context infrastructures that enable true human/AI collaboration.
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
						<div className="sticky top-16 z-20">
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="p-6 space-y-6 min-h-[calc(100vh-64px)] flex flex-col justify-between rounded-none pr-12"
							>
								<div className="space-y-6 mb-8">
									{/* Search Input */}
									<div className="space-y-4">
										<h2 className="text-xl font-medium text-foreground">Search</h2>
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

									{/* Filter Tags */}
									{allTags.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<h3 className="text-base font-medium text-foreground">Filter</h3>
												<Button
													variant="ghost"
													size="sm"
													onClick={clearFilters}
													className={cn(
														"h-6 text-xs transition-opacity select-none",
														searchQuery || selectedTags.length > 0
															? "opacity-100"
															: "opacity-0 pointer-events-none"
													)}
												>
													Clear
												</Button>
											</div>
											<div className="flex flex-wrap gap-1.5">
												{allTags.map((tag) => {
													const isSelected = selectedTags.includes(tag);
													return (
														<Badge
															key={tag}
															variant={isSelected ? "primary" : "secondary"}
															appearance={isSelected ? "outline" : "light"}
															size="sm"
															className={cn(
																"cursor-pointer select-none transition-all",
																!isSelected && "hover:border-primary/30 hover:bg-primary/20 hover:text-accent-foreground text-foreground"
															)}
															onClick={() => toggleTag(tag)}
														>
															{tag}
														</Badge>
													);
												})}
											</div>
										</div>
									)}

									{/* Recent articles */}
									<div className="space-y-3 pt-4">
										<h3 className="text-base font-semibold text-foreground">Recent articles</h3>
										<ScrollArea className="h-[calc(100vh-500px)] pr-4">
											<div className="space-y-1">
												{allPosts.length > 0 ? (
													allPosts.slice(0, 10).map((post) => (
														<Link
															key={post.slug.join("/")}
															href={post.url}
															className="flex flex-col py-2 text-sm border-b border-border/30 transition hover:text-primary"
														>
															<span className="font-medium pr-6">{post.title}</span>
															<span className="text-xs text-muted-foreground pr-6">
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
								<div className="text-xs text-muted-foreground select-none">
									{filteredPosts.length}/{allPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
								</div>
							</GridCard>
						</div>
					</GridCell>

					{/* Blog Posts - 5 columns */}
					<GridCell colSpan={8} lgColSpan={5}>
						<div>
							{filteredPosts.length > 0 ? (
								filteredPosts.map((post) => {
									const postTags = post.tags ? (Array.isArray(post.tags) ? post.tags : [post.tags]) : [];
									return (
										<div key={post.slug.join("/")} className="grid grid-cols-subgrid lg:grid-cols-5 gap-x-px gap-y-px">
											<div className="col-span-8 lg:col-span-5">
												<GlowCard
													glowRadius="420px"
													className="border border-border/70 bg-background/80 p-6 rounded-none h-[200px]"
												>
													<Link href={post.url} className="group flex flex-col md:flex-row h-full gap-6">
														<div className="flex flex-col justify-between flex-1 min-w-0">
															<h2 className="text-2xl font-semibold tracking-tight">{post.title}</h2>
															{post.description ? (
																<p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
															) : null}
															{postTags.length > 0 && (
																<div className="flex flex-wrap gap-1.5 mt-2">
																	{postTags.map((tag) => (
																		<Badge
																			key={tag}
																			variant="secondary"
																			appearance="light"
																			size="sm"
																			className="text-xs"
																		>
																			{tag}
																		</Badge>
																	))}
																</div>
															)}
														</div>
												{post.heroImage ? (
													<div className="md:w-[180px] shrink-0 h-full rounded-md overflow-hidden relative">
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
													<div className="md:w-[180px] shrink-0 flex h-full items-center justify-center rounded-md border border-border/70 text-sm text-muted-foreground relative">
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
											</Link>
										</GlowCard>
									</div>
								</div>
									);
								})
							) : (
								<div className="col-span-8 lg:col-span-5">
									<GlowCard
										glowRadius="420px"
										className="border border-border/70 bg-background/80 p-6 rounded-none"
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

