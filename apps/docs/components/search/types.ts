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

// Hierarchical structure for documentation search results
export type HierarchicalSearchResult = {
  type: 'page';
  id: string;
  title: string;
  url: string;
  score?: number;
  headings: Array<{
    type: 'heading';
    id: string;
    title: string;
    url: string;
    content: Array<{
      type: 'text';
      id: string;
      title: string;
      url: string;
      content: string;
    }>;
  }>;
};

export type SearchProvider = {
  // Given a query, return items suitable for SearchResultsList
  // For documentation: can return HierarchicalSearchResult[] for hierarchical structure
  // For knowledge base: returns SearchItem[] (flat list)
  search: (query: string) => Promise<SearchItem[] | HierarchicalSearchResult[]>;
};
