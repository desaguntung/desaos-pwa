"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

export interface NewsItem {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  category: string;
  published_at: string;
  views_count?: number;
}

interface NewsCardProps {
  article: NewsItem;
  index?: number;
}

export default function NewsCard({ article, index = 0 }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <Link href={`/berita/${article.slug}`} className="block relative aspect-[4/3] overflow-hidden">
        <Image
          src={article.cover_image || "https://placehold.co/600x400?text=No+Image"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white bg-blue-600/90 backdrop-blur-md rounded-full shadow-sm">
          {article.category}
        </span>
      </Link>

      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <time dateTime={article.published_at}>
            {format(new Date(article.published_at), "d MMMM yyyy", { locale: id })}
          </time>
        </div>

        <Link href={`/berita/${article.slug}`} className="group-hover:text-blue-600 transition-colors">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 flex-grow">
          {article.excerpt}
        </p>

        <Link
          href={`/berita/${article.slug}`}
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-auto"
        >
          Baca Selengkapnya
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
