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
  pageTitle?: string; // For content results, the actual page title
};

export type SearchProvider = {
  // Given a query, return items suitable for SearchResultsList
  search: (query: string) => Promise<SearchItem[]>;
};
