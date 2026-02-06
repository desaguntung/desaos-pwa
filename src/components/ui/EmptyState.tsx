import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="text-secondary-text/50 mb-4 [&>svg]:w-12 [&>svg]:h-12">
            {icon}
          </div>
        )}
        <h3 className="text-secondary-text font-medium text-base">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-secondary-text mt-1">
            {description}
          </p>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
