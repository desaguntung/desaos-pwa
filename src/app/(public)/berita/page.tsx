import { createSupabaseServerClient } from "@/utils/supabase/server";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import NewsPortalClient from "@/components/public/portal/NewsPortalClient";
import MobileNewsView from "@/components/mobile/MobileNewsView";
import MobileNavDock from "@/components/mobile/MobileNavDock";
import { NewsItem } from "@/components/public/NewsCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita & Artikel | Desa Digital",
  description: "Arsip lengkap berita, kegiatan, dan informasi terkini desa.",
};

export const revalidate = 60; // Revalidate every minute

export default async function NewsPage() {
  const supabase = createSupabaseServerClient();
  
  // Fetch initial data (Fetch more for portal layout)
  const { data: articles, count } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, category, published_at, views_count", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  const categories = categoriesData ? ["Semua", ...categoriesData.map(c => c.name)] : ["Semua"];

  // Map to NewsItem interface
  const newsItems: NewsItem[] = (articles || []).map((article) => ({
    title: article.title,
    excerpt: article.excerpt,
    href: `/berita/${article.slug}?from=/berita`,
    imageSrc: article.cover_image || "/images/placeholder.jpg",
    tag: article.category,
    date: article.published_at,
    views: article.views_count
  }));

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <NewsPortalClient 
          initialItems={newsItems} 
          categories={categories}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileNewsView 
          newsItems={newsItems} 
          categories={categories}
        />
        <MobileNavDock />
      </div>
    </>
  );
}
