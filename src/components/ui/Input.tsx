import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-9 w-full rounded-md border border-border-color bg-card-bg px-3 py-1 text-[14px] font-medium tracking-[-0.01em] text-primary-text ring-offset-sidebar-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text disabled:cursor-not-allowed disabled:opacity-50 transition-shadow dark:bg-zinc-900 dark:border-zinc-700 dark:text-white ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
