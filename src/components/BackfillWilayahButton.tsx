"use client";

import { useState } from "react";
import { backfillWilayahAction } from "@/app/actions/penduduk";
import { getIdentitasDesa } from "@/lib/services/surat";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  onRefresh?: () => void;
}

export default function BackfillWilayahButton({ onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBackfill = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin memperbarui data wilayah semua penduduk yang kosong dengan data Info Desa saat ini?"
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const infoDesa = await getIdentitasDesa();
      if (!infoDesa || !infoDesa.nama_desa) {
        toast.error("Data Identitas Desa belum tersimpan di database. Silakan lengkapi Identitas Desa terlebih dahulu.");
        return;
      }

      if (!infoDesa.nama_desa || !infoDesa.nama_kecamatan || !infoDesa.nama_kabupaten || !infoDesa.nama_provinsi) {
        toast.error("Data Info Desa di database belum lengkap. Pastikan Nama Desa, Kecamatan, Kabupaten, dan Provinsi terisi.");
        return;
      }

      await backfillWilayahAction(
        infoDesa.nama_desa,
        infoDesa.nama_kecamatan,
        infoDesa.nama_kabupaten,
        infoDesa.nama_provinsi
      );

      toast.success("Berhasil memperbarui data wilayah penduduk.");
      if (onRefresh) {
        onRefresh();
      }
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`Gagal memperbarui data wilayah: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBackfill}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md transition-all shadow-sm disabled:opacity-50 cursor-pointer"
      title="Perbarui data wilayah penduduk yang kosong langsung dari Database Identitas Desa"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      <span>{loading ? "Memproses..." : "Sinkron Wilayah"}</span>
    </button>
  );
}
