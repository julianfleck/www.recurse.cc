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
import { ChevronDownIcon, ChevronUpIcon, EditIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { apiService } from "@/lib/api";
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
    header: "Status",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                row.getValue("is_active")
                  ? "animate-pulse bg-primary"
                  : "bg-muted-foreground"
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
    header: "Secret Key",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <div className="font-mono text-sm">
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
      <div className="font-mono text-sm">
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
                "text-xs",
                isApiKey && "border-primary/20 text-primary",
                isUser && "border-green-600/20 text-green-600"
              )}
              variant="outline"
            >
              {scope}
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
        return <div className="text-muted-foreground text-sm">Read only</div>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {scopes.map((scope) => (
            <Badge className="text-xs" key={scope} variant="secondary">
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
];

export function ApiKeysTable() {
  const [data, setData] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiKey[]>("/users/me/api-keys");
      setData(response.data);
    } catch {
      // Silently handle API key fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

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
    <div className="w-full">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-[300px] pl-9"
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

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button size="sm" variant="destructive">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete {selectedCount} key{selectedCount > 1 ? "s" : ""}
            </Button>
          )}
          <Button size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
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
                {headerGroup.headers.map((header) => {
                  const getAriaSort = () => {
                    const sortState = header.column.getIsSorted();
                    if (sortState === "asc") return "ascending";
                    if (sortState === "desc") return "descending";
                    return "none";
                  };

                  return (
                    <TableHead
                      aria-sort={getAriaSort()}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                          )}
                          onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                          onKeyDown={header.column.getCanSort() ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          } : undefined}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
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
    </div>
  );
}
