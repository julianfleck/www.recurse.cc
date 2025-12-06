"use client";

import { FileUploadDropzone } from "@recurse/ui/components/file-upload-dropzone";
import { GraphView } from "@shared/components/graph-view";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";

type UploadResponse = {
	document_id: string;
	job_id: string;
	status: string;
	message: string;
};

export default function Page() {
	const [isUploading, setIsUploading] = useState(false);

	const handleFilesDropped = useCallback(async (files: File[]) => {
		if (files.length === 0) return;

		setIsUploading(true);
		const toastId = "file-upload";
		const totalFiles = files.length;
		let successCount = 0;
		let errorCount = 0;

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
					await apiService.uploadFile<UploadResponse>("/documents/upload", file, {
						title: file.name,
					});
					successCount++;
				} catch (error) {
					errorCount++;
					console.error(`Failed to upload ${file.name}:`, error);
				}
			}

			// Show final result
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
		} finally {
			setIsUploading(false);
		}
	}, []);

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
				depth={0}
				withSidebar={false}
				zoomModifier=""
			/>
		</FileUploadDropzone>
	);
}
