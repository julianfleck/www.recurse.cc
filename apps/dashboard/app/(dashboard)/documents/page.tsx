"use client";

import { useAuthStore } from "@/components/auth/auth-store";
import { DocumentsTable } from "@/components/documents/documents-table";
import { FileUploadDropzone } from "@recurse/ui/components/file-upload-dropzone";
import { apiService } from "@/lib/api";
import { UploadErrorToast } from "@/lib/upload-errors";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";

type UploadResponse = {
	document_id: string;
	job_id: string;
	status: string;
	message: string;
};

export default function DocumentsPage() {
	const [isUploading, setIsUploading] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFilesDropped = useCallback(async (files: File[]) => {
		if (files.length === 0) return;

		const accessToken = useAuthStore.getState().accessToken;
		if (!accessToken) {
			toast.error("Please log in to upload files");
			return;
		}

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

			// Trigger table refresh
			setRefreshKey((prev) => prev + 1);
		} finally {
			setIsUploading(false);
		}
	}, []);

	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files && files.length > 0) {
				handleFilesDropped(Array.from(files));
			}
			// Reset input so the same file can be selected again
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[handleFilesDropped],
	);

	return (
		<div className="flex h-[calc(100vh-var(--fd-nav-height,64px))] flex-col">
			{/* Hidden file input for click-to-upload */}
			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				accept=".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html"
				multiple
				onChange={handleFileInputChange}
			/>

			<FileUploadDropzone
				accept=".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html"
				className="flex-1 w-full min-h-0"
				disabled={isUploading}
				dropMessage={isUploading ? "Uploading..." : "Drop files to upload"}
				multiple
				onFilesDropped={handleFilesDropped}
			>
				<DocumentsTable key={refreshKey} onUploadClick={handleUploadClick} />
			</FileUploadDropzone>
		</div>
	);
}

