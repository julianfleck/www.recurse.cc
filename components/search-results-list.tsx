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
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="truncate font-medium text-sm">
                    {result.title || result.id}
                  </h3>
                  {result.type && (
                    <Badge className="text-xs" variant="secondary">
                      {result.type}
                    </Badge>
                  )}
                </div>

                {result.summary && (
                  <p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
                    {result.summary}
                  </p>
                )}

                {result.metadata && result.metadata.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.metadata.slice(0, 3).map((meta, metaIndex) => (
                      <Badge
                        className="text-xs"
                        key={metaIndex}
                        variant="outline"
                      >
                        {meta}
                      </Badge>
                    ))}
                    {result.metadata.length > 3 && (
                      <Badge className="text-xs" variant="outline">
                        +{result.metadata.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {result.similarity_score && (
                <div className="flex flex-col items-end gap-1">
                  <Badge className="text-xs" variant="secondary">
                    {(result.similarity_score * 100).toFixed(1)}%
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    similarity
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
