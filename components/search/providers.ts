import { apiService } from "@/lib/api";
import type { SearchItem, SearchProvider } from "./types";
import { filterStaticPages } from "./static-pages";

// Knowledge base provider: use API service
export const knowledgeBaseProvider: SearchProvider = {
  async search(query: string) {
    const params = {
      query,
      limit: 50,
      field_set: "metadata",
      page: 1,
    } as const;
    const response = await apiService.get<{
      query: string;
      nodes: any[];
      total_found: number;
      search_time_ms: number;
      filters_applied: string[];
      pagination: any;
    }>("/search", params);
    const nodes = response.data?.nodes ?? [];
    // Remove duplicates based on id
    const uniqueNodes = nodes.reduce((acc: any[], node: any) => {
      // Only deduplicate if the node has a real id (not undefined/null)
      if (node.id && acc.some((existing) => existing.id === node.id)) {
        return acc; // Skip this duplicate
      }
      acc.push(node);
      return acc;
    }, []);

    return uniqueNodes.map(
      (n) =>
        ({
          id: n.id ?? String(Math.random()),
          title: n.title ?? n.id,
          summary: n.summary ?? n.description ?? "",
          type: n.type,
          metadata: Array.isArray(n.metadata) ? n.metadata : [],
          similarity_score: n.similarity_score,
        }) satisfies SearchItem
    );
  },
};

// Documentation provider: use fumadocs server search API via our route
export const documentationProvider: SearchProvider = {
  async search(query: string) {
    // Get static pages first for instant results
    const staticResults = filterStaticPages(query, 5);

    // Proxy through our app route to leverage existing config
    const url = `/api/docs-search?query=${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        // If API fails, return static results only
        return staticResults;
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
        const href =
          (it.url || it.path || "").toString() + (it.hash ? `#${it.hash}` : "");
        if (!acc.some((existing: any) => existing.href === href)) {
          acc.push({
            ...it,
            href,
          });
        }
        return acc;
      }, [] as any[]);

      const apiResults = uniqueItems.map(
        (it: any) => {
          // Fumadocs returns structured_data field with type information
          // Check tag, section, or use heuristics based on content
          let itemType: string;
          
          // Log to see what fumadocs actually returns
          if (process.env.NODE_ENV === 'development') {
            console.log('Fumadocs item:', { tag: it.tag, section: it.section, type: it.type, hasHash: !!it.hash, hasContent: !!it.content, structuredData: it.structured_data });
          }
          
          // Fumadocs uses 'type' field: can be 'page', 'heading', 'text'
          if (it.type === 'heading' || it.tag === 'heading' || it.section === 'heading' || it.hash) {
            itemType = 'heading';
          } else if (it.type === 'text' || it.tag === 'text' || it.section === 'text') {
            // Explicit text/content match
            itemType = 'content';
          } else if (it.type === 'page' || (!it.type && !it.hash && !it.content)) {
            // Explicit page or looks like a page
            itemType = 'page';
          } else {
            // Has content but not a heading - likely a text match
            itemType = it.content ? 'content' : 'page';
          }
          
          return {
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
            type: itemType,
            metadata: [
              Array.isArray(it.breadcrumbs)
                ? it.breadcrumbs.join(" › ")
                : it.breadcrumbs,
            ].filter(Boolean) as string[],
            href: it.href,
            breadcrumbs: Array.isArray(it.breadcrumbs) ? it.breadcrumbs : [],
            highlight: it.highlight || "",
            // Preserve page title from fumadocs for content results
            pageTitle: it.page || (Array.isArray(it.breadcrumbs) && it.breadcrumbs.length > 0 ? it.breadcrumbs[it.breadcrumbs.length - 1] : undefined),
          } satisfies SearchItem;
        }
      );

      // Merge static and API results, removing duplicates by href
      const allResults = [...staticResults, ...apiResults];
      const seenHrefs = new Set<string>();
      return allResults.filter((item) => {
        if (!item.href || seenHrefs.has(item.href)) {
          return false;
        }
        seenHrefs.add(item.href);
        return true;
      });
    } catch (error) {
      // If fetch fails, return static results
      console.error("Documentation search error:", error);
      return staticResults;
    }
  },
};
