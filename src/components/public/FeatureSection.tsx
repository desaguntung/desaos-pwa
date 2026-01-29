"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Store, BookOpen, GraduationCap, Laptop, MoreHorizontal, Plus, X } from "lucide-react";

type FeatureItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
  ringColor: string;
  largeText?: string;
  imageSrc?: string;
};

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = item.icon;
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[24px] p-8 transition-all duration-300 hover:shadow-2xl transform-gpu isolate",
        "h-[480px] w-full md:h-[520px]",
        item.gradient,
        isOpen && "ring-2 ring-inset ring-white dark:ring-zinc-900"
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      
      {/* Main Content (Visible when closed) */}
      <div className={cn("relative z-10 flex h-full flex-col justify-between transition-opacity duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
        <div>
          <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                  <Icon className={cn("h-6 w-6", item.textColor)} />
              </div>
              <h3 className={cn("text-xl font-bold", item.textColor)}>{item.title}</h3>
          </div>
          
          <p className={cn("mb-8 max-w-[240px] text-sm font-medium leading-relaxed opacity-90", item.textColor)}>
            {item.description}
          </p>

          <Link 
            href={item.href}
            className={cn(
              "inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-zinc-100 hover:shadow-xl active:scale-95",
            )}
          >
            Buka Fitur
          </Link>
        </div>

        <div className="mt-auto">
          {item.largeText && (
            <div className={cn("text-4xl font-bold tracking-tight md:text-5xl", item.textColor)}>
              {item.largeText}
            </div>
          )}
          {item.imageSrc && (
               <div className="mt-4 flex justify-center">
                   <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-xl" />
               </div>
          )}
           <div className={cn("mt-8 text-[10px] font-medium opacity-60", item.textColor)}>
            {item.subtitle}
          </div>
        </div>
      </div>

      {/* Detail Overlay (Visible when open) */}
      <div 
        className={cn(
            "absolute inset-0 z-20 flex flex-col bg-white/95 p-8 backdrop-blur-md rounded-[24px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-zinc-900/95 w-[calc(100%+4px)] h-[calc(100%+4px)] -m-[2px]",
            isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
          <div className={cn("mb-6 flex items-center gap-4 transition-all duration-700 delay-100 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm">
                <Icon className="h-7 w-7 text-zinc-900 dark:text-zinc-100" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
          </div>

          <p className={cn("mb-8 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 transition-all duration-700 delay-200 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
            {item.description}
          </p>

          <div className={cn("mt-auto mb-16 transition-all duration-700 delay-300 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
             <Link 
                href={item.href}
                className="inline-flex w-full items-center justify-center rounded-[50px] bg-zinc-900 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Buka Fitur
              </Link>
          </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "absolute bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
            isOpen ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white rotate-90" : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
        )}
        aria-label={isOpen ? "Close details" : "Show details"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}

export default function FeatureSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const features: FeatureItem[] = [
    {
      title: "Layanan Mandiri",
      subtitle: "Administrasi Kependudukan",
      description: "Urus surat keterangan, KTP, dan dokumen lainnya langsung dari rumah Anda.",
      href: "/layanan",
      icon: Laptop,
      gradient: "bg-gradient-to-b from-blue-400 to-blue-600",
      textColor: "text-white",
      ringColor: "ring-blue-500",
      largeText: "Cepat, Mudah, Efisien."
    },
    {
      title: "UMKM Desa",
      subtitle: "Ekonomi Kerakyatan",
      description: "Jelajahi produk lokal unggulan dan dukung ekonomi warga desa kita.",
      href: "/umkm",
      icon: Store,
      gradient: "bg-gradient-to-b from-orange-400 to-red-500",
      textColor: "text-white",
      ringColor: "ring-orange-500",
      largeText: "Produk Lokal Global."
    },
    {
      title: "Akademi Desa",
      subtitle: "Pemberdayaan Masyarakat",
      description: "Akses materi pelatihan dan workshop untuk meningkatkan keterampilan warga.",
      href: "/akademi",
      icon: GraduationCap,
      gradient: "bg-gradient-to-b from-emerald-400 to-teal-600",
      textColor: "text-white",
      ringColor: "ring-emerald-500",
      largeText: "Belajar Tanpa Batas."
    },
    {
      title: "Perpustakaan",
      subtitle: "Literasi Digital",
      description: "Ribuan koleksi buku digital dan arsip desa yang dapat diakses kapan saja.",
      href: "/perpustakaan",
      icon: BookOpen,
      gradient: "bg-gradient-to-b from-violet-400 to-purple-600",
      textColor: "text-white",
      ringColor: "ring-violet-500",
      largeText: "Jendela Dunia."
    },
    {
      title: "Lainnya",
      subtitle: "Fitur Tambahan",
      description: "Temukan berbagai fitur menarik lainnya untuk menunjang aktivitas Anda.",
      href: "/fitur",
      icon: MoreHorizontal,
      gradient: "bg-gradient-to-b from-zinc-700 to-zinc-900",
      textColor: "text-white",
      ringColor: "ring-zinc-700",
      largeText: "Dan Banyak Lagi."
    }
  ];

  return (
    <section className="w-full bg-[#f5f5f7] py-20 dark:bg-zinc-900">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-10 flex items-end justify-between">
          <div className="max-w-xl">
             <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white md:text-5xl">
              Fitur Unggulan. <span className="text-zinc-500">Terintegrasi, mudah, dan bermanfaat.</span>
            </h2>
          </div>
          
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scroll('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex flex-nowrap gap-5 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {features.map((feature, idx) => (
            <div key={idx} className="w-[300px] md:w-[350px] snap-center shrink-0">
              <FeatureCard item={feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
