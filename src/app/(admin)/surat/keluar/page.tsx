"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search
} from "lucide-react";
import { getLogSurat, LogSurat } from "@/lib/services/surat";
import SuratKeluarTableRow from "@/components/SuratKeluarTableRow";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SuratKeluarPage() {
  const router = useRouter();
  const [suratList, setSuratList] = useState<(LogSurat & { 
    tweb_surat_format?: { nama: string };
    penduduk?: { nama: string; nik: string };
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSurat();
  }, []);

  const fetchSurat = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLogSurat();
      setSuratList(data || []);
    } catch (error: any) {
      console.error("Error fetching surat keluar:", error);
      setError(error.message || "Gagal memuat data surat keluar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip surat ini?")) {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.from("log_surat").delete().eq("id", id);
        setSuratList((prev) => prev.filter((s) => s.id !== id));
      } catch (error: any) {
        console.error("Error deleting surat:", error);
        alert(`Gagal menghapus surat: ${error.message || "Terjadi kesalahan saat menghapus data."}`);
      }
    }
  };

  const handleCetak = (id: number) => {
    // Redirect to view/print page
    router.push(`/surat/view/${id}`);
  };

  const filteredSurat = useMemo(() => {
    return suratList.filter((s) => 
      (s.no_surat && s.no_surat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.nama_surat && s.nama_surat.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suratList, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader 
        title="Surat Keluar" 
        subtitle="Layanan Surat / Surat Keluar"
        actions={
          <Link
            href="/surat/cetak"
            className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Surat Baru</span>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {/* Filter Toolbar */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
            <br />
            <span className="text-xs text-red-500 mt-1 block">
              Kemungkinan penyebab: Tabel belum dibuat atau relasi tabel (Foreign Key) belum ada. Silakan jalankan script SQL pembuatan tabel surat kembali.
            </span>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-zinc-100 shadow-xs">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-xs sm:text-sm"
              placeholder="Cari Nomor Surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider text-center w-12">No</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Nomor Surat</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Jenis Surat</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Tujuan</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-secondary-text">
                      Loading data...
                    </td>
                  </tr>
                ) : filteredSurat.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-secondary-text">
                      Belum ada arsip surat keluar
                    </td>
                  </tr>
                ) : (
                  filteredSurat.map((surat, index) => (
                    <SuratKeluarTableRow
                      key={surat.id}
                      surat={surat}
                      rowNumber={index + 1}
                      onCetak={handleCetak}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
