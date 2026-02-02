"use client";

import Link from "next/link";
import { FileText, Users, MapPin, Phone, Store, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { 
    label: "Layanan", 
    desc: "Surat & Admin", 
    icon: FileText, 
    href: "/layanan", 
    gradient: "from-blue-500 to-indigo-600", 
    shadow: "shadow-blue-500/20" 
  },
  { 
    label: "Aduan", 
    desc: "Lapor Masalah", 
    icon: Phone, 
    href: "/layanan/pengaduan", 
    gradient: "from-orange-500 to-red-600", 
    shadow: "shadow-orange-500/20" 
  },
  { 
    label: "Data Desa", 
    desc: "Statistik", 
    icon: Users, 
    href: "/statistik/kependudukan", 
    gradient: "from-emerald-500 to-teal-600", 
    shadow: "shadow-emerald-500/20" 
  },
  { 
    label: "Peta", 
    desc: "Geospasial", 
    icon: MapPin, 
    href: "/profil/peta", 
    gradient: "from-purple-500 to-pink-600", 
    shadow: "shadow-purple-500/20" 
  },
  { 
    label: "UMKM", 
    desc: "Ekonomi", 
    icon: Store, 
    href: "/potensi/umkm", 
    gradient: "from-amber-400 to-orange-500", 
    shadow: "shadow-amber-500/20" 
  },
];

export default function MobileQuickMenu() {
  return (
    <div className="w-full py-2">
      <div 
        className="flex overflow-x-auto snap-x gap-4 pl-5 pr-5 pb-4 scrollbar-hide scroll-pl-5" 
        style={{ scrollbarWidth: 'none' }}
      >
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link key={idx} href={item.href} className="snap-start shrink-0">
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="relative w-[140px] h-[160px] rounded-[28px] bg-white/50 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-slate-100/50 overflow-hidden transform-gpu isolation-isolate"
                style={{ 
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                  maskImage: 'radial-gradient(white, black)' 
                }}
              >
                {/* Clean Background - Removed redundant inner borders */}
                
                {/* Gradient Blob for Glow */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-10 blur-3xl rounded-full`} />

                <div className="relative h-full flex flex-col justify-between p-5">
                  {/* Icon Container - Fixed shadow syntax */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg ${item.shadow}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  {/* Text Content */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1 tracking-tight">{item.label}</h4>
                    <p className="text-[11px] font-medium text-slate-400 tracking-wide">{item.desc}</p>
                  </div>

                  {/* Action Indicator */}
                  <div className="absolute bottom-5 right-5">
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                     </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
