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
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail
} from "lucide-react";
import { getPermohonanSurat, PermohonanSurat } from "@/lib/services/surat";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PermohonanSuratPage() {
  const [permohonanList, setPermohonanList] = useState<PermohonanSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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
      (item.surat_formats?.nama && item.surat_formats.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.penduduk?.nik && item.penduduk.nik.includes(searchTerm))
    );
  }, [permohonanList, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPermohonan.length / rowsPerPage);
  const paginatedPermohonan = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPermohonan.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPermohonan, currentPage, rowsPerPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: // Menunggu
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
            <Clock className="w-3.5 h-3.5" />
            Menunggu
          </span>
        );
      case 1: // Disetujui
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui
          </span>
        );
      case 2: // Ditolak
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <PageHeader 
        title="Permohonan Surat" 
        subtitle="Layanan Surat / Permohonan"
        className="mb-6"
      />

      <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
        {/* Card Wrapper */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden p-6">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                placeholder="Cari Nama / NIK / Jenis Surat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Pemohon</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Jenis Surat</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Tanggal Request</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">No. HP</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Status</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-16 border-b border-gray-200">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredPermohonan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center align-middle">
                      <div className="flex flex-col items-center justify-center py-12">
                         <Mail className="w-12 h-12 text-gray-300 mb-4" />
                         <p className="text-gray-500 font-medium text-base">
                           {searchTerm ? "Tidak ada permohonan yang cocok" : "Belum ada data permohonan"}
                         </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPermohonan.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {item.penduduk?.nama?.toLowerCase() || "Tanpa Nama"}
                          </span>
                          <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.penduduk?.nik || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{item.surat_formats?.nama || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {item.created_at ? formatDate(item.created_at) : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-500 font-mono">
                        {item.no_hp_aktif}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <button 
                          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Pagination Controls */}
          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <span className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredPermohonan.length)} dari {filteredPermohonan.length} data
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100 h-8 px-3 text-gray-500"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100 h-8 px-3 text-gray-500"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
