import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sejarah Desa",
  description: "Sejarah dan asal usul desa",
};

export default async function SejarahPage() {
  const { data } = await getProfileData();
  
  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Sejarah Desa"
        subtitle={data.identitas.nama_desa}
        description="Jejak langkah perjalanan desa dari masa ke masa."
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />
      
      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-20">
          <ProfileView data={data} category="sejarah" />
        </div>
      </div>
    </>
  );
}
