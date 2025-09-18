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
import { PlusIcon, SearchIcon, TrashIcon, EditIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
          <Badge
            variant={row.getValue("is_active") ? "default" : "secondary"}
            className={cn(
              "text-xs",
              row.getValue("is_active")
                ? "bg-green-600/10 hover:bg-green-600/20 text-green-600"
                : "bg-gray-600/10 hover:bg-gray-600/20 text-gray-600"
            )}
          >
            {row.getValue("is_active") ? "Active" : "Inactive"}
          </Badge>
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
          {id.substring(0, SECRET_KEY_VISIBLE_CHARS)}...{id.substring(id.length - SECRET_KEY_END_CHARS)}
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
      return (
        <div className="text-sm">
          {date.toLocaleDateString()}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "last_used",
    header: "Last Used",
    cell: ({ row }) => {
      const lastUsed = row.getValue("last_used") as string | null;
      if (!lastUsed) {
        return <div className="text-sm text-muted-foreground">Never</div>;
      }
      const date = new Date(lastUsed);
      return (
        <div className="text-sm">
          {date.toLocaleDateString()}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "total_requests",
    header: "Total Requests",
    cell: ({ row }) => (
      <div className="text-sm font-mono">
        {row.getValue("total_requests").toLocaleString()}
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
              variant="outline"
              className={cn(
                "text-xs",
                isApiKey && "border-blue-600/20 text-blue-600",
                isUser && "border-green-600/20 text-green-600"
              )}
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
        return <div className="text-sm text-muted-foreground">Read only</div>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {scopes.map((scope) => (
            <Badge key={scope} variant="secondary" className="text-xs">
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
    header: "Actions",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 p-0 w-8">
          <EditIcon className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 p-0 text-destructive hover:text-destructive w-8">
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
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
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search API keys..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-9 w-[300px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button variant="destructive" size="sm">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete {selectedCount} key{selectedCount > 1 ? "s" : ""}
            </Button>
          )}
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add new key
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (loading) {
                return (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading API keys...
                    </TableCell>
                  </TableRow>
                );
              }

              if (table.getRowModel().rows?.length) {
                return table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                    colSpan={columns.length}
                    className="h-24 text-center"
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
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedCount > 0 && `${selectedCount} of `}
          {table.getFilteredRowModel().rows.length} API key{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
