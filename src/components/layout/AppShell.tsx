"use client";

import React, { useEffect } from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import { PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

function MobileSidebar() {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex md:hidden transition-all duration-300",
      isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
    )}>
      <div 
        className={cn(
          "fixed inset-0 bg-zinc-900/10 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={close} 
      />
      <div className={cn(
        "relative w-64 h-full bg-sidebar-bg shadow-xl flex flex-col transform transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-3 right-3 z-50">
          <button 
            onClick={close}
            className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col h-full border-r border-border-color bg-sidebar-bg flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-body-bg relative">
        {children}
      </main>
    </div>
  );
}

import { GeistProvider } from "@geist-ui/core";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GeistProvider>
      <SidebarProvider>
        <AppShellContent>{children}</AppShellContent>
      </SidebarProvider>
    </GeistProvider>
  );
}
