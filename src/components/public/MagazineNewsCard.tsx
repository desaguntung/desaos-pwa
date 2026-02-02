"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NewsItem } from "./berita/NewsCard";

interface MagazineNewsCardProps {
  article: NewsItem;
  index: number;
  featured?: boolean;
}

export default function MagazineNewsCard({ article, index, featured = false }: MagazineNewsCardProps) {
  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden cursor-pointer"
      >
        <Link href={`/berita/${article.slug}`}>
          <Image
            src={article.cover_image || "https://placehold.co/1200x800?text=No+Image"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-white uppercase bg-blue-600 rounded-full">
                {article.category}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {article.title}
              </h2>
              <p className="text-lg text-zinc-200 line-clamp-2 mb-6 max-w-2xl">
                {article.excerpt}
              </p>
              <div className="flex items-center text-zinc-400 text-sm gap-4">
                <time dateTime={article.published_at}>
                  {format(new Date(article.published_at), "d MMMM yyyy", { locale: id })}
                </time>
                <span>•</span>
                <span>{article.views_count || 0} kali dilihat</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-row md:flex-col gap-4 items-start md:items-stretch"
    >
      <Link href={`/berita/${article.slug}`} className="relative shrink-0 w-24 h-24 md:w-full md:h-auto md:aspect-[3/2] overflow-hidden rounded-lg md:rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={article.cover_image || "https://placehold.co/600x400?text=No+Image"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100px, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      <div className="flex flex-col gap-1 md:gap-2 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[10px] md:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {article.category}
          </span>
          <time className="text-[10px] md:text-xs text-zinc-500" dateTime={article.published_at}>
            {format(new Date(article.published_at), "d MMM yyyy", { locale: id })}
          </time>
        </div>

        <Link href={`/berita/${article.slug}`} className="group/title">
          <h3 className="text-sm md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover/title:text-blue-600 transition-colors line-clamp-2 md:line-clamp-none">
            {article.title}
          </h3>
        </Link>

        <p className="hidden md:block text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>

        <Link 
          href={`/berita/${article.slug}`}
          className="hidden md:inline-flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-2 hover:underline decoration-zinc-300 underline-offset-4"
        >
          Baca selengkapnya <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </motion.div>
  );
}
