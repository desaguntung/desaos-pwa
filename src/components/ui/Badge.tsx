import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline" | "secondary";
  size?: "sm" | "md" | "icon" | "icon-sm";
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", icon, children, ...props }, ref) => {
    const variants = {
      default: "bg-secondary-text/10 text-secondary-text border-border-color",
      success: "bg-success-bg text-success-text border-success-border",
      warning: "bg-warning-bg text-warning-text border-warning-border",
      error: "bg-error-bg text-error-text border-error-border",
      info: "bg-info-bg text-info-text border-info-border",
      outline: "bg-transparent text-primary-text border-border-color",
      secondary: "bg-body-bg text-secondary-text border-border-color",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-2.5 py-0.5 text-xs",
      icon: "w-6 h-6 p-0 flex items-center justify-center rounded-full",
      "icon-sm": "w-5 h-5 p-0 flex items-center justify-center rounded-full text-[10px]",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium border gap-1.5",
          size === "icon" || size === "icon-sm" ? "justify-center" : "rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
