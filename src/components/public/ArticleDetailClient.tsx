"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  User, 
  Copy, 
  Check, 
  ChevronLeft,
  Facebook,
  Twitter,
  Linkedin,
  Eye
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { incrementArticleView } from "@/app/actions/articles";

interface ArticleDetailClientProps {
  article: {
    title: string;
    content: string;
    cover_image: string | null;
    published_at: string;
    category: string | null;
    views?: number;
    slug: string;
    author: {
      name: string;
    };
  };
  readTime: number;
  backLink?: string;
}

export default function ArticleDetailClient({ article, readTime, backLink = "/" }: ArticleDetailClientProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backUrl, setBackUrl] = useState(backLink);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Smart Back Button Logic
    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin) {
           // If coming from Home -> Back to Home
           if (referrer.pathname === "/") {
             setBackUrl("/");
           } 
           // If coming from /berita -> Back to /berita
           else if (referrer.pathname.startsWith("/berita")) {
             setBackUrl("/berita");
           }
        }
      } catch (e) {
        // ignore invalid URLs
      }
    }

    // Increment View Count
    incrementArticleView(article.slug);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [article.slug]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        // Fallback for non-secure contexts (e.g., HTTP localhost)
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          throw new Error("Gagal menyalin");
        }
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      toast.success("Tautan artikel berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Gagal menyalin tautan");
      console.error("Copy failed", err);
    }
  };

  const publishDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(article.published_at));

  return (
    <div className="relative min-h-screen bg-card-bg font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-[48px] md:top-[44px] left-0 right-0 z-[100] h-1 bg-blue-600 origin-left"
        style={{ scaleX }}
      />

      {/* Floating Header removed as per user request */}
      
      <main className="pb-24 pt-24 md:pt-32">
        <article className="mx-auto max-w-[980px] px-5 md:px-8">
          
          {/* Back Button (Initial - Mobile Only) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 md:hidden"
          >
            <Link 
              href={backUrl} 
              className="inline-flex items-center text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Kembali
            </Link>
          </motion.div>

          {/* Article Header */}
          <header className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex justify-center"
            >
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-600 ring-1 ring-inset ring-blue-500/10">
                {article.category || "Berita Desa"}
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-3xl font-bold leading-tight tracking-tight text-primary-text md:text-5xl lg:text-6xl lg:leading-[1.1]"
            >
              {article.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-secondary-text"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-body-bg ring-1 ring-border-color">
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-primary-text">{article.author.name}</span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-border-color sm:block" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.published_at}>{publishDate}</time>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-border-color sm:block" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{readTime} menit baca</span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-border-color sm:block" />
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{article.views || 0} dilihat</span>
              </div>
            </motion.div>
          </header>

          {/* Hero Image */}
          {article.cover_image && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative mb-16 aspect-[16/9] w-full overflow-hidden rounded-2xl md:aspect-[21/9] md:rounded-[2.5rem] shadow-2xl ring-1 ring-border-color"
            >
              <img
                src={article.cover_image}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl md:rounded-[2.5rem]" />
            </motion.div>
          )}

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto max-w-[680px]"
          >
            <div 
              className="prose prose-zinc prose-lg md:prose-xl dark:prose-invert 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary-text 
                prose-p:leading-relaxed prose-p:text-secondary-text prose-p:font-normal prose-p:mb-8
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:ring-1 prose-img:ring-border-color prose-img:my-10
                prose-strong:font-semibold prose-strong:text-primary-text
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-secondary-text
                first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-bold first-letter:text-primary-text first-letter:leading-[0.8]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags / Share Footer */}
            <div className="mt-16 border-t border-border-color pt-10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Bagikan Artikel
                  </h3>
                  <div className="flex gap-3">
                    <button onClick={handleCopyLink} className="group flex h-10 w-10 items-center justify-center rounded-full bg-body-bg text-secondary-text transition-all hover:bg-blue-600 hover:text-white hover:scale-110 hover:shadow-lg">
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                    <a href="#" className="group flex h-10 w-10 items-center justify-center rounded-full bg-body-bg text-secondary-text transition-all hover:bg-[#1877F2] hover:text-white hover:scale-110 hover:shadow-lg">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="group flex h-10 w-10 items-center justify-center rounded-full bg-body-bg text-secondary-text transition-all hover:bg-[#1DA1F2] hover:text-white hover:scale-110 hover:shadow-lg">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </article>
      </main>

      {/* Floating Bottom Dock (Mobile Only) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden"
      >
        <div className="flex items-center gap-1 rounded-full bg-primary-text/90 p-1.5 shadow-xl backdrop-blur-md ring-1 ring-white/10">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-4 w-px bg-white/20 mx-1" />
          <button onClick={handleCopyLink} className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
            {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

    </div>
  );
}