import { Badge } from "@recurse/ui/components/badge";
import { cn } from "@recurse/ui/lib/utils";
import type { ReactNode } from "react";
import type { BlogFrontmatter } from "./types";

export interface BlogArticleLayoutProps {
	meta: BlogFrontmatter;
	children: ReactNode;
	className?: string;
	showHeader?: boolean;
	bodyClassName?: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
});

export function BlogArticleLayout({
	meta,
	children,
	className,
	showHeader = true,
	bodyClassName,
}: BlogArticleLayoutProps) {
	const publishedAt = dateFormatter.format(new Date(meta.publishedAt));
	return (
		<article className={cn("mx-auto flex w-full max-w-4xl flex-col gap-10", className)}>
			{showHeader ? (
				<header className="space-y-6">
					<div className="text-sm uppercase tracking-widest text-muted-foreground">
						Published {publishedAt}
					</div>
					<div className="space-y-3">
						<h1 className="text-4xl font-semibold tracking-tight">{meta.title}</h1>
						{meta.description ? (
							<p className="text-lg text-muted-foreground">{meta.description}</p>
						) : null}
					</div>
					{meta.tags && meta.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{meta.tags.map((tag) => (
								<Badge key={tag} variant="outline" className="bg-transparent text-xs uppercase tracking-wide">
									{tag}
								</Badge>
							))}
						</div>
					)}
					{meta.heroImage ? (
						<div className="overflow-hidden rounded-3xl border border-border/60">
							<img
								src={meta.heroImage}
								alt={meta.title}
								className="h-auto w-full object-cover"
								loading="lazy"
							/>
						</div>
					) : null}
					<a
						className="inline-flex items-center text-sm text-primary underline underline-offset-4"
						href={meta.substackUrl}
						target="_blank"
						rel="noreferrer"
					>
						Read on Substack ↗
					</a>
				</header>
			) : null}
			<section className={cn("prose prose-neutral dark:prose-invert max-w-none px-2 md:px-4", bodyClassName)}>
				{children}
			</section>
		</article>
	);
}

