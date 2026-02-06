"use client";

import FamilyForm from "@/components/FamilyForm";
import { useRbac } from "@/useRbac";
import { useRouter } from "next/navigation";

export default function TambahKeluargaPage() {
  const { canCreate } = useRbac("keluarga");
  const router = useRouter();

  if (!canCreate) {
    // Optional: Redirect or show unauthorized
    return null; 
  }

  return (
    <FamilyForm 
      mode="create" 
      title="Tambah Keluarga"
      subtitle="Tambahkan data keluarga baru ke dalam sistem."
      backButtonHref="/keluarga"
    />
  );
}