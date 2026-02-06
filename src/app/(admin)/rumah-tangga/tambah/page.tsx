"use client";

import RumahTanggaForm from "@/components/RumahTanggaForm";

export default function TambahRumahTanggaPage() {
  return (
    <RumahTanggaForm
      mode="create"
      title="Tambah Rumah Tangga"
      subtitle="Tambahkan data rumah tangga baru ke dalam sistem."
      backButtonHref="/rumah-tangga"
    />
  );
}
