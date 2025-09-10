import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "@/components/layout/page";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	// Redirect /docs to introduction
	if (!params.slug || params.slug.length === 0) {
		redirect("/docs/introduction");
	}
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDXContent = page.data.body;

	// Last modified time (enabled via source.config.ts lastModifiedTime: 'git')
	const lastModifiedRaw = (page.data as any).lastModified as number | undefined;
	const lastUpdate = lastModifiedRaw ? new Date(lastModifiedRaw) : undefined;

	return (
		<DocsPage
			toc={page.data.toc}
			full={page.data.full}
			breadcrumb={{ enabled: false }}
			lastUpdate={lastUpdate}
		>
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
