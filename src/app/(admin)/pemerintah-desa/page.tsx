"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Check,
  ShieldCheck, 
  XCircle,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import { 
  getPamong, 
  deletePamong,
  type Pamong 
} from '@/lib/services/surat';
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/DropdownMenu";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";

export default function PemerintahDesaPage() {
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | null>(null); // null = all, 1 = active, 0 = inactive
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchPamong();
  }, []);

  const fetchPamong = async () => {
    try {
      setLoading(true);
      const data = await getPamong();
      setPamongList(data || []);
    } catch (error: any) {
      console.error("Error fetching pamong:", error);
      toast.error(`Gagal memuat data aparatur: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data aparatur ini?")) {
      try {
        await deletePamong(id);
        toast.success("Data aparatur berhasil dihapus");
        fetchPamong();
      } catch (error: any) {
        console.error("Error deleting pamong:", error);
        toast.error(`Gagal menghapus data aparatur: ${error.message || "Terjadi kesalahan"}`);
      }
    }
  };

  // Filter Logic
  const filteredPamong = useMemo(() => {
    return pamongList.filter(p => {
      // Filter by Status
      if (filterStatus !== null && p.pamong_status !== filterStatus) {
        return false;
      }
  
      const name = p.pamong_nama || p.penduduk?.nama || "";
      const nip = p.pamong_nip || "";
      const niap = p.pamong_niap || "";
      const term = searchTerm.toLowerCase();
      
      return name.toLowerCase().includes(term) ||
        nip.includes(searchTerm) ||
        niap.includes(searchTerm);
    });
  }, [pamongList, filterStatus, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPamong.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredPamong.slice(startIndex, startIndex + pageSize);

  // Columns Configuration
  const columns: Column<Pamong>[] = [
    { 
      header: "No", 
      accessorKey: "id", 
      className: "text-center w-12",
      cell: (row) => {
        const index = filteredPamong.findIndex(p => p.pamong_id === row.pamong_id);
        return <span>{index + 1}</span>;
      }
    },
    { 
      header: "Aparatur Desa", 
      accessorKey: "pamong_nama", 
      cell: (row) => {
        const displayName = row.pamong_nama || row.penduduk?.nama || "Tanpa Nama";
        const nik = row.penduduk?.nik || "-";
        
        return (
          <div className="flex items-center gap-3">
             <div className="flex-shrink-0">
                <Avatar 
                    src={row.foto}
                    alt={displayName}
                    fallback={displayName}
                    size="md"
                    className={row.pamong_status !== 1 ? 'grayscale' : ''}
                />
             </div>
             <div>
                <div className="font-medium text-primary-text">{displayName}</div>
                <div className="text-xs text-secondary-text">{nik}</div>
             </div>
          </div>
        );
      }
    },
    { 
      header: "Jabatan", 
      accessorKey: "jabatan",
      cell: (row) => (
        <div>
            <div className="text-sm text-primary-text">{row.pamong_pangkat || "Perangkat Desa"}</div>
            <div className="text-xs text-secondary-text">{row.jabatan || "-"}</div>
        </div>
      )
    },
    { 
      header: "NIP / NIAP", 
      accessorKey: "pamong_nip",
      className: "font-mono text-xs",
      cell: (row) => row.pamong_nip || row.pamong_niap || row.penduduk?.nik || "-"
    },
    { 
      header: "Status", 
      accessorKey: "pamong_status", 
      className: "text-center",
      cell: (row) => (
        <Badge variant={row.pamong_status === 1 ? "success" : "default"}>
            {row.pamong_status === 1 ? "Aktif" : "Tidak Aktif"}
        </Badge>
      )
    },
    { 
      header: "Tanda Tangan", 
      accessorKey: "pamong_ttd", 
      className: "text-center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1.5">
            {row.pamong_ttd === 1 ? (
                <>
                    <ShieldCheck className="w-4 h-4 text-success-text" />
                    <span className="text-xs text-success-text font-medium">Otoritas</span>
                </>
            ) : (
                <>
                    <XCircle className="w-4 h-4 text-secondary-text" />
                    <span className="text-xs text-secondary-text">No Access</span>
                </>
            )}
        </div>
      )
    },
    { 
      header: "Aksi", 
      accessorKey: "pamong_id", 
      className: "text-center",
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
                        <Link href={`/pemerintah-desa/edit/${row.pamong_id}`} className="flex items-center w-full">
                            <Edit2 className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                            Edit Data
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => handleDelete(row.pamong_id)}
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
  const mobileConfig: MobileConfig<Pamong> = {
    titleKey: (row) => row.pamong_nama || row.penduduk?.nama || "Tanpa Nama",
    subtitleKey: (row) => (
        <span>{row.jabatan || "-"} • {row.pamong_status === 1 ? "Aktif" : "Tidak Aktif"}</span>
    ),
    statusKey: (row) => (
         <div className="flex items-center gap-1">
            {row.pamong_ttd === 1 && <ShieldCheck className="w-4 h-4 text-success-text" />}
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
                    <Link href={`/pemerintah-desa/edit/${row.pamong_id}`} className="flex items-center w-full">
                        <Edit2 className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                        Edit Data
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={() => handleDelete(row.pamong_id)}
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
        title="Pemerintah Desa" 
        subtitle="Kelola data aparatur dan perangkat desa"
      />

      {/* Toolbar */}
      <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search & Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-secondary-text" />
                    </div>
                    <Input 
                      type="text" 
                      className="pl-9 bg-card-bg border-border-color text-primary-text"
                      placeholder="Cari nama atau NIP..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="text-secondary-text whitespace-nowrap">
                             <Filter className="w-3.5 h-3.5 mr-2" />
                             <span className="text-xs font-medium hidden sm:inline">Filter Status</span>
                             {filterStatus !== null && (
                                <span className="ml-1.5 flex h-1.5 w-1.5 rounded-full bg-primary-text" />
                             )}
                         </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-52">
                         <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                            <span className={`flex-1 ${filterStatus === null ? 'font-medium' : ''}`}>Semua</span>
                            {filterStatus === null && <Check className="h-3.5 w-3.5" />}
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus(1)}>
                            <span className={`flex-1 ${filterStatus === 1 ? 'font-medium' : ''}`}>Aktif</span>
                            {filterStatus === 1 && <Check className="h-3.5 w-3.5" />}
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus(0)}>
                            <span className={`flex-1 ${filterStatus === 0 ? 'font-medium' : ''}`}>Tidak Aktif</span>
                            {filterStatus === 0 && <Check className="h-3.5 w-3.5" />}
                         </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button variant="outline" size="icon" title="Export PDF">
                      <Download className="w-3.5 h-3.5 text-secondary-text" />
                  </Button>

                  <Link href="/pemerintah-desa/tambah">
                      <Button className="whitespace-nowrap">
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Tambah Aparatur
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
          totalItems={filteredPamong.length}
          itemsPerPage={pageSize}
          onItemsPerPageChange={setPageSize}
          sticky={true}
      />
    </div>
  );
}
