"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Clock, Eye } from "lucide-react";
import { NewsItem } from "@/components/public/NewsCard";

interface PortalNewsCardProps {
  item: NewsItem;
  variant?: "hero-main" | "hero-sub" | "horizontal" | "vertical" | "compact" | "text-only";
  className?: string;
  showCategory?: boolean;
  showExcerpt?: boolean;
  imageHeight?: string;
}

export default function PortalNewsCard({ 
  item, 
  variant = "vertical", 
  className,
  showCategory = true,
  showExcerpt = true,
  imageHeight = "h-48"
}: PortalNewsCardProps) {
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const timeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return formatDate(dateString);
  };

  // Apple Style Constants
  const hoverTextClass = "group-hover:text-[#06c] transition-colors duration-300";
  const titleClass = "text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight font-semibold";
  const metaClass = "text-[#86868b] text-xs font-medium";

  // Hero Main: Large, Overlay Text
  if (variant === "hero-main") {
    return (
      <Link href={item.href} className={cn("group relative block w-full h-full overflow-hidden rounded-2xl", className)}>
        <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 animate-pulse" />
        <img 
          src={item.imageSrc} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
        
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
          {showCategory && item.tag && (
            <span className="mb-3 inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white uppercase tracking-wider border border-white/10">
              {item.tag}
            </span>
          )}
          <h2 className={cn("mb-3 text-2xl md:text-4xl font-bold leading-tight text-white", hoverTextClass)}>
            {item.title}
          </h2>
          <div className={cn("flex items-center gap-4 text-gray-300", metaClass)}>
             <span className="flex items-center gap-1.5">
                {timeAgo(item.date)}
             </span>
             {item.views !== undefined && (
                 <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 opacity-70" />
                    {item.views}
                 </span>
             )}
          </div>
        </div>
      </Link>
    );
  }

  // Hero Sub: Smaller Overlay Text
  if (variant === "hero-sub") {
    return (
      <Link href={item.href} className={cn("group relative block w-full h-full overflow-hidden rounded-2xl", className)}>
        <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 animate-pulse" />
        <img 
          src={item.imageSrc} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
        
        <div className="absolute bottom-0 left-0 p-5 w-full">
          {showCategory && item.tag && (
            <span className="mb-2 inline-block rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider border border-white/10">
              {item.tag}
            </span>
          )}
          <h2 className={cn("mb-2 text-base md:text-lg font-bold leading-tight text-white", hoverTextClass)}>
            {item.title}
          </h2>
          <div className={cn("flex items-center gap-3 text-gray-300", metaClass)}>
             <span className="flex items-center gap-1.5">
                {timeAgo(item.date)}
             </span>
          </div>
        </div>
      </Link>
    );
  }

  // Horizontal: Image Left, Content Right
  if (variant === "horizontal") {
    return (
      <Link href={item.href} className={cn("group flex gap-5 items-start", className)}>
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800">
           <img 
            src={item.imageSrc} 
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 py-1">
          {showCategory && item.tag && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#06c] mb-0.5">
              {item.tag}
            </span>
          )}
          <h3 className={cn("line-clamp-2 text-[17px] leading-snug", titleClass, hoverTextClass)}>
            {item.title}
          </h3>
          <span className={cn(metaClass, "mt-1")}>
            {timeAgo(item.date)}
          </span>
        </div>
      </Link>
    );
  }

  // Compact: Used in Sidebar or grids
  if (variant === "compact") {
     return (
      <Link href={item.href} className={cn("group block", className)}>
        <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800">
           <img 
            src={item.imageSrc} 
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className={cn("line-clamp-2 text-[15px] leading-snug", titleClass, hoverTextClass)}>
            {item.title}
        </h3>
        <span className={cn(metaClass, "mt-1.5 block")}>
            {timeAgo(item.date)}
        </span>
      </Link>
    );
  }

  // Text Only (Headline lists)
  if (variant === "text-only") {
    return (
        <Link href={item.href} className={cn("group block py-3 border-b border-[#d2d2d7]/30 dark:border-zinc-800 last:border-0", className)}>
             <h3 className={cn("line-clamp-2 text-[15px] leading-snug font-medium", titleClass, hoverTextClass)}>
                {item.title}
            </h3>
             <span className={cn(metaClass, "mt-1.5 block")}>
                {timeAgo(item.date)}
            </span>
        </Link>
    )
  }

  // Default Vertical
  return (
    <Link href={item.href} className={cn("group flex flex-col h-full", className)}>
      <div className={cn("relative mb-4 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-sm", imageHeight)}>
        <img 
          src={item.imageSrc} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showCategory && item.tag && (
            <div className="absolute top-3 left-3">
                 <span className="inline-block rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-[#1d1d1f] uppercase tracking-wider shadow-sm">
                    {item.tag}
                </span>
            </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className={cn("mb-2 line-clamp-2 text-[19px] md:text-[21px] leading-tight", titleClass, hoverTextClass)}>
          {item.title}
        </h3>
        
        {showExcerpt && (
            <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-[#1d1d1f]/70 dark:text-zinc-400 font-normal">
                {item.excerpt}
            </p>
        )}

        <div className="mt-auto flex items-center gap-3">
             <span className={cn(metaClass, "flex items-center gap-1.5")}>
                {timeAgo(item.date)}
             </span>
        </div>
      </div>
    </Link>
  );
}
