import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  sticky?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50, 100],
  sticky = false,
}) => {
  // Generate page numbers to display (max 5)
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    startPage = Math.max(1, startPage);
    endPage = Math.min(totalPages, endPage);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 0 && !totalItems) return null;

  const content = (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full",
      sticky && "px-4 md:px-6",
      className
    )}>
      {/* Info and Page Size Selector */}
      {(totalItems !== undefined && itemsPerPage !== undefined) && (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
           <span className="whitespace-nowrap pagination-summary">
             Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
           </span>
           {onItemsPerPageChange && (
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    onItemsPerPageChange(Number(e.target.value));
                    onPageChange(1); // Reset to first page on size change
                  }}
                  className="h-8 text-xs border border-border-color rounded px-2 bg-card-bg focus:outline-none focus:ring-1 focus:ring-primary-text text-primary-text cursor-pointer"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size} baris</option>
                  ))}
                </select>
              </div>
           )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={cn("flex items-center space-x-2", (totalItems === undefined) ? "w-full justify-center" : "")}>
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 hidden sm:flex"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "primary" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className={cn("h-8 w-8 p-0", currentPage === page ? "pointer-events-none" : "")}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 hidden sm:flex"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  if (sticky) {
    return (
      <div className="sticky bottom-8 z-20 rounded-xl border border-border-color bg-card-bg">
        {content}
      </div>
    );
  }

  return content;
};
