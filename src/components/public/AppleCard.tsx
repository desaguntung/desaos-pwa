import { cn } from "@/lib/utils";
import React from "react";

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function AppleCard({ 
  children, 
  className, 
  noPadding = false,
  ...props 
}: AppleCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md",
        !noPadding && "p-6 md:p-8",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
