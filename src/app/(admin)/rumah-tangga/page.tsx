"use client";

import { 
  Search, 
  MoreHorizontal,
  Home,
  Eye,
  Pencil,
  Trash2,
  Check,
  Filter as FilterIcon,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { RumahTangga, getRumahTanggaList, deleteRumahTangga } from "@/lib/services/rumah_tangga";
import { useReferenceData } from "@/lib/services/referensi";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";

export default function RumahTanggaPage() {
  const router = useRouter();
  const resource: PermissionResource = "rumah_tangga";
  const { canCreate, canUpdate, canDelete } = useRbac(resource);
  const { dusun: dusunList } = useReferenceData();

  const [dataRumahTangga, setDataRumahTangga] = useState<RumahTangga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Penerima" | "Non-Bansos">("Semua");
  const [dusunFilter, setDusunFilter] = useState("Semua");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getRumahTanggaList();
      setDataRumahTangga(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataRumahTangga([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data rumah tangga ini?")) {
      try {
        await deleteRumahTangga(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  // Extract Dusun Options (from reference service with fallback)
  const dusunOptions = useMemo(() => {
    if (dusunList && dusunList.length > 0) {
      return dusunList.map((d: any) => d.nama || d.nama_dusun || `DUSUN ${d.id}`);
    }
    const dusuns = new Set<string>();
    dataRumahTangga.forEach(item => {
      if (item.dusun) dusuns.add(item.dusun);
    });
    return Array.from(dusuns).sort();
  }, [dusunList, dataRumahTangga]);

  const filteredRumahTangga = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = dataRumahTangga;

    // Filter Status
    if (statusFilter === "Penerima") {
      data = data.filter((item) => item.bdt && item.bdt.length > 0);
    } else if (statusFilter === "Non-Bansos") {
      data = data.filter((item) => !item.bdt || item.bdt.length === 0);
    }

    // Filter Dusun
    if (dusunFilter !== "Semua") {
      data = data.filter(item => item.dusun && item.dusun.toLowerCase().includes(dusunFilter.toLowerCase()));
    }

    // Filter Search
    if (term) {
      data = data.filter((item) => {
        const nomor = (item.no_rtm || "").toLowerCase();
        const nama = (item.kepala_rtm?.nama || "").toLowerCase();
        return nomor.includes(term) || nama.includes(term);
      });
    }

    // Sort
    const sorted = [...data].sort((a, b) => {
      const left = a.no_rtm || "";
      const right = b.no_rtm || "";
      const compare = left.localeCompare(right);
      return sortDirection === "asc" ? compare : -compare;
    });

    return sorted;
  }, [dataRumahTangga, searchTerm, statusFilter, dusunFilter, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRumahTangga.length / rowsPerPage));

  const paginatedRumahTangga = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRumahTangga.slice(start, start + rowsPerPage);
  }, [filteredRumahTangga, currentPage, rowsPerPage]);

  // DataTable Columns Configuration
  const columns: Column<RumahTangga>[] = [
    {
      header: "No",
      accessorKey: "id",
      className: "w-14 text-center",
      cell: (row) => {
        const index = paginatedRumahTangga.findIndex(item => item.id === row.id);
        return (currentPage - 1) * rowsPerPage + (index >= 0 ? index + 1 : 1);
      }
    },
    {
      header: "No. RTM",
      accessorKey: "no_rtm",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-semibold text-primary-text">{row.no_rtm}</span>
          {row.bdt && row.bdt.length > 0 && (
            <Badge variant="success" className="w-fit text-[10px] px-1.5 py-0.5">
              Bansos
            </Badge>
          )}
        </div>
      )
    },
    {
      header: "Kepala Rumah Tangga",
      accessorKey: "kepala_rtm",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-secondary-text" />
          <span className="font-medium text-primary-text capitalize">
            {(row.kepala_rtm?.nama || "-").toLowerCase()}
          </span>
        </div>
      )
    },
    {
      header: "Alamat",
      accessorKey: "alamat",
      cell: (row) => <span className="text-secondary-text truncate max-w-52 block" title={row.alamat || ""}>{row.alamat || "-"}</span>
    },
    {
      header: "Dusun / RW / RT",
      accessorKey: "dusun",
      cell: (row) => (
        <span className="text-secondary-text text-xs">
          {row.dusun || "-"} / RW {row.rw || "-"} / RT {row.rt || "-"}
        </span>
      )
    },
    {
      header: "Anggota",
      accessorKey: "jumlah_anggota",
      className: "text-center",
      cell: (row) => (
        <div className="flex justify-center">
          <Badge variant="info" className="w-fit px-2.5">
            {row.jumlah_anggota || 0} Jiwa
          </Badge>
        </div>
      )
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center w-28",
      cell: (row) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-secondary-text hover:text-primary-text"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/rumah-tangga/${row.id}`} className="cursor-pointer">
                  <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/rumah-tangga/tambah?id=${row.id}`} className="cursor-pointer">
                    <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                    Edit Data
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(row.id)}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Hapus Data
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  // Mobile Configuration for DataTable
  const mobileConfig: MobileConfig<RumahTangga> = {
    titleKey: (row) => <span className="capitalize">{(row.kepala_rtm?.nama || "-").toLowerCase()}</span>,
    subtitleKey: (row) => `No. RTM: ${row.no_rtm}`,
    statusKey: (row) => (
      <div className="flex flex-col gap-1 items-end">
        <span className="text-xs text-secondary-text">{row.dusun}</span>
        {row.bdt && row.bdt.length > 0 && (
          <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
            Bansos
          </Badge>
        )}
      </div>
    ),
    action: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-secondary-text hover:text-primary-text"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/rumah-tangga/${row.id}`} className="cursor-pointer">
              <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
              Lihat Detail
            </Link>
          </DropdownMenuItem>
          {canUpdate && (
            <DropdownMenuItem asChild>
              <Link href={`/rumah-tangga/tambah?id=${row.id}`} className="cursor-pointer">
                <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                Edit Data
              </Link>
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem 
              onClick={() => handleDelete(row.id)}
              variant="destructive"
              className="cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Hapus Data
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Data Rumah Tangga"
        subtitle="Kelola data rumah tangga dan penerima bantuan sosial desa"
      />

      <Card className="p-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-text" />
            </div>
            <Input
              placeholder="Cari Rumah Tangga..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-card-bg border-border-color text-primary-text"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
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
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["Semua", "Penerima", "Non-Bansos"] as const).map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className="justify-between cursor-pointer"
                  >
                    {status}
                    {statusFilter === status && <Check className="h-3.5 w-3.5 opacity-50" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dusun Filter */}
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
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto custom-scrollbar">
                <DropdownMenuLabel>Filter Dusun</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setDusunFilter("Semua"); setCurrentPage(1); }} className="justify-between cursor-pointer">
                  Semua
                  {dusunFilter === "Semua" && <Check className="h-3.5 w-3.5 opacity-50" />}
                </DropdownMenuItem>
                {dusunOptions.map((dusun) => (
                  <DropdownMenuItem 
                    key={dusun} 
                    onClick={() => {
                      setDusunFilter(dusun);
                      setCurrentPage(1);
                    }}
                    className="justify-between cursor-pointer"
                  >
                    {dusun}
                    {dusunFilter === dusun && <Check className="h-3.5 w-3.5 opacity-50" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Button */}
            {canCreate && (
              <Link href="/rumah-tangga/tambah">
                <Button variant="primary" className="gap-1.5 h-9 w-full md:w-auto">
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Tambah Data</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginatedRumahTangga}
        mobileConfig={mobileConfig}
        loading={isLoading}
        onRowClick={(row) => router.push(`/rumah-tangga/${row.id}`)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredRumahTangga.length}
        itemsPerPage={rowsPerPage}
        onItemsPerPageChange={setRowsPerPage}
        sticky={true}
      />
    </div>
  );
}