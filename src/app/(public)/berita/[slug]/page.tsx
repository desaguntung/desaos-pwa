import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";
import ArticleDetailClient from "@/components/public/ArticleDetailClient";
import MobileArticlePageWrapper from "@/components/mobile/MobileArticlePageWrapper";

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, cover_image")
    .eq("slug", slug)
    .single();

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

export default async function ArticleDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  let backLink = typeof resolvedSearchParams.from === 'string' ? resolvedSearchParams.from : "/";
  
  // Security check: Ensure backLink is an internal path
  if (!backLink.startsWith("/")) {
    backLink = "/";
  }
  
  const supabase = createSupabaseServerClient();
  
  // Fetch Article
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !article) {
    notFound();
  }

  // Fetch Author
  let authorName = "Admin Desa";
  if (article.author_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", article.author_id)
      .single();
    
    if (profile?.full_name) {
      authorName = profile.full_name;
    }
  }

  // Estimate read time
  const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Transform data for client component
  const articleData = {
    ...article,
    author: {
      name: authorName
    }
  };

  return (
    <>
      <div className="hidden md:block">
        <ArticleDetailClient article={articleData} readTime={readTime} backLink={backLink} />
      </div>
      <div className="block md:hidden">
        <MobileArticlePageWrapper article={articleData} slug={slug} />
      </div>
    </>
  );
}