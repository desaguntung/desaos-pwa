"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react";
import { getPermohonanSurat, PermohonanSurat } from "@/lib/services/surat";
import { formatDate } from "@/lib/utils";

import { PageHeader } from "@/components/layout/PageHeader";

export default function PermohonanSuratPage() {
  const [permohonanList, setPermohonanList] = useState<PermohonanSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPermohonan();
  }, []);

  const fetchPermohonan = async () => {
    try {
      setLoading(true);
      const data = await getPermohonanSurat();
      setPermohonanList(data || []);
    } catch (error) {
      console.error("Error fetching permohonan surat:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermohonan = useMemo(() => {
    return permohonanList.filter((item) => 
      (item.penduduk?.nama && item.penduduk.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tweb_surat_format?.nama && item.tweb_surat_format.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.penduduk?.nik && item.penduduk.nik.includes(searchTerm))
    );
  }, [permohonanList, searchTerm]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3" />
            Disetujui
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg">
      <PageHeader 
        title="Permohonan Surat" 
        subtitle="Layanan Surat / Permohonan" 
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-zinc-100 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-xs sm:text-sm dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:focus:bg-zinc-900"
              placeholder="Cari Nama / NIK / Jenis Surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Pemohon</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Jenis Surat</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Tanggal Request</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">No. HP</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-secondary-text">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredPermohonan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-secondary-text">
                      Tidak ada permohonan surat ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPermohonan.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-primary-text">{item.penduduk?.nama || "Tanpa Nama"}</span>
                          <span className="text-xs text-secondary-text flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.penduduk?.nik || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-primary-text">{item.tweb_surat_format?.nama || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary-text">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {item.created_at ? formatDate(item.created_at) : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-primary-text font-mono">
                        {item.no_hp_aktif}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-zinc-100 text-secondary-text transition-colors dark:hover:bg-zinc-800"
                          title="Lihat Detail"
                          onClick={() => alert(`Fitur detail untuk ID ${item.id} belum tersedia`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
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
