"use client";

import { useState, useEffect, useRef } from "react";
import MagazineGrid from "../MagazineGrid";
import SearchBar from "./SearchBar";
import MinimalCategoryFilter from "../MinimalCategoryFilter";
import SkeletonLoader from "./SkeletonLoader";
import { getArticles } from "@/app/actions/articles";
import { NewsItem } from "./NewsCard";
import { Loader2 } from "lucide-react";

interface NewsPageClientProps {
  initialArticles: NewsItem[];
  initialCount: number;
  categories: string[];
}

export default function NewsPageClient({ initialArticles, initialCount, categories }: NewsPageClientProps) {
  const [articles, setArticles] = useState<NewsItem[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [hasMore, setHasMore] = useState((initialArticles?.length || 0) < initialCount);
  
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const fetchFiltered = async () => {
      setLoading(true);
      setPage(1);
      const { data, count } = await getArticles(1, search, category);
      if (data) {
        setArticles(data as NewsItem[]);
        setHasMore((data?.length || 0) < (count || 0));
      }
      setLoading(false);
    };

    fetchFiltered();
  }, [search, category]);

  const handleSearch = (query: string) => {
    if (query !== search) {
      setSearch(query);
    }
  };

  const handleCategorySelect = (cat: string) => {
    if (cat !== category) {
      setCategory(cat);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, count } = await getArticles(nextPage, search, category);
    if (data) {
      setArticles((prev) => [...prev, ...data as NewsItem[]]);
      setPage(nextPage);
      setHasMore(articles.length + data.length < (count || 0));
    }
    setLoadingMore(false);
  };

  return (
    <div className="bg-body-bg dark:bg-zinc-950 min-h-screen">
      <MinimalCategoryFilter
        categories={categories}
        activeCategory={category}
        onSelectCategory={handleCategorySelect}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex justify-end">
            <SearchBar onSearch={handleSearch} initialValue={search} />
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <MagazineGrid articles={articles} />
            
            {hasMore && (
              <div className="flex justify-center mt-20">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="group flex items-center px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-bold tracking-wide transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loadingMore ? "MEMUAT..." : "MUAT LEBIH BANYAK"}
                </button>
              </div>
            )}
            
            {!loading && articles.length === 0 && (
                <div className="text-center py-24">
                    <p className="text-secondary-text">Tidak ada berita ditemukan.</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
