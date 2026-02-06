"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Calendar, 
  Search, 
  X, 
  Flame, 
  TrendingUp, 
  Clock, 
  Hash,
  Eye,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { NewsItem } from "@/components/public/NewsCard";
import MobileArticleDetail from "./MobileArticleDetail";

interface MobileNewsViewProps {
  newsItems: NewsItem[];
  categories: string[];
}

type TabType = 'terbaru' | 'trending' | 'populer';

export default function MobileNewsView({ newsItems, categories }: MobileNewsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('terbaru');
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  // Focus input when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Prevent body scroll when search is active
  useEffect(() => {
    if (isSearchActive) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isSearchActive]);

  // Reset scroll on tab or category change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab, selectedCategory]);

  // Handle scroll for sticky states and category visibility
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Sticky header state
    setIsHeaderSticky(latest > 50);
    
    // Safety: Always show if near top or content is short
    if (latest < 50 || maxScroll < 300) {
      setShowCategories(true);
    } else {
      // Show/Hide logic based on direction
      if (latest > previous && latest > 100) {
         setShowCategories(false);
      } else if (latest < previous) {
         setShowCategories(true);
      }
    }
    
    lastScrollY.current = latest;
  });

  // Handle back button to close modal
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (selectedSlug) {
        setSelectedSlug(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedSlug]);

  const handleNewsClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const slug = href.split("/berita/")[1]?.split("?")[0];
    if (slug) {
      setSelectedSlug(slug);
      window.history.pushState({ modal: true }, "", href);
    }
  };

  const handleCloseDetail = () => {
    setSelectedSlug(null);
    window.history.back(); 
  };

  // Filter items logic
  const filteredItems = newsItems.filter(item => {
    const matchesCategory = selectedCategory === "Semua" || item.tag === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Derived Data for Tabs (Simulated)
  const trendingItems = [...newsItems].sort(() => 0.5 - Math.random()).slice(0, 5); // Random 5 items
  const popularItems = [...newsItems].slice(0, 10); // Top 10 items

  // Search Component removed from here and inlined to avoid recreation bugs

  return (
    <div className="min-h-screen bg-body-bg pb-24 relative font-sans">
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header Section */}
      <div className="bg-body-bg/80 backdrop-blur-md pt-6 pb-2 px-4 sticky top-0 z-40 border-b border-border-color shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="relative flex items-center mb-4 h-14">
          {/* Title Area */}
          <motion.div 
            animate={{ 
              opacity: isSearchActive ? 0 : 1,
              x: isSearchActive ? -20 : 0,
              pointerEvents: isSearchActive ? 'none' : 'auto' 
            }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <h1 className="text-2xl font-black text-primary-text tracking-tight">
              Berita<span className="text-blue-600">Desa</span>.
            </h1>
            <p className="text-xs text-secondary-text font-medium">Informasi Terkini & Terpercaya</p>
          </motion.div>

          {/* Search Trigger Button */}
          <motion.button 
            animate={{ 
              opacity: isSearchActive ? 0 : 1,
              scale: isSearchActive ? 0.8 : 1,
              pointerEvents: isSearchActive ? 'none' : 'auto' 
            }}
            transition={{ duration: 0.2 }}
            className="p-2 bg-card-bg rounded-full border border-border-color relative shrink-0 ml-4"
            onClick={() => setIsSearchActive(true)}
          >
             <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
             <Search className="w-5 h-5 text-secondary-text" />
          </motion.button>

          {/* Expanded Search Bar */}
          <AnimatePresence>
            {isSearchActive && (
              <motion.div 
                initial={{ opacity: 0, width: "40px", x: 20 }}
                animate={{ opacity: 1, width: "100%", x: 0 }}
                exit={{ opacity: 0, width: "40px", x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 bottom-0 flex items-center z-50 bg-card-bg"
              >
                <div className={cn(
                  "flex items-center w-full bg-body-bg rounded-xl px-3 py-2.5 transition-all duration-300",
                  isSearchActive ? "ring-2 ring-blue-500 bg-card-bg" : ""
                )}>
                  <Search className="w-5 h-5 text-secondary-text mr-2 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari berita..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchActive(false)}
                    className="bg-transparent border-none outline-none text-[16px] w-full text-primary-text placeholder:text-secondary-text"
                    autoFocus
                  />
                  <button 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      // Logic: If text exists, clear it. If empty, close search.
                      if (searchQuery) {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      } else {
                        setIsSearchActive(false);
                      }
                    }}
                    className="p-1 rounded-full bg-border-color text-secondary-text ml-2 hover:bg-zinc-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-body-bg/50 p-1 rounded-xl mb-3 relative">
          {(['terbaru', 'trending', 'populer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative z-10",
                activeTab === tab 
                  ? "bg-card-bg text-blue-600 shadow-sm" 
                  : "text-secondary-text hover:text-primary-text"
              )}
            >
              {tab === 'terbaru' && <Clock className="w-3.5 h-3.5" />}
              {tab === 'trending' && <Flame className="w-3.5 h-3.5" />}
              {tab === 'populer' && <TrendingUp className="w-3.5 h-3.5" />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Smart Sticky Category Filter */}
        <AnimatePresence initial={false}>
          {activeTab === 'terbaru' && showCategories && (
            <motion.div
              key="category-filter"
              initial={{ height: "auto", opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
               <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
                 {categories.map((cat) => (
                   <button
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={cn(
                       "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0",
                       selectedCategory === cat
                         ? "bg-primary-text text-white border-primary-text"
                         : "bg-card-bg text-secondary-text border-border-color"
                     )}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-4 min-h-[60vh]">
        <AnimatePresence mode="wait">
          
          {/* TAB: TERBARU */}
          {activeTab === 'terbaru' && (
            <motion.div
              key="terbaru"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Featured News (Top 1) */}
              {!searchQuery && selectedCategory === 'Semua' && filteredItems.length > 0 && (
                <div className="mb-6">
                   <Link 
                      href={filteredItems[0].href}
                      onClick={(e) => handleNewsClick(e, filteredItems[0].href)}
                      className="group block relative rounded-2xl overflow-hidden aspect-[16/10]"
                   >
                      <Image
                        src={filteredItems[0].imageSrc}
                        alt={filteredItems[0].title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <span className="inline-block px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md mb-2">
                          {filteredItems[0].tag || "Headline"}
                        </span>
                        <h2 className="text-white text-lg font-bold leading-snug line-clamp-2 mb-1">
                          {filteredItems[0].title}
                        </h2>
                        <p className="text-slate-300 text-xs line-clamp-1">
                          {filteredItems[0].excerpt}
                        </p>
                      </div>
                   </Link>
                </div>
              )}

              {/* Efficient List View */}
              <div className="space-y-4">
                {(searchQuery || selectedCategory !== 'Semua' ? filteredItems : filteredItems.slice(1)).map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={(e) => handleNewsClick(e, item.href)}
                    className="flex gap-4 group bg-white active:bg-slate-50 transition-colors p-1 rounded-xl"
                  >
                    {/* Thumbnail - Fixed Size */}
                    <div className="relative w-[100px] h-[75px] shrink-0 rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                            {item.tag || "Berita"}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-400">
                            {item.date ? new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru saja"}
                          </span>
                        </div>
                        <h3 className="text-slate-800 text-sm font-bold leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      
                      {/* Action / Meta */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> 1.2k
                        </span>
                        <MoreHorizontal className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: TRENDING */}
          {activeTab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Hot Stories Carousel */}
              <div>
                <div className="flex items-center gap-2 mb-4 px-1">
                   <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                     <Flame className="w-4 h-4" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800">Sedang Hangat</h3>
                </div>
                
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
                   {trendingItems.map((item, idx) => (
                     <Link 
                        key={idx}
                        href={item.href}
                        onClick={(e) => handleNewsClick(e, item.href)}
                        className="snap-start shrink-0 w-[280px]"
                     >
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-lg">
                           <Image
                             src={item.imageSrc}
                             alt={item.title}
                             fill
                             className="object-cover"
                           />
                           <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> Trending
                           </div>
                        </div>
                        <h4 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.excerpt}
                        </p>
                     </Link>
                   ))}
                </div>
              </div>

              {/* Just For You List */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Rekomendasi Untukmu</h3>
                <div className="grid grid-cols-1 gap-4">
                  {newsItems.slice(2, 6).map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={(e) => handleNewsClick(e, item.href)}
                      className="flex items-start gap-4 p-3 rounded-2xl bg-white shadow-sm border border-slate-100"
                    >
                       <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <Image src={item.imageSrc} alt={item.title} fill className="object-cover" />
                       </div>
                       <div>
                          <span className="text-[10px] text-blue-600 font-bold mb-1 block">{item.tag || "Pilihan"}</span>
                          <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-2">
                            {item.title}
                          </h4>
                       </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: POPULER */}
          {activeTab === 'populer' && (
            <motion.div
              key="populer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6 px-1">
                 <h3 className="text-lg font-bold text-slate-800">Paling Banyak Dibaca</h3>
                 <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Minggu Ini</span>
              </div>

              <div className="space-y-2">
                {popularItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={(e) => handleNewsClick(e, item.href)}
                    className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 group"
                  >
                    <div className={cn(
                      "text-3xl font-black italic w-8 text-center shrink-0",
                      idx < 3 ? "text-blue-600" : "text-slate-300"
                    )}>
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                         {item.title}
                       </h4>
                       <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {100 - idx * 5}rb x
                          </span>
                          <span>•</span>
                          <span>{item.tag || "Umum"}</span>
                       </div>
                    </div>

                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                       <Image src={item.imageSrc} alt={item.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedSlug && (
          <MobileArticleDetail 
            slug={selectedSlug} 
            onClose={handleCloseDetail} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
