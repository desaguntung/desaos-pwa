"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NewsItem } from "./NewsCard";

interface FeaturedNewsCardProps {
  item: NewsItem;
  priority?: boolean;
}

export default function FeaturedNewsCard({ item, priority = false }: FeaturedNewsCardProps) {
  return (
    <Link href={item.href} className="group block w-full relative overflow-hidden rounded-[32px]">
      <div className="relative aspect-[4/5] md:aspect-[21/9] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <motion.img
          src={item.imageSrc}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          loading={priority ? "eager" : "lazy"}
        />
        
        {/* Gradient Overlay - Apple style usually subtle, but needed for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-3xl"
            >
                {item.tag && (
                    <span className="mb-4 inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/20">
                    {item.tag}
                    </span>
                )}
                
                <h2 className="mb-4 text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
                    {item.title}
                </h2>
                
                <p className="mb-6 line-clamp-2 text-lg md:text-xl font-medium text-white/90 md:line-clamp-3 max-w-2xl">
                    {item.excerpt}
                </p>

                <div className="flex items-center gap-6 text-sm font-medium text-white/80">
                    {item.date && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {new Date(item.date).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    )}
                     <div className="flex items-center gap-2 text-white group-hover:underline decoration-white/50 underline-offset-4 transition-all">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </Link>
  );
}
