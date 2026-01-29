"use client";

import SuratMasukForm from "@/components/SuratMasukForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TambahSuratMasukPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Tambah Surat Masuk" 
        subtitle="Layanan Surat / Surat Masuk / Tambah"
        showBackButton={true}
        backButtonHref="/surat/masuk"
      />

      <div className="p-6 max-w-4xl mx-auto w-full pb-12">
        <SuratMasukForm />
      </div>
    </div>
  );
}
