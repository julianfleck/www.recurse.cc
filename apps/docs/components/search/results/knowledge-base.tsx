"use client";

import { Badge } from "@recurse/ui/components/badge";
import { CommandItem } from "@recurse/ui/components/command";
import { getNodeIcon } from "@/components/graph-view";
import type { SearchItem } from "../types";

type KnowledgeBaseResultsProps = {
	results: SearchItem[];
};

const PERCENTAGE_MULTIPLIER = 100;

export function KnowledgeBaseResults({ results }: KnowledgeBaseResultsProps) {
	return (
		<>
			{results.map((result, idx) => {
				// Create unique key using id, title, type, and index to avoid collisions
				const uniqueKey = `kb-${result.id || "no-id"}-${(result.title || "").slice(0, 20)}-${result.type || "no-type"}-${idx}`;

				return (
					<CommandItem
						className="flex-col items-start gap-1 px-4 py-3 data-[selected=true]:bg-accent/60"
						key={uniqueKey}
						value={result.title || result.id}
					>
						<div className="flex w-full items-center gap-3">
							<div className="h-4 w-4 flex-shrink-0 text-muted-foreground">
								{
									getNodeIcon(result.type || "unknown", { size: "h-4 w-4" })
										.icon
								}
							</div>
							<span className="flex-1 font-medium text-sm">
								{result.title || result.id}
							</span>
							{result.type && (
								<Badge className="text-xs" variant="secondary">
									{getNodeIcon(result.type || "unknown").label}
								</Badge>
							)}
						</div>

						{result.summary && (
							<p className="line-clamp-2 text-muted-foreground text-xs">
								{result.summary}
							</p>
						)}

						{result.metadata && result.metadata.length > 0 && (
							<div className="flex items-center gap-1 text-muted-foreground text-xs">
								<span className="truncate">
									{result.metadata.slice(0, 2).join(" › ")}
									{result.metadata.length > 2 && " › ..."}
								</span>
							</div>
						)}

						{result.similarity_score && (
							<div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
								<span>Similarity</span>
								<Badge className="text-xs" variant="outline">
									{(result.similarity_score * PERCENTAGE_MULTIPLIER).toFixed(1)}
									%
								</Badge>
							</div>
						)}
					</CommandItem>
				);
			})}
		</>
	);
}
