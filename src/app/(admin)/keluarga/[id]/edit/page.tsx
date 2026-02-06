"use client";

import FamilyForm from "@/components/FamilyForm";
import { useRbac } from "@/useRbac";
import { useRouter, useParams } from "next/navigation";

export default function EditKeluargaPage() {
  const { canUpdate } = useRbac("keluarga");
  const params = useParams();
  const id = params.id as string; // This is actually no_kk based on our logic

  if (!canUpdate) {
    return null;
  }

  return (
    <FamilyForm 
      mode="edit" 
      editNoKK={id}
      title="Edit Keluarga"
      subtitle="Perbarui data keluarga yang sudah ada."
      backButtonHref="/keluarga"
    />
  );
}