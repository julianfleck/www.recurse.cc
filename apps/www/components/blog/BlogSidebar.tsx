"use client";

import type React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { ScrollArea } from "@recurse/ui/components/scroll-area";
import { Badge } from "@recurse/ui/components/badge";
import { CopyButton } from "@recurse/ui/components/copy-button";
import { Tree, TreeItem, TreeItemLabel } from "@recurse/ui/components/tree";
import { syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Share2, UserRound, Twitter, Linkedin, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarPost = {
	title: string;
	slug: string[];
	url: string;
	publishedAt: string;
};

type ShareIcon = "twitter" | "linkedin" | "substack";

type ShareTarget = {
	label: string;
	href: string;
	icon: ShareIcon;
};

type TreeNodeData = {
	name: string;
	children?: string[];
	href?: string;
};

interface BlogSidebarProps {
	posts: SidebarPost[];
	currentSlug: string;
	author: string;
	title: string;
	summary?: string;
	publishedDate: string;
	substackUrl: string;
	shareTargets: ShareTarget[];
	canonicalUrl: string;
	latestPosts: SidebarPost[];
}

const ROOT_ID = "blog-root";

const shareIconMap: Record<ShareIcon, (props: { className?: string }) => React.JSX.Element> = {
	twitter: (props) => <Twitter strokeWidth={1.5} {...props} />,
	linkedin: (props) => <Linkedin strokeWidth={1.5} {...props} />,
	substack: (props) => <Rss strokeWidth={1.5} {...props} />,
};

export function BlogSidebar({
	posts,
	currentSlug,
	author,
	title,
	summary,
	publishedDate,
	substackUrl,
	shareTargets,
	canonicalUrl,
	latestPosts,
}: BlogSidebarProps) {
	const { treeItems, expandedItems, currentItemId } = useMemo(() => {
		const items: Record<string, TreeNodeData> = {
			[ROOT_ID]: {
				name: "Archive",
				children: [],
			},
		};

		const postsByYear = new Map<string, SidebarPost[]>();
		for (const post of posts) {
			const year = new Date(post.publishedAt).getFullYear().toString();
			const collection = postsByYear.get(year) ?? [];
			collection.push(post);
			postsByYear.set(year, collection);
		}

		const sortedYears = Array.from(postsByYear.keys()).sort((a, b) => Number(b) - Number(a));
		items[ROOT_ID].children = sortedYears.map((year) => `year-${year}`);

		for (const year of sortedYears) {
			const yearId = `year-${year}`;
			const yearPosts = postsByYear
				.get(year)!
				.slice()
				.sort((a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf());
			items[yearId] = {
				name: year,
				children: yearPosts.map((post) => `post-${post.slug.join("/")}`),
			};

			for (const post of yearPosts) {
				const id = `post-${post.slug.join("/")}`;
				items[id] = {
					name: post.title,
					href: post.url,
				};
			}
		}

		const currentId = `post-${currentSlug}`;
		return {
			treeItems: items,
			expandedItems: [ROOT_ID, ...sortedYears.map((year) => `year-${year}`)],
			currentItemId: items[currentId] ? currentId : undefined,
		};
	}, [posts, currentSlug]);

	const tree = useTree<TreeNodeData>({
		rootItemId: ROOT_ID,
		indent: 14,
		initialState: {
			expandedItems,
			selectedItems: currentItemId ? [currentItemId] : [],
		},
		getItemName: (item) => item.getItemData().name,
		isItemFolder: (item) => Boolean(item.getItemData().children?.length),
		dataLoader: {
			getItem: (id) => treeItems[id],
			getChildren: (id) => treeItems[id]?.children ?? [],
		},
		features: [syncDataLoaderFeature],
	});

	return (
		<ScrollArea className="max-h-[calc(100vh-160px)] pr-4">
			<div className="space-y-8">
				<div className="space-y-2">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Recurse blog</p>
					<h1 className="text-2xl font-semibold leading-tight text-foreground">{title}</h1>
					{summary ? <p className="text-base text-muted-foreground">{summary}</p> : null}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<UserRound className="h-4 w-4 text-muted-foreground" />
						<span>
							By <span className="text-foreground font-medium">{author}</span>
						</span>
					</div>
					<p className="text-xs text-muted-foreground">{publishedDate}</p>
					<Link
						href={substackUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
					>
						Read on Substack
						<Share2 className="h-3.5 w-3.5" />
					</Link>
				</div>

				<div className="space-y-3">
					<p className="text-sm font-semibold text-muted-foreground">Share this essay</p>
					<div className="flex flex-wrap gap-2">
						{shareTargets.map(({ label, href, icon }) => (
							<Link key={label} href={href} target="_blank" rel="noreferrer">
								<Badge
									variant="secondary"
									className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
								>
									{shareIconMap[icon] ? (
										shareIconMap[icon]({ className: "h-3.5 w-3.5" })
									) : (
										<Share2 className="h-3.5 w-3.5" />
									)}
									{label}
								</Badge>
							</Link>
						))}
						<CopyButton
							text={canonicalUrl}
							variant="ghost"
							size="sm"
							className="h-7 rounded-full border border-border/60 bg-background px-3 text-xs text-muted-foreground hover:border-primary hover:text-primary"
						>
							Copy link
						</CopyButton>
					</div>
				</div>

				<div className="space-y-3">
					<p className="text-sm font-semibold text-muted-foreground">Browse archive</p>
					<div className="rounded-xl border border-border/70 bg-background/60 p-2">
						<Tree indent={14} tree={tree}>
							{tree.getItems().map((item) => {
								const data = item.getItemData();
								const isFolder = Boolean(data.children?.length);
								return (
									<TreeItem key={item.getId()} item={item}>
										<TreeItemLabel
											className={cn(
												"rounded-md px-2 py-1 text-sm",
												!isFolder && "text-muted-foreground hover:text-primary",
											)}
										>
											{isFolder ? (
												data.name
											) : (
												<Link href={data.href ?? "#"} className="flex-1 truncate">
													{data.name}
												</Link>
											)}
										</TreeItemLabel>
									</TreeItem>
								);
							})}
						</Tree>
					</div>
				</div>

				<div className="space-y-3">
					<p className="text-sm font-semibold text-muted-foreground">Latest essays</p>
					<div className="space-y-2">
						{latestPosts.map((post) => (
							<Link
								key={post.slug.join("/")}
								href={post.url}
								className="block rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm transition hover:border-primary hover:text-primary"
							>
								<div className="font-medium">{post.title}</div>
								<div className="text-xs text-muted-foreground">
									{new Date(post.publishedAt).toLocaleDateString(undefined, {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}

