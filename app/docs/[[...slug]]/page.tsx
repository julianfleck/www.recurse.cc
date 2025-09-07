import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDXContent = page.data.body;
	const githubOwner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
	const githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO;
	const githubBranch = process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main";
	const githubUrl =
		githubOwner && githubRepo
			? `https://github.com/${githubOwner}/${githubRepo}/blob/${githubBranch}/content/docs/${page.path}`
			: undefined;

	return (
		<DocsPage toc={page.data.toc} full={page.data.full} breadcrumb={{ enabled: false }}>
			<div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
				<LLMCopyButton markdownUrl={`${page.url}.mdx`} />
				{githubUrl ? (
					<ViewOptions markdownUrl={`${page.url}.mdx`} githubUrl={githubUrl} />
				) : null}
			</div>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
			<DocsBody>
				<MDXContent
					components={getMDXComponents({
						// this allows you to link to other pages with relative file paths
						a: createRelativeLink(source, page),
					})}
				/>
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(
	props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	return {
		title: page.data.title,
		description: page.data.description,
	};
}
