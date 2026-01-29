"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowRight, Eye } from "lucide-react";

export interface NewsItem {
  title: string;
  excerpt: string;
  href: string;
  imageSrc: string;
  tag?: string;
  date?: string;
  views?: number;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={item.href} className="group block h-full w-full">
      <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-zinc-900 shadow-lg ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl aspect-[4/5] md:aspect-[3/4]">
        {/* Image Background */}
        <div className="absolute inset-0">
          <img
            src={item.imageSrc}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
        </div>

        {/* Badge */}
        {item.tag && (
          <span className="absolute right-5 top-5 z-20 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md ring-1 ring-white/20 transition-colors group-hover:bg-white/30">
            {item.tag}
          </span>
        )}

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-6 flex flex-col justify-end">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-white md:text-2xl mb-3 drop-shadow-md">
            {item.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-300 mb-6 opacity-90">
            {item.excerpt}
          </p>
          
          <div className="flex items-center gap-3 text-sm font-semibold text-white/90 group-hover:text-white">
            <span>Baca Selengkapnya</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-2 group-hover:bg-white group-hover:text-black">
                <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ViewAllCard() {
  return (
    <Link href="/berita" className="group block h-full w-full">
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-6 text-center shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 aspect-[4/5] md:aspect-[3/4]">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-white opacity-50 dark:from-zinc-800 dark:to-zinc-900" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 shadow-inner dark:bg-zinc-800 group-hover:scale-110 transition-transform duration-500">
            <ArrowRight className="h-7 w-7 text-zinc-900 dark:text-zinc-100" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Lihat Semua Berita
          </span>
          <span className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
            Arsip Lengkap
          </span>
        </div>
      </div>
    </Link>
  );
}

interface NewsSectionProps {
  items?: NewsItem[];
}

export default function NewsSection({ items = [] }: NewsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white dark:bg-zinc-900">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="flex items-center justify-between py-8 md:py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-primary-text md:text-3xl">
            Artikel Terbaru
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto gap-4 pb-10 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.title} className="min-w-[85%] md:min-w-[calc(33.333%-11px)] snap-center shrink-0">
              <NewsCard item={item} />
            </div>
          ))}
          
          {/* View All Card - Always appears at the end */}
          <div className="min-w-[85%] md:min-w-[calc(33.333%-11px)] snap-center shrink-0">
            <ViewAllCard />
          </div>
        </div>
      </div>
    </section>
  );
}