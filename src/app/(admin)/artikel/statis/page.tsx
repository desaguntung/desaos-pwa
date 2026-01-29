"use client";

import { Construction } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ArtikelStatisPage() {
  return (
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader
        title="Artikel Statis"
        subtitle="Kelola halaman profil desa, visi misi, dan informasi tetap lainnya."
      />
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <div className="bg-amber-100 p-4 rounded-full mb-4">
          <Construction className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Dalam Pengembangan</h2>
        <p className="text-zinc-500 max-w-md text-sm">
          Fitur ini sedang dalam pengembangan. Artikel statis akan digunakan untuk halaman profil desa, visi misi, dan informasi tetap lainnya.
        </p>
      </div>
    </div>
  );
}
