"use client";

import { ContentTree } from "@recurse/ui/components";
import type { SearchItem } from "../types";

type DocumentationResultsProps = {
  results: SearchItem[];
  searchTerm: string;
  onSelect?: () => void;
  isLoading?: boolean;
};

export function DocumentationResults({
  results,
  searchTerm,
  onSelect,
  isLoading = false,
}: DocumentationResultsProps) {
  const handleSelect = (href: string) => {
    if (href) {
      window.location.href = href;
      onSelect?.();
    }
  };

  return (
    <ContentTree
      results={results}
      searchTerm={searchTerm}
      onSelect={handleSelect}
    />
  );
}

