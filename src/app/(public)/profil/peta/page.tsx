import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Peta Desa | DesaOS",
  description: "Peta wilayah administratif dan lokasi penting desa",
};

export default async function PetaPage() {
  const { data } = await getProfileData();
  
  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Peta Wilayah"
        subtitle={data.identitas.nama_desa}
        description="Gambaran visual wilayah administratif dan lokasi strategis desa."
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />
      
      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
          <ProfileView data={data} category="peta" />
        </div>
      </div>
    </>
  );
}
