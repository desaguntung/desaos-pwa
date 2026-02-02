"use client";

import NewsCard, { NewsItem } from "./NewsCard";

interface NewsGridProps {
  articles: NewsItem[];
}

export default function NewsGrid({ articles }: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Belum ada berita</h3>
        <p className="text-zinc-500 max-w-sm mx-auto">
          Belum ada artikel yang diterbitkan dalam kategori ini. Silakan cek kembali nanti atau cari topik lain.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <NewsCard key={article.id || article.slug} article={article} index={index} />
      ))}
    </div>
  );
}
