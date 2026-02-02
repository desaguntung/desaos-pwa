"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NewsItem } from "@/components/public/NewsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PortalTickerProps {
  items: NewsItem[];
}

export default function PortalTicker({ items }: PortalTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-zinc-900 border-b border-[#d2d2d7]/30 dark:border-zinc-800">
      <div className="container mx-auto max-w-7xl flex items-center h-[44px] px-4 md:px-6 text-[13px]">
        <div className="flex items-center gap-2.5 pr-4 border-r border-[#d2d2d7] dark:border-zinc-700 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="font-semibold text-[#1d1d1f] dark:text-white uppercase tracking-tight">Terbaru</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative h-full">
             <div className="absolute inset-0 flex items-center">
                <Link 
                    href={currentItem.href}
                    className="truncate text-[#1d1d1f] dark:text-zinc-200 hover:text-[#06c] transition-colors px-4 block w-full font-medium"
                >
                    {currentItem.title}
                </Link>
             </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-[#86868b] pl-4 border-l border-[#d2d2d7] dark:border-zinc-700 shrink-0">
           <span className="font-medium">{currentIndex + 1} / {items.length}</span>
           <div className="flex gap-1">
               <button 
                onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
                className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors p-1"
               >
                   <ChevronLeft className="h-3.5 w-3.5" />
               </button>
               <button 
                onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors p-1"
               >
                   <ChevronRight className="h-3.5 w-3.5" />
               </button>
           </div>
        </div>
      </div>
    </div>
  );
}
