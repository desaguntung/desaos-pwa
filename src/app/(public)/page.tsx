import HeroSection from "@/components/public/HeroSection";
import OfficialsSection from "@/components/public/OfficialsSection";
import FeatureSection from "@/components/public/FeatureSection";
import NewsSection, { NewsItem } from "@/components/public/NewsSection";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import MobileNavDock from "@/components/mobile/MobileNavDock";
import MobileHomeView from "@/components/mobile/MobileHomeView";

export default async function PublicHome() {
  const supabase = createSupabaseServerClient();
  
  // 1. Fetch Identity
  const { data: identitas } = await supabase
    .from("identitas_desa")
    .select("nama_desa, sebutan_desa")
    .limit(1)
    .single();
    
  const sebutanDesa = identitas?.sebutan_desa || "Desa";
  const namaDesa = identitas?.nama_desa || "Digital";
  const websiteTitle = `Website Resmi ${sebutanDesa} ${namaDesa}.`;

  // 2. Fetch Latest Articles
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);

  const newsItems: NewsItem[] = (articles || []).map((article) => ({
    title: article.title,
    excerpt: article.excerpt || "",
    href: `/berita/${article.slug}?from=/`,
    imageSrc: article.cover_image || "https://placehold.co/600x400?text=No+Image",
    tag: article.category || "Berita Desa",
    date: article.published_at,
    views: article.views || 0,
  }));

  return (
    <main>
      {/* --- DESKTOP AREA (DO NOT TOUCH CONTENTS) --- */}
      <div className="hidden md:block">
        {/* Hero 1: Sambutan Kepala Desa */}
        <HeroSection 
          title="Selamat Datang."
          titleClassName="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 pb-2"
          subtitle={websiteTitle}
          subtitleClassName="text-lg md:text-2xl"
          description="Pusat informasi dan pelayanan publik terpadu. Transparan, Akuntabel, dan Melayani."
          primaryAction={{ label: "Profil Desa", href: "#" }}
          secondaryAction={{ label: "Layanan Publik", href: "#" }}
          bgClass="bg-[#f5f5f7]"
          size="large"
          variant="split"
          imageSrc="https://placehold.co/800x800/e2e8f0/475569?text=Foto+Kepala+Desa"
        />

        <FeatureSection />
        <NewsSection items={newsItems} />
        <OfficialsSection />
      </div>

      {/* --- NEW MOBILE AREA --- */}
      <div className="block md:hidden">
        <MobileHomeView identitas={identitas} newsItems={newsItems} />
        <MobileNavDock />
      </div>
    </main>
  );
}
