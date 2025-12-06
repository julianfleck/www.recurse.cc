"use client";

import { Badge } from "@recurse/ui/components/badge";
import type {
	ColumnDef,
	ColumnFiltersState,
	ExpandedState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getExpandedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	MoreHorizontalIcon,
	RefreshCwIcon,
	SearchIcon,
	TrashIcon,
	UploadIcon,
} from "lucide-react";
import { getNodeIcons } from "@shared/components/graph-view/config/icon-config";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/components/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ApiError, apiService } from "@/lib/api";
import { cn } from "@/lib/utils";

// Types - API may return metadata either nested or at top level
type MetadataFields = {
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
};

export type Frame = {
	id: string;
	title: string;
	type: string;
	summary?: string | null;
	text?: string | null;
	parent_id?: string | null;
	created_at?: string;
	updated_at?: string;
	children?: Frame[];
	metadata?: MetadataFields;
	// API may also return metadata fields at top level
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
};

export type Document = {
	id: string;
	title: string;
	type: string;
	summary?: string | null;
	text?: string | null;
	created_at?: string;
	updated_at?: string;
	children?: Frame[];
	metadata?: MetadataFields;
	// API may also return metadata fields at top level
	tags?: string[];
	hypernyms?: string[];
	hyponyms?: string[];
};

interface TableNode {
	id: string;
	title: string;
	type: string;
	summary?: string | null;
	text?: string | null;
	created_at?: string;
	updated_at?: string;
	metadata?: MetadataFields;
	level: number;
	subRows: TableNode[];
}

function buildTree(documents: Document[]): TableNode[] {
	return documents.map(doc => ({
		id: doc.id,
		title: doc.title,
		type: doc.type,
		summary: doc.summary,
		text: doc.text,
		created_at: doc.created_at,
		updated_at: doc.updated_at,
		metadata: normalizeMetadata(doc),
		level: 0,
		subRows: buildSubTree(doc.children ?? [], 1),
	}));
}

function buildSubTree(frames: Frame[], level: number): TableNode[] {
	return frames.map(frame => ({
		id: frame.id,
		title: frame.title,
		type: frame.type,
		summary: frame.summary,
		text: frame.text,
		created_at: frame.created_at,
		updated_at: frame.updated_at,
		metadata: normalizeMetadata(frame),
		level,
		subRows: buildSubTree(frame.children ?? [], level + 1),
	}));
}

// Helper to normalize metadata from either nested or top-level location
function normalizeMetadata(node: Document | Frame): MetadataFields | undefined {
	// Check nested metadata first
	if (node.metadata && (node.metadata.tags?.length || node.metadata.hypernyms?.length || node.metadata.hyponyms?.length)) {
		return node.metadata;
	}
	// Check top-level fields
	if (node.tags?.length || node.hypernyms?.length || node.hyponyms?.length) {
		return {
			tags: node.tags,
			hypernyms: node.hypernyms,
			hyponyms: node.hyponyms,
		};
	}
	// Return nested metadata even if empty (for consistency)
	return node.metadata;
}

type DocumentsApiResponse = {
	documents?: Document[];
	nodes?: Document[];
	pagination?: {
		page: number;
		limit: number;
		total_count: number;
		total_pages: number;
		has_next: boolean;
		has_previous: boolean;
	};
};


// Helper function to render sortable table header
const SortableTableHead = ({ header }: { header: any }) => {
	const sortState = header.column.getIsSorted();
	let ariaSort: "ascending" | "descending" | "none" = "none";
	if (sortState === "asc") {
		ariaSort = "ascending";
	} else if (sortState === "desc") {
		ariaSort = "descending";
	}
	const canSort = header.column.getCanSort();
	const columnClassName = (header.column.columnDef.meta as { className?: string })?.className ?? "";

	const handleClick = () => {
		if (canSort) {
			header.column.getToggleSortingHandler()(undefined);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (canSort && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			header.column.getToggleSortingHandler()(e);
		}
	};

	if (!canSort) {
		return (
			<TableHead key={header.id} className={columnClassName}>
				{header.isPlaceholder ? null : (
					<span className="truncate text-xs">
						{flexRender(header.column.columnDef.header, header.getContext())}
					</span>
				)}
			</TableHead>
		);
	}

	return (
		<TableHead aria-sort={ariaSort} key={header.id} className={columnClassName}>
			{header.isPlaceholder ? null : (
				<button
					className="flex h-full w-full cursor-pointer select-none items-center justify-between gap-2 text-left"
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					type="button"
				>
					<span className="truncate text-xs">
						{flexRender(header.column.columnDef.header, header.getContext())}
					</span>
					{{
						asc: (
							<ChevronUpIcon
								aria-hidden="true"
								className="shrink-0 opacity-60"
								size={14}
							/>
						),
						desc: (
							<ChevronDownIcon
								aria-hidden="true"
								className="shrink-0 opacity-60"
								size={14}
							/>
						),
					}[sortState as string] ?? null}
				</button>
			)}
		</TableHead>
	);
};


// Constants
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

type DocumentsTableProps = {
	onUploadClick?: () => void;
};

export function DocumentsTable({ onUploadClick }: DocumentsTableProps) {
	const [data, setData] = useState<Document[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "created_at", desc: true },
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [expanded, setExpanded] = useState<ExpandedState>({});
	
	// Refs to access current state in columns without causing re-renders
	const expandedRef = useRef<ExpandedState>({});
	expandedRef.current = expanded;

	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const fetchDocuments = useCallback(async (retryCount = 0) => {
		try {
			setLoading(true);
			setError(null);

			const currentToken = useAuthStore.getState().accessToken;
			console.log(
				`[Documents] Attempt ${retryCount + 1}/${MAX_RETRIES + 1} with token:`,
				currentToken ? `${currentToken.substring(0, 50)}...` : "NO TOKEN",
			);

			// Fetch documents with nested children
			const response = await apiService.get<DocumentsApiResponse>(
				"/documents",
				{
					field_set: "metadata",
					depth: 3,
					limit: 50,
					page: 1,
				},
			);

			console.log("[Documents] Response:", response.data);

			// Handle the response structure - response.data is the API response object
			const apiResponse = response.data;
			const documents =
				apiResponse?.documents ?? apiResponse?.nodes ?? [];
			
			// Debug: Log first document's metadata structure
			if (documents.length > 0) {
				console.log("[Documents] First doc metadata structure:", {
					metadata: documents[0].metadata,
					tags: documents[0].tags,
					hypernyms: documents[0].hypernyms,
					hyponyms: documents[0].hyponyms,
				});
			}
			
			setData(Array.isArray(documents) ? documents : []);
			setError(null);
		} catch (err) {
			console.error(`[Documents] Fetch error (attempt ${retryCount + 1}):`, err);

			const isAuthError =
				err instanceof ApiError && (err.status === 401 || err.status === 403);
			const canRetry = retryCount < MAX_RETRIES && !retryTimeoutRef.current;

			if (isAuthError && canRetry) {
				const delay = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
				console.log(
					`[Documents] Retrying in ${delay}ms (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`,
				);

				retryTimeoutRef.current = setTimeout(() => {
					retryTimeoutRef.current = null;
					if (useAuthStore.getState().accessToken) {
						fetchDocuments(retryCount + 1);
					} else {
						setError("Authentication required. Please log in again.");
						setLoading(false);
					}
				}, delay);
				return;
			}

			if (isAuthError) {
				setError("Unable to authenticate. Please try logging out and back in.");
			} else if (err instanceof ApiError) {
				setError(`Failed to load documents: ${err.message}`);
			} else {
				setError("Failed to load documents. Please try again later.");
			}
			setLoading(false);
			return;
		}
		setLoading(false);
	}, []);

	const deleteDocument = useCallback(
		async (docId: string, dryRun = false) => {
			try {
				const endpoint = dryRun
					? `/documents/${docId}?dry_run=true`
					: `/documents/${docId}`;
				const response = await apiService.delete<{
					deletion_type: string;
					document_id: string;
					deleted: {
						documents: number;
						sections: number;
						frames: number;
					};
				}>(endpoint);

				if (!dryRun) {
					toast.success("Document deleted successfully", {
						description: `Deleted ${response.data.deleted.documents} document(s) and ${response.data.deleted.frames} frame(s)`,
					});
					fetchDocuments();
				}

				return response.data;
			} catch (err) {
				toast.error("Failed to delete document", {
					description:
						err instanceof ApiError ? err.message : "Unknown error occurred",
				});
				throw err;
			}
		},
		[fetchDocuments],
	);

	const deleteFrame = useCallback(
		async (frameId: string, frameName: string) => {
			try {
				await apiService.delete(`/node/${frameId}/delete`);
				toast.success(`Frame "${frameName}" deleted successfully`);
				fetchDocuments();
			} catch (err) {
				toast.error("Failed to delete frame", {
					description:
						err instanceof ApiError ? err.message : "Unknown error occurred",
				});
			}
		},
		[fetchDocuments],
	);

	const treeData = useMemo(() => buildTree(data), [data]);

	const deleteSelectedDocuments = async () => {
		if (selectedCount === 0) return;

		const selectedNodes = table.getSelectedRowModel().rows.map(row => row.original);

		const promises: Promise<unknown>[] = [];

		for (const node of selectedNodes) {
			const id = node.id;
			const endpoint = node.level === 0 ? `/documents/${id}` : `/frames/${id}`;

			promises.push(
				apiService.delete(endpoint).catch((err: ApiError) => {
					toast.error(`Failed to delete ${node.title}: ${err.message}`);
				})
			);
		}

		try {
			await Promise.all(promises);
			toast.success(`Deleted ${promises.length} items`);
			setRowSelection({});
			fetchDocuments();
		} catch (_err) {
			toast.error("Failed to delete some items");
		}
	};

	const columns: ColumnDef<TableNode>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						aria-label="Select all"
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						aria-label="Select row"
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
					/>
				),
				enableSorting: false,
				enableHiding: false,
				size: 40,
				meta: { className: "w-10" },
			},
			{
				accessorKey: "title",
				header: "Title",
				cell: ({ row }) => {
					const title = row.original.title;
					const rowType = row.original.type;
					const { iconClosed } = getNodeIcons(rowType, {
						size: "h-3.5 w-3.5",
						strokeWidth: 1.5,
					});

					return (
						<div 
							className="flex items-center gap-1"
							style={{ paddingLeft: `${row.depth * 1}rem` }}
						>
							{row.getCanExpand() ? (
								<button
									type="button"
									onClick={row.getToggleExpandedHandler()}
									className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent"
								>
									{row.getIsExpanded() ? (
										<ChevronDownIcon className="h-3 w-3" />
									) : (
										<ChevronRightIcon className="h-3 w-3" />
									)}
								</button>
							) : (
								<div className="w-4" /> // placeholder for alignment
							)}
							<span className="text-muted-foreground shrink-0">
								{iconClosed}
							</span>
							<span className="truncate text-sm">{title}</span>
						</div>
					);
				},
				meta: { className: "min-w-[200px]" },
			},
			{
				accessorKey: "created_at",
				header: "Created",
				cell: ({ row }) => {
					const createdAt = row.getValue("created_at") as string;
					if (!createdAt) {
						return <span className="text-muted-foreground text-xs">—</span>;
					}
					const date = new Date(createdAt);
					return <span className="text-xs">{date.toLocaleDateString()}</span>;
				},
				enableSorting: true,
				meta: { className: "w-24" },
			},
			{
				accessorKey: "updated_at",
				header: "Updated",
				cell: ({ row }) => {
					const updatedAt = row.getValue("updated_at") as string;
					if (!updatedAt) {
						return <span className="text-muted-foreground text-xs">—</span>;
					}
					const date = new Date(updatedAt);
					return <span className="text-xs">{date.toLocaleDateString()}</span>;
				},
				enableSorting: true,
				meta: { className: "w-24" },
			},
			{
				accessorKey: "metadata",
				header: "Metadata",
				cell: ({ row }) => {
					const normalized = row.original.metadata;
					const tags = normalized?.tags ?? [];
					const hypernyms = normalized?.hypernyms ?? [];
					const hyponyms = normalized?.hyponyms ?? [];
					
					const allItems = [
						...tags.slice(0,3).map((t: string) => ({ key: `t-${t}`, label: t, variant: "secondary" as const })),
						...hypernyms.slice(0,2).map((h: string) => ({ key: `hyper-${h}`, label: `↑${h}`, variant: "outline" as const })),
						...hyponyms.slice(0,2).map((h: string) => ({ key: `hypo-${h}`, label: `↓${h}`, variant: "outline" as const })),
					];
					
					const totalCount = tags.length + hypernyms.length + hyponyms.length;
					const shownCount = allItems.length;
					const remaining = totalCount - shownCount;
					
					if (allItems.length === 0) {
						return <span className="text-muted-foreground text-xs">—</span>;
					}
					
					return (
						<div className="flex items-center gap-1 overflow-hidden">
							{allItems.map((item) => (
								<Badge
									key={item.key}
									className="h-5 shrink-0 whitespace-nowrap px-1.5 text-[10px]"
									variant={item.variant}
								>
									{item.label}
								</Badge>
							))}
							{remaining > 0 && (
								<Badge className="h-5 shrink-0 whitespace-nowrap px-1.5 text-[10px]" variant="outline">
									+{remaining}
								</Badge>
							)}
						</div>
					);
				},
				enableSorting: false,
				meta: { className: "w-72" },
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => {
					const rowData = row.original;
					const isDocument = rowData.level === 0;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="h-6 w-6 p-0" size="sm" variant="ghost">
									<MoreHorizontalIcon className="h-3.5 w-3.5" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									className="hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
									onClick={() => {
										if (isDocument) {
											deleteDocument(rowData.id);
										} else {
											deleteFrame(rowData.id, rowData.title);
										}
									}}
								>
									<TrashIcon className="mr-2 h-4 w-4" />
									Delete {isDocument ? "Document" : "Frame"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
				enableSorting: false,
				meta: { className: "w-10" },
			},
		],
		[deleteDocument, deleteFrame],
	);

	// Wait for authentication before fetching
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		let isMounted = true;

		const fetchIfAuthenticated = () => {
			if (!isMounted) {
				console.log("[Documents] Component unmounted, skipping fetch");
				return;
			}

			const token = useAuthStore.getState().accessToken;
			console.log("[Documents] fetchIfAuthenticated called:", {
				hasToken: !!token,
				dataLength: data.length,
				loading,
			});

			if (token && data.length === 0 && !loading) {
				console.log("[Documents] Conditions met, fetching...");
				fetchDocuments();
			}
		};

		const unsubscribe = useAuthStore.subscribe((state) => {
			console.log(
				"[Documents] Auth store changed, hasToken:",
				!!state.accessToken,
			);
			if (state.accessToken) {
				timeoutId = setTimeout(fetchIfAuthenticated, 100);
			}
		});

		timeoutId = setTimeout(fetchIfAuthenticated, 50);

		return () => {
			isMounted = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
				retryTimeoutRef.current = null;
			}
			unsubscribe();
		};
	}, [fetchDocuments, data.length, loading]);

	const table = useReactTable({
		data: treeData,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getSubRows: (row) => row.subRows,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onExpandedChange: setExpanded,
		getRowId: (row) => row.id,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			expanded,
		},
	});

	const selectedCount = Object.keys(rowSelection).length;

	return (
		<div className="flex h-full w-full flex-col px-6">
			{/* Header with search and actions */}
			<div className="flex shrink-0 items-center justify-between gap-6 py-4">
				<div className="flex min-w-0 max-w-md flex-1 items-center">
					<div className="relative w-full">
						<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							className="w-full pl-9"
							onChange={(event) =>
								table.getColumn("title")?.setFilterValue(event.target.value)
							}
							placeholder="Search documents..."
							value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
						/>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{selectedCount > 0 && (
						<Button
							icon={<TrashIcon className="h-4 w-4" />}
							iconSide="left"
							onClick={deleteSelectedDocuments}
							size="sm"
							variant="destructive"
						>
							Delete {selectedCount} doc{selectedCount > 1 ? "s" : ""}
						</Button>
					)}
					<Button
						icon={<RefreshCwIcon className="h-4 w-4" />}
						onClick={() => fetchDocuments()}
						size="sm"
						variant="outline"
					>
						Refresh
					</Button>
					{onUploadClick && (
						<Button
							className="w-40"
							icon={<UploadIcon className="h-4 w-4" />}
							iconSide="right"
							onClick={onUploadClick}
							showIconOnHover={true}
							size="sm"
							variant="outline"
						>
							Upload
						</Button>
					)}
				</div>
			</div>

			{/* Error message */}
			{error && (
				<div className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 p-4 mb-4">
					<p className="text-destructive text-sm">{error}</p>
					<Button
						className="mt-2"
						onClick={() => fetchDocuments(0)}
						size="sm"
						variant="outline"
					>
						Retry
					</Button>
				</div>
			)}

			{/* Table - fills remaining height and scrolls internally */}
			<div className="flex-1 min-h-0 rounded-sm border relative">
				<div className="absolute inset-0 overflow-auto">
					<table className={cn("w-full caption-bottom text-sm", "table-fixed")}>
						<TableHeader sticky>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<SortableTableHead header={header} key={header.id} />
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{(() => {
							if (loading) {
								return (
									<TableRow>
										<TableCell
											className="h-24 text-center text-muted-foreground"
											colSpan={columns.length}
										>
											<div className="flex flex-col items-center gap-2">
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
												<span>Loading documents...</span>
											</div>
										</TableCell>
									</TableRow>
								);
							}

							if (error) {
								return (
									<TableRow>
										<TableCell
											className="h-24 text-center text-muted-foreground"
											colSpan={columns.length}
										>
											Unable to load documents
										</TableCell>
									</TableRow>
								);
							}

							if (table.getRowModel().rows?.length) {
								return table.getRowModel().rows.map((row) => {
									const rowData = row.original;
									const isDocument = rowData.level === 0;
									return (
										<ContextMenu key={row.id}>
											<ContextMenuTrigger asChild>
												<TableRow
													data-state={row.getIsSelected() && "selected"}
													className={`group ${rowData.level > 0 ? "bg-muted/20" : ""}`}
												>
													{row.getVisibleCells().map((cell) => {
														const columnClassName = (cell.column.columnDef.meta as { className?: string })?.className ?? "";
														return (
															<TableCell 
																key={cell.id} 
																className={columnClassName}
															>
																{flexRender(
																	cell.column.columnDef.cell,
																	cell.getContext(),
																)}
															</TableCell>
														);
													})}
												</TableRow>
											</ContextMenuTrigger>
											<ContextMenuContent>
												<ContextMenuItem
													variant="destructive"
													onClick={() => {
														if (isDocument) {
															deleteDocument(rowData.id);
														} else {
															deleteFrame(rowData.id, rowData.title);
														}
													}}
												>
													<TrashIcon className="mr-2 h-4 w-4" />
													Delete {isDocument ? "Document" : "Frame"}
												</ContextMenuItem>
											</ContextMenuContent>
										</ContextMenu>
									);
								});
							}

							return (
								<TableRow>
									<TableCell
										className="h-24 text-center"
										colSpan={columns.length}
									>
										No documents found. Upload some documents to get started.
									</TableCell>
								</TableRow>
							);
						})()}
					</TableBody>
					</table>
				</div>
			</div>

			{/* Pagination info */}
			<div className="flex shrink-0 items-center justify-between px-2 py-4">
				<div className="flex-1 text-muted-foreground text-sm">
					{selectedCount > 0 && `${selectedCount} of `}
					{table.getFilteredRowModel().rows.length} document
					{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""} found
				</div>
			</div>
		</div>
	);
}


