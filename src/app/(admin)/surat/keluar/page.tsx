"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search,
  Filter,
  Mail
} from "lucide-react";
import { 
  MagnifyingGlass,
  MoreHorizontal,
  GridSquare as LayoutGrid,
  ListUnordered as ListIcon,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ChartActivity as Activity
} from "geist-icons";
import { getLogSurat, LogSurat, updateLogSuratStatus } from "@/lib/services/surat";
import SuratKeluarTableRow from "@/components/SuratKeluarTableRow";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { UploadSignedFileModal } from "@/components/UploadSignedFileModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export default function SuratKeluarPage() {
  const router = useRouter();
  const [suratList, setSuratList] = useState<(LogSurat & { 
    surat_formats?: { nama: string };
    penduduk?: { nama: string; nik: string };
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Konsep" | "Verifikasi" | "Perbaikan" | "Tanda Tangan" | "Selesai">("Semua");
  const [openFilterCategory, setOpenFilterCategory] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSuratId, setSelectedSuratId] = useState<number | null>(null);

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
        toast.success("Surat berhasil dihapus");
      } catch (error: any) {
        console.error("Error deleting surat:", error);
        toast.error(`Gagal menghapus surat: ${error.message}`);
      }
    }
  };

  const handleCetak = (id: number) => {
    router.push(`/surat/view/${id}`);
  };

  const handleStatusChange = async (id: number, status: number) => {
    try {
      await updateLogSuratStatus(id, status);
      toast.success("Status surat berhasil diperbarui");
      fetchSurat(); // Refresh to reflect changes
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status surat");
    }
  };

  const handleUploadClick = (id: number) => {
    setSelectedSuratId(id);
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchSurat();
    setIsUploadModalOpen(false);
    setSelectedSuratId(null);
  };

  const filteredSurat = useMemo(() => {
    let filtered = suratList;

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((s) => 
        (s.no_surat && s.no_surat.toLowerCase().includes(lower)) ||
        (s.nama_surat && s.nama_surat.toLowerCase().includes(lower)) ||
        (s.penduduk?.nama && s.penduduk.nama.toLowerCase().includes(lower))
      );
    }

    // Status Filter
    if (statusFilter !== "Semua") {
      const statusMap: Record<string, number> = {
        "Konsep": 0,
        "Verifikasi": 1,
        "Perbaikan": 2,
        "Tanda Tangan": 3,
        "Selesai": 4
      };
      const targetStatus = statusMap[statusFilter];
      if (targetStatus !== undefined) {
        filtered = filtered.filter(s => s.status === targetStatus);
      }
    }

    return filtered;
  }, [suratList, searchTerm, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSurat.length / pageSize);
  const paginatedSurat = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSurat.slice(startIndex, startIndex + pageSize);
  }, [filteredSurat, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const FilterList = () => (
    <div className="w-full text-sm text-primary-text">
      {/* Group 1: Filter by */}
      <div className="py-1">
        <div className="px-3 py-2">
          <span className="text-[11px] text-secondary-text font-medium">Filter by</span>
        </div>
        
        {/* Status */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-zinc-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'status' ? null : 'status'); }}
          >
            <Activity className="mr-3 h-3.5 w-3.5 text-secondary-text" />
            <span className="flex-1 text-primary-text">Status</span>
            {statusFilter !== "Semua" && <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{statusFilter}</span>}
          </button>
          {openFilterCategory === 'status' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {["Semua", "Konsep", "Verifikasi", "Perbaikan", "Tanda Tangan", "Selesai"].map(val => (
                <button key={val} onClick={() => { setStatusFilter(val as any); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-zinc-50 rounded text-secondary-text dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <span className="flex-1 text-left">{val}</span>
                  {statusFilter === val && <Check className="h-3 w-3 text-primary-text" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <PageHeader 
        title="Layanan Surat" 
        subtitle="Kelola arsip surat keluar dan status verifikasi."
        className="mb-6"
      />

      <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden p-6">
          
          {/* Toolbar & Filter */}
          <div className="flex flex-row items-center justify-between gap-3 mb-6">
            {/* Search Bar (Left) */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                placeholder="Cari Nomor Surat, Tujuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <button 
                        type="button"
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                      >
                          <Filter className="w-4 h-4 text-gray-500" />
                          {statusFilter !== "Semua" && (
                            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-slate-900 ring-1 ring-white" />
                          )}
                      </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[200px] p-0 border border-gray-200 shadow-xl rounded-xl bg-white list-none z-50"
                    sideOffset={8}
                  >
                      <FilterList />
                  </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Button */}
              <Link
                href="/surat/cetak"
                className="flex items-center gap-1.5 text-xs bg-slate-900 text-white rounded-md px-3 py-2 hover:bg-slate-800 transition-colors font-medium shadow-sm"
              >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Buat Surat Baru</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-12 border-b border-gray-200">No</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Nomor & Tanggal</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Jenis Surat</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Tujuan</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Status</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-10 border-b border-gray-200">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">
                      Memuat data...
                    </td>
                  </tr>
                ) : paginatedSurat.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center align-middle">
                      <div className="flex flex-col items-center justify-center py-12">
                         <Mail className="w-12 h-12 text-gray-300 mb-4" />
                         <p className="text-gray-500 font-medium text-base">
                           {searchTerm ? "Tidak ada surat yang cocok" : "Belum ada data surat keluar"}
                         </p>
                         <p className="text-sm text-gray-400 mt-1">
                           Silahkan buat surat baru melalui tombol di atas.
                         </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSurat.map((surat, index) => (
                    <SuratKeluarTableRow
                      key={surat.id}
                      surat={surat}
                      rowNumber={(currentPage - 1) * pageSize + index + 1}
                      onCetak={handleCetak}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      onUpload={handleUploadClick}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <span className="text-sm text-gray-500">
                Menampilkan {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredSurat.length)} dari {filteredSurat.length} data
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

      <UploadSignedFileModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        suratId={selectedSuratId}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}