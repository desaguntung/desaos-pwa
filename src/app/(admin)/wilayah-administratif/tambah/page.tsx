"use client";

import DusunForm from "@/components/DusunForm";

export default function TambahDusunPage() {
  return (
    <DusunForm
      mode="create"
      title="Tambah Dusun"
      subtitle="Tambahkan data wilayah dusun baru ke dalam sistem."
      backButtonHref="/wilayah-administratif"
    />
  );
}
