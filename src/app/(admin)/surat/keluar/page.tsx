"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Download,
  Edit,
  Send,
  Printer,
  ChevronDown
} from "lucide-react";
import { getLogSurat, LogSurat, updateLogSuratStatus } from "@/lib/services/surat";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { UploadSignedFileModal } from "@/components/UploadSignedFileModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type SuratKeluar = LogSurat & { 
  surat_formats?: { nama: string };
  penduduk?: { nama: string; nik: string };
};

export default function SuratKeluarPage() {
  const router = useRouter();
  const [suratList, setSuratList] = useState<SuratKeluar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const STATUS_OPTIONS = ["Semua", "Konsep", "Verifikasi", "Perbaikan", "Tanda Tangan", "Selesai"] as const;
  type StatusOption = typeof STATUS_OPTIONS[number];
  const [statusFilter, setStatusFilter] = useState<StatusOption>("Semua");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSuratId, setSelectedSuratId] = useState<number | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suratToDelete, setSuratToDelete] = useState<SuratKeluar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = (surat: SuratKeluar) => {
    setSuratToDelete(surat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!suratToDelete) return;
    
    setIsDeleting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("log_surat").delete().eq("id", suratToDelete.id);
      setSuratList((prev) => prev.filter((s) => s.id !== suratToDelete.id));
      toast.success("Surat berhasil dihapus");
      setDeleteDialogOpen(false);
      setSuratToDelete(null);
    } catch (error: any) {
      console.error("Error deleting surat:", error);
      toast.error(`Gagal menghapus surat: ${error.message}`);
    } finally {
      setIsDeleting(false);
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

  const handleDownload = async (surat: SuratKeluar) => {
    if (!surat.signed_file_path) {
      handleCetak(surat.id!); 
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      toast.info("Sedang mendownload dokumen...");
      
      const { data, error } = await supabase.storage
        .from('surat-documents')
        .download(surat.signed_file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Surat-${surat.no_surat?.replace(/\//g, '-') || surat.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error("Gagal mendownload file: " + error.message);
    }
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
  const totalPages = Math.max(1, Math.ceil(filteredSurat.length / rowsPerPage));
  const paginatedSurat = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredSurat.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSurat, currentPage, rowsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const columns = useMemo<Column<SuratKeluar>[]>(() => [
    {
      header: "Nomor & Tanggal",
      accessorKey: "no_surat",
      cell: (surat) => {
        const formatDate = (dateString?: string) => {
          if (!dateString) return "-";
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "-";
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-mono text-primary-text font-medium">
              {surat.no_surat || "Belum ada nomor"}
            </span>
            <span className="text-xs text-secondary-text flex items-center gap-1">
               <FileText className="w-3 h-3" />
               {formatDate(surat.tanggal)}
            </span>
          </div>
        );
      }
    },
    {
      header: "Jenis Surat",
      accessorKey: "nama_surat",
      cell: (surat) => (
        <span className="text-sm text-primary-text font-medium">
          {surat.surat_formats?.nama || surat.nama_surat || "Surat Keterangan"}
        </span>
      )
    },
    {
      header: "Tujuan",
      accessorKey: "penduduk.nama",
      cell: (surat) => {
        if (surat.nama_non_warga) {
          return (
            <div>
              <div className="font-medium text-primary-text text-sm uppercase">{surat.nama_non_warga}</div>
              <div className="text-xs text-secondary-text">Non-Warga</div>
            </div>
          );
        }
        if (surat.penduduk) {
          return (
            <div>
              <div className="font-medium text-primary-text text-sm uppercase">{surat.penduduk.nama}</div>
              <div className="text-xs text-secondary-text font-mono">NIK: {surat.penduduk.nik}</div>
            </div>
          );
        }
        return "-";
      }
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (surat) => {
        const status = surat.status;
        switch (status) {
          case 0: return <Badge variant="outline">Konsep</Badge>;
          case 1: return <Badge variant="info">Verifikasi Sekdes</Badge>;
          case 2: return <Badge variant="error">Perbaikan</Badge>;
          case 3: return <Badge variant="warning">Tanda Tangan Kades</Badge>;
          case 4: return <Badge variant="success">Selesai</Badge>;
          default: return <Badge variant="outline">Unknown</Badge>;
        }
      }
    },
    {
      header: "Aksi",
      accessorKey: "actions",
      cell: (surat) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost-secondary"
                  className="rounded-md"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Aksi Surat</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Status-based Actions */}
                {surat.status === 0 && (
                  <DropdownMenuItem onClick={() => handleStatusChange(surat.id!, 1)}>
                    <Send className="w-3.5 h-3.5 mr-2 text-info-text" />
                    Ajukan Verifikasi
                  </DropdownMenuItem>
                )}

                {surat.status === 1 && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange(surat.id!, 3)}>
                      <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                      Verifikasi & Lanjut
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(surat.id!, 2)}>
                      <XCircle className="w-3.5 h-3.5 mr-2 text-amber-600" />
                      Perlu Perbaikan
                    </DropdownMenuItem>
                  </>
                )}

                {surat.status === 2 && (
                   <DropdownMenuItem onClick={() => handleStatusChange(surat.id!, 1)}>
                    <Send className="w-3.5 h-3.5 mr-2 text-info-text" />
                    Ajukan Ulang
                  </DropdownMenuItem>
                )}

                {surat.status === 3 && (
                  <>
                    <DropdownMenuItem onClick={() => handleUploadClick(surat.id!)}>
                      <Upload className="w-3.5 h-3.5 mr-2 text-primary-text" />
                      Upload TTD
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleStatusChange(surat.id!, 2)}>
                      <XCircle className="w-3.5 h-3.5 mr-2 text-amber-600" />
                      Tolak & Perbaikan
                    </DropdownMenuItem>
                  </>
                )}

                {surat.status === 4 && (
                   <DropdownMenuItem onClick={() => handleDownload(surat)}>
                    <Download className="w-3.5 h-3.5 mr-2 text-primary-text" />
                    Download File
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                
                {/* Common Actions */}
                <DropdownMenuItem onClick={() => handleCetak(surat.id!)}>
                  <Eye className="w-3.5 h-3.5 mr-2" />
                  Lihat Detail
                </DropdownMenuItem>
                
                {surat.status < 3 && (
                   <DropdownMenuItem onClick={() => handleCetak(surat.id!)}>
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Edit Data
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => handleCetak(surat.id!)}>
                  <Printer className="w-3.5 h-3.5 mr-2" />
                  Cetak
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => confirmDelete(surat)}
                  className="text-error-text focus:text-error-text focus:bg-error-bg/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ], [suratList]); // Re-create columns if list changes to ensure closure captures latest state if needed, though mostly relying on args

  return (
    <div className="space-y-6 p-6 md:p-8 pb-24">
      <PageHeader 
        title="Layanan Surat" 
        subtitle="Kelola arsip surat keluar dan status verifikasi."
      />

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="w-full md:w-auto flex-1 max-w-sm">
            <Input
              startIcon={<Search className="w-4 h-4" />}
              placeholder="Cari Nomor Surat, Tujuan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 shrink-0 text-secondary-text"
                >
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  <span className="hidden sm:inline text-xs font-medium">{statusFilter}</span>
                  {statusFilter !== "Semua" && (
                     <div className="ml-2 w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map(val => (
                  <DropdownMenuItem key={val} onClick={() => { setStatusFilter(val); setCurrentPage(1); }}>
                    {val}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/surat/cetak">
              <Button className="gap-1.5 h-9">
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Buat Surat</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-error-bg border border-error-border text-error-text px-4 py-3 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedSurat}
        emptyMessage={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-body-bg p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-secondary-text/50" />
            </div>
            <h3 className="text-lg font-medium text-primary-text">Belum ada surat keluar</h3>
            <p className="text-sm text-secondary-text max-w-sm mt-1 mb-4">
              Buat surat baru untuk memulai pencatatan arsip surat keluar.
            </p>
            <Link href="/surat/cetak">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Buat Surat Baru
              </Button>
            </Link>
          </div>
        }
        isLoading={loading}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredSurat.length}
        itemsPerPage={rowsPerPage}
        onItemsPerPageChange={setRowsPerPage}
        sticky={true}
      />

      <UploadSignedFileModal  
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        suratId={selectedSuratId}
        onSuccess={handleUploadSuccess}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Surat Keluar?"
        description={
          <span>
            Apakah Anda yakin ingin menghapus surat nomor <span className="font-medium text-primary-text">{suratToDelete?.no_surat || "Tanpa Nomor"}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </span>
        }
        confirmLabel="Hapus Surat"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}