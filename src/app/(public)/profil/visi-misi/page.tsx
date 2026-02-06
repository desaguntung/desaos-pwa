import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visi & Misi",
  description: "Visi dan Misi Desa",
};

export default async function VisiMisiPage() {
  const { data } = await getProfileData();

  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Visi & Misi"
        subtitle={data.identitas.nama_desa}
        description="Arah dan tujuan pembangunan desa untuk kesejahteraan bersama."
        size="medium"
        variant="centered"
        bgClass="bg-body-bg"
      />

      <div className="min-h-screen bg-card-bg pb-20">
        <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-20">
           <ProfileView data={data} category="visi-misi" />
        </div>
      </div>
    </>
  );
}
