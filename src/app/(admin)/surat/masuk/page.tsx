"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getSuratMasuk, deleteSuratMasuk, SuratMasuk } from "@/lib/services/surat";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";

export default function SuratMasukPage() {
  const router = useRouter();
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  // Pagination Logic
  const totalPages = Math.ceil(filteredSurat.length / rowsPerPage);
  const paginatedSurat = filteredSurat.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <PageHeader 
        title="Surat Masuk" 
        subtitle="Layanan Surat / Surat Masuk"
        actions={
          <Link
            href="/surat/masuk/tambah"
            className="flex items-center gap-1.5 text-xs bg-slate-900 text-white rounded-md px-3 py-2 hover:bg-slate-800 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Surat</span>
          </Link>
        }
        className="mb-6"
      />

      <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden p-6">
          
          {/* Search Bar */}
          <div className="mb-6">
             <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                  placeholder="Cari Nomor Surat, Pengirim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-12 border-b border-gray-200">No</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Tanggal Terima</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Nomor Surat</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Pengirim</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Isi Singkat</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-10 border-b border-gray-200">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : filteredSurat.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      Belum ada data surat masuk
                    </td>
                  </tr>
                ) : (
                  paginatedSurat.map((surat, index) => (
                    <tr key={surat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-500 text-center w-12 align-middle">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(surat.tanggal_penerimaan)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Tgl Surat: {formatDate(surat.tanggal_surat)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-900">
                            {surat.nomor_surat}
                          </span>
                          <span className="text-xs text-gray-500">
                            Kode: {surat.kode_surat}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <span className="text-sm font-medium text-gray-900 capitalize block">
                          {surat.pengirim}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {surat.isi_singkat}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => handleDisposisi(surat.id)} className="cursor-pointer">
                                <FileText className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                Disposisi
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(surat.id)} className="cursor-pointer">
                                <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                Edit Data
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(surat.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Hapus Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
           <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <span className="text-sm text-gray-500">
                  Menampilkan {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredSurat.length)} dari {filteredSurat.length} data
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}