"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MinimalCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MinimalCategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
}: MinimalCategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30">
      <div 
        ref={scrollContainerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide py-4"
      >
        <div className="flex items-center gap-8 min-w-max">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={cn(
                  "group relative text-sm font-medium transition-colors duration-300",
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                {category}
                <span 
                  className={cn(
                    "absolute -bottom-4 left-0 w-full h-0.5 bg-black dark:bg-white transition-all duration-300",
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-50"
                  )} 
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
