"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateResident, getResidentByNIK, Resident } from "@/lib/services/penduduk";
import ResidentForm from "@/components/ResidentForm";
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
      <div className="flex flex-col h-full bg-body-bg items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-secondary-text text-sm animate-pulse">Memuat data penduduk...</p>
        </div>
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
            className="px-4 py-2 text-sm font-medium text-card-bg bg-primary-text rounded-lg hover:opacity-90 transition-colors"
          >
            Kembali ke Data Penduduk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ResidentForm
      mode="edit"
      initialData={resident}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title="Edit Penduduk"
      subtitle="Perbarui data penduduk yang sudah ada di sistem."
      backButtonHref="/penduduk"
    />
  );
}
