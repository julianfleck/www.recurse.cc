"use client";

import { ContentTree } from "@recurse/ui/components";
import type { HierarchicalSearchResult } from "../types";

type DocumentationResultsProps = {
  results: HierarchicalSearchResult[];
  searchTerm: string;
  onSelect?: () => void;
  onSelectAll?: () => void;
  isLoading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

export function DocumentationResults({
  results,
  searchTerm,
  onSelect,
  onSelectAll,
  isLoading = false,
  containerRef,
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
      onSelectAll={onSelectAll}
      containerRef={containerRef}
    />
  );
}
