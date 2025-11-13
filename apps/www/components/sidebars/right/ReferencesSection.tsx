"use client";

import { Badge } from "@recurse/ui/components/badge";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/contexts/SessionContext";
import { useViewer } from "@/contexts/ViewerContext";
import { cn } from "@/lib/utils";
import type { RelatedItem } from "@/models/api/types";
import { api } from "@/services/apiConfig";

interface AnimatedItem extends RelatedItem {
	isNew?: boolean;
	isLeaving?: boolean;
}

const getFrameTypeColor = (type: string) => {
	switch (type) {
		case "concept":
			return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
		case "fact":
			return "bg-green-500/10 text-green-700 dark:text-green-400";
		case "relationship":
			return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
		case "claim":
			return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
		default:
			return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
	}
};

export function ReferencesSection() {
	const [groupByDocument, setGroupByDocument] = React.useState(true);
	const [relatedItems, setRelatedItems] = React.useState<AnimatedItem[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [documents, setDocuments] = React.useState<{
		[key: string]: { id: string; title: string };
	}>({});

	const { viewMode, selectedItem, selectItem } = useViewer();
	const { sessions, selectedSessionId } = useSession();
	const currentSession = sessions.find((s) => s.id === selectedSessionId);

	// Track previous items for animation
	const prevItemsRef = React.useRef<string[]>([]);
	const relatedItemsRef = React.useRef<AnimatedItem[]>([]);

	// Update ref when relatedItems changes
	React.useEffect(() => {
		relatedItemsRef.current = relatedItems;
	}, [relatedItems]);

	// Fetch related items based on context
	React.useEffect(() => {
		const fetchRelatedItems = async () => {
			setIsLoading(true);

			try {
				let items: RelatedItem[] = [];

				if (viewMode === "viewer" && selectedItem) {
					// Get items related to the currently viewed item
					items = await api.getRelatedItems(selectedItem.id, selectedItem.type);
				} else if (viewMode === "chat" && currentSession) {
					// Get items related to the current query/conversation
					// Using the session title as a simple query
					items = await api.getRelatedItems(currentSession.title, "query");
				}

				// Animate items - detect new and leaving items
				const currentIds = items.map((item) => item.id);
				const prevIds = prevItemsRef.current;

				// Mark new items
				const animatedItems: AnimatedItem[] = items.map((item) => ({
					...item,
					isNew: !prevIds.includes(item.id),
				}));

				// Add leaving items
				for (const prevId of prevIds) {
					if (!currentIds.includes(prevId)) {
						const prevItem = relatedItemsRef.current.find(
							(item) => item.id === prevId,
						);
						if (prevItem) {
							animatedItems.push({
								...prevItem,
								isLeaving: true,
							});
						}
					}
				}

				setRelatedItems(animatedItems);
				prevItemsRef.current = currentIds;

				// Remove leaving items after animation
				setTimeout(() => {
					setRelatedItems((items) => items.filter((item) => !item.isLeaving));
				}, 300);

				// Fetch document info for grouping
				if (groupByDocument) {
					const docs = await api.getDocuments();
					const docMap: { [key: string]: { id: string; title: string } } = {};
					for (const document of docs) {
						docMap[document.id] = { id: document.id, title: document.title };
					}
					setDocuments(docMap);
				}
			} catch {
				// Handle error silently for now
			} finally {
				setIsLoading(false);
			}
		};

		fetchRelatedItems();
	}, [viewMode, selectedItem, currentSession, groupByDocument]);

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="space-y-4 p-4">
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				</div>
			);
		}

		if (relatedItems.length === 0) {
			return (
				<div className="p-4 text-center text-muted-foreground text-sm">
					No related items found.
				</div>
			);
		}

		// Separate used and unused items
		const usedItems = relatedItems.filter((item) => item.wasUsedInContext);
		const unusedItems = relatedItems.filter((item) => !item.wasUsedInContext);

		const renderItemWithOpacity = (item: AnimatedItem, isUsed: boolean) => {
			const isFrame = item.type === "frame";

			return (
				<div
					className={cn(
						"cursor-pointer border-b p-4 text-sm transition-all duration-300 last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
						item.isNew && "slide-in-from-right-2 fade-in-0 animate-in",
						item.isLeaving && "slide-out-to-right-2 fade-out-0 animate-out",
						!(item.isNew || item.isLeaving) &&
							"fade-in-0 animate-in duration-200",
						!isUsed && "opacity-60",
					)}
					key={item.id}
					onClick={() => {
						// Navigate to the item
						if (selectedItem?.id !== item.id) {
							selectItem({
								id: item.id,
								title: item.title,
								type: item.type,
							});
						}
					}}
				>
					<div className="mb-2 flex items-center gap-2">
						<span className="flex-1 truncate font-medium">{item.title}</span>
						{isFrame ? (
							<Badge
								className={cn(
									"shrink-0 text-xs",
									getFrameTypeColor(item.frameType || "concept"),
								)}
								variant="secondary"
							>
								{item.frameType || item.type}
							</Badge>
						) : (
							<Badge className="shrink-0 text-xs capitalize" variant="outline">
								{item.type}
							</Badge>
						)}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										className="shrink-0 px-1.5 py-0.5 font-mono text-xs"
										variant="outline"
									>
										{Math.round(item.relevanceScore * 100)}
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p>Relevance: {Math.round(item.relevanceScore * 100)}%</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					{item.preview && (
						<div className="line-clamp-4 text-muted-foreground text-xs leading-relaxed">
							{item.preview}
						</div>
					)}
				</div>
			);
		};

		if (groupByDocument) {
			// For grouped view, we need to handle used/unused within each group
			const renderGroupedItems = (items: AnimatedItem[], showHeader = true) => {
				const groups: { [key: string]: AnimatedItem[] } = {};

				items.forEach((item) => {
					let docId = "";
					if (item.type === "document") {
						docId = item.id;
					} else if (item.type === "section") {
						docId = "doc-1"; // Simplified for demo
					} else if (item.type === "frame") {
						docId = "doc-1"; // Simplified for demo
					}

					if (!groups[docId]) {
						groups[docId] = [];
					}
					groups[docId].push(item);
				});

				return Object.entries(groups).map(([docId, groupItems]) => {
					if (groupItems.length === 0) {
						return null;
					}

					const docTitle =
						documents[docId]?.title ||
						(docId === "ungrouped" ? "Other" : "Unknown Document");

					return (
						<div
							className="px-0"
							key={`${docId}-${showHeader ? "used" : "unused"}`}
						>
							<div className="sticky top-0 bg-sidebar/95 px-4 py-2 font-medium text-muted-foreground text-xs backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
								{docTitle}
							</div>
							<div>
								{groupItems.map((item) =>
									renderItemWithOpacity(item, showHeader),
								)}
							</div>
						</div>
					);
				});
			};

			return (
				<>
					{usedItems.length > 0 && renderGroupedItems(usedItems, true)}
					{unusedItems.length > 0 && (
						<>
							<div className="border-t px-4 py-2 font-medium text-muted-foreground/70 text-xs italic">
								Related but not used in the answer
							</div>
							{renderGroupedItems(unusedItems, false)}
						</>
					)}
				</>
			);
		}
		// For ungrouped view
		return (
			<div className="px-0">
				{usedItems.map((item) => renderItemWithOpacity(item, true))}
				{unusedItems.length > 0 && (
					<>
						<div className="border-t px-4 py-2 font-medium text-muted-foreground/70 text-xs italic">
							Related but not used for answer
						</div>
						{unusedItems.map((item) => renderItemWithOpacity(item, false))}
					</>
				)}
			</div>
		);
	};

	return (
		<div className="flex h-full flex-col">
			{/* Content area */}
			<div className="min-h-0 flex-1 overflow-y-auto">{renderContent()}</div>

			{/* Settings at bottom */}
			<div className="flex-shrink-0 border-t p-3">
				<Label className="flex items-center gap-2 text-xs">
					<span className="text-muted-foreground">Group per document</span>
					<Switch
						checked={groupByDocument}
						className="scale-75"
						onCheckedChange={setGroupByDocument}
					/>
				</Label>
			</div>
		</div>
	);
}
