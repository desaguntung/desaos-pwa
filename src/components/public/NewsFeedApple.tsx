"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import NewsCard, { NewsItem } from "@/components/public/NewsCard";
import FeaturedNewsCard from "@/components/public/FeaturedNewsCard";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface NewsFeedProps {
  initialItems: NewsItem[];
  categories: string[];
}

export default function NewsFeedApple({ initialItems, categories }: NewsFeedProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Detect sticky state for additional styling
  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80); // Adjust based on navbar height + offset
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredItems = initialItems.filter((item) => {
    const matchesCategory = activeCategory === "Semua" || item.tag === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured logic: Only show featured if "Semua" is selected and no search query
  const showFeatured = activeCategory === "Semua" && !searchQuery;
  const featuredItem = showFeatured ? filteredItems[0] : null;
  const gridItems = showFeatured ? filteredItems.slice(1) : filteredItems;

  return (
    <div className="w-full relative">
      {/* Sticky Filter Bar */}
      <div 
        ref={filterRef}
        className="sticky top-[60px] z-40 -mx-4 md:-mx-8 lg:-mx-12 mb-12"
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300" />
        
        <div className="relative container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
            {/* Categories - Horizontal Scroll on Mobile */}
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-1 md:gap-2">
                {categories.map((category) => (
                    <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                        "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                        activeCategory === category
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
                    )}
                    >
                    {category}
                    </button>
                ))}
                </div>
            </div>

            {/* Search - Expandable or compact */}
            <div className="w-full md:w-auto relative group">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search Newsroom"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-[240px] rounded-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-300 dark:focus:border-zinc-700 py-1.5 pl-9 pr-8 text-sm outline-none transition-all placeholder:text-zinc-400"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
            <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-16"
            >
            {/* Featured Section (Hero) */}
            {featuredItem && (
                <section className="relative">
                     {/* Section Label */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 flex items-center justify-between"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Top Stories
                        </h2>
                        <span className="text-sm font-medium text-zinc-500">
                             {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </motion.div>

                    <FeaturedNewsCard item={featuredItem} priority />
                </section>
            )}

            {/* Grid Section (Bento-ish) */}
            {gridItems.length > 0 ? (
                <section>
                    {featuredItem && (
                         <div className="mb-8 flex items-center gap-4">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                Latest News
                            </h2>
                            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                    )}
                
                {/* Masonry / Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {gridItems.map((item, index) => (
                    <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                        <NewsCard 
                            item={item} 
                            layout="stack" 
                            className="h-full"
                        />
                    </motion.div>
                    ))}
                </div>
                </section>
            ) : (
                !featuredItem && (
                <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                        No stories found
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        We couldn't find any articles matching "{searchQuery}" in {activeCategory}.
                    </p>
                    <button 
                        onClick={() => {setSearchQuery(""); setActiveCategory("Semua");}}
                        className="mt-6 text-blue-600 hover:underline font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
                )
            )}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
