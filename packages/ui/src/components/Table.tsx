import React from "react";
import { cn } from "../lib/utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const paddingClasses = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

export function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "No data available",
  onRowClick,
  striped = false,
  hoverable = true,
  size = "md",
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-background-elevated">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "font-semibold text-foreground",
                  sizeClasses[size],
                  paddingClasses[size],
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  "text-left"
                )}
                style={column.width ? { width: column.width } : undefined}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  "px-4 py-8 text-center text-foreground-muted",
                  sizeClasses[size]
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-border transition-colors",
                  striped && index % 2 === 0 && "bg-background-elevated",
                  hoverable &&
                    onRowClick &&
                    "cursor-pointer hover:bg-background-hover",
                  onRowClick && "focus-within:bg-background-hover"
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                aria-label={onRowClick ? `Row ${index + 1}` : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "text-foreground",
                      sizeClasses[size],
                      paddingClasses[size],
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      "text-left"
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : item[column.key]?.toString() || "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
