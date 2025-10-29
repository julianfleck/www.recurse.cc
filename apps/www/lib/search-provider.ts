import { getDocsUrl } from "./utils";

export type SearchItem = {
  id: string;
  title?: string;
  summary?: string;
  type?: string;
  metadata?: string[];
  href?: string;
  breadcrumbs?: string[];
  highlight?: string;
  similarity_score?: number;
};

export type SearchProvider = {
  search: (query: string) => Promise<SearchItem[]>;
};

// Documentation provider that calls docs API cross-origin
export const documentationProvider: SearchProvider = {
  async search(query: string) {
    const docsUrl = getDocsUrl();
    const url = `${docsUrl}/api/docs-search?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Docs search failed: ${res.statusText}`);
    }
    const data = await res.json();
    const items: any[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    const uniqueItems = items.reduce((acc, it) => {
      const href =
        (it.url || it.path || "").toString() + (it.hash ? `#${it.hash}` : "");
      if (!acc.some((existing: any) => existing.href === href)) {
        acc.push({ ...it, href });
      }
      return acc;
    }, [] as any[]);

    return uniqueItems.map((it: any): SearchItem => ({
      id: it.href || crypto.randomUUID(),
      title: it.title || it.content || it.heading || "Untitled",
      summary:
        it.excerpt ||
        it.description ||
        (typeof it.content === "string"
          ? it.content.slice(0, 200)
          : Array.isArray(it.content)
            ? it.content.join(" ").slice(0, 200)
            : ""),
      type: it.tag || it.section || it.type || (it.hash ? "heading" : "page"),
      metadata: [
        Array.isArray(it.breadcrumbs)
          ? it.breadcrumbs.join(" › ")
          : it.breadcrumbs,
      ].filter(Boolean) as string[],
      href: it.href?.startsWith("http")
        ? it.href
        : it.href?.startsWith("/")
          ? `${docsUrl}${it.href}`
          : it.href
            ? `${docsUrl}/${it.href}`
            : undefined,
      breadcrumbs: Array.isArray(it.breadcrumbs) ? it.breadcrumbs : [],
      highlight: it.highlight || "",
    }));
  },
};

