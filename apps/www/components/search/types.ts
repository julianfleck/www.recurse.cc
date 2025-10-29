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
  // Given a query, return items suitable for SearchResultsList
  search: (query: string) => Promise<SearchItem[]>;
};

