import { createSupabaseServerClient } from "@/utils/supabase/server";
import AllNewsClient, { Article } from "@/components/public/AllNewsClient";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semua Berita | Desa Digital",
  description: "Arsip lengkap berita, kegiatan, dan informasi terkini desa.",
};

export const revalidate = 60; // Revalidate every minute

export default async function AllNewsPage() {
  const supabase = createSupabaseServerClient();
  
  // Fetch all published articles with graceful fallback for optional columns
  let articles: any[] = [];
  
  try {
    // 1. Try fetching with all desired fields (views, author)
    // Note: This assumes a foreign key relation 'articles.author_id' -> 'profiles.id' exists and is named 'profiles' or similar.
    // If 'views' column is missing, this will throw code 42703.
    const { data, error } = await supabase
      .from("articles")
      .select(`
        id, 
        title, 
        excerpt, 
        slug, 
        cover_image, 
        category, 
        published_at, 
        author_id, 
        views,
        author:profiles(full_name)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) throw error;
    articles = data || [];
  } catch (error: any) {
    // 2. Fallback if 'views' or relation doesn't exist
    // Check for "column does not exist" or specific relation errors
    if (error.code === '42703' || error.code === 'PGRST200') {
        // console.warn("Optional columns/relations missing, falling back to basic fetch.", error.message);
        const { data, error: retryError } = await supabase
          .from("articles")
          .select("id, title, excerpt, slug, cover_image, category, published_at, author_id")
          .eq("status", "published")
          .order("published_at", { ascending: false });
          
        if (retryError) {
          console.error("Critical error fetching articles:", retryError);
        } else {
          articles = data || [];
        }
    } else {
       console.error("Error fetching articles:", error);
    }
  }

  // Transform data to match Article interface
  const formattedArticles: Article[] = articles.map((article: any) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || "",
    slug: article.slug,
    cover_image: article.cover_image,
    category: article.category,
    published_at: article.published_at,
    views: article.views || 0,
    author: article.author ? { full_name: article.author.full_name } : undefined,
  }));

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <AllNewsClient initialArticles={formattedArticles} />
      <Footer />
    </div>
  );
}
