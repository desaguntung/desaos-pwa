"use client";

import SuratMasukForm from "@/components/SuratMasukForm";

export default function TambahSuratMasukPage() {
  return (
    <SuratMasukForm
      mode="create"
      title="Tambah Surat Masuk"
      subtitle="Layanan Surat / Surat Masuk / Tambah"
      backButtonHref="/surat/masuk"
    />
  );
}
