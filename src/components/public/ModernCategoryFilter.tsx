"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ModernCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function ModernCategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
}: ModernCategoryFilterProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = categories.indexOf(activeCategory);
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeCategory, categories]);

  return (
    <div className="relative flex justify-center w-full">
      <div className="relative inline-flex p-1 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
        {/* Sliding Indicator */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-white dark:bg-zinc-800 shadow-md z-10"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Tab Buttons */}
        {categories.map((category, index) => (
          <button
            key={category}
            ref={(el) => {
              if (el) tabsRef.current[index] = el;
            }}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "relative z-20 px-5 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap rounded-full focus:outline-none",
              activeCategory === category
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
