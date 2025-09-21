"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface SearchResult {
  id: string;
  title?: string;
  summary?: string;
  type?: string;
  metadata?: string[];
  similarity_score?: number;
  reranked_score?: number;
  index?: number;
}

interface SearchResultsListProps {
  results: SearchResult[];
  searchTerm: string;
  isLoading?: boolean;
}

const STAGGER_DELAY = 0.05;
const ANIMATION_DURATION = 0.3;

export function SearchResultsList({
  results,
  searchTerm,
  isLoading = false,
}: SearchResultsListProps) {
  if (isLoading && results.length === 0) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="flex justify-center py-12"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Searching...</p>
        </div>
      </motion.div>
    );
  }

  if (results.length === 0 && searchTerm) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="py-12 text-center"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <p className="text-muted-foreground">
          No results found for "{searchTerm}"
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-4"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      {results.map((result, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 10 }}
          key={result.id}
          transition={{
            delay: index * STAGGER_DELAY,
            duration: ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-medium">
                  {result.title || result.id}
                </h3>
              </div>

              {result.summary && (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {result.summary}
                </p>
              )}

              <div className="mt-1 flex items-center gap-2">
                {result.type && (
                  <span className="text-xs text-muted-foreground">
                    {result.type}
                  </span>
                )}
                {result.metadata && result.metadata.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    • {result.metadata.slice(0, 2).join(" › ")}
                    {result.metadata.length > 2 && " › ..."}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
