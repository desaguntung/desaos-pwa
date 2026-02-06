import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "h-4 w-4 rounded border-border-color text-primary-text focus:ring-primary-text cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-slate-900 dark:accent-slate-50",
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
