"use client";

import { FileUploadDropzone } from "@recurse/ui/components/file-upload-dropzone";
import {
	BookOpen,
	Brain,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Paperclip,
	Send,
	X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiError, apiService } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UploadErrorToast, getUploadError, formatErrorDescription, parseApiError } from "@/lib/upload-errors";
import { DocumentsTable, type Document, type Frame } from "@/components/documents/documents-table";

const HIGHLIGHT_DURATION_MS = 1600;

type Citation = {
	citation_index: number;
	id: string;
	title: string;
	summary?: string;
	type: string;
};

type SourceDocument = {
	id: string;
	title: string;
	type?: string;
	summary?: string;
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
	metadata?: {
		tags?: string[];
		hypernyms?: string[];
		hyponyms?: string[];
	};
};

type SourceGroup = {
	document: SourceDocument;
	citations: Citation[];
};

type AnswerSource = Citation & {
	// Include document metadata for normalization
	document?: SourceDocument;
};

type AnswerResponse = {
	result?: string;
	versions?: string[];
	sources?: SourceGroup[];
	message?: string;
};

type UploadResponse = {
	document_id: string;
	job_id: string;
	status: string;
	message: string;
};

type AttachedFile = {
	file: File;
	status: "pending" | "uploading" | "uploaded" | "error";
	documentId?: string;
	error?: string;
};

export default function ChatPage() {
	const [query, setQuery] = useState("");
	const [useKb, setUseKb] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [answer, setAnswer] = useState<string | null>(null);
	const [sources, setSources] = useState<SourceGroup[] | null>(null);
	const [documents, setDocuments] = useState<Document[] | null>(null);
	const [versions, setVersions] = useState<string[] | null>(null);
	const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
	const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const sourceRefs = useRef<Record<number, HTMLDivElement | null>>({});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [highlightedSource, setHighlightedSource] = useState<number | null>(
		null,
	);

	const hasContent = useMemo(() => {
		return Boolean(answer) || (Array.isArray(versions) && versions.length > 0);
	}, [answer, versions]);

	const canSubmit = useMemo(() => {
		return query.trim().length > 0 && !loading && !isUploading;
	}, [query, loading, isUploading]);

	const showPrompt = answer == null && !loading && error == null;

	const uploadFile = useCallback(async (file: File): Promise<UploadResponse> => {
		const { data } = await apiService.uploadFile<UploadResponse>(
			"/documents/upload",
			file,
			{ title: file.name },
		);
		return data;
	}, []);

	const handleFilesDropped = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return;

			// Add files as pending
			const newAttachedFiles: AttachedFile[] = files.map((file) => ({
				file,
				status: "pending" as const,
			}));

			setAttachedFiles((prev) => [...prev, ...newAttachedFiles]);
			setIsUploading(true);

			// Upload files
			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				setAttachedFiles((prev) =>
					prev.map((af) =>
						af.file === file ? { ...af, status: "uploading" as const } : af,
					),
				);

				try {
					const result = await uploadFile(file);
					setAttachedFiles((prev) =>
						prev.map((af) =>
							af.file === file
								? {
										...af,
										status: "uploaded" as const,
										documentId: result.document_id,
									}
								: af,
						),
					);
					toast.success(`Uploaded: ${file.name}`);
				} catch (error) {
					const errorDef = getUploadError(error);
					const errorMessage = formatErrorDescription(errorDef, parseApiError(error).message);
					setAttachedFiles((prev) =>
						prev.map((af) =>
							af.file === file
								? { ...af, status: "error" as const, error: errorMessage }
								: af,
						),
					);
					toast.error(<UploadErrorToast error={error} />, {
						duration: 8000,
					});
				}
			}

			setIsUploading(false);
		},
		[uploadFile],
	);

	const handleRemoveFile = useCallback((index: number) => {
		setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
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

	const submit = useCallback(async () => {
		if (!canSubmit) {
			return;
		}
		setLoading(true);
		setError(null);
		setAnswer(null);
		setSources(null);
		setDocuments(null);
		setVersions(null);
		setCurrentDraftIndex(0);

		try {
			const params = {
				query: query.trim(),
				use_knowledge_base: useKb,
				cite_sources: true,
				model: "openai/gpt-4o",
				depth: 5,
			} as const;

			// Use apiService to include Authorization header from auth store
			const { data } = await apiService.get<AnswerResponse>(
				"/writing/answer",
				params as unknown as Record<string, string | number | boolean>,
			);

			setAnswer(data?.result ?? null);
			setSources(Array.isArray(data?.sources) ? data.sources : null);
			
			// Collect all cited frame IDs
			const citedFrameIds = new Set<string>();
			
			// Build documents from source groups - the answer endpoint returns all candidates
			const documentsMap = new Map<string, Document>();
			
			if (Array.isArray(data?.sources)) {
				for (const sourceGroup of data.sources) {
					// Mark all citations as cited
					for (const citation of sourceGroup.citations) {
						citedFrameIds.add(citation.id);
					}
					
					const docId = sourceGroup.document.id;
					
					// Convert citations to Frame[] format
					const frames: Frame[] = sourceGroup.citations.map((citation) => ({
						id: citation.id,
						title: citation.title,
						type: citation.type,
						summary: citation.summary || null,
						index: citation.citation_index,
						parent_id: docId,
						metadata: {
							citation_index: citation.citation_index,
							is_cited: true,
						},
					}));
					
					// If document already exists, merge citations
					if (documentsMap.has(docId)) {
						const existingDoc = documentsMap.get(docId)!;
						// Merge frames, avoiding duplicates by ID
						const existingFrameIds = new Set(existingDoc.children?.map(f => f.id) ?? []);
						const newFrames = frames.filter(f => !existingFrameIds.has(f.id));
						existingDoc.children = [...(existingDoc.children ?? []), ...newFrames];
					} else {
						// Create new Document from sourceGroup.document with frames as children
						const doc: Document = {
							id: docId,
							title: sourceGroup.document.title,
							type: sourceGroup.document.type || "Document",
							summary: sourceGroup.document.summary || null,
							children: frames,
							tags: sourceGroup.document.tags,
							hypernyms: sourceGroup.document.hypernyms,
							hyponyms: sourceGroup.document.hyponyms,
							metadata: sourceGroup.document.metadata,
						};
						documentsMap.set(docId, doc);
					}
				}
			}
			
			const convertedDocuments = Array.from(documentsMap.values());
			setDocuments(convertedDocuments.length > 0 ? convertedDocuments : null);
			setVersions(Array.isArray(data?.versions) ? data?.versions : null);

			// Clear attached files after successful submission
			setAttachedFiles([]);

			// Reset scroll position on new content
			setTimeout(() => {
				if (scrollRef.current) {
					scrollRef.current.scrollTop = 0;
				}
			}, 0);
		} catch (e) {
			const message = e instanceof ApiError ? e.message : "Request failed";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [canSubmit, query, useKb]);

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	const drafts = useMemo(() => {
		const items: string[] = [];
		if (answer) {
			items.push(answer);
		}
		if (Array.isArray(versions)) {
			items.push(...versions);
		}
		return items;
	}, [answer, versions]);

	const currentDraft = drafts[currentDraftIndex] ?? drafts[0] ?? "";

	const handleCitationClick = useCallback((n: number) => {
		const el = sourceRefs.current[n];
		if (el) {
			try {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			} catch {
				// Ignore scroll errors
			}
			setHighlightedSource(n);
			// Clear highlight after a short delay
			window.setTimeout(
				() => setHighlightedSource((prev) => (prev === n ? null : prev)),
				HIGHLIGHT_DURATION_MS,
			);
		}
	}, []);

	const renderAnswerWithCitations = useCallback(
		(text: string) => {
			const parts: React.ReactNode[] = [];
			const regex = /\[(\d+)\]/g;
			let lastIndex = 0;
			let match: RegExpExecArray | null;
			while (true) {
				match = regex.exec(text);
				if (match === null) {
					break;
				}
				const idx = match.index;
				const num = Number(match[1]);
				if (idx > lastIndex) {
					parts.push(text.slice(lastIndex, idx));
				}
				parts.push(
					<button
						aria-label={`Jump to source ${num}`}
						className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border px-1 align-super text-[10px] text-muted-foreground leading-none hover:border-primary hover:text-primary"
						key={`cite-${idx}`}
						onClick={() => handleCitationClick(num)}
						type="button"
					>
						{num}
					</button>,
				);
				lastIndex = regex.lastIndex;
			}
			if (lastIndex < text.length) {
				parts.push(text.slice(lastIndex));
			}
			return parts;
		},
		[handleCitationClick],
	);

	const getFileStatusIcon = (status: AttachedFile["status"]) => {
		switch (status) {
			case "uploading":
				return <Loader2 className="size-3 animate-spin text-muted-foreground" />;
			case "uploaded":
				return null;
			case "error":
				return <X className="size-3 text-destructive" />;
			default:
				return <Paperclip className="size-3 text-muted-foreground" />;
		}
	};

	return (
		<FileUploadDropzone
			accept=".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html"
			className="flex flex-col"
			disabled={isUploading}
			dropMessage={isUploading ? "Uploading..." : "Drop files to upload"}
			multiple
			onFilesDropped={handleFilesDropped}
		>
			<div
				className="flex flex-col"
				style={{ minHeight: "calc(100vh - var(--fd-nav-height))" }}
			>
				<div className="container mx-auto flex flex-1 flex-col p-8">
					{/* Scrollable answer area with sources inside */}
					<div className="min-h-0 flex-1">
						<ScrollArea className="h-full">
							<div className="relative p-6" ref={scrollRef}>
								{showPrompt && (
									<div className="text-muted-foreground">
										<div className="flex flex-col">
											<span className="text-base">Ask a question</span>
											<span className="mt-1 text-sm">
												Get answers from your knowledge base.
											</span>
										</div>
									</div>
								)}
								{loading && (
									<div className="text-muted-foreground text-sm">Thinking…</div>
								)}
								{error && <div className="text-destructive text-sm">{error}</div>}

								{hasContent && !loading && !error && (
									<div className="space-y-6">
										{/* Current draft content with clickable citations */}
										<div className="whitespace-pre-wrap">
											{renderAnswerWithCitations(currentDraft)}
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
					</div>

					{/* Attached files preview */}
					{attachedFiles.length > 0 && (
						<div className="mb-2 flex flex-wrap gap-2">
							{attachedFiles.map((af, index) => (
								<div
									className={cn(
										"flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm",
										af.status === "uploaded" && "border-green-500/50 bg-green-500/10",
										af.status === "error" && "border-destructive/50 bg-destructive/10",
										af.status === "uploading" && "bg-muted/50",
										af.status === "pending" && "bg-muted/50",
									)}
									key={`${af.file.name}-${index}`}
								>
									{getFileStatusIcon(af.status)}
									<span className="max-w-32 truncate">{af.file.name}</span>
									<button
										aria-label={`Remove ${af.file.name}`}
										className="rounded-sm p-0.5 hover:bg-muted"
										onClick={() => handleRemoveFile(index)}
										type="button"
									>
										<X className="size-3" />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Sources table - positioned above input */}
					{documents && documents.length > 0 && (
						<div className="mb-4">
							<div className="mb-3 flex items-center gap-2">
								<BookOpen className="size-4" />
								<span className="font-medium">Context</span>
							</div>
							<div className="h-96">
								<DocumentsTable data={documents} disableAutoFetch />
							</div>
						</div>
					)}

					{/* Footer input area with KB switch and draft arrows */}
					<form
						className="mt-4"
						onSubmit={(e) => {
							e.preventDefault();
							submit();
						}}
					>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<Switch
									aria-label="Use knowledge base"
									checked={useKb}
									onCheckedChange={(v) => setUseKb(Boolean(v))}
								/>
								<Tooltip>
									<TooltipTrigger asChild>
										<Brain aria-hidden className="size-4" />
									</TooltipTrigger>
									<TooltipContent side="top" sideOffset={6}>
										Use knowledge base
									</TooltipContent>
								</Tooltip>
							</div>

							{/* Hidden file input */}
							<input
								ref={fileInputRef}
								accept=".pdf,.txt,.md,.mdx,.json,.csv,.doc,.docx,.html"
								className="sr-only"
								multiple
								onChange={handleFileInputChange}
								type="file"
							/>

							{/* Upload button */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										aria-label="Upload files"
										disabled={isUploading}
										onClick={handleUploadClick}
										size="icon"
										type="button"
										variant="outline"
									>
										{isUploading ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Paperclip className="size-4" />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top" sideOffset={6}>
									{isUploading ? "Uploading..." : "Attach files"}
								</TooltipContent>
							</Tooltip>

							<Input
								aria-label="Ask a question"
								disabled={loading}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={onKeyDown}
								placeholder="Ask something…"
								value={query}
							/>
							<Button
								aria-label="Send"
								disabled={!canSubmit}
								size="icon"
								type="submit"
							>
								<Send className="size-4" />
							</Button>
							{Array.isArray(versions) && versions.length > 0 && (
								<div className="ml-2 flex items-center gap-2">
									<Button
										aria-label="Previous draft"
										onClick={() => {
											const total = 1 + (versions?.length || 0);
											setCurrentDraftIndex((i) => (i - 1 + total) % total);
										}}
										size="icon"
										type="button"
										variant="outline"
									>
										<ChevronLeft className="size-4" />
									</Button>
									<Button
										aria-label="Next draft"
										onClick={() => {
											const total = 1 + (versions?.length || 0);
											setCurrentDraftIndex((i) => (i + 1) % total);
										}}
										size="icon"
										type="button"
										variant="outline"
									>
										<ChevronRight className="size-4" />
									</Button>
								</div>
							)}
						</div>
					</form>
				</div>
			</div>
		</FileUploadDropzone>
	);
}
