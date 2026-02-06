"use client";

import { useParams } from "next/navigation";
import RumahTanggaForm from "@/components/RumahTanggaForm";

export default function EditRumahTanggaPage() {
  const params = useParams<{ id: string }>();

  return (
    <RumahTanggaForm
      mode="edit"
      editId={params.id}
      title="Edit Rumah Tangga"
      subtitle="Perbarui data rumah tangga yang sudah ada."
      backButtonHref="/rumah-tangga"
    />
  );
}
