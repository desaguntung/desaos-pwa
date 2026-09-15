"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { getPermohonanSurat, PermohonanSurat } from "@/lib/services/surat";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/DropdownMenu";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function PermohonanSuratPage() {
  const [permohonanList, setPermohonanList] = useState<PermohonanSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suratToDelete, setSuratToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const totalPages = Math.max(1, Math.ceil(filteredPermohonan.length / rowsPerPage));
  const paginatedPermohonan = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPermohonan.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPermohonan, currentPage, rowsPerPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const confirmDelete = (id: number) => {
    setSuratToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!suratToDelete) return;
    
    setIsDeleting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("permohonan_surat").delete().eq("id", suratToDelete);
      setPermohonanList((prev) => prev.filter((item) => item.id !== suratToDelete));
      toast.success("Permohonan surat berhasil dihapus");
      setDeleteDialogOpen(false);
      setSuratToDelete(null);
    } catch (error: any) {
      console.error("Error deleting permohonan:", error);
      toast.error(`Gagal menghapus permohonan: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<Column<PermohonanSurat>[]>(() => [
    {
      header: "Pemohon",
      accessorKey: "penduduk.nama",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-primary-text capitalize">
            {row.penduduk?.nama?.toLowerCase() || "Tanpa Nama"}
          </span>
          <span className="text-xs text-secondary-text font-mono flex items-center gap-1">
            <User className="w-3 h-3" />
            {row.penduduk?.nik || "-"}
          </span>
        </div>
      )
    },
    {
      header: "Jenis Surat",
      accessorKey: "surat_formats.nama",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-secondary-text" />
          <span className="text-sm text-primary-text">{row.surat_formats?.nama || "Unknown"}</span>
        </div>
      )
    },
    {
      header: "Tanggal Request",
      accessorKey: "created_at",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-secondary-text" />
          <span className="text-sm text-secondary-text">
            {row.created_at ? formatDate(row.created_at) : "-"}
          </span>
        </div>
      )
    },
    {
      header: "No. HP",
      accessorKey: "no_hp_aktif",
      cell: (row) => (
         <span className="text-sm text-secondary-text font-mono">
            {row.no_hp_aktif || "-"}
         </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        switch (row.status) {
          case 0:
            return <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>Menunggu</Badge>;
          case 1:
            return <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>Disetujui</Badge>;
          case 2:
            return <Badge variant="error" icon={<XCircle className="w-3 h-3" />}>Ditolak</Badge>;
          default:
            return <Badge variant="default">Unknown</Badge>;
        }
      }
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center w-16",
      cell: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost-secondary"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Aksi Permohonan</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => toast.info(`Fitur detail untuk ID ${row.id} sedang dalam sinkronisasi.`)}
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => confirmDelete(row.id!)}
                className="text-error-text focus:text-error-text focus:bg-error-bg/10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6 p-6 md:p-8 pb-24">
      <PageHeader 
        title="Permohonan Surat" 
        subtitle="Layanan Surat / Permohonan"
      />

      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1 max-w-sm">
            <Input
              startIcon={<Search className="w-4 h-4" />}
              placeholder="Cari Nama / NIK / Jenis Surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={paginatedPermohonan}
        isLoading={loading}
        emptyMessage={
          <div className="flex flex-col items-center justify-center py-12">
             <Mail className="w-12 h-12 text-secondary-text/50 mb-4" />
             <p className="text-secondary-text font-medium text-base">
               {searchTerm ? "Tidak ada permohonan yang cocok" : "Belum ada data permohonan"}
             </p>
          </div>
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={rowsPerPage}
        onItemsPerPageChange={setRowsPerPage}
        totalItems={filteredPermohonan.length}
        sticky={true}
      />
      
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Permohonan?"
        description="Apakah Anda yakin ingin menghapus permohonan surat ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Permohonan"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
