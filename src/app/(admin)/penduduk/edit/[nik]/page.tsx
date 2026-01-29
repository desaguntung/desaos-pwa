"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateResident, getResidentByNIK, Resident } from "@/lib/services/penduduk";
import ResidentForm from "../../../../components/ResidentForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EditPendudukPage() {
  const router = useRouter();
  const params = useParams();
  const nik = params.nik as string;

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nik) {
      fetchResident();
    }
  }, [nik]);

  const fetchResident = async () => {
    try {
      setLoading(true);
      const data = await getResidentByNIK(nik);
      if (!data) {
        setError("Data penduduk tidak ditemukan");
      } else {
        setResident(data);
      }
    } catch (err: any) {
      console.error("Error fetching resident:", err);
      setError("Gagal mengambil data penduduk");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<Resident, "id">) => {
    if (!resident?.id) return;

    try {
      setIsSubmitting(true);
      await updateResident(resident.id, data);
      router.push("/penduduk");
    } catch (error: any) {
      console.error("Error updating resident:", error);
      alert(error.message || "Gagal memperbarui data penduduk");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-body-bg">
        <PageHeader title="Edit Penduduk" showBackButton backButtonHref="/penduduk" />
        <div className="flex-1 flex items-center justify-center text-zinc-500">Loading data...</div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="flex flex-col h-full bg-body-bg">
        <PageHeader title="Edit Penduduk" showBackButton backButtonHref="/penduduk" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 font-medium">{error || "Data tidak ditemukan"}</div>
          <Link
            href="/penduduk"
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Kembali ke Data Penduduk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader
        title="Edit Penduduk"
        subtitle={`Edit data penduduk: ${resident.nama || nik}`}
        showBackButton={true}
        backButtonHref="/penduduk"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/penduduk"
              className="text-xs text-secondary-text hover:text-primary-text transition-colors"
            >
              Batal
            </Link>
            <Button
              type="submit"
              form="resident-form"
              disabled={isSubmitting}
              className="bg-zinc-900 text-white hover:bg-zinc-800 h-8 text-xs px-3"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-hidden">
        <ResidentForm
          initialData={resident}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
          hideActions={true}
        />
      </div>
    </div>
  );
}
