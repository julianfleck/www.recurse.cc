import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "@/components/layout/page";
import { dashboardSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/dashboard/[[...slug]]">) {
  const params = await props.params;
  const slug =
    !params.slug || params.slug.length === 0 ? ["overview"] : params.slug;

  const page = dashboardSource.getPage(slug);
  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;
  const lastModifiedRaw = (page.data as { lastModified?: number }).lastModified;
  const lastUpdate = lastModifiedRaw ? new Date(lastModifiedRaw) : undefined;

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      full={page.data.full}
      lastUpdate={lastUpdate}
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            a: createRelativeLink(dashboardSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return dashboardSource.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/dashboard/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const slug =
    !params.slug || params.slug.length === 0 ? ["overview"] : params.slug;
  const page = dashboardSource.getPage(slug);
  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
