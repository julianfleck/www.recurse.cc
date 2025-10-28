import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<_TData extends RowData, _TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}
