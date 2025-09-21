"use client";

import { motion } from "framer-motion";
import { GenericTooltipLayout } from "@/components/graph-view/components/node-tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ContextCardProps = {
  id: string;
  title?: string;
  summary?: string;
  type?: string;
  metadata?: string[];
  similarity_score?: number;
  index: number;
  staggerDelay: number;
  animationDuration: number;
};

const SCORE_MULTIPLIER = 100;

export function ContextCard({
  id,
  title,
  summary,
  type,
  metadata = [],
  similarity_score,
  index,
  staggerDelay,
  animationDuration,
}: ContextCardProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      key={id}
      transition={{
        delay: index * staggerDelay,
        duration: animationDuration,
        ease: "easeOut",
      }}
    >
      <Card className="h-full">
        <CardContent className="p-0">
          <div className="flex h-full flex-col p-4">
            <GenericTooltipLayout
              className="flex-1"
              metadata={metadata}
              showIcon={false}
              summary={summary}
              title={title || id}
              type={type}
            />
            {similarity_score ? (
              <div className="mt-3 border-border border-t pt-2">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Similarity</span>
                  <Badge className="text-xs" variant="secondary">
                    {(similarity_score * SCORE_MULTIPLIER).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
