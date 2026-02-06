"use client";

import { useState } from "react";
import { NewsItem } from "@/components/public/NewsCard";
import PortalHero from "./PortalHero";
import PortalTicker from "./PortalTicker";
import PortalNewsCard from "./PortalNewsCard";
import PortalSectionHeader from "./PortalSectionHeader";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import SmartCategoryFilter from "@/components/public/berita/SmartCategoryFilter";

interface NewsPortalClientProps {
  initialItems: NewsItem[];
  categories: string[];
}

export default function NewsPortalClient({ initialItems, categories }: NewsPortalClientProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredItems = initialItems.filter((item) => {
    const matchesCategory = activeCategory === "Semua" || item.tag === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Derived Data
  const heroItems = filteredItems.slice(0, 3);
  const latestItems = filteredItems.slice(3);
  
  // Popular Items (Sort by views descending)
  const popularItems = [...initialItems]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-card-bg dark:bg-zinc-950 font-sans text-primary-text dark:text-zinc-100 pb-20">
      
      {/* 1. Ticker Section */}
      <div className="sticky top-[48px] md:top-[44px] z-40">
        <PortalTicker items={initialItems.slice(0, 5)} />
      </div>

      {/* 2. Navigation / Filter Bar */}
      <div className="sticky top-[92px] md:top-[88px] z-30 w-full bg-card-bg/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-border-color/30 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 h-auto md:h-[60px] py-3 md:py-0">
            
            {/* Smart Categories */}
            <div className="w-full md:w-auto flex-1 overflow-hidden">
               <SmartCategoryFilter 
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
               />
            </div>

            {/* Search */}
             <div className="relative w-full md:w-64 shrink-0 hidden md:block">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-body-bg dark:bg-zinc-900 border-none py-1.5 pl-9 pr-4 text-[13px] font-medium focus:ring-1 focus:ring-[#0066cc] placeholder:text-secondary-text"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-secondary-text" />
            </div>

          </div>
        </div>
      </div>

      {/* 3. Hero Section */}
      {heroItems.length > 0 && (
          <PortalHero items={heroItems} />
      )}

      <div className="container mx-auto max-w-7xl px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 4. Left Column (Main Content) - 8 Cols */}
          <div className="lg:col-span-8">
            <PortalSectionHeader title={activeCategory === "Semua" ? "Latest News" : activeCategory} />
            
            <div className="flex flex-col gap-8">
                {latestItems.length > 0 ? (
                    latestItems.map((item) => (
                        <PortalNewsCard 
                            key={item.title} 
                            item={item} 
                            variant="horizontal" 
                            className="border-b border-border-color/30 dark:border-zinc-800 pb-8 last:border-0 last:pb-0"
                        />
                    ))
                ) : (
                    <div className="py-20 text-center text-secondary-text">
                        Tidak ada berita ditemukan.
                    </div>
                )}
            </div>
            
            {/* Pagination Placeholder */}
            {latestItems.length > 0 && (
                <div className="mt-12 flex justify-center">
                    <button className="rounded-full border border-border-color dark:border-zinc-700 px-8 py-2.5 text-[15px] font-medium hover:bg-body-bg dark:hover:bg-zinc-800 transition-colors">
                        Load More
                    </button>
                </div>
            )}
          </div>

          {/* 5. Right Column (Sidebar) - 4 Cols */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Terpopuler Widget */}
            <div className="rounded-2xl border border-border-color/50 dark:border-zinc-800 bg-card-bg dark:bg-zinc-900 p-6 shadow-sm">
                <PortalSectionHeader title="Trending" />
                <div className="flex flex-col gap-5">
                    {popularItems.map((item, idx) => (
                        <div key={item.title} className="flex gap-4 items-start group">
                             <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-body-bg dark:bg-zinc-800 text-primary-text dark:text-white font-semibold text-xs mt-1">
                                {idx + 1}
                             </span>
                             <PortalNewsCard 
                                item={item} 
                                variant="text-only" 
                                className="border-b border-border-color/30 py-2"
                             />
                        </div>
                    ))}
                </div>
            </div>

            {/* Newsletter / Subscribe (Optional) */}
             <div className="rounded-2xl bg-body-bg dark:bg-zinc-900 p-8 text-center">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-white tracking-tight">Subscribe</h3>
                <p className="text-sm text-secondary-text mb-4 leading-relaxed">Dapatkan berita terkini langsung di inbox Anda.</p>
                <input type="email" placeholder="Email address" className="w-full rounded-lg border-none bg-card-bg p-3 text-sm mb-3 shadow-sm" />
                <button className="w-full rounded-lg bg-[#0066cc] text-white py-2.5 text-sm font-semibold hover:bg-[#0055aa] transition-colors">
                    Langganan
                </button>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
