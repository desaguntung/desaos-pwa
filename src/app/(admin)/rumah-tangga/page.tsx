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
  MoreVertical,
  Home
} from "geist-icons";
import { ListFilter, Plus, Filter, Download, Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { RumahTangga, getRumahTanggaList, deleteRumahTangga } from "@/lib/services/rumah_tangga";
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

export default function RumahTanggaPage() {
  const router = useRouter();
  const resource: PermissionResource = "rumah_tangga";
  const { canRead, canCreate, canUpdate, canDelete } = useRbac(resource);

  const [dataRumahTangga, setDataRumahTangga] = useState<RumahTangga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Penerima" | "Non-Bansos">("Semua");
  const [dusunFilter, setDusunFilter] = useState("Semua");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // View Mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Dropdown Accordion State
  const [openFilterCategory, setOpenFilterCategory] = useState<string | null>(null);

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
      setDataRumahTangga(data);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  // Extract Dusun Options
  const dusunOptions = useMemo(() => {
    const dusuns = new Set<string>();
    dataRumahTangga.forEach(item => {
      if (item.dusun) dusuns.add(item.dusun);
    });
    return Array.from(dusuns).sort();
  }, [dataRumahTangga]);

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
      data = data.filter(item => item.dusun === dusunFilter);
    }

    // Filter Search
    if (term) {
      data = data.filter((item) => {
        const nomor = item.no_rtm.toLowerCase();
        const nama = item.kepala_rtm?.nama.toLowerCase() || "";
        return nomor.includes(term) || nama.includes(term);
      });
    }

    // Sort
    const sorted = [...data].sort((a, b) => {
      const left = a.no_rtm;
      const right = b.no_rtm;
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
            <span className="flex-1">Status Bansos</span>
            {statusFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{statusFilter}</span>}
          </button>
          {openFilterCategory === 'status' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {["Semua", "Penerima", "Non-Bansos"].map(val => (
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
            <span className="flex-1 pl-6.5">Newest</span>
            {sortDirection === 'desc' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900" />}
          </button>
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
            onClick={() => setSortDirection('asc')}
          >
            <span className="flex-1 pl-6.5">Oldest</span>
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <PageHeader 
        title="Data Rumah Tangga"
        subtitle="Kependudukan / Rumah Tangga"
        className="mb-6"
      />

      <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
          
          {/* Toolbar: Search, View Toggle, Filter, Add */}
          <div className="flex flex-row items-center justify-between gap-3 p-5 border-b border-gray-100">
            {/* Left: Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Rumah Tangga..."
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
                  href="/rumah-tangga/tambah"
                  className="p-2 md:px-3 md:py-2 bg-slate-900 border border-slate-900 rounded-md hover:bg-slate-800 transition-colors text-white shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline text-xs font-medium">Tambah</span>
                </Link>
              )}
            </div>
          </div>

          {/* Unified Scrollable Table Container */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-hidden h-full flex flex-col bg-white">
              <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* Mobile Table View */}
              <table className="w-full text-left text-sm table-fixed md:hidden">
                <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200">
                  <tr>
                    <th className="h-10 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[12%] text-center border-b border-gray-200">No</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[38%] text-left border-b border-gray-200">Rumah Tangga</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[25%] text-left border-b border-gray-200">Lokasi</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[10%] text-center border-b border-gray-200">Angt</th>
                    <th className="h-10 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[15%] text-center border-b border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-500">Memuat data...</td>
                    </tr>
                  ) : paginatedRumahTangga.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-500">Tidak ada data ditemukan.</td>
                    </tr>
                  ) : (
                    paginatedRumahTangga.map((rtm, i) => (
                      <tr key={rtm.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 align-middle text-center text-xs text-gray-500">
                          {(currentPage - 1) * rowsPerPage + i + 1}
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                               <Home className="w-3.5 h-3.5 text-gray-400" />
                               <span className="font-medium text-xs text-gray-900 line-clamp-1 capitalize">
                                 {rtm.kepala_rtm?.nama?.toLowerCase() || "-"}
                               </span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">{rtm.no_rtm}</span>
                            {rtm.bdt && (
                               <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-700 w-fit">
                                 Bansos
                               </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-600 line-clamp-1">{rtm.dusun || "-"}</span>
                            <span className="text-[9px] text-gray-400">RT {rtm.rt}/{rtm.rw}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {rtm.jumlah_anggota || 0}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-middle text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem asChild>
                                <Link href={`/rumah-tangga/${rtm.id}`} className="cursor-pointer">
                                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                  Lihat Detail
                                </Link>
                              </DropdownMenuItem>
                              {canUpdate && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/rumah-tangga/tambah?id=${rtm.id}`} className="cursor-pointer">
                                    <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                    Edit Data
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(rtm.id)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Hapus Data
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-12 text-center border-b border-gray-200">No</th>
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%] text-left border-b border-gray-200">No. RTM</th>
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%] text-left border-b border-gray-200">Kepala Rumah Tangga</th>
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%] text-left border-b border-gray-200">Alamat</th>
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%] text-left border-b border-gray-200">Dusun / RW / RT</th>
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%] text-center border-b border-gray-200">Anggota</th>
                    <th className="h-10 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%] text-center border-b border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="h-32 text-center text-gray-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-5 w-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                          <span>Memuat data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedRumahTangga.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="h-48 text-center text-gray-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p className="text-gray-900 font-medium">Tidak ada data ditemukan</p>
                          <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRumahTangga.map((rtm, i) => (
                      <tr key={rtm.id} className="hover:bg-gray-50 transition-colors group cursor-pointer border-b border-gray-100 last:border-0">
                        <td className="py-4 px-4 align-middle text-sm text-gray-500 text-center w-12 antialiased tracking-tight">
                          {(currentPage - 1) * rowsPerPage + i + 1}
                        </td>
                        <td className="py-4 px-4 align-middle w-[15%]">
                          <span className="text-xs font-mono text-gray-500 truncate block antialiased tracking-tight">
                            {rtm.no_rtm}
                          </span>
                          {rtm.bdt && (
                            <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Bansos
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 align-middle w-[20%]">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 truncate block capitalize antialiased tracking-tight">
                              {rtm.kepala_rtm?.nama?.toLowerCase() || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-middle text-sm text-gray-600 w-[25%] antialiased tracking-tight truncate" title={rtm.alamat || ""}>
                          {rtm.alamat || "-"}
                        </td>
                        <td className="py-4 px-4 align-middle text-sm text-gray-600 w-[15%] antialiased tracking-tight">
                          {rtm.dusun || "-"} / {rtm.rw || "-"} / {rtm.rt || "-"}
                        </td>
                        <td className="py-4 px-4 align-middle text-center w-[8%]">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {rtm.jumlah_anggota || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle text-center w-[8%]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem asChild>
                                <Link href={`/rumah-tangga/${rtm.id}`} className="cursor-pointer">
                                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                  Lihat Detail
                                </Link>
                              </DropdownMenuItem>
                              {canUpdate && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/rumah-tangga/tambah?id=${rtm.id}`} className="cursor-pointer">
                                    <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                    Edit Data
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(rtm.id)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Hapus Data
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                      Menampilkan {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredRumahTangga.length)} dari {filteredRumahTangga.length} data
                  </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-9 px-3"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-9 px-3"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
