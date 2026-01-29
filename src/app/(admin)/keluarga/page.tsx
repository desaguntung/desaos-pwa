"use client";

import { 
  MagnifyingGlass as Search, 
  MoreHorizontal,
  GridSquare as LayoutGrid,
  ListUnordered as ListIcon,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Location as MapPin,
  Users,
  BookOpen,
  Heart,
  Eye,
  Pencil,
  Trash as Trash2,
  Check,
  ChartActivity as Activity,
  MoreVertical
} from "geist-icons";
import { ListFilter, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { getResidents, Resident, updateResident } from "@/lib/services/penduduk";
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

type FamilyRow = {
  nomorKK: string;
  headName: string;
  headNik: string;
  addressLine: string;
  dusun: string;
  dusunRwRt: string;
  totalMembers: number;
  status: string;
  statusColor: "emerald" | "red" | "blue" | "gray";
};

const formatDateForKk = (value?: string | null): string => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match) {
    const [, year, month, day] = match;
    return `${day}-${month}-${year}`;
  }
  const matchWithTime = /^(\d{4})-(\d{2})-(\d{2})T/.exec(trimmed);
  if (matchWithTime) {
    const [, year, month, day] = matchWithTime;
    return `${day}-${month}-${year}`;
  }
  return trimmed;
};

export default function KeluargaPage() {
  const router = useRouter();
  const resource: PermissionResource = "keluarga";
  const { canRead, canCreate, canUpdate, canDelete } = useRbac(resource);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Aktif" | "Pindah" | "Meninggal">("Semua");
  const [dusunFilter, setDusunFilter] = useState("Semua");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // View Mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Dropdown Accordion State
  const [openFilterCategory, setOpenFilterCategory] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedKk, setSelectedKk] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deletingKk, setDeletingKk] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getResidents();
        setResidents(data);
      } catch (error) {
        console.error("Error fetching residents for keluarga:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const baseFamilies = useMemo<FamilyRow[]>(() => {
    if (!canRead) {
      return [];
    }

    const groups = new Map<string, Resident[]>();
    for (const person of residents) {
      const kk = person.no_kk?.trim();
      if (!kk) {
        continue;
      }
      const existing = groups.get(kk);
      if (existing) {
        existing.push(person);
      } else {
        groups.set(kk, [person]);
      }
    }

    const result: FamilyRow[] = [];
    groups.forEach((members, kk) => {
      const head =
        members.find(
          (m) =>
            (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA",
        ) ?? members[0];

      const headName = (head.nama ?? "").toUpperCase();
      const headNik = head.nik ?? "";

      const dusun = head.dusun || "";
      const rw = head.rw || "";
      const rt = head.rt || "";
      const wilayahParts: string[] = [];
      if (dusun) {
        wilayahParts.push(`Dusun ${dusun}`);
      }
      if (rw) {
        wilayahParts.push(`RW ${rw}`);
      }
      if (rt) {
        wilayahParts.push(`RT ${rt}`);
      }
      const dusunRwRt =
        wilayahParts.length > 0 ? wilayahParts.join(" / ") : "";

      const addressLine =
        head.alamat_saat_ini ||
        head.alamat_rt ||
        head.alamat_sebelumnya ||
        "";

      const statusPenduduk = head.status_penduduk || "Aktif";
      let statusColor: "emerald" | "red" | "blue" | "gray" = "emerald";
      if (statusPenduduk === "Meninggal") {
        statusColor = "red";
      } else if (statusPenduduk === "Pindah") {
        statusColor = "blue";
      }

      result.push({
        nomorKK: kk,
        headName,
        headNik,
        addressLine,
        dusun,
        dusunRwRt,
        totalMembers: members.length,
        status: statusPenduduk,
        statusColor,
      });
    });

    return result;
  }, [residents, canRead]);

  // Derived Data: Dusun Options
  const dusunOptions = useMemo(() => {
    const dusuns = new Set<string>();
    baseFamilies.forEach((f) => {
      if (f.dusun) dusuns.add(f.dusun);
    });
    return Array.from(dusuns).sort();
  }, [baseFamilies]);

  const filteredFamilies = useMemo<FamilyRow[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = baseFamilies;

    if (statusFilter !== "Semua") {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }

    if (dusunFilter !== "Semua") {
      filtered = filtered.filter((row) => row.dusun === dusunFilter);
    }

    if (term) {
      filtered = filtered.filter((row) => {
        const kk = row.nomorKK.toLowerCase();
        const name = row.headName.toLowerCase();
        const nik = row.headNik.toLowerCase();
        return kk.includes(term) || name.includes(term) || nik.includes(term);
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const leftName = a.headName || "";
      const rightName = b.headName || "";
      let compare = 0;
      if (leftName && rightName) {
        compare = leftName.localeCompare(rightName);
      } else {
        compare = a.nomorKK.localeCompare(b.nomorKK);
      }
      return sortDirection === "asc" ? compare : -compare;
    });

    return sorted;
  }, [baseFamilies, searchTerm, statusFilter, dusunFilter, sortDirection]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / rowsPerPage));

  const paginatedFamilies = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredFamilies.slice(start, start + rowsPerPage);
  }, [filteredFamilies, currentPage, rowsPerPage]);

  const handleChangePage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  const getPaginationRange = (current: number, total: number) => {
    const maxNumbers = 5; // Reduced from 15 to fit better

    if (total <= maxNumbers) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    let start = current - Math.floor(maxNumbers / 2);
    let end = current + Math.floor(maxNumbers / 2);

    if (start < 1) {
      start = 1;
      end = maxNumbers;
    }

    if (end > total) {
      end = total;
      start = total - maxNumbers + 1;
    }

    const pages: (number | string)[] = [];

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("...");
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total) {
      if (end < total - 1) {
        pages.push("...");
      }
      pages.push(total);
    }

    return pages;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: "Semua" | "Aktif" | "Pindah" | "Meninggal") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDusunFilterChange = (value: string) => {
    setDusunFilter(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleSortToggle = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const selectedFamilyMembers = useMemo(() => {
    if (!selectedKk) {
      return [];
    }
    const members = residents.filter((resident) => {
      const kk = resident.no_kk?.trim();
      return kk && kk === selectedKk;
    });
    const orderValue = (relation?: string | null) => {
      const value = (relation || "").toUpperCase();
      if (value === "KEPALA KELUARGA") {
        return 1;
      }
      if (value === "ISTRI") {
        return 2;
      }
      if (value === "SUAMI") {
        return 2;
      }
      if (value === "ANAK") {
        return 3;
      }
      return 4;
    };
    const parseDate = (value?: string | null) => {
      if (!value) {
        return null;
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return null;
      }
      return date;
    };
    return members.slice().sort((a, b) => {
      const aOrder = orderValue(a.hubungan_keluarga);
      const bOrder = orderValue(b.hubungan_keluarga);
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      if (aOrder === 3) {
        const aDate = parseDate(a.tanggal_lahir);
        const bDate = parseDate(b.tanggal_lahir);
        if (aDate && bDate && aDate.getTime() !== bDate.getTime()) {
          return aDate.getTime() - bDate.getTime();
        }
      }
      const aName = a.nama || "";
      const bName = b.nama || "";
      return aName.localeCompare(bName);
    });
  }, [selectedKk, residents]);

  const handleOpenDetail = (nomorKk: string) => {
    setSelectedKk(nomorKk);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };



  const handleDeleteFamily = async (nomorKk: string) => {
    if (!canDelete) {
      alert("Anda tidak memiliki hak untuk menghapus data keluarga.");
      return;
    }
    const confirmed = window.confirm(
      `Yakin ingin menghapus KK ${nomorKk}? Semua anggota akan dihapus nomor KK-nya.`,
    );
    if (!confirmed) {
      return;
    }
    try {
      setDeletingKk(nomorKk);
      const members = residents.filter((resident) => {
        const kk = resident.no_kk?.trim();
        return kk && kk === nomorKk;
      });
      const updates = members.map(async (resident) => {
        if (!resident.id) {
          return;
        }
        await updateResident(String(resident.id), {
          no_kk: "",
          hubungan_keluarga: "",
        });
      });
      await Promise.all(updates);
      const refreshed = await getResidents();
      setResidents(refreshed);
    } catch (error) {
      console.error("Error menghapus keluarga:", error);
      alert("Gagal menghapus data keluarga.");
    } finally {
      setDeletingKk(null);
    }
  };

  const FilterList = () => (
    <div className="w-full text-sm text-gray-700">
      {/* Group 1: Filter by */}
      <div className="py-1">
        <div className="px-3 py-2">
          <span className="text-[11px] text-gray-500 font-medium">Filter by</span>
        </div>
        
        {/* Status */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'status' ? null : 'status'); }}
          >
            <Activity className="mr-3 h-3.5 w-3.5 text-slate-500" />
            <span className="flex-1">Status</span>
            {statusFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{statusFilter}</span>}
          </button>
          {openFilterCategory === 'status' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {["Semua", "Aktif", "Pindah", "Meninggal"].map(val => (
                <button key={val} onClick={() => { setStatusFilter(val as any); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600">
                  <span className="flex-1 text-left">{val}</span>
                  {statusFilter === val && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dusun */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'dusun' ? null : 'dusun'); }}
          >
            <MapPin className="mr-3 h-3.5 w-3.5 text-slate-500" />
            <span className="flex-1">Dusun</span>
            {dusunFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[80px]">{dusunFilter}</span>}
          </button>
          {openFilterCategory === 'dusun' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
              <button onClick={() => { setDusunFilter("Semua"); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600">
                <span className="flex-1 text-left">Semua</span>
                {dusunFilter === "Semua" && <Check className="h-3 w-3" />}
              </button>
              {dusunOptions.map(d => (
                <button key={d} onClick={() => { setDusunFilter(d); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600">
                  <span className="flex-1 text-left">{d}</span>
                  {dusunFilter === d && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-gray-100 mx-0 my-1" />

      {/* Group 2: Sort by */}
      <div className="py-1">
        <div className="px-3 py-2">
          <span className="text-[11px] text-gray-500 font-medium">Sort by</span>
        </div>
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
            onClick={() => setSortDirection('desc')}
          >
            <span className="flex-1 pl-6.5">Activity</span>
            {sortDirection === 'desc' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900" />}
          </button>
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
            onClick={() => setSortDirection('asc')}
          >
            <span className="flex-1 pl-6.5">Name</span>
            {sortDirection === 'asc' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900" />}
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <div className="h-[1px] bg-gray-100 mx-0 my-1" />

        {/* Group 3: View (Mobile Only) */}
        <div className="py-1">
          <div className="px-3 py-2">
            <span className="text-[11px] text-gray-500 font-medium">View</span>
          </div>
          <div className="px-1">
            <button 
              className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="mr-3 h-3.5 w-3.5 text-slate-500" />
              <span className="flex-1">Grid View</span>
              {viewMode === 'grid' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900" />}
            </button>
            <button 
              className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="mr-3 h-3.5 w-3.5 text-slate-500" />
              <span className="flex-1">List View</span>
              {viewMode === 'list' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-body-bg">
      {/* Header */}
      <PageHeader 
        title="Data Keluarga"
        subtitle="Kependudukan / Keluarga"
      />

      <div className="flex-1 overflow-hidden p-4 md:p-6 space-y-4 flex flex-col">
        {/* Toolbar: Search, View Toggle, Filter, Add */}
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Left: Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Keluarga..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Right: View Toggle, Filter & Add */}
          <div className="flex items-center gap-2">
            {/* Desktop View Toggle */}
            <div className="hidden md:flex items-center bg-gray-100/80 p-1 rounded-lg border border-gray-200/50">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                   type="button"
                   className={`group flex items-center justify-center gap-1.5 p-2 md:px-3 md:py-2 bg-white border rounded-md hover:bg-gray-50 transition-all text-xs font-medium shadow-sm ${
                     (statusFilter !== "Semua" || dusunFilter !== "Semua")
                       ? "border-slate-300 text-slate-800" 
                       : "border-gray-200 text-slate-600"
                   }`}
                >
                   <span className="relative flex items-center">
                     <span className="hidden md:inline mr-1.5">Filter</span>
                     <Filter className="w-4 h-4 text-slate-500" />
                     {(statusFilter !== "Semua" || dusunFilter !== "Semua") && (
                       <span className="absolute -top-1 -right-1 flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                       </span>
                     )}
                   </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                 align="end" 
                 className="w-[280px] p-0 border border-gray-200 shadow-xl rounded-xl bg-white list-none z-50"
                 sideOffset={8}
                 onInteractOutside={() => setOpenFilterCategory(null)}
               >
                   <FilterList />
               </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Button */}
            {canCreate && (
              <Link
                href="/keluarga/tambah"
                className="p-2 md:px-3 md:py-2 bg-slate-900 border border-slate-900 rounded-md hover:bg-slate-800 transition-colors text-white shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-medium">Tambah</span>
              </Link>
            )}
          </div>
        </div>

        {/* Unified Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col bg-white shadow-sm">
            <div className="flex-1 overflow-auto">
              {/* Mobile Table View */}
              <table className="w-full text-left text-sm table-fixed md:hidden">
                <thead className="bg-gray-50 sticky top-0 z-20" style={{ borderBottom: '1px solid hsla(var(--ds-gray-200-value), 1)' }}>
                  <tr>
                    <th className="h-10 px-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider w-[12%] text-center border-b border-gray-200">No</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider w-[38%] border-b border-gray-200">Keluarga</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider w-[25%] border-b border-gray-200">Lokasi</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider w-[10%] text-center border-b border-gray-200">Angt</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider w-[15%] text-center border-b border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-500 text-xs">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredFamilies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-500 text-xs">
                        Tidak ada data keluarga ditemukan
                      </td>
                    </tr>
                  ) : (
                    paginatedFamilies.map((keluarga, index) => (
                      <tr 
                        key={keluarga.nomorKK} 
                        className="hover:bg-gray-50 transition-colors group cursor-pointer border-b border-gray-100 last:border-0"
                        onClick={() => handleOpenDetail(keluarga.nomorKK)}
                      >
                        <td className="py-3 px-3 align-top text-[10px] text-slate-500 text-center">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="py-3 px-3 align-top w-[38%]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[12px] text-slate-900 leading-tight font-medium">
                              {keluarga.nomorKK}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono capitalize">
                              {keluarga.headName || "-"}
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border w-fit mt-1 
                              ${keluarga.statusColor === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                                keluarga.statusColor === "red" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                keluarga.statusColor === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              {keluarga.status}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top text-[11px] text-slate-600 w-[25%]">
                          <div className="flex flex-col">
                            <span className="text-slate-900 leading-tight">
                              {keluarga.dusunRwRt}
                            </span>
                            <span className="text-slate-500 text-[10px] mt-0.5">
                              {keluarga.addressLine}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top text-[11px] text-slate-600 w-[10%] text-center">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-medium">
                            {keluarga.totalMembers}
                          </span>
                        </td>

                        <td className="py-3 px-3 align-top text-center w-[15%]">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md p-0"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={() => handleOpenDetail(keluarga.nomorKK)}>
                                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                {canUpdate && (
                                  <DropdownMenuItem asChild>
                                    <Link 
                                      href={`/keluarga/tambah?no_kk=${encodeURIComponent(keluarga.nomorKK)}`}
                                      className="flex items-center w-full cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                      Edit Data
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteFamily(keluarga.nomorKK)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    disabled={deletingKk === keluarga.nomorKK}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Hapus Data
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Desktop Table View */}
              <table className="hidden md:table w-full text-left text-sm table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200">
                  <tr>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[4%] text-center border-b border-gray-200">No</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[14%] border-b border-gray-200">Nomor KK</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[18%] border-b border-gray-200">Kepala Keluarga</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[12%] border-b border-gray-200">NIK Kepala</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[15%] border-b border-gray-200">Alamat</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[10%] border-b border-gray-200">Dusun</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-[8%] text-center border-b border-gray-200">Anggota</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right w-[10%] border-b border-gray-200">Status</th>
                    <th className="h-10 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-center w-[8%] border-b border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="h-32 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-5 w-5 border-2 border-gray-200 border-t-slate-500 rounded-full animate-spin" />
                          <span>Memuat data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredFamilies.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="h-48 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-slate-300" />
                          <p className="text-slate-900 font-medium">Tidak ada data ditemukan</p>
                          <p className="text-slate-500">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedFamilies.map((keluarga, index) => (
                      <tr 
                        key={keluarga.nomorKK} 
                        className="hover:bg-gray-50 transition-colors group cursor-pointer border-b border-gray-100 last:border-0"
                        onClick={() => handleOpenDetail(keluarga.nomorKK)}
                      >
                        <td className="py-3 px-4 align-middle text-xs text-slate-500 text-center">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>
                        
                        <td className="py-3 px-4 align-middle w-[14%]">
                          <span className="text-xs font-medium text-slate-900 truncate block">
                            {keluarga.nomorKK}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-middle w-[18%]">
                          <span className="text-xs text-slate-600 truncate block capitalize">
                            {keluarga.headName || "-"}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-middle w-[12%]">
                          <span className="text-xs text-slate-500 font-mono">
                            {keluarga.headNik || "-"}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-middle text-xs text-slate-600 w-[15%]">
                          <span className="truncate block">
                            {keluarga.addressLine}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-middle text-xs text-slate-600 w-[10%]">
                          <span className="truncate block">
                            {keluarga.dusunRwRt}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-middle text-xs text-slate-600 w-[8%] text-center">
                          {keluarga.totalMembers}
                        </td>

                        <td className="py-3 px-4 align-middle text-right w-[10%]">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-sm
                            ${keluarga.statusColor === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                              keluarga.statusColor === "red" ? "bg-rose-50 text-rose-700 border-rose-200" :
                              keluarga.statusColor === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {keluarga.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 align-middle text-center w-[8%]">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={() => handleOpenDetail(keluarga.nomorKK)}>
                                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                {canUpdate && (
                                  <DropdownMenuItem asChild>
                                    <Link 
                                      href={`/keluarga/tambah?no_kk=${encodeURIComponent(keluarga.nomorKK)}`}
                                      className="flex items-center w-full cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                      Edit Data
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteFamily(keluarga.nomorKK)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    disabled={deletingKk === keluarga.nomorKK}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Hapus Data
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">
                  Menampilkan {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredFamilies.length)} dari {filteredFamilies.length} data
                </span>
                <div className="hidden md:flex items-center gap-2">
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-7 text-xs border border-gray-200 rounded px-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-600"
                  >
                    <option value={10}>10 baris</option>
                    <option value={25}>25 baris</option>
                    <option value={50}>50 baris</option>
                    <option value={100}>100 baris</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetail && selectedKk && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-zinc-200 rounded-lg shadow-lg w-full max-w-5xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-end px-4 py-3 border-b border-zinc-200">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="text-xs text-secondary-text hover:text-primary-text"
              >
                Tutup
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {selectedFamilyMembers.length === 0 ? (
                <p className="text-xs text-secondary-text">
                  Belum ada anggota untuk KK ini.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="text-center my-2">
                    <h3 className="text-lg font-bold tracking-wide text-primary-text">
                      SALINAN KARTU KELUARGA
                    </h3>
                    <p className="text-xs text-secondary-text mt-1">
                      <span>No. </span>
                      <span
                        className=""
                      >
                        {selectedKk}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-primary-text">
                    <div className="space-y-0.5">
                      <p>
                        <span className="inline-block w-40">Nama Kepala Keluarga</span>
                        <span className="inline-block w-4 text-center">:</span>
                        <span className="font-semibold">
                          {(() => {
                            const head =
                              selectedFamilyMembers.find(
                                (m) =>
                                  (m.hubungan_keluarga || "").toUpperCase() ===
                                  "KEPALA KELUARGA",
                              ) ?? selectedFamilyMembers[0];
                            return (head?.nama || "").toUpperCase();
                          })()}
                        </span>
                      </p>
                      <p>
                        <span className="inline-block w-40">Alamat</span>
                        <span className="inline-block w-4 text-center">:</span>
                        <span className="font-semibold">
                          {(() => {
                            const head =
                              selectedFamilyMembers.find(
                                (m) =>
                                  (m.hubungan_keluarga || "").toUpperCase() ===
                                  "KEPALA KELUARGA",
                              ) ?? selectedFamilyMembers[0];
                            const alamat =
                              head?.alamat_saat_ini ||
                              head?.alamat_rt ||
                              head?.alamat_sebelumnya ||
                              "";
                            const dusun = head?.dusun ? ` DUSUN ${head.dusun}` : "";
                            return `${(alamat || "").toUpperCase()}${dusun}`;
                          })()}
                        </span>
                      </p>
                      <p>
                        <span className="inline-block w-40">RT/RW</span>
                        <span className="inline-block w-4 text-center">:</span>
                        <span className="font-semibold">
                          {(() => {
                            const head =
                              selectedFamilyMembers.find(
                                (m) =>
                                  (m.hubungan_keluarga || "").toUpperCase() ===
                                  "KEPALA KELUARGA",
                              ) ?? selectedFamilyMembers[0];
                            const rt = head?.rt || "";
                            const rw = head?.rw || "";
                            if (!rt && !rw) {
                              return "-";
                            }
                            return `${rt || "-"} / ${rw || "-"}`;
                          })()}
                        </span>
                      </p>
                      <p>
                        <span className="inline-block w-40">Kode Pos</span>
                        <span className="inline-block w-4 text-center">:</span>
                        <span className="font-semibold">-</span>
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {(() => {
                        const head =
                          selectedFamilyMembers.find(
                            (m) =>
                              (m.hubungan_keluarga || "").toUpperCase() ===
                              "KEPALA KELUARGA",
                          ) ?? selectedFamilyMembers[0];
                        return (
                          <>
                            <p>
                              <span className="inline-block w-36">
                                Desa/Kelurahan
                              </span>
                              <span className="inline-block w-4 text-center">
                                :
                              </span>
                              <span className="font-semibold">
                                {head?.nama_desa || "-"}
                              </span>
                            </p>
                            <p>
                              <span className="inline-block w-36">Kecamatan</span>
                              <span className="inline-block w-4 text-center">
                                :
                              </span>
                              <span className="font-semibold">
                                {head?.nama_kecamatan || "-"}
                              </span>
                            </p>
                            <p>
                              <span className="inline-block w-36">
                                Kabupaten/Kota
                              </span>
                              <span className="inline-block w-4 text-center">
                                :
                              </span>
                              <span className="font-semibold">
                                {head?.nama_kabupaten || "-"}
                              </span>
                            </p>
                            <p>
                              <span className="inline-block w-36">Provinsi</span>
                              <span className="inline-block w-4 text-center">
                                :
                              </span>
                              <span className="font-semibold">
                                {head?.nama_provinsi || "-"}
                              </span>
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Table 1: Columns 1-9 */}
                    <div className="overflow-hidden border border-zinc-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[40px] text-center border-r border-zinc-200">
                              No
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[160px] border-r border-zinc-200">
                              Nama Lengkap
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[130px] border-r border-zinc-200">
                              NIK
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[70px] border-r border-zinc-200">
                              Jenis Kelamin
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[140px] border-r border-zinc-200">
                              Tempat Lahir
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[110px] border-r border-zinc-200">
                              Tanggal Lahir
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[90px] border-r border-zinc-200">
                              Agama
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[130px] border-r border-zinc-200">
                              Pendidikan
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[130px] border-r border-zinc-200">
                              Jenis Pekerjaan
                            </th>
                            <th className="px-3 py-2 text-xs font-semibold text-secondary-text tracking-wider min-w-[50px]">
                              Golongan Darah
                            </th>
                          </tr>
                          <tr className="border-b border-zinc-200 bg-zinc-50">
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200"></th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(1)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(2)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(3)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(4)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(5)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(6)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(7)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center border-r border-zinc-200">(8)</th>
                            <th className="px-3 py-1 text-xs text-secondary-text text-center">(9)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {selectedFamilyMembers.map((member, index) => (
                            <tr key={`${member.nik}-1`}>
                              <td className="px-3 py-2 text-[10px] text-secondary-text text-center border-r border-zinc-200">
                                {index + 1}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-primary-text border-r border-zinc-200">
                                {(member.nama || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-primary-text border-r border-zinc-200">
                                {member.nik}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text border-r border-zinc-200">
                                {(member.jenis_kelamin || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text border-r border-zinc-200">
                                {(member.tempat_lahir || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text border-r border-zinc-200">
                                {formatDateForKk(member.tanggal_lahir)}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text border-r border-zinc-200">
                                {(member.agama || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text border-r border-zinc-200">
                                {(member.pendidikan_kk || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text border-r border-zinc-200">
                                {(member.pekerjaan || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-[10px] text-secondary-text text-center">
                                {(member.golongan_darah || "-").toUpperCase()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table 2: Columns 10-17 */}
                    <div className="overflow-hidden border border-zinc-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[40px] text-center border-r border-zinc-200">
                              No
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[120px] border-r border-zinc-200">
                              Status Perkawinan
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[120px] border-r border-zinc-200">
                              Tanggal Perkawinan
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[150px] border-r border-zinc-200">
                              Status Hubungan Dalam Keluarga
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[100px] border-r border-zinc-200">
                              Kewarganegaraan
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[120px] border-r border-zinc-200">
                              No. Paspor
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[120px] border-r border-zinc-200">
                              No. KITAS/KITAP
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[140px] border-r border-zinc-200">
                              Nama Ayah
                            </th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-secondary-text tracking-wider min-w-[140px]">
                              Nama Ibu
                            </th>
                          </tr>
                          <tr className="border-b border-zinc-200 bg-zinc-50">
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200"></th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(10)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(11)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(12)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(13)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(14)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(15)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center border-r border-zinc-200">(16)</th>
                            <th className="px-3 py-1 text-[9px] text-secondary-text text-center">(17)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {selectedFamilyMembers.map((member, index) => (
                            <tr key={`${member.nik}-2`}>
                              <td className="px-3 py-2 text-xs text-secondary-text text-center border-r border-zinc-200">
                                {index + 1}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {(member.status_kawin || "-").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {formatDateForKk(member.tanggal_perkawinan)}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {(member.hubungan_keluarga || "").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {(member.kewarganegaraan || "WNI").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {(member.no_paspor || "-").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {(member.no_kitap || "-").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text border-r border-zinc-200">
                                {(member.nama_ayah || "-").toUpperCase()}
                              </td>
                              <td className="px-3 py-2 text-xs text-secondary-text">
                                {(member.nama_ibu || "-").toUpperCase()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-zinc-200 flex justify-end">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="px-4 py-2 bg-primary-text text-white text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


