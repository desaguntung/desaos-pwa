"use client";

import MagazineNewsCard from "./MagazineNewsCard";
import { NewsItem } from "./berita/NewsCard";

interface MagazineGridProps {
  articles: NewsItem[];
}

export default function MagazineGrid({ articles }: MagazineGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg text-zinc-500">Belum ada artikel yang ditemukan.</p>
      </div>
    );
  }

  // First article is featured
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Featured Article */}
      <MagazineNewsCard article={featuredArticle} index={0} featured={true} />

      {/* Grid for remaining articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 md:gap-y-12 md:gap-x-8">
        {remainingArticles.map((article, index) => (
          <MagazineNewsCard 
            key={article.id || article.slug} 
            article={article} 
            index={index + 1} 
          />
        ))}
      </div>
    </div>
  );
}
