"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NewsCard, { NewsItem } from "@/components/public/NewsCard";
import FeaturedNewsCard from "@/components/public/FeaturedNewsCard";
import ModernCategoryFilter from "@/components/public/ModernCategoryFilter";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface NewsFeedProps {
  initialItems: NewsItem[];
  categories: string[];
}

export default function NewsFeed({ initialItems, categories }: NewsFeedProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = initialItems.filter((item) => {
    const matchesCategory = activeCategory === "Semua" || item.tag === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured logic (only for "Semua" category without search)
  const showFeatured = activeCategory === "Semua" && !searchQuery;
  const featuredItem = showFeatured ? filteredItems[0] : null;
  const gridItems = showFeatured ? filteredItems.slice(1) : filteredItems;

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      {/* Search & Filter Section */}
      <div className="mb-12 flex flex-col items-center gap-8">
        {/* Search Bar - Clean & Simple */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-400 shadow-sm transition-all"
          />
        </div>

        {/* Categories - Modern Floating Filter */}
        <ModernCategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
          {/* Featured Section */}
          {featuredItem && (
            <section>
               <div className="mb-6 flex items-center gap-4">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Berita Utama
                  </h2>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
               </div>
              <FeaturedNewsCard item={featuredItem} priority />
            </section>
          )}

          {/* Grid Section */}
          {gridItems.length > 0 ? (
            <section>
               {featuredItem && (
                <div className="mb-6 mt-12 flex items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Terbaru
                    </h2>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>
               )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridItems.map((item, index) => (
                  <div key={item.href}>
                    <NewsCard item={item} layout="stack" />
                  </div>
                ))}
              </div>
            </section>
          ) : (
            !featuredItem && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
                    <Search className="h-10 w-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Tidak ditemukan</h3>
                <p className="mt-2 text-zinc-500">
                  Coba kata kunci lain atau ubah filter kategori.
                </p>
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
