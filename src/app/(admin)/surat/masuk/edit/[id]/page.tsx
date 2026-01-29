"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SuratMasukForm from "@/components/SuratMasukForm";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { SuratMasuk } from "@/lib/services/surat";

import { PageHeader } from "@/components/layout/PageHeader";

export default function EditSuratMasukPage() {
  const params = useParams();
  const id = params.id as string;
  const [surat, setSurat] = useState<SuratMasuk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSurat(id);
    }
  }, [id]);

  const fetchSurat = async (suratId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("surat_masuk")
        .select("*")
        .eq("id", suratId)
        .single();
        
      if (error) throw error;
      setSurat(data);
    } catch (error) {
      console.error("Error fetching surat:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-secondary-text text-xs">
        Loading...
      </div>
    );
  }

  if (!surat) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-red-500 font-medium">Data surat tidak ditemukan</div>
        <Link href="/surat/masuk" className="text-blue-600 hover:underline text-xs">
          Kembali ke Surat Masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Edit Surat Masuk" 
        subtitle="Perbarui data surat masuk"
        showBackButton={true}
        backButtonHref="/surat/masuk"
      />

      <div className="p-6 max-w-4xl mx-auto w-full pb-12">
        <SuratMasukForm initialData={surat} isEdit={true} />
      </div>
    </div>
  );
}
