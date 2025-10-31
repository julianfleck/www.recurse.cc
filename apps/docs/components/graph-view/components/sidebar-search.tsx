"use client";

import { useCallback, useRef, useState } from "react";
import { Input } from "@recurse/ui/components/input";
import type {
  GraphLink as DataLink,
  GraphNode as DataNode,
} from "../utils/data/data-manager";
import {
  buildMetadataTextIndex,
  collectTags,
  nodeMatchesParsedQuery,
} from "../utils/search/filter-helpers";
import { parseSearchQuery } from "../utils/search/query-parser";

export type SidebarSearchMode = "json" | "api";

export type SidebarSearchProps = {
  mode: SidebarSearchMode;
  allNodes: DataNode[];
  allLinks?: DataLink[];
  onFilterIdsChange: (ids: Set<string> | null) => void;
  onQueryChange?: (raw: string) => void;
  onSearchApi?: (raw: string) => void; // for api mode only
  placeholder?: string;
  className?: string;
};

export function SidebarSearch({
  mode,
  allNodes,
  allLinks = [],
  onFilterIdsChange,
  onQueryChange,
  onSearchApi,
  placeholder = 'Search (e.g., summary:"foo" tag:bar)',
  className,
}: SidebarSearchProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<number | null>(null);

  const collectTagsFromNode = useCallback(
    (node: DataNode) => collectTags(node),
    []
  );

  const runLocalFilter = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        onFilterIdsChange(null);
        return;
      }
      const parsed = parseSearchQuery(trimmed);

      const idSet = new Set<string>();
      const metaIndex = buildMetadataTextIndex(allNodes, allLinks);
      for (const n of allNodes) {
        const metaTags = collectTagsFromNode(n);
        const linked = metaIndex.get(n.id) || {
          tag: [],
          hyponym: [],
          hypernym: [],
          any: [],
        };
        const ok = nodeMatchesParsedQuery(
          {
            id: n.id,
            title: n.title,
            summary: n.summary,
            type: n.type,
            metadata:
              (n as unknown as { metadata?: { tags?: unknown } }).metadata ??
              null,
            tags: (n as unknown as { tags?: unknown }).tags,
          },
          parsed,
          metaTags,
          linked
        );
        if (!ok) {
          continue;
        }
        idSet.add(n.id);
      }
      onFilterIdsChange(idSet);
    },
    [allNodes, allLinks, onFilterIdsChange, collectTagsFromNode]
  );

  const handleChange = useCallback(
    (next: string) => {
      setValue(next);
      onQueryChange?.(next);
      const immediate = next.trim();
      if (immediate === "") {
        // Clear filters immediately when input is empty
        onFilterIdsChange(null);
      }
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        if (mode === "api") {
          onSearchApi?.(next);
        } else {
          runLocalFilter(next);
        }
      }, 200);
    },
    [mode, onQueryChange, onSearchApi, runLocalFilter, onFilterIdsChange]
  );

  return (
    <div className={className}>
      <Input
        aria-label="Search nodes"
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}
