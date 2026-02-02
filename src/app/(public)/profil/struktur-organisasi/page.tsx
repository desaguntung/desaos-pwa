import HeroSection from "@/components/public/HeroSection";
import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Struktur Organisasi | DesaOS",
  description: "Struktur Organisasi Pemerintahan Desa",
};

export default async function StrukturOrganisasiPage() {
  const { data } = await getProfileData();

  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Struktur Organisasi"
        subtitle={data.identitas.nama_desa}
        description={`Susunan organisasi dan tata kerja Pemerintah Desa ${data.identitas.nama_desa || ""}`}
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />

      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
           <ProfileView data={data} category="struktur-organisasi" />
        </div>
      </div>
    </>
  );
}
