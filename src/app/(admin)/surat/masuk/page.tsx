"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  ChevronDown,
  Pencil,
  Trash2,
  FileText,
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
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";

export default function SuratMasukPage() {
  const router = useRouter();
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter States
  const [filterYear, setFilterYear] = useState("Semua");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    let data = suratList;

    // Filter Year
    if (filterYear !== "Semua") {
      data = data.filter((s) => new Date(s.tanggal_penerimaan).getFullYear().toString() === filterYear);
    }

    // Filter Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((s) => 
        (s.nomor_surat || "").toLowerCase().includes(term) ||
        (s.pengirim || "").toLowerCase().includes(term) ||
        (s.isi_singkat || "").toLowerCase().includes(term)
      );
    }

    return data;
  }, [suratList, searchTerm, filterYear]);

  // Extract Years for Filter
  const availableYears = useMemo(() => {
    const years = new Set(suratList.map(s => new Date(s.tanggal_penerimaan).getFullYear().toString()));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [suratList]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredSurat.length / rowsPerPage));
  const paginatedSurat = filteredSurat.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const columns: Column<SuratMasuk>[] = useMemo(() => [
    {
      header: "Tanggal Terima",
      accessorKey: "tanggal_penerimaan",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-primary-text">
            {formatDate(row.tanggal_penerimaan)}
          </span>
          <span className="text-xs text-secondary-text">
            Tgl Surat: {formatDate(row.tanggal_surat)}
          </span>
        </div>
      )
    },
    {
      header: "Nomor Surat",
      accessorKey: "nomor_surat",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-mono text-primary-text font-medium">
            {row.nomor_surat}
          </span>
          <span className="text-xs text-secondary-text">
            Kode: {row.kode_surat || "-"}
          </span>
        </div>
      )
    },
    {
      header: "Pengirim",
      accessorKey: "pengirim",
      cell: (row) => (
        <span className="text-sm font-medium text-primary-text capitalize block">
          {(row.pengirim || "-").toLowerCase()}
        </span>
      )
    },
    {
      header: "Isi Singkat",
      accessorKey: "isi_singkat",
      cell: (row) => (
        <p className="text-sm text-secondary-text line-clamp-2 max-w-xs capitalize">
          {(row.isi_singkat || "-").toLowerCase()}
        </p>
      )
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-right",
      cell: (row) => (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-secondary-text hover:text-primary-text hover:bg-body-bg rounded-md"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleDisposisi(row.id!)} className="cursor-pointer">
                <FileText className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                Disposisi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.id!)} className="cursor-pointer">
                <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                Edit Data
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(row.id!)}
                className="text-error-text focus:text-error-text focus:bg-error-bg/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Hapus Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )
    }
  ], []);

  const mobileConfig: MobileConfig<SuratMasuk> = {
    titleKey: (row) => row.nomor_surat,
    subtitleKey: (row) => row.pengirim,
    statusKey: (row) => formatDate(row.tanggal_penerimaan),
    action: (row) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-secondary-text hover:text-primary-text hover:bg-body-bg rounded-md"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleDisposisi(row.id!)} className="cursor-pointer">
                <FileText className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                Disposisi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.id!)} className="cursor-pointer">
                <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                Edit Data
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(row.id!)}
                className="text-error-text focus:text-error-text focus:bg-error-bg/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Hapus Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
    )
  };

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Surat Masuk" 
        subtitle="Kelola dan arsipkan surat dinas masuk desa"
      />

      <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full md:w-auto flex-1 relative max-w-sm">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <Input
                type="text"
                className="pl-9"
                placeholder="Cari Nomor Surat, Pengirim..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Actions: Filter & Add */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
               {/* Filter Year */}
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-9 px-3 text-xs font-medium justify-between ${filterYear !== "Semua" ? "bg-body-bg text-primary-text" : "text-secondary-text"}`}
                  >
                    <span>Tahun: {filterYear}</span>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 text-secondary-text" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setFilterYear("Semua")}>
                    Semua
                  </DropdownMenuItem>
                  {availableYears.map(year => (
                    <DropdownMenuItem key={year} onClick={() => setFilterYear(year)}>
                      {year}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/surat/masuk/tambah">
                <Button className="gap-1.5 text-xs h-9">
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Tambah Surat Masuk</span>
                </Button>
              </Link>
            </div>
          </div>
      </Card>

      <DataTable 
          columns={columns} 
          data={paginatedSurat} 
          loading={loading}
          mobileConfig={mobileConfig}
      />

      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredSurat.length}
          itemsPerPage={rowsPerPage}
          onItemsPerPageChange={setRowsPerPage}
          sticky={true}
      />
    </div>
  );
}