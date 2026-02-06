"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2,
  Trash2,
  MapPin,
  Building2,
  Download
} from 'lucide-react';
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getLembagaList, deleteLembaga, type Lembaga } from "@/lib/services/lembaga";

export default function LembagaDesaPage() {
  const [data, setData] = useState<Lembaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getLembagaList();
      setData(result || []);
    } catch (error: any) {
      console.error(error);
      toast.error(`Gagal memuat data lembaga: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus lembaga ini?")) return;

    try {
      await deleteLembaga(id);
      toast.success("Lembaga berhasil dihapus");
      fetchData();
    } catch (error: any) {
      toast.error("Gagal menghapus: " + error.message);
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.singkatan && item.singkatan.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  // Columns Configuration
  const columns: Column<Lembaga>[] = [
    { 
      header: "No", 
      accessorKey: "id", 
      className: "text-center w-12",
      cell: (row) => {
        const index = filteredData.findIndex(item => item.id === row.id);
        return <span>{index + 1}</span>;
      }
    },
    { 
      header: "Lembaga", 
      accessorKey: "nama", 
      cell: (row) => (
        <div className="flex items-center gap-3">
           <div className="flex-shrink-0">
              <Avatar 
                  src={row.logo_url}
                  alt={row.nama}
                  fallback={row.singkatan || row.nama}
                  size="md"
                  className="bg-white" 
              />
           </div>
           <div>
              <div className="font-medium text-primary-text">{row.nama}</div>
              {row.singkatan && (
                <div className="text-xs text-secondary-text">{row.singkatan}</div>
              )}
           </div>
        </div>
      )
    },
    { 
      header: "Kategori", 
      accessorKey: "kategori",
      className: "text-center",
      cell: (row) => (
        <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold">
          {row.kategori || "Umum"}
        </Badge>
      )
    },
    { 
      header: "Alamat", 
      accessorKey: "alamat",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-secondary-text max-w-xs truncate">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate text-sm">{row.alamat || "-"}</span>
        </div>
      )
    },
    { 
      header: "Aksi", 
      accessorKey: "id", 
      className: "text-center w-16",
      cell: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-secondary-text">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                        <Link href={`/lembaga-desa/edit/${row.id}`} className="flex items-center w-full">
                            <Edit2 className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                            Edit Data
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => handleDelete(row.id)}
                        className="text-error-text focus:text-error-text focus:bg-error-bg"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Hapus Data
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    }
  ];

  // Mobile Config
  const mobileConfig: MobileConfig<Lembaga> = {
    titleKey: "nama",
    subtitleKey: (row) => (
        <span>{row.kategori || "Umum"} • {row.singkatan || "-"}</span>
    ),
    statusKey: (row) => (
         <div className="flex items-center gap-1 text-xs text-secondary-text">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">{row.alamat || "-"}</span>
         </div>
    ),
    action: (row) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-secondary-text">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                    <Link href={`/lembaga-desa/edit/${row.id}`} className="flex items-center w-full">
                        <Edit2 className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                        Edit Data
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={() => handleDelete(row.id)}
                    className="text-error-text focus:text-error-text focus:bg-error-bg"
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
      {/* Header */}
      <PageHeader
        title="Lembaga Desa"
        subtitle="Kelola data organisasi dan lembaga kemasyarakatan"
      />

      {/* Toolbar */}
      <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-secondary-text" />
                    </div>
                    <Input 
                      type="text" 
                      className="pl-9 bg-card-bg border-border-color text-primary-text"
                      placeholder="Cari nama lembaga..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button variant="outline" size="icon" title="Export Data">
                      <Download className="w-3.5 h-3.5 text-secondary-text" />
                  </Button>

                  <Link href="/lembaga-desa/tambah">
                      <Button className="whitespace-nowrap">
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Tambah Lembaga
                      </Button>
                  </Link>
              </div>
          </div>
      </Card>

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={currentData}
        mobileConfig={mobileConfig}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          itemsPerPage={pageSize}
          onItemsPerPageChange={setPageSize}
          sticky={true}
      />
    </div>
  );
}
