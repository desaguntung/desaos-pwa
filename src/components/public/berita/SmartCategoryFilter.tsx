"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SmartCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function SmartCategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
}: SmartCategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Initialize to check scroll state
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Use a small threshold (e.g., 5px) to avoid precision issues
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollWidth - clientWidth - scrollLeft > 5);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Check scroll again after animation
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative group w-full max-w-full">
      {/* Left Gradient Mask & Arrow */}
      <AnimatePresence>
        {showLeftArrow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-12 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 pl-2"
          >
            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm text-zinc-600 dark:text-zinc-300 hover:scale-105 transition-all active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Gradient Mask & Arrow */}
      <AnimatePresence>
        {showRightArrow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-12 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 pr-2"
          >
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm text-zinc-600 dark:text-zinc-300 hover:scale-105 transition-all active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-2 w-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => {
                onSelectCategory(category);
                // Optional: Scroll to center the clicked item
              }}
              className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 select-none flex-shrink-0",
                isActive
                  ? "text-white dark:text-zinc-900 shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
