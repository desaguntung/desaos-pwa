import { getProfileData } from "@/app/actions/profile";
import ProfileView from "@/components/public/profil/ProfileView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Geografis Desa | DesaOS",
  description: "Informasi geografis, luas wilayah, dan batas desa.",
};

export default async function GeografisPage() {
  const { data } = await getProfileData();

  if (!data || !data.identitas) return notFound();

  return (
    <>
      <HeroSection 
        title="Geografis Desa"
        subtitle={data.identitas.nama_desa}
        description={`Informasi mengenai kondisi geografis, luas wilayah, dan batas-batas administratif Desa ${data.identitas.nama_desa}.`}
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />

      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
           <ProfileView data={data} category="geografis" />
        </div>
      </div>
    </>
  );
}
