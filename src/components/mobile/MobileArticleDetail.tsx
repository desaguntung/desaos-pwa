"use client";

import React, { useEffect, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { ChevronLeft, Calendar, User, Clock, Share2, Eye } from "lucide-react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

interface MobileArticleDetailProps {
  slug: string;
  onClose: () => void;
  initialData?: any;
}

export default function MobileArticleDetail({ slug, onClose, initialData }: MobileArticleDetailProps) {
  const [article, setArticle] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const dragControls = useDragControls();

  useEffect(() => {
    if (initialData) {
        setArticle(initialData);
        setLoading(false);
        return;
    }

    const fetchArticle = async () => {
      console.log("Fetching article with slug:", slug);
      const supabase = createSupabaseBrowserClient();
      
      // Fetch article first (without join to avoid RLS issues)
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (articleError) {
        console.error("Article Fetch Error:", JSON.stringify(articleError, null, 2));
        setLoading(false);
        return;
      }

      if (articleData) {
        let authorName = "Admin Desa";
        
        // Try to fetch author if exists
        if (articleData.author_id) {
             const { data: profile } = await supabase
               .from("profiles")
               .select("full_name")
               .eq("id", articleData.author_id)
               .single();
             if (profile?.full_name) {
                authorName = profile.full_name;
             }
        }
        
        setArticle({
            ...articleData,
            profiles: { full_name: authorName }
        });
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug, initialData]);

  const authorName = article?.profiles?.full_name || "Admin Desa";
  const wordCount = article?.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.2 }}
      onDragEnd={(e, info) => {
        if (info.offset.y > 100) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] bg-card-bg dark:bg-zinc-900 flex flex-col h-[100dvh]"
    >
      {/* Header with Drag Handle & Back Button */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-6 pointer-events-none">
         <button 
           onClick={onClose}
           className="w-10 h-10 rounded-full bg-card-bg/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-sm border border-border-color/60 dark:border-zinc-800 flex items-center justify-center text-primary-text dark:text-zinc-200 pointer-events-auto active:scale-95 transition-all hover:shadow-md"
         >
           <ChevronLeft className="w-5 h-5" />
         </button>
         
         {/* Drag Handle Indicator */}
         <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full shadow-sm backdrop-blur-md pointer-events-auto" />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : article ? (
        <div className="flex-1 overflow-y-auto bg-body-bg dark:bg-zinc-950 pb-32">
          {/* Hero Image */}
          <div className="relative w-full h-[45vh]">
            <Image
              src={article.cover_image || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60"}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10" />
          </div>

          {/* Floating Title Card */}
          <div className="relative -mt-24 mx-5 z-10">
             <div className="bg-card-bg/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 border border-border-color/60 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                   <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-800/50">
                     {article.category || "Berita"}
                   </span>
                   <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{readTime} menit baca</span>
                   </div>
                </div>

                <h1 className="text-2xl font-bold text-primary-text dark:text-zinc-100 leading-snug mb-5 tracking-tight">
                  {article.title}
                </h1>

                <div className="flex items-center gap-3 pt-5 border-t border-border-color dark:border-zinc-800">
                   <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-border-color dark:border-zinc-700">
                     <User className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary-text dark:text-zinc-200">{authorName}</span>
                      <span className="text-[11px] text-secondary-text">
                        {new Date(article.created_at).toLocaleDateString("id-ID", {
                           day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* Article Content */}
          <div className="px-6 pt-8">
              <div 
                className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-primary-text dark:prose-headings:text-zinc-100 prose-headings:tracking-tight
                prose-p:text-secondary-text prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-md prose-img:w-full prose-img:object-cover prose-img:border prose-img:border-border-color dark:prose-img:border-zinc-800
                prose-strong:text-primary-text dark:prose-strong:text-zinc-100 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
           <h3 className="text-lg font-bold text-primary-text dark:text-zinc-100 mb-2">Gagal memuat berita</h3>
           <p className="text-secondary-text mb-4">Artikel tidak ditemukan atau terjadi kesalahan.</p>
           <button onClick={onClose} className="text-blue-600 font-bold">Kembali</button>
        </div>
      )}
    </motion.div>
  );
}
