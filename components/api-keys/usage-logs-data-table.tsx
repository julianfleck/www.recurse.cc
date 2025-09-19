"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { parseDate } from "chrono-node";
import { CalendarIcon, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
};

type UsageLogType = {
  timestamp: string;
  [key: string]: unknown;
};

export function UsageLogsDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    method: false,
    status_code: false,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [naturalInput, setNaturalInput] = useState("");
  const [pageSize, setPageSize] = useState(20);

  // Filter data by date and time ranges
  const filteredData = useMemo(() => {
    const hasDateFilter = Boolean(dateRange.from || dateRange.to);
    const hasTimeFilter = Boolean(timeRange.start || timeRange.end);

    if (!(hasDateFilter || hasTimeFilter)) {
      return data;
    }

    return data.filter((item) => {
      const cast = item as unknown as UsageLogType;
      const itemDate = new Date(cast.timestamp);

      // Date range filter
      if (hasDateFilter) {
        const itemDateOnly = new Date(
          itemDate.getFullYear(),
          itemDate.getMonth(),
          itemDate.getDate()
        );

        if (dateRange.from) {
          const fromDate = new Date(
            dateRange.from.getFullYear(),
            dateRange.from.getMonth(),
            dateRange.from.getDate()
          );
          if (itemDateOnly.getTime() < fromDate.getTime()) {
            return false;
          }
        }

        if (dateRange.to) {
          const toDate = new Date(
            dateRange.to.getFullYear(),
            dateRange.to.getMonth(),
            dateRange.to.getDate()
          );
          if (itemDateOnly.getTime() > toDate.getTime()) {
            return false;
          }
        }
      }

      // Time range filter
      if (hasTimeFilter) {
        const itemTime = itemDate.toTimeString().slice(0, 5); // HH:MM
        if (timeRange.start && itemTime < timeRange.start) {
          return false;
        }
        if (timeRange.end && itemTime > timeRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [data, dateRange, timeRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const _clearFilters = () => {
    setGlobalFilter("");
    setDateRange({});
    setTimeRange({ start: "", end: "" });
    setNaturalInput("");
    setColumnFilters([]);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Global search */}
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-9 w-[300px] pl-8"
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Filter logs..."
              value={globalFilter}
            />
          </div>

          {/* Natural language date input with calendar popover */}
          <div className="relative flex gap-2">
            <Input
              className="h-9 w-[240px] pr-16 placeholder:text-muted-foreground/40"
              onChange={(e) => {
                setNaturalInput(e.target.value);

                // Clear filters if input is empty
                if (!e.target.value.trim()) {
                  setDateRange({});
                  setTimeRange({ start: "", end: "" });
                  return;
                }

                const parsed = parseDate(e.target.value);
                if (parsed) {
                  const now = new Date();
                  const inputLower = e.target.value.toLowerCase().trim();

                  // For relative terms like "last week", "yesterday", etc., create a range to today
                  if (
                    inputLower.includes("last") ||
                    inputLower.includes("yesterday") ||
                    inputLower.includes("ago") ||
                    inputLower.includes("past")
                  ) {
                    setDateRange({ from: parsed, to: now });
                  } else {
                    // For specific dates, use just that date
                    setDateRange({ from: parsed, to: parsed });
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setDatePickerOpen(true);
                }
              }}
              placeholder={(() => {
                const hasFilters =
                  dateRange.from ||
                  dateRange.to ||
                  timeRange.start ||
                  timeRange.end ||
                  naturalInput;

                if (!hasFilters) {
                  return "yesterday, last week...";
                }

                if (naturalInput) {
                  return; // Show the actual natural input value
                }

                const parts = [];

                // Date part
                if (dateRange.from && dateRange.to) {
                  parts.push(
                    `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  );
                } else if (dateRange.from) {
                  parts.push(`From ${dateRange.from.toLocaleDateString()}`);
                } else if (dateRange.to) {
                  parts.push(`Until ${dateRange.to.toLocaleDateString()}`);
                }

                // Time part
                if (timeRange.start && timeRange.end) {
                  parts.push(`${timeRange.start} - ${timeRange.end}`);
                } else if (timeRange.start) {
                  parts.push(`From ${timeRange.start}`);
                } else if (timeRange.end) {
                  parts.push(`Until ${timeRange.end}`);
                }

                return parts.join(" • ") || "filters active...";
              })()}
              value={naturalInput}
            />
            {/* Show X button when there's text (left side) */}
            {naturalInput.trim() && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-8 size-6"
                onClick={() => {
                  setNaturalInput("");
                  setDateRange({});
                  setTimeRange({ start: "", end: "" });
                }}
                size="sm"
                variant="ghost"
              >
                <X className="size-3.5" />
                <span className="sr-only">Clear filters</span>
              </Button>
            )}

            {/* Always show calendar icon (right side) */}
            <Popover onOpenChange={setDatePickerOpen} open={datePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="-translate-y-1/2 absolute top-1/2 right-2 size-6"
                  size="sm"
                  variant="ghost"
                >
                  <CalendarIcon className="size-3.5" />
                  <span className="sr-only">Open calendar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-4">
                <div className="space-y-4">
                  {/* Calendar and time in a horizontal layout */}
                  <div className="flex gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium text-sm">Date Range</Label>
                      <Calendar
                        captionLayout="dropdown"
                        mode="range"
                        onSelect={(range) => {
                          setDateRange(range || {});
                          setNaturalInput(""); // Clear natural input when using calendar
                        }}
                        selected={
                          dateRange.from || dateRange.to
                            ? (dateRange as unknown as {
                                from: Date;
                                to?: Date;
                              })
                            : undefined
                        }
                      />
                    </div>

                    <div className="min-w-[140px] space-y-3">
                      <Label className="font-medium text-sm">Time Range</Label>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">
                            From:
                          </Label>
                          <Input
                            className="h-8 w-full appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            onChange={(event) =>
                              setTimeRange((prev) => ({
                                ...prev,
                                start: event.target.value,
                              }))
                            }
                            type="time"
                            value={timeRange.start}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">
                            To:
                          </Label>
                          <Input
                            className="h-8 w-full appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            onChange={(event) =>
                              setTimeRange((prev) => ({
                                ...prev,
                                end: event.target.value,
                              }))
                            }
                            type="time"
                            value={timeRange.end}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      onClick={() => {
                        setDateRange({});
                        setTimeRange({ start: "", end: "" });
                        setNaturalInput("");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Clear All
                    </Button>
                    <Button onClick={() => setDatePickerOpen(false)} size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Items per page */}
          <Label className="text-muted-foreground text-xs">Rows:</Label>
          <Select
            onValueChange={(value) => {
              setPageSize(Number(value));
              table.setPageSize(Number(value));
            }}
            value={pageSize.toString()}
          >
            <SelectTrigger className="h-9 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9" variant="outline">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      className="capitalize"
                      key={column.id}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "timestamp"
                        ? "Date/Time"
                        : column.id.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="h-10 text-xs"
                        key={header.id}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="h-12"
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="py-2" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
