export type SearchItem = {
  id: string;
  title?: string;
  summary?: string;
  type?: string;
  metadata?: string[];
};

export type SearchProvider = {
  // Given a query, return items suitable for SearchResultsList
  search: (query: string) => Promise<SearchItem[]>;
};
