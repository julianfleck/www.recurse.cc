"use client";

import { cn } from "@recurse/ui/lib";
import { Upload } from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { useCallback, useState } from "react";

export interface FileUploadDropzoneProps {
	children: ReactNode;
	/** Called when files are dropped */
	onFilesDropped: (files: File[]) => void;
	/** Accepted file types (e.g., "image/*,.pdf,.txt") */
	accept?: string;
	/** Whether multiple files can be dropped */
	multiple?: boolean;
	/** Whether the dropzone is disabled */
	disabled?: boolean;
	/** Custom message to show when dragging */
	dropMessage?: string;
	/** Additional className for the container */
	className?: string;
	/** Additional className for the overlay */
	overlayClassName?: string;
}

/**
 * A dropzone wrapper that shows an overlay when files are being dragged over it.
 * Wraps any content and adds drag-and-drop file upload functionality.
 */
export function FileUploadDropzone({
	children,
	onFilesDropped,
	accept = "*",
	multiple = true,
	disabled = false,
	dropMessage = "Drop files to upload",
	className,
	overlayClassName,
}: FileUploadDropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);

	const validateFileType = useCallback(
		(file: File): boolean => {
			if (accept === "*") return true;

			const acceptedTypes = accept.split(",").map((type) => type.trim());
			const fileType = file.type || "";
			const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

			return acceptedTypes.some((type) => {
				if (type.startsWith(".")) {
					return fileExtension === type.toLowerCase();
				}
				if (type.endsWith("/*")) {
					const baseType = type.split("/")[0];
					return fileType.startsWith(`${baseType}/`);
				}
				return fileType === type;
			});
		},
		[accept],
	);

	const handleDragEnter = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (!disabled) {
				setIsDragging(true);
			}
		},
		[disabled],
	);

	const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		// Only set isDragging to false if we're leaving the container itself
		if (e.currentTarget.contains(e.relatedTarget as Node)) {
			return;
		}

		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (!disabled) {
				setIsDragging(true);
			}
		},
		[disabled],
	);

	const handleDrop = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			if (disabled) return;

			const droppedFiles = e.dataTransfer.files;
			if (!droppedFiles || droppedFiles.length === 0) return;

			const validFiles: File[] = [];
			const filesArray = Array.from(droppedFiles);

			for (const file of filesArray) {
				if (validateFileType(file)) {
					validFiles.push(file);
					if (!multiple) break;
				}
			}

			if (validFiles.length > 0) {
				onFilesDropped(validFiles);
			}
		},
		[disabled, multiple, onFilesDropped, validateFileType],
	);

	return (
		<div
			className={cn("relative", className)}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{children}

			{/* Drop overlay */}
			{isDragging && !disabled && (
				<div
					className={cn(
						"pointer-events-none absolute inset-0 z-50 flex items-center justify-center",
						"bg-background/60 backdrop-blur-[2px]",
						"transition-all duration-200",
						overlayClassName,
					)}
				>
					<div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-8 py-6 text-center shadow-lg">
						<div className="rounded-full bg-primary/10 p-3">
							<Upload className="size-6 text-primary" />
						</div>
						<p className="font-medium text-card-foreground">{dropMessage}</p>
					</div>
				</div>
			)}
		</div>
	);
}

