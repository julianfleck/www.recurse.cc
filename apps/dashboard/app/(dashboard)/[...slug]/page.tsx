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

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  // Required catch-all doesn't match root, so slug will always be present
  const page = dashboardSource.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;

  // Last modified time (enabled via source.config.ts lastModifiedTime: 'git')
  const lastModifiedRaw = (page.data as any).lastModified as number | undefined;
  const lastUpdate = lastModifiedRaw ? new Date(lastModifiedRaw) : undefined;

  return (
    <DocsPage
      footer={{ enabled: false }}
      full={page.data.full}
      lastUpdate={lastUpdate}
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(dashboardSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export const dynamicParams = true; // Allow dynamic params for pages not in generateStaticParams

export async function generateStaticParams() {
  // Generate params for all dashboard MDX pages
  return dashboardSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = dashboardSource.getPage(params.slug);
  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

