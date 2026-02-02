"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface NewsItem {
  title: string;
  excerpt: string;
  href: string;
  imageSrc: string;
  tag?: string;
  date?: string;
  views?: number;
}

interface NewsCardProps {
  item: NewsItem;
  layout?: "overlay" | "stack"; // overlay = text over image, stack = image top, text bottom
  className?: string;
}

export default function NewsCard({ item, layout = "overlay", className }: NewsCardProps) {
  if (layout === "stack") {
    return (
      <Link href={item.href} className={cn("group block h-full w-full", className)}>
        <motion.div 
            whileHover={{ y: -5 }}
            className="flex h-full flex-col overflow-hidden rounded-[20px] bg-transparent transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          {/* Image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-zinc-100 dark:bg-zinc-800">
            <img
              src={item.imageSrc}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
            />
             {item.tag && (
                <div className="absolute top-4 left-4">
                     <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-zinc-900/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white backdrop-blur-md shadow-sm">
                        {item.tag}
                    </span>
                </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col py-6 pr-4">
             <div className="mb-3 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {item.date && (
                    <span className="flex items-center gap-1">
                         <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        })}
                    </span>
                )}
            </div>
            
            <h3 className="mb-3 text-xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h3>
            
            <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {item.excerpt}
            </p>
            
            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <span>Baca Artikel</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Overlay Layout (Default/Original Style but refined)
  return (
    <Link href={item.href} className={cn("group block h-full w-full", className)}>
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
