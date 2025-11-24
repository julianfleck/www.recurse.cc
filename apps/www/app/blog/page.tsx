import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrollAnimation from "@/components/animations/ScrollAnimation/ScrollAnimation";
import { GlowCard } from "@recurse/ui/components/glow-card";
import { ScrollArea } from "@recurse/ui/components/scroll-area";
import { Badge } from "@recurse/ui/components/badge";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { GridCard } from "@/components/layout/GridCard";
import { getAllBlogPosts } from "@/lib/blog";

const SUBSTACK_URL = "https://j0lian.substack.com";

export const metadata: Metadata = {
	title: "Blog | Recurse",
	description:
		"Mirrored essays and research notes from our Substack, rendered with the www layout and MDX pipeline.",
};

export const revalidate = 3600;

export default function BlogIndexPage() {
	const posts = getAllBlogPosts();
	const yearsRepresented = new Set(posts.map((post) => new Date(post.publishedAt).getFullYear()));

	return (
		<>
			<div className="relative z-10 group/hero pt-halfcol">
				<ScrollAnimation enableFadeIn exitBlur={4} exitScale={0.98}>
					<Grid8Col>
						<GridCell colSpan={8}>
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="px-1col py-1col lg:px-2col lg:py-1.5col"
							>
								<div className="space-y-6 text-left">
									<div className="space-y-4 lg:max-w-3xl">
										<p className="text-sm text-muted-foreground">Essays from the Recurse team</p>
										<h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
											Living notes on context infrastructure
										</h1>
										<p className="text-lg text-muted-foreground">
											Every Substack post we publish mirrors into these pages, so long-form thinking, changelogs, and
											product experiments sit beside the rest of recurse.cc.
										</p>
									</div>
									<div className="flex flex-col gap-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
										<div className="flex gap-6">
											<div>
												<p className="text-3xl font-semibold text-foreground">{posts.length}</p>
												<p className="mt-1 text-sm text-muted-foreground">Published essays</p>
											</div>
											<div>
												<p className="text-3xl font-semibold text-foreground">{yearsRepresented.size}</p>
												<p className="mt-1 text-sm text-muted-foreground">Years of archives</p>
											</div>
										</div>
										<div className="flex flex-wrap items-center gap-3">
											<Link
												href={SUBSTACK_URL}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
											>
												Subscribe on Substack
												<ArrowUpRight className="h-4 w-4" />
											</Link>
											<p className="text-sm text-muted-foreground">Mirrored hourly via RSS sync</p>
										</div>
									</div>
								</div>
							</GridCard>
						</GridCell>
					</Grid8Col>
				</ScrollAnimation>
			</div>

			<section>
				<Grid8Col>
					{/* Sidebar - 3 columns, spans all rows */}
					<GridCell colSpan={8} lgColSpan={3} lgRowSpan="full">
						<div className="sticky top-16 z-20">
							<GridCard
								enableHoverEffect
								enableSpotlight
								className="p-6 space-y-6 min-h-[calc(100vh-64px)] flex flex-col justify-between rounded-none"
							>
								<div className="space-y-8">
									<div className="space-y-4">
										<h2 className="text-xl font-semibold text-foreground">Stay close to the work</h2>
										<p className="text-sm text-muted-foreground">
											The blog is where we narrate what it takes to build living context systems. Subscribe or skim the
											latest drops whenever you need a pulse check.
										</p>
										<Link
											href={SUBSTACK_URL}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
										>
											Get new essays in your inbox
											<ArrowUpRight className="h-4 w-4" />
										</Link>
									</div>

									<div className="space-y-3">
										<h3 className="text-base font-semibold text-foreground">Recently published</h3>
										<ScrollArea className="h-[calc(100vh-400px)] pr-4">
											<div className="space-y-1">
												{posts.length > 0 ? (
													posts.map((post) => (
														<Link
															key={post.slug.join("/")}
															href={post.url}
															className="flex flex-col py-2 text-sm border-b border-border/30 transition hover:text-primary"
														>
															<span className="font-medium">{post.title}</span>
															<span className="text-xs text-muted-foreground">
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
									{posts.length} {posts.length === 1 ? "article" : "articles"}
								</div>
							</GridCard>
						</div>
					</GridCell>

					{/* Blog Posts - 5 columns */}
					<GridCell colSpan={8} lgColSpan={5}>
						<div>
							{posts.map((post) => (
								<div key={post.slug.join("/")} className="grid grid-cols-subgrid lg:grid-cols-5 gap-x-px gap-y-px">
									<div className="col-span-8 lg:col-span-5">
										<GlowCard
											glowRadius="420px"
											className="border border-border/70 bg-background/80 p-0 rounded-none overflow-hidden h-[200px]"
										>
											<Link href={post.url} className="group flex flex-col md:flex-row h-full">
												{post.heroImage ? (
													<div className="md:w-[180px] shrink-0 h-full">
														<img
															src={post.heroImage}
															alt={post.title}
															loading="lazy"
															className="h-full w-full object-cover transition-opacity duration-300 opacity-60 group-hover:opacity-100"
														/>
													</div>
												) : (
													<div className="md:w-[180px] shrink-0 flex h-full items-center justify-center border-r border-border/70 text-sm text-muted-foreground">
														&nbsp;
													</div>
												)}
												<div className="p-6 flex flex-col justify-between flex-1">
													<div className="grid grid-cols-[1fr_auto] gap-4 items-start">
														<h2 className="text-2xl font-semibold tracking-tight">{post.title}</h2>
														<Badge variant="secondary" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
															{new Date(post.publishedAt).toLocaleDateString(undefined, {
																year: "numeric",
																month: "short",
																day: "numeric",
															})}
														</Badge>
													</div>
													{post.description ? (
														<p className="text-sm text-muted-foreground line-clamp-3 mt-4">{post.description}</p>
													) : null}
												</div>
											</Link>
										</GlowCard>
									</div>
								</div>
							))}
						</div>
					</GridCell>
				</Grid8Col>
			</section>
		</>
	);
}

