import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, startIcon, ...props }, ref) => {
    const baseStyles = "flex h-9 w-full rounded-md border border-border-color bg-card-bg px-3 py-1 text-sm font-normal tracking-[-0.01em] text-primary-text antialiased file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 placeholder:font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-body-bg disabled:text-secondary-text transition-shadow";

    if (startIcon) {
      return (
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
            {startIcon}
          </div>
          <input
            type={type}
            className={cn(baseStyles, "pl-9", className)}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(baseStyles, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
