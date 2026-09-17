import React from "react";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "ghost-destructive" | "ghost-secondary";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95";
    
    const variants = {
      primary: "bg-primary-btn-bg text-primary-btn-text hover:opacity-90",
      secondary: "bg-card-bg text-primary-text border border-border-color hover:bg-hover-bg",
      outline: "border border-border-color bg-transparent hover:bg-hover-bg text-primary-text",
      ghost: "hover:bg-hover-bg text-primary-text",
      link: "text-primary-text underline-offset-4 hover:underline",
      destructive: "bg-error-bg text-error-text border border-error-border hover:opacity-90",
      "ghost-destructive": "text-secondary-text hover:text-error-text hover:bg-error-bg",
      "ghost-secondary": "text-secondary-text hover:text-primary-text hover:bg-hover-bg",
    };

    const sizes = {
      xs: "h-7 px-2 text-xs",
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 py-2 text-sm",
      lg: "h-10 px-8 text-sm",
      icon: "h-9 w-9 text-sm",
      "icon-sm": "h-8 w-8 text-sm",
    };

    return (
      <Comp
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
