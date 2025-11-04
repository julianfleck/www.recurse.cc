import { apiService } from "@/lib/api";
import type { SearchItem, SearchProvider, HierarchicalSearchResult } from "./types";
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
// Returns hierarchical structure: pages with nested headings and content
export const documentationProvider: SearchProvider = {
  async search(query: string): Promise<HierarchicalSearchResult[]> {
    // Proxy through our app route to leverage existing config
    const url = `/api/docs-search?query=${encodeURIComponent(query)}`;
    
    try {
      const res = await fetch(url, { method: "GET" });
      
      if (!res.ok) {
        // Return empty array if API fails
        return [];
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      // Return API response AS-IS - no transformations whatsoever
      return data as HierarchicalSearchResult[];
    } catch (error) {
      // If fetch fails, return empty
      return [];
    }
  },
};
