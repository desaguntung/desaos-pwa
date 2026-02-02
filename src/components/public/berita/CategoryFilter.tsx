"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2 mask-linear-fade">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none",
              isActive
                ? "text-white shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={cn("relative z-10", isActive && "text-white dark:text-zinc-900")}>
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
