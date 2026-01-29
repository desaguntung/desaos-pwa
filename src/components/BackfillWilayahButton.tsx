"use client";

import { useState } from "react";
import { backfillWilayahAction } from "@/app/actions/penduduk";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

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
      const infoDesaStr = localStorage.getItem("desaOS.infoDesa");
      if (!infoDesaStr) {
        alert("Data Info Desa tidak ditemukan di penyimpanan lokal. Silakan simpan Identitas Desa terlebih dahulu.");
        return;
      }

      const infoDesa = JSON.parse(infoDesaStr);
      if (!infoDesa.nama_desa || !infoDesa.nama_kecamatan || !infoDesa.nama_kabupaten || !infoDesa.nama_provinsi) {
         alert("Data Info Desa tidak lengkap. Pastikan Nama Desa, Kecamatan, Kabupaten, dan Provinsi terisi.");
         return;
      }

      await backfillWilayahAction(
        infoDesa.nama_desa,
        infoDesa.nama_kecamatan,
        infoDesa.nama_kabupaten,
        infoDesa.nama_provinsi
      );

      alert("Berhasil memperbarui data wilayah penduduk.");
      if (onRefresh) {
        onRefresh();
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui data wilayah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBackfill}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md transition-all shadow-sm disabled:opacity-50"
      title="Perbarui data wilayah penduduk yang kosong"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      <span>{loading ? "Memproses..." : "Sinkron Wilayah"}</span>
    </button>
  );
}
