import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
	title: "Blog | Recurse",
	description:
		"Mirrored essays and research notes from our Substack, rendered with the www layout and MDX pipeline.",
};

export const revalidate = 3600;

export default function BlogIndexPage() {
	const posts = getAllBlogPosts();

	return (
		<section className="mx-auto flex w-full max-w-6xl flex-col gap-12 py-16">
			<header className="space-y-4 text-center">
				<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
					Recurse Blog
				</p>
				<h1 className="text-4xl font-semibold tracking-tight">
					Living notes on context infrastructure
				</h1>
				<p className="text-lg text-muted-foreground">
					These articles mirror the essays we publish on Substack so everything lives next to the product
					experience.
				</p>
			</header>

			<div className="grid gap-8 md:grid-cols-2">
				{posts.map((post) => (
					<article
						key={post.slug.join("/")}
						className="group flex h-full flex-col rounded-3xl border border-border/60 bg-background/80 p-6 transition hover:border-border"
					>
						{post.heroImage ? (
							<div className="mb-5 overflow-hidden rounded-2xl border border-border/80">
								<img
									src={post.heroImage}
									alt={post.title}
									loading="lazy"
									className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.015]"
								/>
							</div>
						) : null}
						<div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
							{new Date(post.publishedAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</div>
						<h2 className="mt-3 text-2xl font-semibold tracking-tight">
							<Link href={post.url} className="hover:underline">
								{post.title}
							</Link>
						</h2>
						{post.description ? (
							<p className="mt-3 text-muted-foreground">{post.description}</p>
						) : null}
						<div className="mt-auto pt-6">
							<Link
								href={post.url}
								className="text-sm font-medium text-primary underline-offset-4 hover:underline"
							>
								Read article →
							</Link>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}

