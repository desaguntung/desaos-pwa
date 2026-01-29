"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Search, 
  Calendar, 
  Eye, 
  Filter, 
  X,
  ChevronDown,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  cover_image: string | null;
  category: string | null;
  published_at: string;
  views?: number;
  author?: {
    full_name: string;
  };
}

interface AllNewsClientProps {
  initialArticles: Article[];
}

type SortOption = "newest" | "oldest" | "popular";

export default function AllNewsClient({ initialArticles }: AllNewsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(initialArticles.map(a => a.category).filter(Boolean))) as string[];
  }, [initialArticles]);

  // Filter and Sort articles
  const filteredArticles = useMemo(() => {
    let result = [...initialArticles];

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.excerpt?.toLowerCase().includes(query)
      );
    }

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(article => article.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      } else if (sortOption === "oldest") {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      } else if (sortOption === "popular") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

    return result;
  }, [initialArticles, searchQuery, selectedCategory, sortOption]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSortOption("newest");
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (sortOption !== "newest" ? 1 : 0);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header & Controls Section */}
      <div className="bg-white/80 border-b border-zinc-200 backdrop-blur-xl sticky top-0 z-30 supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-4 md:py-6 gap-4">
            
            {/* Top Row: Title & Mobile Filter Toggle */}
            <div className="flex items-center justify-end">
              {/* Mobile Filter Trigger */}
              <div className="flex items-center gap-2 md:hidden">
                 <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative gap-2 rounded-full border-zinc-200 bg-white hover:bg-zinc-50">
                      <Filter className="h-4 w-4" />
                      Filter
                      {activeFiltersCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-[20px] p-0 h-[85vh] sm:max-w-md mx-auto">
                     <div className="p-6 h-full flex flex-col">
                        <SheetHeader className="mb-6 text-left">
                          <SheetTitle className="text-xl">Filter & Urutkan</SheetTitle>
                          <SheetDescription>
                            Sesuaikan tampilan berita sesuai kebutuhan Anda.
                          </SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                          {/* Mobile Sort */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-zinc-900">Urutkan Berdasarkan</h3>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: "newest", label: "Terbaru", icon: SortDesc },
                                { id: "oldest", label: "Terlama", icon: SortAsc },
                                { id: "popular", label: "Terpopuler", icon: TrendingUp },
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => setSortOption(opt.id as SortOption)}
                                  className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border",
                                    sortOption === opt.id
                                      ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                                      : "border-zinc-100 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    <opt.icon className="h-4 w-4" />
                                    {opt.label}
                                  </span>
                                  {sortOption === opt.id && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Mobile Categories */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-zinc-900">Kategori</h3>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                  "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                                  selectedCategory === null
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                )}
                              >
                                Semua
                              </button>
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                  className={cn(
                                    "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                                    selectedCategory === cat
                                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                  )}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <SheetFooter className="mt-auto pt-6 border-t border-zinc-100">
                          <div className="flex gap-3 w-full">
                            <Button 
                              variant="outline" 
                              className="flex-1 rounded-full border-zinc-200"
                              onClick={clearFilters}
                            >
                              Reset
                            </Button>
                            <SheetClose asChild>
                              <Button className="flex-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white">
                                Terapkan
                              </Button>
                            </SheetClose>
                          </div>
                        </SheetFooter>
                     </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Bottom Row: Search & Desktop Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul, topik, atau kata kunci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-zinc-100/50 py-2.5 pl-10 pr-4 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-500 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                />
              </div>

              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-3">
                 {/* Category Scroll/Dropdown could go here, but let's keep it simple inline for now or use horizontal scroll */}
                 <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-md pb-1 md:pb-0">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                          "whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                          selectedCategory === null
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "bg-white text-zinc-600 hover:bg-zinc-100 ring-1 ring-zinc-200"
                        )}
                      >
                        Semua
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                          selectedCategory === category
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-zinc-600 hover:bg-zinc-100 ring-1 ring-zinc-200"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                 </div>

                 <div className="h-6 w-px bg-zinc-200 mx-1" />

                 {/* Sort Dropdown (Simple implementation) */}
                 <div className="relative group">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="appearance-none bg-white pl-3 pr-8 py-2 rounded-lg text-xs font-medium ring-1 ring-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-zinc-50 transition-colors text-zinc-700"
                    >
                      <option value="newest">Terbaru</option>
                      <option value="oldest">Terlama</option>
                      <option value="popular">Terpopuler</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                 </div>
              </div>
            </div>
            
            {/* Active Filters Summary (Mobile only mainly, or if filtered) */}
            {(searchQuery || selectedCategory || sortOption !== 'newest') && (
               <div className="flex items-center gap-2 pt-1 md:hidden">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Aktif:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory(null)} className="ml-0.5 hover:text-blue-900"><X className="h-3 w-3" /></button>
                      </span>
                    )}
                    {sortOption !== 'newest' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 ring-1 ring-inset ring-zinc-500/20">
                        {sortOption === 'oldest' ? 'Terlama' : 'Terpopuler'}
                         <button onClick={() => setSortOption('newest')} className="ml-0.5 hover:text-zinc-900"><X className="h-3 w-3" /></button>
                      </span>
                    )}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="popLayout">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {filteredArticles.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200"
            >
              <div className="rounded-full bg-zinc-50 p-4 mb-4 ring-1 ring-zinc-100">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">Tidak ada berita ditemukan</h3>
              <p className="text-zinc-500 mt-1 max-w-xs mx-auto">
                Coba sesuaikan kata kunci pencarian atau ubah filter kategori Anda.
              </p>
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="mt-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Hapus semua filter
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NewsCard({ article, index }: { article: Article; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className="group flex flex-col h-full"
    >
      <Link href={`/berita/${article.slug}`} className="block h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-sm ring-1 ring-zinc-900/5 transition-all duration-300 group-hover:shadow-xl group-hover:ring-zinc-900/10 group-hover:-translate-y-1">
          <img
            src={article.cover_image || "https://placehold.co/600x400?text=No+Image"}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          {article.category && (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-900 shadow-sm backdrop-blur-md">
                {article.category}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-1 flex-col px-1">
          {/* Meta Info */}
          <div className="flex items-center gap-x-3 text-[11px] font-medium text-zinc-500 mb-3 uppercase tracking-wider">
            <time dateTime={article.published_at} className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(article.published_at))}
            </time>
            <div className="h-0.5 w-0.5 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1">
               <Eye className="h-3 w-3" />
               <span>{article.views || 0}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 flex-1">
            {article.excerpt}
          </p>

          <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600">
            <span>Baca selengkapnya</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
