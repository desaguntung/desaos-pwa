"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ResidentForm from "@/components/ResidentForm";
import { addResident, Resident } from "@/lib/services/penduduk";
import { toast } from "sonner";

export default function TambahPendudukPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<Resident>) => {
    try {
      setIsSubmitting(true);
      await addResident(data as any); 
      toast.success("Penduduk berhasil ditambahkan");
      router.push("/penduduk");
      router.refresh();
    } catch (error) {
      console.error("Failed to add resident:", error);
      toast.error("Gagal menambahkan penduduk. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResidentForm 
      mode="create" 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title="Tambah Penduduk"
      subtitle="Tambahkan data penduduk baru ke dalam sistem database desa."
      backButtonHref="/penduduk"
    />
  );
}
