"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface NewsItem {
  id?: string | number;
  slug?: string;
  title: string;
  excerpt: string;
  date: string;
  author?: string;
  imageSrc: string;
  category?: string;
  tag?: string;
  href: string;
}

interface MobileNewsRowProps {
  items: NewsItem[];
}

export default function MobileNewsRow({ items }: MobileNewsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  // Auto-scroll logic
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const cardWidth = 236; // 220px card + 16px gap
        const maxScroll = scrollWidth - clientWidth;
        
        let nextScroll = scrollLeft + cardWidth;
        
        // If near end, scroll back to start
        if (nextScroll >= maxScroll - 10) {
          nextScroll = 0;
          setActiveIndex(0);
        } else {
          setActiveIndex((prev) => (prev + 1) % items.length);
        }

        scrollRef.current.scrollTo({
          left: nextScroll,
          behavior: 'smooth'
        });
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  // Track active index on manual scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const cardWidth = 236;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      // Assuming dateStr is in a standard format or Indonesian format
      // We'll try to parse it and format to dd mm yyyy
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid
      
      return date.toLocaleDateString("id-ID", {
         day: "2-digit",
         month: "short",
         year: "numeric"
       });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-8 -mx-0 scrollbar-hide" 
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, idx) => (
          <Link 
            key={idx} 
            href={item.href}
            className="snap-start shrink-0 w-[220px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: idx * 0.1 }}
              className="group/card relative h-[250px] rounded-[20px] overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg border border-slate-100/50 flex flex-col"
            >
              {/* Full Height Image with Gradient Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
              </div>
              
              {/* Category Badge - Ensure high z-index and visibility */}
              <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-[8px] font-bold text-white rounded-full border border-white/20 tracking-wide uppercase shadow-sm">
                  {item.tag || item.category || "Berita"}
                </span>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 mt-auto p-3.5 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-white/70 text-[9px] font-medium mb-0.5">
                   <Clock className="w-2.5 h-2.5" />
                   <span>{formatDate(item.date)}</span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow-sm">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                   <span className="text-[9px] text-white/80 font-medium">
                     Baca Selengkapnya
                   </span>
                   <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover/card:bg-white group-hover/card:text-slate-900 transition-all duration-300 text-white">
                      <ArrowRight className="w-2.5 h-2.5" />
                   </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        {items.map((_, idx) => (
          <div 
            key={idx}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              idx === activeIndex ? "w-6 bg-slate-800" : "w-1.5 bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
