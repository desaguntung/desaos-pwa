import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prestasi Desa | DesaOS",
  description: "Daftar penghargaan dan pencapaian prestasi desa yang membanggakan.",
};

export default async function PrestasiPage() {
  const { data } = await getProfileData();
  
  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Prestasi Desa"
        subtitle="Hall of Fame"
        description="Jejak langkah keberhasilan dan penghargaan yang telah diraih oleh desa kami."
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />
      
      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
          <ProfileView data={data} category="prestasi" />
        </div>
      </div>
    </>
  );
}
