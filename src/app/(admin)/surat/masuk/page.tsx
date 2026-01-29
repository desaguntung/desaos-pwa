"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Download,
  Upload
} from "lucide-react";
import { getSuratMasuk, deleteSuratMasuk, SuratMasuk } from "@/lib/services/surat";
import SuratMasukTableRow from "@/components/SuratMasukTableRow";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SuratMasukPage() {
  const router = useRouter();
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSurat();
  }, []);

  const fetchSurat = async () => {
    try {
      setLoading(true);
      const data = await getSuratMasuk();
      setSuratList(data || []);
    } catch (error) {
      console.error("Error fetching surat masuk:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus surat ini?")) {
      try {
        await deleteSuratMasuk(id);
        setSuratList((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error("Error deleting surat:", error);
        alert("Gagal menghapus surat");
      }
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/surat/masuk/edit/${id}`);
  };

  const handleDisposisi = (id: number) => {
    router.push(`/surat/masuk/disposisi/${id}`);
  };

  const filteredSurat = useMemo(() => {
    return suratList.filter((s) => 
      s.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.isi_singkat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suratList, searchTerm]);

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg">
      <PageHeader 
        title="Surat Masuk" 
        subtitle="Layanan Surat / Surat Masuk"
        actions={
          <Link
            href="/surat/masuk/tambah"
            className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Surat</span>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-zinc-100 shadow-xs">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-xs sm:text-sm"
              placeholder="Cari Nomor Surat, Pengirim..."
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
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Tanggal Terima</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Nomor Surat</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Pengirim</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">Isi Singkat</th>
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
                      Belum ada data surat masuk
                    </td>
                  </tr>
                ) : (
                  filteredSurat.map((surat, index) => (
                    <SuratMasukTableRow
                      key={surat.id}
                      surat={surat}
                      rowNumber={index + 1}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDisposisi={handleDisposisi}
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
