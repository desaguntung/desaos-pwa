"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MagnifyingGlass as Search, 
  MoreHorizontal, 
  Trash as Trash2, 
  Pencil as Edit, 
  Eye, 
  Filter as FilterIcon,
  Users,
  Check
} from "geist-icons";
import { Plus } from "lucide-react";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { getKeluargaList, deleteKeluarga, Keluarga } from "@/lib/services/keluarga";
import { Resident } from "@/lib/services/penduduk";

// UI Components
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export default function KeluargaPage() {
  const router = useRouter();
  const resource: PermissionResource = "keluarga";
  const { canRead, canCreate, canUpdate, canDelete } = useRbac(resource);

  // Data States
  const [data, setData] = useState<Keluarga[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [dusunFilter, setDusunFilter] = useState<string>("Semua");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedKeluarga, setSelectedKeluarga] = useState<Keluarga | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getKeluargaList();
      setData(result);
    } catch (error) {
      console.error("Error fetching keluarga:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derived Data: Dusun Options
  const dusunOptions = useMemo(() => {
    const dusuns = new Set<string>();
    data.forEach((item) => {
      if (item.dusun) dusuns.add(item.dusun);
    });
    return Array.from(dusuns).sort();
  }, [data]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = 
        item.nomorKK.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.headNik.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "Semua" || item.status === statusFilter;
      const matchesDusun = dusunFilter === "Semua" || item.dusun === dusunFilter;

      return matchesSearch && matchesStatus && matchesDusun;
    });
  }, [data, searchTerm, statusFilter, dusunFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Actions
  const handleDelete = async (keluarga: Keluarga) => {
    if (!canDelete) return;
    
    if (confirm(`Yakin ingin menghapus KK ${keluarga.nomorKK}? Semua anggota akan dihapus nomor KK-nya.`)) {
      try {
        await deleteKeluarga(keluarga.nomorKK, keluarga.members);
        await fetchData(); // Refresh data
      } catch (error) {
        console.error("Failed to delete keluarga", error);
        alert("Gagal menghapus data keluarga.");
      }
    }
  };

  const handleViewDetail = (keluarga: Keluarga) => {
    setSelectedKeluarga(keluarga);
    setDetailOpen(true);
  };

  // Columns Configuration
  const columns: Column<Keluarga>[] = [
    {
      header: "Kepala Keluarga",
      accessorKey: "headName",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar 
            alt={row.headName} 
            fallback={row.headName.substring(0, 2).toUpperCase()}
            size="md"
            shape="circle"
          />
          <div className="flex flex-col">
            <span className="font-medium text-primary-text">{row.headName}</span>
            <span className="text-xs text-secondary-text">NIK: {row.headNik}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Nomor KK",
      accessorKey: "nomorKK",
      className: "font-medium font-mono text-xs",
    },
    {
      header: "Alamat",
      accessorKey: "addressLine",
      cell: (row) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="truncate" title={row.addressLine}>{row.addressLine || "-"}</span>
          <span className="text-xs text-secondary-text truncate">{row.dusunRwRt}</span>
        </div>
      ),
    },
    {
      header: "Anggota",
      accessorKey: "totalMembers",
      cell: (row) => (
        <Badge variant="outline" className="gap-1">
          <Users className="w-3 h-3" />
          {row.totalMembers}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <Badge variant={row.statusVariant}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-text hover:text-primary-text">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewDetail(row)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4 text-secondary-text" />
              Lihat Anggota
            </DropdownMenuItem>
            {canUpdate && (
              <Link href={`/keluarga/${row.nomorKK}/edit`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4 text-secondary-text" />
                  Ubah
                </DropdownMenuItem>
              </Link>
            )}
            {canDelete && (
              <DropdownMenuItem 
                variant="destructive"
                className="cursor-pointer"
                onClick={() => handleDelete(row)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const mobileConfig: MobileConfig<Keluarga> = {
    titleKey: "headName",
    subtitleKey: "nomorKK",
    statusKey: (row) => (
      <Badge variant={row.statusVariant} className="text-[10px] px-1.5 h-5">
        {row.status}
      </Badge>
    ),
    action: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-text hover:text-primary-text">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
           <DropdownMenuItem onClick={() => handleViewDetail(row)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4 text-secondary-text" />
              Lihat Anggota
            </DropdownMenuItem>
            {canUpdate && (
              <Link href={`/keluarga/${row.nomorKK}/edit`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4 text-secondary-text" />
                  Ubah
                </DropdownMenuItem>
              </Link>
            )}
            {canDelete && (
              <DropdownMenuItem 
                variant="destructive"
                className="cursor-pointer"
                onClick={() => handleDelete(row)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  return (
    <div className="flex flex-col h-full bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Data Keluarga"
        subtitle="Kependudukan / Keluarga"
      />

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-text" />
              </div>
              <Input
                placeholder="Cari KK, Nama Kepala, NIK..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-card-bg border-border-color text-primary-text"
              />
            </div>

            {/* Filter Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-secondary-text bg-card-bg border-border-color gap-2 h-9 border-dashed">
                  <FilterIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Status</span>
                  {statusFilter !== "Semua" && (
                    <Badge variant="default" className="ml-1 h-5 px-1">
                      {statusFilter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["Semua", "Aktif", "Pindah", "Meninggal"].map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => setStatusFilter(status)}
                    className="justify-between cursor-pointer"
                  >
                    {status}
                    {statusFilter === status && <Check className="h-3.5 w-3.5 opacity-50" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dusun */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-secondary-text bg-card-bg border-border-color gap-2 h-9 border-dashed">
                  <FilterIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Dusun</span>
                  {dusunFilter !== "Semua" && (
                    <Badge variant="default" className="ml-1 h-5 px-1">
                      {dusunFilter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <DropdownMenuLabel>Filter Dusun</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDusunFilter("Semua")} className="justify-between cursor-pointer">
                  Semua
                  {dusunFilter === "Semua" && <Check className="h-3.5 w-3.5 opacity-50" />}
                </DropdownMenuItem>
                {dusunOptions.map((dusun) => (
                  <DropdownMenuItem 
                    key={dusun} 
                    onClick={() => setDusunFilter(dusun)}
                    className="justify-between cursor-pointer"
                  >
                    {dusun}
                    {dusunFilter === dusun && <Check className="h-3.5 w-3.5 opacity-50" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {canCreate && (
              <Link href="/keluarga/tambah">
                <Button className="gap-2 h-9">
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Tambah Keluarga</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* DataTable */}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Keluarga</DialogTitle>
            <DialogDescription>
              Nomor KK: <span className="font-mono font-medium text-primary-text">{selectedKeluarga?.nomorKK}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedKeluarga && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-body-bg p-4 rounded-lg">
                <div>
                  <label className="text-xs text-secondary-text block mb-1">Kepala Keluarga</label>
                  <div className="font-medium text-primary-text">{selectedKeluarga.headName}</div>
                  <div className="text-sm text-secondary-text">{selectedKeluarga.headNik}</div>
                </div>
                <div>
                  <label className="text-xs text-secondary-text block mb-1">Alamat</label>
                  <div className="text-sm text-primary-text">{selectedKeluarga.addressLine}</div>
                  <div className="text-xs text-secondary-text">{selectedKeluarga.dusunRwRt}</div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-text" />
                  Daftar Anggota Keluarga ({selectedKeluarga.members.length})
                </h4>
                <div className="border border-border-color rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-body-bg text-secondary-text font-medium text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">NIK</th>
                        <th className="px-4 py-3">Hubungan</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                      {selectedKeluarga.members.map((member) => (
                        <tr key={member.id} className="hover:bg-body-bg/50">
                          <td className="px-4 py-3 font-medium">{member.nama}</td>
                          <td className="px-4 py-3 font-mono text-xs">{member.nik}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px] h-5">
                              {member.hubungan_keluarga}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "text-xs font-medium",
                              member.status_penduduk === "Meninggal" ? "text-error-text" :
                              member.status_penduduk === "Pindah" ? "text-info-text" :
                              "text-success-text"
                            )}>
                              {member.status_penduduk || "Aktif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
