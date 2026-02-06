"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  backButtonHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  isSidebarSticky?: boolean;
}

export function FormLayout({
  title,
  subtitle,
  backButtonHref,
  actions,
  children,
  sidebar,
  isSidebarSticky = true,
}: FormLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-body-bg overflow-hidden">
      <PageHeader
        title={title}
        subtitle={subtitle}
        showBackButton={!!backButtonHref}
        backButtonHref={backButtonHref}
        actions={actions}
        className="z-30 flex-shrink-0"
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation - Fixed */}
        {sidebar && (
          <aside className="hidden lg:block w-72 flex-shrink-0 h-full overflow-y-auto border-r border-border-color bg-card-bg/30 p-6">
            <div className="space-y-6">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content Form - Scrollable */}
        <main 
          id="form-scroll-container" 
          className="flex-1 h-full overflow-y-auto w-full"
        >
          <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
