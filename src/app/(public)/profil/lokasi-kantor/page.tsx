import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lokasi Kantor | DesaOS",
  description: "Peta lokasi dan informasi kantor desa",
};

export default async function LokasiKantorPage() {
  const { data } = await getProfileData();
  
  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Lokasi Kantor"
        subtitle="Pusat Pemerintahan"
        description="Kunjungi kantor desa kami untuk layanan administrasi secara langsung."
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />
      
      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-20">
          <ProfileView data={data} category="lokasi-kantor" />
        </div>
      </div>
    </>
  );
}
