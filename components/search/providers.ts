import { createFromSource } from "fumadocs-core/search/server";
import { apiService } from "@/lib/api";
import { source } from "@/lib/source";
import type { SearchItem, SearchProvider } from "./types";

// Knowledge base provider: use API service
export const knowledgeBaseProvider: SearchProvider = {
  async search(query: string) {
    const params = { query, limit: 20, field_set: "content" } as const;
    const response = await apiService.get<{ nodes?: any[] }>("/search", params);
    const nodes = response.data?.nodes ?? [];
    return nodes.map(
      (n) =>
        ({
          id: n.id ?? String(Math.random()),
          title: n.title ?? n.id,
          summary: n.summary ?? n.description ?? "",
          type: n.type,
          metadata: Array.isArray(n.metadata) ? n.metadata : [],
        }) satisfies SearchItem
    );
  },
};

// Documentation provider: use fumadocs server search API via our route
export const documentationProvider: SearchProvider = {
  async search(query: string) {
    // Proxy through our app route to leverage existing config
    const url = `/api/docs-search?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Docs search failed: ${res.statusText}`);
    }
    const data = await res.json();
    // Fumadocs can return either `{ items: [...] }` or raw array; normalize
    const items: any[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
    
    // Remove duplicates based on href
    const uniqueItems = items.reduce((acc, it) => {
      const href = (it.url || it.path || "").toString() + (it.hash ? `#${it.hash}` : "");
      if (!acc.some(existing => existing.href === href)) {
        acc.push({
          ...it,
          href,
        });
      }
      return acc;
    }, [] as any[]);

    return uniqueItems.map(
      (it) =>
        ({
          id: it.href || crypto.randomUUID(),
          title: it.title || it.heading || it.id,
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
          href: it.href,
          breadcrumbs: Array.isArray(it.breadcrumbs) ? it.breadcrumbs : [],
          highlight: it.highlight || "",
        }) satisfies SearchItem
    );
  },
};
