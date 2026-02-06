"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface NavSection {
  id: string;
  title: string;
  icon?: React.ElementType;
}

interface FormSidebarNavProps {
  sections: NavSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
  title?: string;
  className?: string;
}

export function FormSidebarNav({
  sections,
  activeSection,
  onSectionClick,
  title = "Navigasi Form",
  className,
}: FormSidebarNavProps) {
  return (
    <nav className={cn("space-y-1", className)}>
      {title && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-secondary-text uppercase tracking-wider">
          {title}
        </h3>
      )}
      
      <div className="space-y-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;
          
          return (
            <button
              key={section.id}
              onClick={(e) => {
                e.preventDefault();
                onSectionClick(section.id);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                isActive
                  ? "bg-card-bg text-primary-text border border-border-color"
                  : "text-secondary-text hover:text-primary-text hover:bg-hover-bg transparent border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon 
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-accent" : "text-secondary-text group-hover:text-primary-text"
                    )} 
                  />
                )}
                <span>{section.title}</span>
              </div>
              
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-accent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
