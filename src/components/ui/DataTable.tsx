 "use client";
 import React from "react";
import { User, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface MobileConfig<T> {
  titleKey: keyof T | ((row: T) => React.ReactNode);
  subtitleKey?: keyof T | ((row: T) => React.ReactNode);
  imageKey?: keyof T; // If provided, assumes URL string
  statusKey?: keyof T | ((row: T) => React.ReactNode);
  action?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  mobileConfig?: MobileConfig<T>;
  onRowClick?: (row: T) => void;
  keyField?: keyof T; // Unique ID field, defaults to 'id'
  loading?: boolean;
  maxHeight?: string;
  emptyMessage?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  mobileConfig,
  onRowClick,
  keyField = "id",
  loading = false,
  maxHeight = "calc(100vh - 420px)", // Default height adjusted to ensure pagination is visible and not touching
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  
  // Helper to get value from accessor
  const getValue = (row: T, accessor: keyof T | string) => {
    return row[accessor as string];
  };

  return (
    <div className="w-full">
      {/* Desktop View (md and up) */}
      <div className="hidden md:block bg-card-bg rounded-xl border border-border-color overflow-hidden">
        <div 
          className="overflow-auto custom-scrollbar"
          style={{ maxHeight }}
        >
          <table className={`w-full text-left relative ${data.length === 0 ? "is-empty" : ""}`}>
            <thead className="border-b border-border-color h-12 sticky top-0 z-10">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-6 h-12 align-middle font-semibold text-xs text-secondary-text uppercase tracking-wider bg-[var(--table-header-bg)] backdrop-blur-sm ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="loading-row">
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-6 py-4">
                        <Skeleton className="h-6 w-full rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr className="empty-row">
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-secondary-text"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={(row[keyField as string] as string) || rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`group transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 text-sm text-primary-text whitespace-nowrap ${col.className || ""}`}
                      >
                        {col.cell
                          ? col.cell(row)
                          : (getValue(row, col.accessorKey) as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (below md) */}
      <div className="md:hidden space-y-0 divide-y divide-border-color border-t border-b border-border-color bg-card-bg">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="px-4 py-8 text-center text-secondary-text text-sm">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, rowIdx) => {
            // Default fallback if no mobileConfig provided
            // Use first column as title, second as subtitle
            const title = mobileConfig
              ? typeof mobileConfig.titleKey === "function"
                ? mobileConfig.titleKey(row)
                : row[mobileConfig.titleKey as string]
              : row[columns[0]?.accessorKey as string];

            const subtitle = mobileConfig
              ? mobileConfig.subtitleKey
                ? typeof mobileConfig.subtitleKey === "function"
                  ? mobileConfig.subtitleKey(row)
                  : row[mobileConfig.subtitleKey as string]
                : null
              : row[columns[1]?.accessorKey as string];

            const status = mobileConfig?.statusKey
              ? typeof mobileConfig.statusKey === "function"
                ? mobileConfig.statusKey(row)
                : row[mobileConfig.statusKey as string]
              : null;

            const image = mobileConfig?.imageKey ? row[mobileConfig.imageKey as string] : null;

            return (
              <div
                key={(row[keyField as string] as string) || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`flex items-center gap-3 p-4 bg-card-bg active:bg-[var(--hover-bg)] ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {/* Avatar / Icon Left */}
                <div className="flex-shrink-0">
                  {image ? (
                    <img
                      src={image as string}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-border-color"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--hover-bg)] flex items-center justify-center border border-border-color text-secondary-text">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Center Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-text truncate">
                    {title as React.ReactNode}
                  </p>
                  {subtitle && (
                    <p className="text-xs text-secondary-text truncate mt-0.5">
                      {subtitle as React.ReactNode}
                    </p>
                  )}
                </div>

                {/* Right Status / Action */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {status && (
                     <div className="text-xs">{status as React.ReactNode}</div>
                  )}
                  {mobileConfig?.action ? (
                    mobileConfig.action(row)
                  ) : (
                    <Button variant="ghost" size="icon" className="text-secondary-text hover:text-primary-text">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
