"use client";

import { AuthSessionExpiredError } from "@recurse/auth";
import { Badge } from "@recurse/ui/components/badge";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	EditIcon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiKeyDialog } from "@/components/api-keys/api-key-dialog";
import { useAuthStore } from "@/components/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiError, apiService } from "@/lib/api";
import { cn } from "@/lib/utils";

// Constants
const SECRET_KEY_VISIBLE_CHARS = 8;
const SECRET_KEY_END_CHARS = 4;

export type ApiKey = {
	id: string;
	name: string;
	is_active: boolean;
	expires_at: string | null;
	last_used: string | null;
	scopes: string[];
	total_requests: number;
	data_scope: "api_key" | "user";
	created_at: string;
};

// Columns definition moved inside component to access deleteApiKey function
const _columns: ColumnDef<ApiKey>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				aria-label="Select all"
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
	},
	{
		accessorKey: "is_active",
		header: "",
		cell: ({ row }) => (
			<Tooltip>
				<TooltipTrigger>
					<div className="ml-2 flex items-center justify-center pb-2">
						<div
							className={cn(
								"size-1.5 rounded-full ring-2 ring-chart-2/90",
								row.getValue("is_active")
									? "bg-chart-2"
									: "bg-muted-foreground",
							)}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>API key is {row.getValue("is_active") ? "active" : "inactive"}</p>
				</TooltipContent>
			</Tooltip>
		),
		enableSorting: true,
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "id",
		header: "Key",
		cell: ({ row }) => {
			const id = row.getValue("id") as string;
			return (
				<div className="font-mono text-xs">
					{id.substring(0, SECRET_KEY_VISIBLE_CHARS)}...
					{id.substring(id.length - SECRET_KEY_END_CHARS)}
				</div>
			);
		},
		enableSorting: false,
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: ({ row }) => {
			const date = new Date(row.getValue("created_at"));
			return <div className="text-sm">{date.toLocaleDateString()}</div>;
		},
		enableSorting: true,
	},
	{
		accessorKey: "last_used",
		header: "Last Used",
		cell: ({ row }) => {
			const lastUsed = row.getValue("last_used") as string | null;
			if (!lastUsed) {
				return <div className="text-muted-foreground text-sm">Never</div>;
			}
			const date = new Date(lastUsed);
			return <div className="text-sm">{date.toLocaleDateString()}</div>;
		},
		enableSorting: true,
	},
	{
		accessorKey: "total_requests",
		header: "Total Requests",
		cell: ({ row }) => (
			<div className="font-mono text-xs">
				{(row.getValue("total_requests") as number).toLocaleString()}
			</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "data_scope",
		header: "Scope",
		cell: ({ row }) => {
			const scope = row.getValue("data_scope") as string;
			const isApiKey = scope === "api_key";
			const isUser = scope === "user";

			return (
				<Tooltip>
					<TooltipTrigger>
						<Badge
							className={cn(
								"border-border text-[8px] text-muted-foreground uppercase tracking-wider",
							)}
							variant="outline"
						>
							{isApiKey && "API Key"}
							{isUser && "User"}
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{isApiKey
								? "This API key sees only the content that was added with this key"
								: "This API key sees all the content in your user account"}
						</p>
					</TooltipContent>
				</Tooltip>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: "scopes",
		header: "Permissions",
		cell: ({ row }) => {
			const scopes = row.getValue("scopes") as string[];

			if (!scopes || scopes.length === 0) {
				return (
					<Badge
						className={cn(
							"border-border text-[8px] text-muted-foreground uppercase tracking-wider",
						)}
						variant="outline"
					>
						All
					</Badge>
				);
			}

			return (
				<div className="flex flex-wrap gap-1">
					{scopes.map((scope) => (
						<Badge
							className={cn(
								"border-border text-[8px] text-muted-foreground uppercase tracking-wider",
							)}
							key={scope}
							variant="outline"
						>
							{scope}
						</Badge>
					))}
				</div>
			);
		},
		enableSorting: false,
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => {
			const _apiKey = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="h-8 w-8 p-0" size="sm" variant="ghost">
							<MoreHorizontalIcon className="h-4 w-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<EditIcon className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
							onClick={() => {}}
						>
							<TrashIcon className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		enableSorting: false,
	},
];

// Helper function to render sortable table header
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SortableTableHead = ({ header }: { header: any }) => {
	// eslint-disable-line @typescript-eslint/no-explicit-any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sortState = header.column.getIsSorted();
	let ariaSort: "ascending" | "descending" | "none" = "none";
	if (sortState === "asc") {
		ariaSort = "ascending";
	} else if (sortState === "desc") {
		ariaSort = "descending";
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const canSort = header.column.getCanSort();

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
			<TableHead key={header.id}>
				{header.isPlaceholder ? null : (
					<span className="truncate text-xs">
						{flexRender(header.column.columnDef.header, header.getContext())}
					</span>
				)}
			</TableHead>
		);
	}

	return (
		<TableHead aria-sort={ariaSort} key={header.id}>
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
								size={16}
							/>
						),
						desc: (
							<ChevronDownIcon
								aria-hidden="true"
								className="shrink-0 opacity-60"
								size={16}
							/>
						),
					}[sortState as string] ?? null}
				</button>
			)}
		</TableHead>
	);
};

// Constants for retry logic
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000; // 1 second

export function ApiKeysTable() {
	const [data, setData] = useState<ApiKey[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "created_at", desc: true },
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	// Prevent multiple simultaneous retries
	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);

	const fetchApiKeys = useCallback(async (retryCount = 0) => {
		try {
			setLoading(true);
			setError(null);
			
			// Debug: Log current auth token
			const currentToken = useAuthStore.getState().accessToken;
			console.log(`[API Keys] Attempt ${retryCount + 1}/${MAX_RETRIES + 1} with token:`, currentToken ? `${currentToken.substring(0, 50)}...` : "NO TOKEN");
			
			const response = await apiService.get<{ keys: ApiKey[]; count: number; message?: string }>("/users/me/api-keys");
			console.log("[API Keys] Response:", response);
			
			// Handle the new response structure: { keys: [], count: 0, message?: "..." }
			const keys = response.data?.keys ?? response.data ?? [];
			setData(Array.isArray(keys) ? keys : []);
			setError(null);
		} catch (err) {
			console.error(`[API Keys] Fetch error (attempt ${retryCount + 1}):`, err);
			
			// Check for session expired errors - don't retry, the auth layer handles logout
			if (err instanceof AuthSessionExpiredError) {
				setLoading(false);
				return;
			}

			// Check for Missing Refresh Token errors in the message (from network errors)
			const errorMessage = err instanceof Error ? err.message : "";
			const isMissingRefreshToken =
				errorMessage.toLowerCase().includes("missing refresh token") ||
				(errorMessage.toLowerCase().includes("refresh") &&
					errorMessage.toLowerCase().includes("token"));

			if (isMissingRefreshToken) {
				// Session expired - auth layer should handle this, don't retry
				toast.error("Session expired", {
					description: "Please log in again to continue.",
					duration: 5000,
				});
				setLoading(false);
				return;
			}

			// Check if we should retry
			const isAuthError = err instanceof ApiError && (err.status === 401 || err.status === 403);
			const canRetry = retryCount < MAX_RETRIES && !retryTimeoutRef.current;
			
			if (isAuthError && canRetry) {
				// Exponential backoff: 1s, 2s, 4s, 8s...
				const delay = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
				console.log(`[API Keys] Retrying in ${delay}ms (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);

				retryTimeoutRef.current = setTimeout(() => {
					retryTimeoutRef.current = null;
					if (useAuthStore.getState().accessToken) {
						fetchApiKeys(retryCount + 1);
					} else {
						toast.error("Authentication required", {
							description: "Please log in again.",
						});
						setLoading(false);
					}
				}, delay);
				return; // Keep loading state while waiting for retry
			}

			// Max retries exceeded or non-auth error - show toast and set error state
			if (isAuthError) {
				toast.error("Authentication failed", {
					description: "Please try logging out and back in.",
				});
				setError("Unable to authenticate. Please try logging out and back in.");
			} else if (err instanceof ApiError) {
				toast.error("Failed to load API keys", {
					description: err.message,
				});
				setError(`Failed to load API keys: ${err.message}`);
			} else {
				toast.error("Failed to load API keys", {
					description: "Please try again later.",
				});
				setError("Failed to load API keys. Please try again later.");
			}
			setLoading(false);
			return;
		}
		setLoading(false);
	}, []);

	const deleteApiKey = useCallback(
		async (keyId: string) => {
			try {
				const _response = await apiService.delete(
					`/users/me/api-keys/${keyId}`,
				);

				// Show success toast
				toast.success("API key deleted successfully");

				// Refresh the table after successful deletion
				fetchApiKeys();
			} catch (_error) {
				toast.error("Failed to delete API key");
			}
		},
		[fetchApiKeys],
	);

	const deleteSelectedKeys = useCallback(async () => {
		const selectedIds = Object.keys(rowSelection);

		try {
			// Delete all selected keys
			await Promise.all(
				selectedIds.map((keyId) =>
					apiService.delete(`/users/me/api-keys/${keyId}`),
				),
			);

			// Show success toast
			const count = selectedIds.length;
			toast.success(
				`${count} API key${count > 1 ? "s" : ""} deleted successfully`,
			);

			// Clear selection and refresh table
			setRowSelection({});
			fetchApiKeys();
		} catch (_error) {
			toast.error("Failed to delete selected API keys");
		}
	}, [rowSelection, fetchApiKeys]);

	const columns: ColumnDef<ApiKey>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					aria-label="Select all"
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
		},
		{
			accessorKey: "is_active",
			header: "Status",
			cell: ({ row }) => (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="ml-2 flex items-center justify-center pt-2 pb-2">
							<div
								className={cn(
									"size-1.5 rounded-full ring-2 ring-chart-2/90",
									row.getValue("is_active")
										? "bg-chart-2"
										: "bg-muted-foreground",
								)}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							API key is {row.getValue("is_active") ? "active" : "inactive"}
						</p>
					</TooltipContent>
				</Tooltip>
			),
			enableSorting: true,
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "id",
			header: "Key",
			cell: ({ row }) => {
				const id = row.getValue("id") as string;
				return (
					<div className="font-mono text-xs">
						{id.substring(0, SECRET_KEY_VISIBLE_CHARS)}...
						{id.substring(id.length - SECRET_KEY_END_CHARS)}
					</div>
				);
			},
			enableSorting: false,
		},
		{
			accessorKey: "created_at",
			header: "Created",
			cell: ({ row }) => {
				const date = new Date(row.getValue("created_at"));
				return <div className="text-sm">{date.toLocaleDateString()}</div>;
			},
			enableSorting: true,
		},
		{
			accessorKey: "last_used",
			header: "Last Used",
			cell: ({ row }) => {
				const lastUsed = row.getValue("last_used");
				if (
					!lastUsed ||
					(typeof lastUsed === "object" && Object.keys(lastUsed).length === 0)
				) {
					return <div className="text-muted-foreground text-sm">Never</div>;
				}
				const date = new Date(lastUsed as string | number | Date);
				return <div className="text-sm">{date.toLocaleDateString()}</div>;
			},
			enableSorting: true,
		},
		{
			accessorKey: "total_requests",
			header: "Total Requests",
			cell: ({ row }) => (
				<div className="font-mono text-xs">
					{(row.getValue("total_requests") as number).toLocaleString()}
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "data_scope",
			header: "Scope",
			cell: ({ row }) => {
				const scope = row.getValue("data_scope") as string;
				const isApiKey = scope === "api_key";
				const isUser = scope === "user";

				return (
					<Tooltip>
						<TooltipTrigger>
							<Badge
								className={cn(
									"border-border text-[8px] text-muted-foreground uppercase tracking-wider",
								)}
								variant="outline"
							>
								{isApiKey && "API Key"}
								{isUser && "User"}
							</Badge>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								{isApiKey
									? "Content is only visible to this API key"
									: "Content is visible to your user account"}
							</p>
						</TooltipContent>
					</Tooltip>
				);
			},
			enableSorting: true,
		},
		{
			accessorKey: "scopes",
			header: "Permissions",
			cell: ({ row }) => {
				const scopes = row.getValue("scopes") as string[];

				if (!scopes || scopes.length === 0) {
					return (
						<Badge
							className={cn(
								"border-border text-[8px] text-muted-foreground uppercase tracking-wider",
							)}
							variant="outline"
						>
							All
						</Badge>
					);
				}

				return (
					<div className="flex flex-wrap gap-1">
						{scopes.map((scope) => (
							<Badge
								className={cn(
									"border-border text-[8px] text-muted-foreground uppercase tracking-wider",
								)}
								key={scope}
								variant="outline"
							>
								{scope}
							</Badge>
						))}
					</div>
				);
			},
			enableSorting: false,
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const apiKey = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="h-8 w-8 p-0" size="sm" variant="ghost">
								<MoreHorizontalIcon className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>
								<EditIcon className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
								onClick={() => deleteApiKey(apiKey.id)}
							>
								<TrashIcon className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			enableSorting: false,
		},
	];

	// Wait for authentication before fetching
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		let isMounted = true;

		const fetchIfAuthenticated = () => {
			if (!isMounted) {
				console.log("[API Keys] Component unmounted, skipping fetch");
				return;
			}

			const token = useAuthStore.getState().accessToken;
			console.log("[API Keys] fetchIfAuthenticated called:", {
				hasToken: !!token,
				dataLength: data.length,
				loading,
			});
			
			if (token && data.length === 0 && !loading) {
				console.log("[API Keys] Conditions met, fetching...");
				fetchApiKeys();
			} else {
				console.log("[API Keys] Conditions not met:", {
					hasToken: !!token,
					dataEmpty: data.length === 0,
					notLoading: !loading,
				});
			}
		};

		const unsubscribe = useAuthStore.subscribe((state) => {
			console.log("[API Keys] Auth store changed, hasToken:", !!state.accessToken);
			if (state.accessToken) {
				// Add a small delay to ensure auth is stable
				timeoutId = setTimeout(fetchIfAuthenticated, 100);
			}
		});

		// Check immediately with a small delay to ensure component is ready
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
	}, [fetchApiKeys, data.length, loading]);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	const selectedCount = Object.keys(rowSelection).length;

	return (
		<div className="mt-12 w-full">
			{/* Header with search and actions */}
			<div className="flex items-center justify-between gap-6 pb-4">
				<div className="flex min-w-0 max-w-md flex-1 items-center">
					<div className="relative w-full">
						<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							className="w-full pl-9"
							onChange={(event) =>
								table.getColumn("name")?.setFilterValue(event.target.value)
							}
							placeholder="Search API keys..."
							value={
								(table.getColumn("name")?.getFilterValue() as string) ?? ""
							}
						/>
					</div>
				</div>

				<div className="flex flex-shrink-0 items-center gap-2">
					{selectedCount > 0 && (
						<Button
							icon={<TrashIcon className="h-4 w-4" />}
							iconSide="left"
							onClick={deleteSelectedKeys}
							size="sm"
							variant="destructive"
						>
							Delete {selectedCount} key{selectedCount > 1 ? "s" : ""}
						</Button>
					)}
					<Button
						className="w-40"
						icon={<PlusIcon className="h-4 w-4" />}
						iconSide="right"
						onClick={() => setDialogOpen(true)}
						showIconOnHover={true}
						size="sm"
						variant="outline"
					>
						Add new key
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="mt-4 rounded-sm border">
				<Table maxHeight="h-[400px]" stickyHeader>
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
												<span>Loading API keys...</span>
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
											Unable to load API keys
										</TableCell>
									</TableRow>
								);
							}

							if (table.getRowModel().rows?.length) {
								return table.getRowModel().rows.map((row) => (
									<TableRow
										data-state={row.getIsSelected() && "selected"}
										key={row.id}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								));
							}

							return (
								<TableRow>
									<TableCell
										className="h-24 text-center"
										colSpan={columns.length}
									>
										No API keys found.
									</TableCell>
								</TableRow>
							);
						})()}
					</TableBody>
				</Table>
			</div>

			{/* Pagination info */}
			<div className="flex items-center justify-between px-2 pt-4">
				<div className="flex-1 text-muted-foreground text-sm">
					{selectedCount > 0 && `${selectedCount} of `}
					{table.getFilteredRowModel().rows.length} API key
					{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""} found
				</div>
			</div>

			{/* API Key Dialog */}
			<ApiKeyDialog
				onOpenChange={setDialogOpen}
				onSuccess={() => {
					// Refresh the table data after creating a new key
					fetchApiKeys();
				}}
				open={dialogOpen}
			/>
		</div>
	);
}
