import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlowCard } from "@recurse/ui/components/glow-card";
import { BlogArticleLayout, getBlogMDXComponents } from "@recurse/blog";
import { Grid8Col, GridCell } from "@/components/layout/Grid8Col";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { getAllBlogPosts, getBlogPage, findBlogPost, generateBlogParams } from "@/lib/blog";

export const dynamicParams = false;
export const revalidate = 3600;

const SITE_URL = "https://www.recurse.cc";

export default async function BlogArticlePage(
	props: PageProps<"/blog/[...slug]">,
) {
	const params = await props.params;
	const slug = params.slug;

	if (!slug || slug.length === 0) {
		notFound();
	}

	const slugKey = slug.join("/");
	const page = getBlogPage(slug);
	if (!page) {
		notFound();
	}

	const posts = getAllBlogPosts();
	const currentSummary = posts.find((post) => post.slug.join("/") === slugKey);
	const latestPosts = posts.filter((post) => post.slug.join("/") !== slugKey).slice(0, 5);
	const canonicalUrl = new URL(currentSummary?.url ?? `/blog/${slugKey}`, SITE_URL).toString();
	const publishedDate = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(page.data.publishedAt));
	const shareTargets = [
		{
			label: "Share on X",
			href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(page.data.title)}`,
			icon: "twitter" as const,
		},
		{
			label: "Share on LinkedIn",
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
			icon: "linkedin" as const,
		},
		{
			label: "Discuss on Substack",
			href: page.data.substackUrl,
			icon: "substack" as const,
		},
	];
	const author = page.data.author ?? "Recurse";
	const postsForSidebar = posts.map((post) => ({
		title: post.title,
		slug: post.slug,
		url: post.url,
		publishedAt: post.publishedAt,
	}));

	const MDXContent = page.data.body;

	return (
		<section className="py-16">
			<Grid8Col className="gap-px">
				<GridCell colSpan={8} lgColSpan={3}>
					<div className="lg:sticky lg:top-24">
						<BlogSidebar
							posts={postsForSidebar}
							currentSlug={slugKey}
							author={author}
							title={page.data.title}
							summary={page.data.description}
							publishedDate={publishedDate}
							substackUrl={page.data.substackUrl}
							shareTargets={shareTargets}
							canonicalUrl={canonicalUrl}
							latestPosts={latestPosts}
						/>
					</div>
				</GridCell>
				<GridCell colSpan={8} lgColSpan={5} className="lg:pl-12">
					<div className="flex flex-col gap-6">
						{page.data.heroImage ? (
							<GlowCard enableGlow className="border border-border/70 bg-background/70 p-0">
								<img
									src={page.data.heroImage}
									alt={page.data.title}
									className="h-auto w-full rounded-xl object-cover"
									loading="lazy"
								/>
							</GlowCard>
						) : null}
						{page.data.tags && page.data.tags.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{page.data.tags.map((tag) => (
									<span
										key={tag}
										className="rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground"
									>
										{tag}
									</span>
								))}
							</div>
						) : null}
						<BlogArticleLayout meta={page.data} showHeader={false} className="max-w-none lg:mx-0" bodyClassName="lg:px-6">
							<MDXContent components={getBlogMDXComponents()} />
						</BlogArticleLayout>
					</div>
				</GridCell>
			</Grid8Col>
		</section>
	);
}

export async function generateStaticParams() {
	return generateBlogParams();
}

export async function generateMetadata(
	props: PageProps<"/blog/[...slug]">,
): Promise<Metadata> {
	const params = await props.params;
	const slug = params.slug;

	if (!slug || slug.length === 0) {
		return {};
	}

	const post = findBlogPost(slug);
	if (!post) {
		notFound();
	}

	return {
		title: post.title,
		description: post.description,
		openGraph: {
			title: post.title,
			description: post.description ?? undefined,
			type: "article",
			url: post.url,
			images: post.heroImage
				? [
						{
							url: post.heroImage,
							alt: post.title,
						},
				  ]
				: undefined,
		},
	};
}

