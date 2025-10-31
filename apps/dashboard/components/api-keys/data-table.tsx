"use client";

import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SearchIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@recurse/ui/components/avatar";
import { Badge } from "@recurse/ui/components/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { cn } from "@/lib/utils";

// NOTE: ColumnMeta declaration moved to a single shared ambient declaration to avoid duplication

type Item = {
  id: string;
  product: string;
  productImage: string;
  fallback: string;
  price: number;
  availability: "In Stock" | "Out of Stock" | "Limited";
  rating: number;
};

const columns: ColumnDef<Item>[] = [
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
  },
  {
    header: "Product",
    accessorKey: "product",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="rounded-sm">
          <AvatarImage
            alt={row.original.fallback}
            src={row.original.productImage}
          />
          <AvatarFallback className="text-xs">
            {row.original.fallback}
          </AvatarFallback>
        </Avatar>
        <div className="font-medium">{row.getValue("product")}</div>
      </div>
    ),
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => <div>${row.getValue("price")}</div>,
    enableSorting: false,
    meta: {
      filterVariant: "range",
    },
  },
  {
    header: "Availability",
    accessorKey: "availability",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as string;

      const styles = {
        "In Stock":
          "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
        "Out of Stock":
          "bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
        Limited:
          "bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5",
      }[availability];

      return (
        <Badge
          className={
            (cn("rounded-full border-none focus-visible:outline-none"), styles)
          }
        >
          {row.getValue("availability")}
        </Badge>
      );
    },
    enableSorting: false,
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "Rating",
    accessorKey: "rating",
    cell: ({ row }) => <div>{row.getValue("rating")}</div>,
    meta: {
      filterVariant: "range",
    },
  },
];

const items: Item[] = [
  {
    id: "1",
    product: "Black Chair",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-1.png",
    fallback: "BC",
    price: 159,
    availability: "In Stock",
    rating: 3.9,
  },
  {
    id: "2",
    product: "Nike Jordan",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-2.png",
    fallback: "NJ",
    price: 599,
    availability: "Limited",
    rating: 4.4,
  },
  {
    id: "3",
    product: "OnePlus 7 Pro",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-3.png",
    fallback: "O7P",
    price: 1299,
    availability: "Out of Stock",
    rating: 3.5,
  },
  {
    id: "4",
    product: "Nintendo Switch",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-4.png",
    fallback: "NS",
    price: 499,
    availability: "In Stock",
    rating: 4.9,
  },
  {
    id: "5",
    product: "Apple magic mouse",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-5.png",
    fallback: "AMM",
    price: 970,
    availability: "Limited",
    rating: 4.1,
  },
  {
    id: "6",
    product: "Apple watch",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-6.png",
    fallback: "AW",
    price: 1500,
    availability: "Limited",
    rating: 3.1,
  },
  {
    id: "7",
    product: "Casio G-Shock",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-8.png",
    fallback: "CGS",
    price: 194,
    availability: "Out of Stock",
    rating: 1.5,
  },
  {
    id: "8",
    product: "RayBan Sunglasses",
    productImage:
      "https://cdn.shadcnstudio.com/ss-assets/products/product-10.png",
    fallback: "RBS",
    price: 199,
    availability: "Out of Stock",
    rating: 2.4,
  },
];

const DataTableWithColumnFilterDemo = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "price",
      desc: false,
    },
  ]);

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <div className="flex flex-wrap gap-3 px-2 py-6">
          <div className="w-44">
            <Filter column={table.getColumn("product")!} />
          </div>
          <div className="w-36">
            <Filter column={table.getColumn("price")!} />
          </div>
          <div className="w-44">
            <Filter column={table.getColumn("availability")!} />
          </div>
          <div className="w-36">
            <Filter column={table.getColumn("rating")!} />
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-muted/50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="relative h-10 select-none border-t"
                      key={header.id}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-center text-muted-foreground text-sm">
        Data table with column filter
      </p>
    </div>
  );
};

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnHeader =
    typeof column.columnDef.header === "string" ? column.columnDef.header : "";

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === "range") {
      return [];
    }

    const values = Array.from(column.getFacetedUniqueValues().keys());

    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr];
      }

      return [...acc, curr];
    }, []);

    return Array.from(new Set(flattenedValues)).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterVariant, column.getFacetedUniqueValues]);

  if (filterVariant === "range") {
    return (
      <div className="*:not-first:mt-2">
        <Label>{columnHeader}</Label>
        <div className="flex">
          <Input
            aria-label={`${columnHeader} min`}
            className="flex-1 rounded-e-none [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            id={`${id}-range-1`}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                e.target.value ? Number(e.target.value) : undefined,
                old?.[1],
              ])
            }
            placeholder="Min"
            type="number"
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
          />
          <Input
            aria-label={`${columnHeader} max`}
            className="-ms-px flex-1 rounded-s-none [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            id={`${id}-range-2`}
            onChange={(e) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                e.target.value ? Number(e.target.value) : undefined,
              ])
            }
            placeholder="Max"
            type="number"
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
          />
        </div>
      </div>
    );
  }

  if (filterVariant === "select") {
    return (
      <div className="*:not-first:mt-2">
        <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
        <Select
          onValueChange={(value) => {
            column.setFilterValue(value === "all" ? undefined : value);
          }}
          value={columnFilterValue?.toString() ?? "all"}
        >
          <SelectTrigger className="w-full" id={`${id}-select`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {sortedUniqueValues.map((value) => (
              <SelectItem key={String(value)} value={String(value)}>
                {String(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
      <div className="relative">
        <Input
          className="peer ps-9"
          id={`${id}-input`}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
          type="text"
          value={(columnFilterValue ?? "") as string}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
}

export default DataTableWithColumnFilterDemo;
