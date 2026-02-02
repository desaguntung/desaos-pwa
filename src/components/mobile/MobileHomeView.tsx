import React from "react";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { NewsItem } from "@/components/public/NewsSection";

// Mobile UI Components
import MobileHeader from "./ui/MobileHeader";
import MobileBanner from "./ui/MobileBanner";
import MobileQuickMenu from "./ui/MobileQuickMenu";
import MobileStatsCard from "./ui/MobileStatsCard";
import MobileSectionHeader from "./ui/MobileSectionHeader";
import MobileNewsRow from "./ui/MobileNewsRow";
import MobileAgendaList from "./ui/MobileAgendaList";

interface MobileHomeViewProps {
  identitas: {
    nama_desa: string;
    sebutan_desa: string;
  } | null;
  newsItems: NewsItem[];
}

export default async function MobileHomeView({ identitas, newsItems }: MobileHomeViewProps) {
  const supabase = createSupabaseServerClient();
  
  // Fetch population count
  const { count: populationCount } = await supabase
    .from("penduduk")
    .select("*", { count: "exact", head: true });

  const { count: maleCount } = await supabase
    .from("penduduk")
    .select("*", { count: "exact", head: true })
    .or("jenis_kelamin.ilike.%LAKI%,sex.eq.1");

  const { count: femaleCount } = await supabase
    .from("penduduk")
    .select("*", { count: "exact", head: true })
    .or("jenis_kelamin.ilike.%PEREM%,sex.eq.2");

  const { count: kkCount } = await supabase
    .from("penduduk")
    .select("*", { count: "exact", head: true })
    .ilike("hubungan_keluarga", "%KEPALA KELUARGA%");

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sebutanDesa = identitas?.sebutan_desa || "Desa";
  const namaDesa = identitas?.nama_desa || "Digital";

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 relative overflow-hidden">
      {/* Background Decor - Premium AI Glow */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[40%] bg-blue-100/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[10%] right-[-10%] w-[60%] h-[40%] bg-indigo-100/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />

      {/* 2. Hero / Welcome Banner */}
      <MobileBanner 
        sebutanDesa={sebutanDesa} 
        namaDesa={namaDesa} 
        currentDate={currentDate} 
      />

      {/* 3. Quick Menu Grid (Kitabisa Style) */}
      <MobileQuickMenu />

      {/* Spacer */}
      <div className="h-6" />

      {/* 4. Population Stats */}
      <MobileSectionHeader title="Statistik Desa" href="/statistik/kependudukan" />
      <MobileStatsCard 
        populationCount={populationCount || 0}
        maleCount={maleCount || 0}
        femaleCount={femaleCount || 0}
        kkCount={kkCount || 0}
      />

      {/* 5. News Slider (Horizontal) */}
      <MobileSectionHeader title="Kabar Terbaru" href="/berita" actionLabel="Lihat Semua" />
      <MobileNewsRow items={newsItems} />

      {/* 6. Agenda (Vertical List) */}
      <MobileSectionHeader title="Agenda Kegiatan" href="/agenda" />
      <MobileAgendaList />

      {/* 7. Bottom Decoration */}
      <div className="mt-6 mb-6 text-center">
        <p className="text-slate-400 text-xs">DesaOS Mobile v1.0</p>
        <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
}
