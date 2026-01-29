"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResidentForm from "@/components/ResidentForm";
import { addResident, Resident } from "@/lib/services/penduduk";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

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
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader
        title="Tambah Penduduk"
        subtitle="Tambahkan data penduduk baru ke dalam sistem database desa."
        showBackButton={true}
        backButtonHref="/penduduk"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              form="resident-form"
              disabled={isSubmitting}
              className="bg-zinc-900 text-white hover:bg-zinc-800 h-8 text-xs px-3"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-hidden">
        <ResidentForm 
          mode="create" 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          hideActions={true}
        />
      </div>
    </div>
  );
}
