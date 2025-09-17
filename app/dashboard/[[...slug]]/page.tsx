import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "@/components/layout/page";
import { Cards, Card } from "fumadocs-ui/components/card";
import { dashboardSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/dashboard/[[...slug]]">) {
  const params = await props.params;
  const slug = !params.slug || params.slug.length === 0 ? [] : params.slug;

  // Root shell
  if (slug.length === 0) {
    return (
      <DocsPage footer={{ enabled: false }}>
        <DocsTitle>Dashboard</DocsTitle>
        <DocsDescription>
          Overview of your knowledge base and account.
        </DocsDescription>
        <DocsBody>
          <Cards>
            <Card href="/dashboard/graph" title="Graph" icon="share2">
              Visualize relationships across your knowledge.
            </Card>
            <Card href="/dashboard/context" title="Context" icon="brain">
              Build and manage reusable context.
            </Card>
            <Card href="/dashboard/chat" title="Chat" icon="bot">
              Converse with your knowledge.
            </Card>
            <Card href="/dashboard/usage" title="Usage" icon="filetext">
              Monitor API usage and limits.
            </Card>
            <Card href="/dashboard/api-keys" title="API Keys" icon="code">
              Manage programmatic access.
            </Card>
            <Card href="/dashboard/settings" title="Settings" icon="edit">
              Configure your account preferences.
            </Card>
          </Cards>
        </DocsBody>
      </DocsPage>
    );
  }

  // Section shells
  const section = slug[0];
  if (
    section === "graph" ||
    section === "context" ||
    section === "chat" ||
    section === "usage" ||
    section === "api-keys" ||
    section === "settings"
  ) {
    const titleMap: Record<string, string> = {
      graph: "Graph",
      context: "Context",
      chat: "Chat",
      usage: "Usage",
      "api-keys": "API Keys",
      settings: "Settings",
    };

    return (
      <DocsPage footer={{ enabled: false }}>
        <DocsTitle>{titleMap[section]}</DocsTitle>
        <DocsDescription>
          {section === "graph" &&
            "Visualize and explore your knowledge relationships."}
          {section === "context" &&
            "Create and manage reusable context for AI systems."}
          {section === "chat" && "Converse with your knowledge base."}
          {section === "usage" && "Monitor your API usage and limits."}
          {section === "api-keys" && "Manage API keys for programmatic access."}
          {section === "settings" && "Configure your account preferences."}
        </DocsDescription>
        <DocsBody>
          <p>
            This is a shell page. Replace with the actual {titleMap[section]} UI
            when ready.
          </p>
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
            a: createRelativeLink(dashboardSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  const sectionParams = [
    { slug: ["graph"] },
    { slug: ["context"] },
    { slug: ["chat"] },
    { slug: ["usage"] },
    { slug: ["api-keys"] },
    { slug: ["settings"] },
  ];
  return [...sectionParams, ...dashboardSource.generateParams()];
}

export async function generateMetadata(
  props: PageProps<"/dashboard/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const slug = !params.slug || params.slug.length === 0 ? [] : params.slug;

  if (slug.length === 0) {
    return {
      title: "Dashboard",
      description: "Overview of your knowledge base and account.",
    };
  }

  const section = slug[0];
  const titleMap: Record<string, { title: string; description: string }> = {
    graph: {
      title: "Graph",
      description: "Visualize and explore your knowledge relationships.",
    },
    context: {
      title: "Context",
      description: "Create and manage reusable context for AI systems.",
    },
    chat: {
      title: "Chat",
      description: "Converse with your knowledge base.",
    },
    usage: {
      title: "Usage",
      description: "Monitor your API usage and limits.",
    },
    "api-keys": {
      title: "API Keys",
      description: "Manage API keys for programmatic access.",
    },
    settings: {
      title: "Settings",
      description: "Configure your account preferences.",
    },
  };

  if (titleMap[section]) {
    return titleMap[section];
  }

  const page = dashboardSource.getPage(slug);
  if (!page) {
    notFound();
  }
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
