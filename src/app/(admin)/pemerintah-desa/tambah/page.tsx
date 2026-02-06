"use client";

import PamongForm from "@/components/PamongForm";

export default function TambahPamongPage() {
  return (
    <PamongForm
      mode="create"
      title="Tambah Aparatur"
      subtitle="Tambahkan data aparatur desa baru ke dalam sistem."
      backButtonHref="/pemerintah-desa"
    />
  );
}
