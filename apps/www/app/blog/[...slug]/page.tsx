import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogArticleLayout, getBlogMDXComponents } from "@recurse/blog";
import { getBlogPage, findBlogPost, generateBlogParams } from "@/lib/blog";

export const dynamicParams = false;
export const revalidate = 3600;

export default async function BlogArticlePage(
	props: PageProps<"/blog/[...slug]">,
) {
	const params = await props.params;
	const slug = params.slug;

	if (!slug || slug.length === 0) {
		notFound();
	}

	const page = getBlogPage(slug);
	if (!page) {
		notFound();
	}

	const MDXContent = page.data.body;

	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col gap-12 py-16">
			<BlogArticleLayout meta={page.data}>
				<MDXContent components={getBlogMDXComponents()} />
			</BlogArticleLayout>
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

