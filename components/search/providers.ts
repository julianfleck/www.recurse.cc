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
    const url = `/api/search?query=${encodeURIComponent(query)}`;
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
    return items.map(
      (it) =>
        ({
          id: it.url || it.id || it.path || crypto.randomUUID(),
          title: it.title || it.heading || it.id,
          summary: it.description || it.excerpt || it.content || "",
          type: it.tag || it.section || "doc",
          metadata: [it.breadcrumbs?.join(" › ")].filter(Boolean) as string[],
        }) satisfies SearchItem
    );
  },
};
