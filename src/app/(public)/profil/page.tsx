"use client";

import React from "react";
import Link from "next/link";
import { 
  History, Target, Users, MapPin, BarChart3, Map as MapIcon, Trophy, ChevronRight, Phone
} from "lucide-react";
import { AppleCard } from "@/components/ui/AppleCard";
import { cn } from "@/lib/utils";

const profilItems = [
  {
    title: "Tentang Desa",
    items: [
      { label: "Sejarah Desa", href: "/profil/sejarah", icon: History, desc: "Asal usul dan perjalanan sejarah desa" },
      { label: "Visi & Misi", href: "/profil/visi-misi", icon: Target, desc: "Cita-cita dan langkah strategis pembangunan" },
      { label: "Struktur Organisasi", href: "/profil/struktur-organisasi", icon: Users, desc: "Susunan pemerintahan dan lembaga desa" },
      { label: "Geografis Desa", href: "/profil/geografis", icon: MapPin, desc: "Letak wilayah, batas, dan kondisi alam" },
      { label: "Demografi", href: "/statistik/kependudukan", icon: BarChart3, desc: "Data statistik penduduk terkini" },
    ]
  },
  {
    title: "Lainnya",
    items: [
      { label: "Peta Desa", href: "/profil/peta", icon: MapIcon, desc: "Peta digital wilayah administratif" },
      { label: "Prestasi Desa", href: "/profil/prestasi", icon: Trophy, desc: "Penghargaan dan pencapaian desa" },
      { label: "Lokasi Kantor", href: "/profil/lokasi-kantor", icon: MapPin, desc: "Alamat dan peta lokasi kantor desa" },
      { label: "Hubungi Kami", href: "/profil/hubungi-kami", icon: Phone, desc: "Kontak dan jam pelayanan desa" },
    ]
  }
];

export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight mb-4">
          Profil Desa
        </h1>
        <p className="text-xl text-[#86868b] max-w-2xl font-medium leading-relaxed">
          Mengenal lebih dekat identitas, potensi, dan tata kelola pemerintahan desa kami yang transparan dan melayani.
        </p>
      </div>

      <div className="space-y-12">
        {profilItems.map((section, sectionIdx) => (
          <div key={section.title}>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6 pl-1">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIdx) => (
                <Link key={item.label} href={item.href} className="block group">
                  <AppleCard 
                    className="h-full hover:scale-[1.02] transition-transform duration-300"
                    delay={sectionIdx * 0.2 + itemIdx * 0.1}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1d1d1f] mb-2 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-[#86868b] text-sm leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </AppleCard>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
