"use client";

import { AuthSessionExpiredError } from "@recurse/auth";
import { Badge } from "@recurse/ui/components/badge";
import { AnimatePresence, motion } from "framer-motion";
import { Search, UploadIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useFileUpload } from "@recurse/ui/hooks/use-file-upload";
import { useAuthStore } from "@/components/auth/auth-store";
import { GenericTooltipLayout } from "@shared/components/graph-view/components/node-tooltip";
import { DefaultSpinner } from "@/components/loaders/default-spinner";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiService } from "@/lib/api";
import { isOnAuthPage } from "@/lib/auth-utils";

// Track if we've shown a network error toast to prevent spam
let hasShownNetworkErrorToast = false;

type SearchResult = {
	id: string;
	title?: string;
	summary?: string;
	type?: string;
	metadata?: string[];
	similarity_score?: number;
	reranked_score?: number;
	index?: number;
};

type ApiSearchResponse = {
	data: {
		nodes: SearchResult[];
		total_found?: number;
		returned_count?: number;
		search_time_ms?: number;
		filters_applied?: string[];
		pagination?: {
			page: number;
			limit: number;
			total_count: number;
			total_pages: number;
			has_next: boolean;
			has_previous: boolean;
		};
	};
	status: number;
	statusText: string;
};

const SEARCH_LIMIT = 20;
const STAGGER_DELAY = 0.1;
const ANIMATION_DURATION = 0.3;
const SCORE_MULTIPLIER = 100;
const DEBOUNCE_DELAY = 1000; // 1 second delay for auto-search

export default function ContextPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingNewResults, setIsLoadingNewResults] = useState(false);
	const [totalFound, setTotalFound] = useState<number | null>(null);
	const [hasPerformedManualSearch, setHasPerformedManualSearch] =
		useState(false);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const accessToken = useAuthStore((s) => s.accessToken);
	
	const [{ files }, { openFileDialog, getInputProps }] = useFileUpload({
		accept: ".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html",
		multiple: true,
		onFilesAdded: async (addedFiles) => {
			const fileList = addedFiles.map(f => f.file as File);
			const toastId = "file-upload";
			const totalFiles = fileList.length;
			let successCount = 0;
			let errorCount = 0;

			toast.loading(
				<div className="flex items-center gap-2">
					<span>
						Uploading {totalFiles} file{totalFiles > 1 ? "s" : ""}...
					</span>
				</div>,
				{ id: toastId },
			);

			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				try {
					await apiService.uploadFile("/documents/upload", file, {
						title: file.name,
					});
					successCount++;
				} catch (error) {
					errorCount++;
					console.error(`Failed to upload ${file.name}:`, error);
				}
			}

			if (errorCount === 0) {
				toast.success(
					<div className="flex flex-col gap-1">
						<span className="font-medium">
							{successCount} file{successCount > 1 ? "s" : ""} uploaded
						</span>
						<span className="text-muted-foreground text-xs">
							Processing started
						</span>
					</div>,
					{ id: toastId },
				);
			} else if (successCount === 0) {
				toast.error(
					<div className="flex flex-col gap-1">
						<span className="font-medium">Upload failed</span>
						<span className="text-muted-foreground text-xs">
							{errorCount} file{errorCount > 1 ? "s" : ""} failed to upload
						</span>
					</div>,
					{ id: toastId },
				);
			} else {
				toast.warning(
					<div className="flex flex-col gap-1">
						<span className="font-medium">
							{successCount} of {totalFiles} files uploaded
						</span>
						<span className="text-muted-foreground text-xs">
							{errorCount} file{errorCount > 1 ? "s" : ""} failed
						</span>
					</div>,
					{ id: toastId },
				);
			}
		},
	});

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const handleSearch = useCallback(
		async (query: string) => {
			if (!query.trim()) {
				setSearchResults([]);
				setTotalFound(null);
				return;
			}

			// Mark as manual search if it's not the initial "type:doc" search
			if (query !== "type:doc") {
				setHasPerformedManualSearch(true);
			}

			// If we have existing results, show loading state in button instead of full loader
			const hasExistingResults = searchResults.length > 0;
			if (hasExistingResults) {
				setIsLoadingNewResults(true);
			} else {
				setIsLoading(true);
			}

			setTotalFound(null);

			try {
				const searchParams = {
					query,
					limit: SEARCH_LIMIT,
					field_set: "content",
				};

				const response: ApiSearchResponse = await apiService.get(
					"/search",
					searchParams,
				);

				// Extract nodes from the API response structure
				const nodes = response.data?.nodes || [];
				setSearchResults(nodes);
				setTotalFound(response.data?.total_found || null);
			} catch (err) {
				// Check for session expired errors
				if (err instanceof AuthSessionExpiredError) {
					setSearchResults([]);
					setTotalFound(null);
					return;
				}

				// Handle authentication errors by redirecting to login (but not when already on auth pages)
				if (err instanceof Error && err.name === "AuthenticationError") {
					if (!isOnAuthPage()) {
						window.location.href = "/login";
					}
					return;
				}

				const errorMessage = err instanceof Error ? err.message : "Search failed";
				const isNetworkError = errorMessage.includes("Failed to fetch") || 
					errorMessage.includes("Network error") ||
					errorMessage.includes("Mixed Content");

				// Show toast for errors (but only once for network errors to prevent spam)
				if (isNetworkError) {
					if (!hasShownNetworkErrorToast) {
						hasShownNetworkErrorToast = true;
						toast.error("Unable to connect to API", {
							description: "Please check your connection and try again.",
							duration: 5000,
						});
					}
				} else {
					toast.error("Search failed", {
						description: errorMessage,
					});
				}

				setSearchResults([]);
				setTotalFound(null);
			} finally {
				setIsLoading(false);
				setIsLoadingNewResults(false);
			}
		},
		[searchResults.length],
	);

	// Debounced search function
	const debouncedSearch = useCallback(
		(query: string) => {
			// Clear existing timer
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			// Set new timer for debounced search
			debounceTimerRef.current = setTimeout(() => {
				handleSearch(query);
			}, DEBOUNCE_DELAY);
		},
		[handleSearch],
	);

	// Initial search on mount - only if authenticated and no manual search performed
	// Ensure we're in the browser before making requests
	useEffect(() => {
		// Only run in browser, not during SSR
		if (typeof window === "undefined") {
			return;
		}
		
		if (accessToken && !hasPerformedManualSearch) {
			// Small delay to ensure everything is initialized
			const timer = setTimeout(() => {
				handleSearch("type:doc");
			}, 100);
			
			return () => clearTimeout(timer);
		}
	}, [handleSearch, accessToken, hasPerformedManualSearch]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setSearchTerm(newValue);

			// Trigger debounced search
			if (newValue.trim()) {
				debouncedSearch(newValue);
			} else {
				// Clear results immediately for empty input
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
				}
				setSearchResults([]);
				setTotalFound(null);
			}
		},
		[debouncedSearch],
	);


	const renderContent = () => {
		// Only show big loading spinner when we have no results yet
		if (isLoading && searchResults.length === 0) {
			return (
				<motion.div
					animate={{ opacity: 1 }}
					className="py-12"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
				>
					<DefaultSpinner text="Searching your knowledge base…" />
				</motion.div>
			);
		}

		if (searchResults.length > 0) {
			return (
				<motion.div
					animate={{ opacity: 1 }}
					className="columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					style={{
						columnFill: "balance",
					}}
				>
					<AnimatePresence>
						{searchResults.map((result, index) => (
							<motion.div
								animate={{ opacity: 1, scale: 1, y: 0 }}
								className="mb-4 break-inside-avoid"
								exit={{ opacity: 0, scale: 0.8, y: -20 }}
								initial={{ opacity: 0, scale: 0.8, y: 20 }}
								key={result.id}
								transition={{
									delay: index * STAGGER_DELAY,
									duration: ANIMATION_DURATION,
									ease: "easeOut",
								}}
							>
								<GenericTooltipLayout
									className="rounded-lg border bg-card px-4 py-5 shadow-sm"
									metadata={result.metadata}
									showIcon={false}
									summary={result.summary}
									title={result.title || "Untitled"}
									type={result.type}
								/>
								{result.similarity_score ? (
									<div className="mx-4 mt-3 border-border border-t pt-2 pb-4">
										<div className="flex items-center justify-between text-muted-foreground text-xs">
											<span>Similarity</span>
											<Badge className="text-xs" variant="secondary">
												{(result.similarity_score * SCORE_MULTIPLIER).toFixed(
													1,
												)}
												%
											</Badge>
										</div>
									</div>
								) : null}
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			);
		}

		if (searchTerm && !isLoading) {
			return (
				<motion.div
					animate={{ opacity: 1 }}
					className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
				>
					<div className="flex flex-col items-center justify-center">
						<span className="text-sm">No results found for "{searchTerm}"</span>
						<span className="mt-1 text-xs">
							Try a different query, or broaden your search terms.
						</span>
					</div>
					<Button
						icon={<UploadIcon className="h-4 w-4" />}
						onClick={openFileDialog}
						size="sm"
						variant="outline"
					>
						Upload Documents
					</Button>
					<input {...getInputProps({ className: "hidden" })} />
				</motion.div>
			);
		}

		// Initial empty state when no search has been performed
		if (!searchTerm && !isLoading && searchResults.length === 0) {
			return (
				<motion.div
					animate={{ opacity: 1 }}
					className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
				>
					<div className="flex flex-col items-center justify-center">
						<span className="text-sm">No documents yet.</span>
						<span className="mt-1 text-xs">
							Upload documents to start exploring your knowledge base.
						</span>
					</div>
					<Button
						icon={<UploadIcon className="h-4 w-4" />}
						onClick={openFileDialog}
						size="sm"
						variant="outline"
					>
						Upload Documents
					</Button>
					<input {...getInputProps({ className: "hidden" })} />
				</motion.div>
			);
		}

		return null;
	};

	return (
		<div className="container mx-auto max-w-7xl space-y-6 p-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="font-bold text-3xl">Context Search</h1>
				<p className="text-muted-foreground">
					Search through your knowledge base to find relevant context and
					information.
				</p>
			</div>

			{/* Search Section */}
			<div className="space-y-4">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-9"
							onChange={handleInputChange}
							placeholder="Enter your search query..."
							value={searchTerm}
						/>
					</div>
					{searchResults.length > 0 &&
						(isLoadingNewResults ? (
							<Button disabled size="sm" tooltip="Loading..." variant="outline">
								<Spinner className="h-4 w-4" />
							</Button>
						) : (
							<CopyButton
								size="sm"
								text={JSON.stringify(
									{
										query: searchTerm,
										total_found: totalFound,
										results: searchResults,
										timestamp: new Date().toISOString(),
									},
									null,
									2,
								)}
								tooltip="Copy context as JSON"
								variant="outline"
							/>
						))}
				</div>

			</div>

			{/* Results Count */}
			{totalFound !== null && searchResults.length > 0 && (
				<div className="text-muted-foreground text-sm">
					Found {totalFound.toLocaleString()} results • Showing{" "}
					{searchResults.length} items
				</div>
			)}

			{/* Results Grid */}
			<AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
		</div>
	);
}
