"use client";

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
import { ApiKeyDialog } from "@/components/api-keys/api-key-dialog";
import { useAuthStore } from "@/components/auth/auth-store";
import { Badge } from "@/components/ui/badge";
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
    header: "",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <div className="ml-2 flex items-center justify-center pb-2">
            <div
              className={cn(
                "size-1.5 rounded-full ring-2 ring-chart-2/90",
                row.getValue("is_active") ? "bg-chart-2" : "bg-muted-foreground"
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
                "border-border text-[8px] text-muted-foreground uppercase tracking-wider"
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
              "border-border text-[8px] text-muted-foreground uppercase tracking-wider"
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
                "border-border text-[8px] text-muted-foreground uppercase tracking-wider"
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
    cell: () => (
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
          <DropdownMenuItem className="hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground">
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
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
  if (sortState === "asc") ariaSort = "ascending";
  else if (sortState === "desc") ariaSort = "descending";
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

export function ApiKeysTable() {
  const [data, setData] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
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
      const response = await apiService.get<ApiKey[]>("/users/me/api-keys");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);

      // If it's an authentication error and we haven't retried yet, wait a bit and retry
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403) &&
        retryCount < 2 &&
        !retryTimeoutRef.current
      ) {
        const delay = 2000 * (retryCount + 1); // 2s, 4s delays
        console.log(
          `Auth error, retrying API keys fetch in ${delay}ms (retry ${retryCount + 1})`
        );

        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          if (useAuthStore.getState().accessToken) {
            fetchApiKeys(retryCount + 1);
          }
        }, delay);
        return;
      }

      // Silently handle other API key fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Wait for authentication before fetching
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchIfAuthenticated = () => {
      if (!isMounted) return;

      const token = useAuthStore.getState().accessToken;
      if (token && data.length === 0 && !loading) {
        console.log("Auth token available, fetching API keys");
        fetchApiKeys();
      }
    };

    const unsubscribe = useAuthStore.subscribe((state) => {
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
      <div className="min-h-[400px] rounded-md border">
        <Table>
          <TableHeader>
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
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      Loading API keys...
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
                          cell.getContext()
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
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {selectedCount > 0 && `${selectedCount} of `}
          {table.getFilteredRowModel().rows.length} API key
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
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
