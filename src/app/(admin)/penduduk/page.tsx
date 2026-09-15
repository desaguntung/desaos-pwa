"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MagnifyingGlass as Search, 
  MoreHorizontal,
  GridSquare as LayoutGrid,
  ListUnordered as ListIcon,
  Location as MapPin,
  Users,
  BookOpen,
  Heart,
  Eye,
  Pencil,
  Trash as Trash2,
  Check,
  ChartActivity as Activity,
} from "geist-icons";
import { Plus, Filter } from "lucide-react";
import { getResidents, Resident, deleteResident } from "@/lib/services/penduduk";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const calculateAge = (dateString?: string) => {
  if (!dateString) return "-";
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PendudukPage() {
  const router = useRouter();

  // State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Aktif" | "Pindah" | "Meninggal">("Semua");
  const [dusunFilter, setDusunFilter] = useState("Semua");
  const [genderFilter, setGenderFilter] = useState<"Semua" | "LAKI-LAKI" | "PEREMPUAN">("Semua");
  const [agamaFilter, setAgamaFilter] = useState("Semua");
  const [kawinFilter, setKawinFilter] = useState("Semua");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // View Mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dropdown Accordion State
  const [openFilterCategory, setOpenFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await getResidents();
      setResidents(data || []); 
    } catch (error) {
      console.error("Error fetching residents:", error);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (nik: string) => {
    router.push(`/penduduk/${nik}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, nama: string) => {
    e.stopPropagation(); // Prevent row click
    if (confirm(`Apakah Anda yakin ingin menghapus data penduduk "${nama}"?`)) {
      try {
        await deleteResident(id);
        fetchResidents();
      } catch (error) {
        console.error("Error deleting resident:", error);
        alert("Gagal menghapus data penduduk");
      }
    }
  };

  // Derived Data: Options for Filters
  const { dusunOptions, agamaOptions, kawinOptions } = useMemo(() => {
    const dusuns = new Set<string>();
    const agamas = new Set<string>();
    const kawins = new Set<string>();

    residents.forEach((r) => {
      if (r.dusun) dusuns.add(r.dusun);
      if (r.agama) agamas.add(r.agama);
      if (r.status_kawin) kawins.add(r.status_kawin);
    });

    return {
      dusunOptions: Array.from(dusuns).sort(),
      agamaOptions: Array.from(agamas).sort(),
      kawinOptions: Array.from(kawins).sort()
    };
  }, [residents]);

  // Filter Logic
  const filteredResidents = useMemo(() => {
    let filtered = residents;

    // Status Filter
    if (statusFilter !== "Semua") {
      filtered = filtered.filter((r) => {
         const status = r.status_penduduk || "Aktif";
         return status === statusFilter;
      });
    }

    // Dusun Filter
    if (dusunFilter !== "Semua") {
      filtered = filtered.filter((r) => r.dusun === dusunFilter);
    }

    // Gender Filter
    if (genderFilter !== "Semua") {
      const targetChar = genderFilter === "LAKI-LAKI" ? "L" : "P";
      filtered = filtered.filter((r) => 
        r.jenis_kelamin && r.jenis_kelamin.toUpperCase().startsWith(targetChar)
      );
    }

    // Agama Filter
    if (agamaFilter !== "Semua") {
      filtered = filtered.filter((r) => r.agama === agamaFilter);
    }

    // Status Kawin Filter
    if (kawinFilter !== "Semua") {
      filtered = filtered.filter((r) => r.status_kawin === kawinFilter);
    }

    // Search Filter
    const searchLower = searchTerm.toLowerCase();
    if (searchLower) {
      filtered = filtered.filter((r) => 
        r.nik.toLowerCase().includes(searchLower) ||
        r.nama.toLowerCase().includes(searchLower) ||
        (r.no_kk && r.no_kk.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      const valA = a.nama || "";
      const valB = b.nama || "";
      return sortDirection === "asc" 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });
  }, [residents, statusFilter, dusunFilter, genderFilter, agamaFilter, kawinFilter, searchTerm, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredResidents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredResidents.slice(startIndex, endIndex);

  // Helper function for status badge color
  const getBadgeVariant = (status?: string | null): "success" | "error" | "info" | "default" => {
    if (!status) return "success";
    const s = status.toUpperCase();
    if (["MATI", "PINDAH", "HILANG", "MENINGGAL"].includes(s)) return "error";
    if (["PENDATANG"].includes(s)) return "info";
    return "success";
  };

  const columns: Column<Resident>[] = [
    { 
      header: "No", 
      accessorKey: "id", 
      className: "text-center w-[50px]", 
      cell: (row) => {
        // Find index in filteredResidents
        const index = filteredResidents.findIndex(r => r.id === row.id);
        return <span>{index + 1}</span>;
      }
    },
    { 
      header: "Nama Lengkap", 
      accessorKey: "nama", 
      className: "font-medium capitalize min-w-[200px]",
      cell: (row) => (row.nama || "").toLowerCase()
    },
    { 
      header: "NIK", 
      accessorKey: "nik", 
      className: "font-mono text-xs" 
    },
    { 
      header: "No. KK", 
      accessorKey: "no_kk", 
      className: "font-mono text-xs" 
    },
    { 
      header: "L/P", 
      accessorKey: "jenis_kelamin", 
      cell: (row) => (
        <Badge 
            variant={(row.jenis_kelamin || "").toUpperCase().startsWith("L") ? "info" : "error"}
            className="w-5 h-5 p-0 justify-center text-[10px]"
        >
            {(row.jenis_kelamin || "-").charAt(0).toUpperCase()}
        </Badge>
      ),
      className: "text-center"
    },
    { 
      header: "Tempat Lahir", 
      accessorKey: "tempat_lahir", 
      className: "capitalize",
      cell: (row) => (row.tempat_lahir || "").toLowerCase()
    },
    { 
      header: "Tgl Lahir", 
      accessorKey: "tanggal_lahir", 
      cell: (row) => <span className="whitespace-nowrap">{formatDate(row.tanggal_lahir)}</span> 
    },
    { 
      header: "USIA", 
      accessorKey: "tanggal_lahir", 
      className: "text-left",
      cell: (row) => `${calculateAge(row.tanggal_lahir)} Thn`
    },
    { 
      header: "Dusun", 
      accessorKey: "dusun", 
      className: "uppercase",
      cell: (row) => (row.dusun || "").toUpperCase()
    },
    { 
      header: "Status", 
      accessorKey: "status_penduduk", 
      className: "text-center", 
      cell: (row) => (
        <Badge variant={getBadgeVariant(row.status_penduduk)}>
            {row.status_penduduk || "Aktif"}
        </Badge>
      ) 
    },
    { 
      header: "Aksi", 
      accessorKey: "id", 
      className: "text-center", 
      cell: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-secondary-text">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => handleDetail(row.nik)}>
                        <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                        Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/penduduk/edit/${row.nik}`)}>
                        <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                        Edit Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={(e) => handleDelete(e as any, row.id!, row.nama)}
                        variant="destructive"
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

  const mobileConfig: MobileConfig<Resident> = {
    titleKey: (row) => <span className="capitalize">{(row.nama || "").toLowerCase()}</span>,
    subtitleKey: (row) => (
      <span>{row.nik} • {calculateAge(row.tanggal_lahir)} Thn • {row.dusun}</span>
    ),
    statusKey: (row) => (
      <Badge variant={getBadgeVariant(row.status_penduduk)} className="text-[10px] px-1.5 h-5">
        {row.status_penduduk || "Aktif"}
      </Badge>
    ),
    action: (row) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-secondary-text">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => handleDetail(row.nik)}>
                    <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                    Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/penduduk/edit/${row.nik}`)}>
                    <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                    Edit Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={(e) => handleDelete(e as any, row.id!, row.nama)}
                    variant="destructive"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Hapus Data
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
  };

  const FilterList = () => (
    <div className="w-full text-sm text-primary-text">
      {/* Group 1: Filter by */}
      <div className="py-1">
        <div className="px-3 py-2">
          <span className="text-[11px] text-secondary-text font-medium">Filter by</span>
        </div>
        
        {/* Status */}
        <div className="px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal h-auto py-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'status' ? null : 'status'); }}
          >
            <Activity className="mr-3 h-3.5 w-3.5 text-secondary-text" />
            <span className="flex-1 text-left">Status</span>
            {statusFilter !== "Semua" && <span className="text-[10px] bg-body-bg border border-border-color px-1.5 py-0.5 rounded text-secondary-text">{statusFilter}</span>}
          </Button>
          {openFilterCategory === 'status' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {["Semua", "Aktif", "Pindah", "Meninggal"].map(val => (
                <Button 
                  key={val} 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setStatusFilter(val as any); setCurrentPage(1); }} 
                  className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                >
                  <span className="flex-1 text-left">{val}</span>
                  {statusFilter === val && <Check className="h-3 w-3 text-primary-text" />}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Dusun */}
        <div className="px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal h-auto py-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'dusun' ? null : 'dusun'); }}
          >
            <MapPin className="mr-3 h-3.5 w-3.5 text-secondary-text" />
            <span className="flex-1 text-left">Dusun</span>
            {dusunFilter !== "Semua" && <span className="text-[10px] bg-body-bg border border-border-color px-1.5 py-0.5 rounded text-secondary-text truncate max-w-[80px]">{dusunFilter}</span>}
          </Button>
          {openFilterCategory === 'dusun' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
              <Button 
                onClick={() => { setDusunFilter("Semua"); setCurrentPage(1); }} 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
              >
                <span className="flex-1 text-left">Semua</span>
                {dusunFilter === "Semua" && <Check className="h-3 w-3 text-primary-text" />}
              </Button>
              {dusunOptions.map(d => (
                <Button 
                  key={d} 
                  onClick={() => { setDusunFilter(d); setCurrentPage(1); }} 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                >
                  <span className="flex-1 text-left">{d}</span>
                  {dusunFilter === d && <Check className="h-3 w-3 text-primary-text" />}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal h-auto py-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'gender' ? null : 'gender'); }}
          >
            <Users className="mr-3 h-3.5 w-3.5 text-secondary-text" />
            <span className="flex-1 text-left">Gender</span>
            {genderFilter !== "Semua" && <span className="text-[10px] bg-body-bg border border-border-color px-1.5 py-0.5 rounded text-secondary-text">{genderFilter === "LAKI-LAKI" ? "L" : "P"}</span>}
          </Button>
          {openFilterCategory === 'gender' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
               {[
                   { val: "Semua", label: "Semua" },
                   { val: "LAKI-LAKI", label: "Laki-laki" },
                   { val: "PEREMPUAN", label: "Perempuan" }
               ].map(({val, label}) => (
                <Button 
                  key={val} 
                  onClick={() => { setGenderFilter(val as any); setCurrentPage(1); }} 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                >
                  <span className="flex-1 text-left">{label}</span>
                  {genderFilter === val && <Check className="h-3 w-3 text-primary-text" />}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Agama */}
        <div className="px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal h-auto py-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'agama' ? null : 'agama'); }}
          >
            <BookOpen className="mr-3 h-3.5 w-3.5 text-secondary-text" />
            <span className="flex-1 text-left">Agama</span>
            {agamaFilter !== "Semua" && <span className="text-[10px] bg-body-bg border border-border-color px-1.5 py-0.5 rounded text-secondary-text truncate max-w-[80px]">{agamaFilter}</span>}
          </Button>
          {openFilterCategory === 'agama' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
               <Button 
                  onClick={() => { setAgamaFilter("Semua"); setCurrentPage(1); }} 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                >
                  <span className="flex-1 text-left">Semua</span>
                  {agamaFilter === "Semua" && <Check className="h-3 w-3 text-primary-text" />}
                </Button>
                {agamaOptions.map(a => (
                  <Button 
                    key={a} 
                    onClick={() => { setAgamaFilter(a); setCurrentPage(1); }} 
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                  >
                    <span className="flex-1 text-left">{a}</span>
                    {agamaFilter === a && <Check className="h-3 w-3 text-primary-text" />}
                  </Button>
                ))}
            </div>
          )}
        </div>

        {/* Kawin */}
        <div className="px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal h-auto py-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'kawin' ? null : 'kawin'); }}
          >
            <Heart className="mr-3 h-3.5 w-3.5 text-secondary-text" />
            <span className="flex-1 text-left">Status Kawin</span>
            {kawinFilter !== "Semua" && <span className="text-[10px] bg-body-bg border border-border-color px-1.5 py-0.5 rounded text-secondary-text truncate max-w-[80px]">{kawinFilter}</span>}
          </Button>
          {openFilterCategory === 'kawin' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
               <Button 
                  onClick={() => { setKawinFilter("Semua"); setCurrentPage(1); }} 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                >
                  <span className="flex-1 text-left">Semua</span>
                  {kawinFilter === "Semua" && <Check className="h-3 w-3 text-primary-text" />}
                </Button>
                {kawinOptions.map(k => (
                  <Button 
                    key={k} 
                    onClick={() => { setKawinFilter(k); setCurrentPage(1); }} 
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-start text-xs h-8 text-secondary-text hover:text-primary-text"
                  >
                    <span className="flex-1 text-left">{k}</span>
                    {kawinFilter === k && <Check className="h-3 w-3 text-primary-text" />}
                  </Button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-border-color mx-0 my-1" />

      {/* Group 2: Sort by */}
      <div className="py-1">
        <div className="px-3 py-2">
          <span className="text-[11px] text-secondary-text font-medium">Sort by</span>
        </div>
        <div className="px-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal"
            onClick={() => setSortDirection('desc')}
          >
            <span className="flex-1 pl-6.5 text-left">Activity</span>
            {sortDirection === 'desc' && <Check className="ml-auto h-3.5 w-3.5 text-primary-text" />}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start font-normal"
            onClick={() => setSortDirection('asc')}
          >
            <span className="flex-1 pl-6.5 text-left">Name</span>
            {sortDirection === 'asc' && <Check className="ml-auto h-3.5 w-3.5 text-primary-text" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Penduduk" 
        subtitle="Kelola data kependudukan desa"
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
                      type="text" 
                      className="pl-9"
                      placeholder="Cari penduduk..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  {/* Filter Button */}
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="text-secondary-text">
                             <Filter className="w-3.5 h-3.5 mr-2" />
                             <span className="text-xs font-medium">Filter</span>
                             {(statusFilter !== "Semua" || dusunFilter !== "Semua" || genderFilter !== "Semua" || agamaFilter !== "Semua" || kawinFilter !== "Semua") && (
                               <div className="ml-2 w-1.5 h-1.5 rounded-full bg-accent" />
                             )}
                         </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent 
                        align="start" 
                        className="w-[280px] p-0"
                        sideOffset={8}
                        onInteractOutside={() => setOpenFilterCategory(null)}
                      >
                          <FilterList />
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              {/* Add Button */}
              <Link href="/penduduk/tambah">
                 <Button variant="primary" className="w-full md:w-auto">
                     <Plus className="w-4 h-4 mr-2" />
                     Tambah Penduduk
                 </Button>
              </Link>
          </div>
       </Card>

      {/* DataTable */}
      <DataTable 
          columns={columns}
          data={currentData}
          mobileConfig={mobileConfig}
          onRowClick={(row) => handleDetail(row.nik)}
          loading={loading}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredResidents.length}
        itemsPerPage={pageSize}
        onItemsPerPageChange={setPageSize}
        sticky={true}
      />
    </div>
  )
}
