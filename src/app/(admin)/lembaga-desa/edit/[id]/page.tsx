"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LembagaForm } from "@/components/LembagaForm";
import { getLembagaById } from "@/lib/services/lembaga";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditLembagaPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        if (!id) {
          toast.error("ID lembaga tidak valid");
          router.push("/lembaga-desa");
          return;
        }

        const lembagaData = await getLembagaById(id);
        if (!lembagaData) {
          toast.error("Data lembaga tidak ditemukan");
          router.push("/lembaga-desa");
          return;
        }

        setData(lembagaData);
      } catch (error: any) {
        console.error("Error fetching lembaga:", error);
        toast.error("Gagal memuat data lembaga");
        router.push("/lembaga-desa");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-text" />
      </div>
    );
  }

  return (
    <LembagaForm
      mode="edit"
      initialData={data}
      title="Edit Lembaga"
      subtitle="Perbarui data lembaga desa."
      backButtonHref="/lembaga-desa"
    />
  );
}
