"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPamongById, type Pamong } from "@/lib/services/surat";
import PamongForm from "@/components/PamongForm";

export default function EditPamongPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Pamong | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const id = Number(params.id);
        if (isNaN(id)) {
          toast.error("ID aparatur tidak valid");
          router.push("/pemerintah-desa");
          return;
        }

        const pamongData = await getPamongById(id);
        if (!pamongData) {
          toast.error("Data aparatur tidak ditemukan");
          router.push("/pemerintah-desa");
          return;
        }

        setData(pamongData);
      } catch (error: any) {
        console.error("Error fetching pamong:", error);
        toast.error("Gagal memuat data aparatur");
        router.push("/pemerintah-desa");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-body-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-text"></div>
      </div>
    );
  }

  return (
    <PamongForm
      initialData={data}
      mode="edit"
      title="Edit Aparatur"
      subtitle="Perbarui data aparatur desa."
      backButtonHref="/pemerintah-desa"
    />
  );
}
