import React from "react";
import { User, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";

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
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  mobileConfig,
  onRowClick,
  keyField = "id",
}: DataTableProps<T>) {
  
  // Helper to get value from accessor
  const getValue = (row: T, accessor: keyof T | string) => {
    return row[accessor as string];
  };

  return (
    <div className="w-full">
      {/* Desktop View (md and up) */}
      <div className="hidden md:block bg-card-bg rounded-lg border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-border-color h-10">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 h-10 align-middle font-medium text-xs text-secondary-text uppercase tracking-wider ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-secondary-text"
                  >
                    No data available.
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={(row[keyField as string] as string) || rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`bg-card-bg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-4 py-2 text-primary-text whitespace-nowrap ${col.className || ""}`}
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
        {data.length === 0 ? (
          <div className="px-4 py-8 text-center text-secondary-text text-sm">
            No data available.
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
                className={`flex items-center gap-3 p-4 bg-card-bg active:bg-zinc-50 dark:active:bg-zinc-800 ${
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
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border-color text-zinc-400 dark:text-zinc-500">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-primary-text">
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
