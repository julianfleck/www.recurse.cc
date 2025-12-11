"use client";

import { useAuthStore } from "@/components/auth/auth-store";
import { apiService } from "@/lib/api";
import {
	type GraphViewData,
	convertApiResponseToGraphData,
} from "@/lib/api-to-graph-converter";
import { UploadErrorToast } from "@/lib/upload-errors";
import { FileUploadDropzone } from "@recurse/ui/components/file-upload-dropzone";
import { useFileUpload } from "@recurse/ui/hooks/use-file-upload";
import { GraphView } from "@shared/components/graph-view";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";

// Track if we've shown a network error toast to prevent spam
let hasShownNetworkErrorToast = false;

type UploadResponse = {
	document_id: string;
	job_id: string;
	status: string;
	message: string;
};

export default function Page() {
	const [isUploading, setIsUploading] = useState(false);
	const [graphData, setGraphData] = useState<GraphViewData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const hasFetchedRef = useRef(false);

	// Fetch documents data for the graph view
	useEffect(() => {
		const fetchDocuments = async () => {
			// Prevent duplicate fetches
			if (hasFetchedRef.current) {
				return;
			}

			try {
				const accessToken = useAuthStore.getState().accessToken;
				if (!accessToken) {
					console.log("[GraphPage] No auth token, waiting...");
					return;
				}

				hasFetchedRef.current = true;
				setIsLoading(true);
				setError(null);
				console.log("[GraphPage] Fetching documents...");

				// Use /documents endpoint with depth=5 to get full nested tree structure
				// This returns documents with nested children at all levels
				// The backend caches this response so it's fast
				const response = await apiService.get<unknown>("/search/document", {
					field_set: "metadata",
					depth: 5,
					min_score: 0,
					limit: 50,
					page: 1,
				});

				console.log("[GraphPage] Raw API response:", response.data);

				// Convert API response to graph view format
				// This properly converts nested children and generates links
				// without creating separate metadata nodes
				const converted = convertApiResponseToGraphData(response.data);

				console.log("[GraphPage] Converted graph data:", converted);
				console.log("[GraphPage] Nodes count:", converted.nodes.length);
				console.log("[GraphPage] Links count:", converted.links.length);

				setGraphData(converted);
			} catch (error) {
				console.error("[GraphPage] Failed to fetch documents:", error);
				const errorMessage = error instanceof Error ? error.message : "";
				const isNetworkError = errorMessage.includes("Failed to fetch") || 
					errorMessage.includes("Network error") ||
					errorMessage.includes("Mixed Content");

				// Only show toast once for network errors to prevent spam
				if (isNetworkError) {
					if (!hasShownNetworkErrorToast) {
						hasShownNetworkErrorToast = true;
						toast.error("Unable to connect to API", {
							description: "Please check your connection and try again.",
							duration: 5000,
						});
					}
				} else {
					toast.error("Failed to load documents");
				}
				setError(errorMessage || "Failed to load documents");
			} finally {
				setIsLoading(false);
			}
		};

		// Subscribe to auth store changes
		const unsubscribe = useAuthStore.subscribe((state, prevState) => {
			if (!prevState.accessToken && state.accessToken) {
				fetchDocuments();
			}
		});

		// Also check immediately in case auth is already ready
		fetchDocuments();

		return unsubscribe;
	}, []);

	const handleFilesDropped = useCallback(async (files: File[]) => {
		if (files.length === 0) return;

		setIsUploading(true);
		const toastId = "file-upload";
		const totalFiles = files.length;
		let successCount = 0;
		const errors: Array<{ file: File; error: unknown }> = [];

		// Show initial loading toast
		toast.loading(
			<div className="flex items-center gap-2">
				<span>
					Uploading {totalFiles} file{totalFiles > 1 ? "s" : ""}...
				</span>
			</div>,
			{ id: toastId },
		);

		try {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				// Update progress
				toast.loading(
					<div className="flex flex-col gap-1">
						<span className="font-medium">
							Uploading {i + 1} of {totalFiles}
						</span>
						<span className="text-muted-foreground text-xs">{file.name}</span>
					</div>,
					{ id: toastId },
				);

				try {
					await apiService.uploadFile<UploadResponse>(
						"/documents/upload",
						file,
						{
							title: file.name,
						},
					);
					successCount++;
				} catch (error) {
					errors.push({ file, error });
					console.error(`Failed to upload ${file.name}:`, error);
					// Show individual error toast for each failed file
					toast.error(<UploadErrorToast error={error} />, {
						duration: 8000,
					});
				}
			}

			// Show final result summary
			if (errors.length === 0) {
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
				// All files failed - show a summary if we have multiple files
				if (totalFiles > 1) {
					toast.error(
						<div className="flex flex-col gap-1">
							<span className="font-medium">
								All {totalFiles} file{totalFiles > 1 ? "s" : ""} failed to upload
							</span>
							<span className="text-muted-foreground text-xs">
								See individual error messages above
							</span>
						</div>,
						{ id: toastId },
					);
				}
			} else {
				toast.warning(
					<div className="flex flex-col gap-1">
						<span className="font-medium">
							{successCount} of {totalFiles} files uploaded
						</span>
						<span className="text-muted-foreground text-xs">
							{errors.length} file{errors.length > 1 ? "s" : ""} failed - see error messages above
						</span>
					</div>,
					{ id: toastId },
				);
			}

			// Refresh the graph data after upload
			const response = await apiService.get<unknown>("/documents", {
				page: 1,
				limit: 20,
				field_set: "metadata",
				depth: 5,
			});
			const converted = convertApiResponseToGraphData(response.data);
			setGraphData(converted);
		} finally {
			setIsUploading(false);
		}
	}, []);

	// Show empty state when no data and not loading
	const hasNoData = !isLoading && (!graphData || graphData.nodes.length === 0);
	
	const [{ files }, { openFileDialog, getInputProps }] = useFileUpload({
		accept: ".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html",
		multiple: true,
		onFilesAdded: (addedFiles) => {
			const fileList = addedFiles.map(f => f.file as File);
			handleFilesDropped(fileList);
		},
	});

	if (hasNoData) {
		return (
			<div className="flex h-[calc(100vh-var(--fd-nav-height))] w-full items-center justify-center px-6 py-10">
				<div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
					<div className="flex flex-col items-center justify-center">
						{error ? (
							<>
								<span className="text-sm">Unable to load graph</span>
								<span className="mt-1 text-xs">{error}</span>
							</>
						) : (
							<>
								<span className="text-sm">No documents yet.</span>
								<span className="mt-1 text-xs">
									Upload documents to start exploring your knowledge base.
								</span>
							</>
						)}
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
				</div>
			</div>
		);
	}

	return (
		<FileUploadDropzone
			accept=".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html"
			className="h-[calc(100vh-var(--fd-nav-height))] w-full overflow-hidden"
			disabled={isUploading}
			dropMessage={isUploading ? "Uploading..." : "Drop files to upload"}
			multiple
			onFilesDropped={handleFilesDropped}
		>
			<GraphView
				className="h-full w-full"
				data={graphData}
				depth={3}
				withSidebar={false}
				zoomModifier=""
			/>
		</FileUploadDropzone>
	);
}
