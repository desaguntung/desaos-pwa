"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, ArrowLeft, ChevronRight, Home } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  className,
  showBackButton,
  backButtonHref
}: PageHeaderProps) {
  const { toggle } = useSidebar();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center gap-1 text-xs text-secondary-text mt-0.5">
        <Link href="/" className="hover:text-primary-text transition-colors flex items-center">
          <Home className="w-3 h-3" />
        </Link>
        {segments.map((segment, index) => {
          // Skip if segment is numeric (likely an ID)
          // if (!isNaN(Number(segment))) return null;
          
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const label = segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

          return (
            <React.Fragment key={href}>
              <ChevronRight className="w-3 h-3 text-secondary-text/50" />
              <Link 
                href={href}
                className={cn(
                  "hover:text-primary-text transition-colors",
                  isLast && "font-medium text-primary-text pointer-events-none"
                )}
              >
                {label}
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("flex-shrink-0 h-16 border-b border-border-color bg-card-bg px-4 md:px-6 flex items-center justify-between z-10 sticky top-0", className)}>
      <div className="flex items-center gap-3">
        <button 
          className="text-secondary-text md:hidden hover:bg-hover-bg p-1 rounded-md transition-colors" 
          onClick={toggle}
          aria-label="Toggle Menu"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          {showBackButton && backButtonHref && (
            <>
              <Link
                href={backButtonHref}
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-hover-bg text-secondary-text hover:text-primary-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="h-4 w-px bg-border-color hidden sm:block"></div>
            </>
          )}
          
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-primary-text line-clamp-1">
              {title}
            </h1>
            <div className="hidden md:block">
              {generateBreadcrumbs()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {actions}
      </div>
    </div>
  );
}
