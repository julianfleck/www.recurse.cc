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
  const slug = !params.slug || params.slug.length === 0 ? [] : params.slug;

  // Root shell
  if (slug.length === 0) {
    return (
      <DocsPage breadcrumb={{ enabled: false }}>
        <DocsTitle>Dashboard</DocsTitle>
        <DocsDescription>Overview of your knowledge base and account.</DocsDescription>
        <DocsBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section>
              <h3 className="font-semibold text-base">Knowledge Base</h3>
              <ul className="mt-2 space-y-2">
                <li><a href="/dashboard/graph" className="underline">Graph</a> – Visualize relationships</li>
                <li><a href="/dashboard/context" className="underline">Context</a> – Build reusable context</li>
                <li><a href="/dashboard/chat" className="underline">Chat</a> – Converse with your knowledge</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base">Account</h3>
              <ul className="mt-2 space-y-2">
                <li><a href="/dashboard/usage" className="underline">Usage</a> – Monitor your activity</li>
                <li><a href="/dashboard/api-keys" className="underline">API Keys</a> – Manage access</li>
                <li><a href="/dashboard/settings" className="underline">Settings</a> – Configure your account</li>
              </ul>
            </section>
          </div>
        </DocsBody>
      </DocsPage>
    );
  }

  // Section shells
  const section = slug[0];
  if (section === "graph" || section === "context" || section === "chat" || section === "usage" || section === "api-keys" || section === "settings") {
    const titleMap: Record<string, string> = {
      graph: "Graph",
      context: "Context",
      chat: "Chat",
      usage: "Usage",
      "api-keys": "API Keys",
      settings: "Settings",
    };

    return (
      <DocsPage breadcrumb={{ enabled: false }}>
        <DocsTitle>{titleMap[section]}</DocsTitle>
        <DocsDescription>
          {section === "graph" && "Visualize and explore your knowledge relationships."}
          {section === "context" && "Create and manage reusable context for AI systems."}
          {section === "chat" && "Converse with your knowledge base."}
          {section === "usage" && "Monitor your API usage and limits."}
          {section === "api-keys" && "Manage API keys for programmatic access."}
          {section === "settings" && "Configure your account preferences."}
        </DocsDescription>
        <DocsBody>
          <p>This is a shell page. Replace with the actual {titleMap[section]} UI when ready.</p>
        </DocsBody>
      </DocsPage>
    );
  }

  // Fallback to MDX-backed pages
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
