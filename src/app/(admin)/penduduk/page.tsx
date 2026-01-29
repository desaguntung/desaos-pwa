"use client";

import { useEffect, useState, useMemo, SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { getResidents, Resident, deleteResident } from "@/lib/services/penduduk";
import { Button } from "@/components/ui/Button";
import AddPendudukSheet from "@/components/features/penduduk/AddPendudukSheet";
import EditPendudukSheet from "@/components/features/penduduk/EditPendudukSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/DropdownMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  // Edit Sheet State
  const [editNik, setEditNik] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
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

  const handleEdit = (e: React.MouseEvent, nik: string) => {
    e.stopPropagation(); // Prevent row click
    setEditNik(nik);
    setIsEditOpen(true);
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
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'status' ? null : 'status'); }}
          >
            <Activity className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span className="flex-1 dark:text-zinc-300">Status</span>
            {statusFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{statusFilter}</span>}
          </button>
          {openFilterCategory === 'status' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {["Semua", "Aktif", "Pindah", "Meninggal"].map(val => (
                <button key={val} onClick={() => { setStatusFilter(val as any); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <span className="flex-1 text-left">{val}</span>
                  {statusFilter === val && <Check className="h-3 w-3 dark:text-zinc-200" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dusun */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'dusun' ? null : 'dusun'); }}
          >
            <MapPin className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span className="flex-1 dark:text-zinc-300">Dusun</span>
            {dusunFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[80px] dark:bg-zinc-800 dark:text-zinc-300">{dusunFilter}</span>}
          </button>
          {openFilterCategory === 'dusun' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
              <button onClick={() => { setDusunFilter("Semua"); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                <span className="flex-1 text-left">Semua</span>
                {dusunFilter === "Semua" && <Check className="h-3 w-3 dark:text-zinc-200" />}
              </button>
              {dusunOptions.map(d => (
                <button key={d} onClick={() => { setDusunFilter(d); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <span className="flex-1 text-left">{d}</span>
                  {dusunFilter === d && <Check className="h-3 w-3 dark:text-zinc-200" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'gender' ? null : 'gender'); }}
          >
            <Users className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span className="flex-1 dark:text-zinc-300">Gender</span>
            {genderFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{genderFilter === "LAKI-LAKI" ? "L" : "P"}</span>}
          </button>
          {openFilterCategory === 'gender' && (
            <div className="pl-9 pr-2 py-1 space-y-1">
               {[
                   { val: "Semua", label: "Semua" },
                   { val: "LAKI-LAKI", label: "Laki-laki" },
                   { val: "PEREMPUAN", label: "Perempuan" }
               ].map(({val, label}) => (
                <button key={val} onClick={() => { setGenderFilter(val as any); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <span className="flex-1 text-left">{label}</span>
                  {genderFilter === val && <Check className="h-3 w-3 dark:text-zinc-200" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Agama */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'agama' ? null : 'agama'); }}
          >
            <BookOpen className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span className="flex-1 dark:text-zinc-300">Agama</span>
            {agamaFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[80px] dark:bg-zinc-800 dark:text-zinc-300">{agamaFilter}</span>}
          </button>
          {openFilterCategory === 'agama' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
               <button onClick={() => { setAgamaFilter("Semua"); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <span className="flex-1 text-left">Semua</span>
                  {agamaFilter === "Semua" && <Check className="h-3 w-3 dark:text-zinc-200" />}
                </button>
                {agamaOptions.map(a => (
                  <button key={a} onClick={() => { setAgamaFilter(a); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                    <span className="flex-1 text-left">{a}</span>
                    {agamaFilter === a && <Check className="h-3 w-3 dark:text-zinc-200" />}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Kawin */}
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenFilterCategory(prev => prev === 'kawin' ? null : 'kawin'); }}
          >
            <Heart className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span className="flex-1 dark:text-zinc-300">Status Kawin</span>
            {kawinFilter !== "Semua" && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[80px] dark:bg-zinc-800 dark:text-zinc-300">{kawinFilter}</span>}
          </button>
          {openFilterCategory === 'kawin' && (
            <div className="pl-9 pr-2 py-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
               <button onClick={() => { setKawinFilter("Semua"); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <span className="flex-1 text-left">Semua</span>
                  {kawinFilter === "Semua" && <Check className="h-3 w-3 dark:text-zinc-200" />}
                </button>
                {kawinOptions.map(k => (
                  <button key={k} onClick={() => { setKawinFilter(k); setCurrentPage(1); }} className="flex w-full items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                    <span className="flex-1 text-left">{k}</span>
                    {kawinFilter === k && <Check className="h-3 w-3 dark:text-zinc-200" />}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-gray-100 mx-0 my-1 dark:bg-zinc-800" />

      {/* Group 2: Sort by */}
      <div className="py-1">
        <div className="px-3 py-2">
          <span className="text-[11px] text-gray-500 font-medium dark:text-zinc-500">Sort by</span>
        </div>
        <div className="px-1">
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={() => setSortDirection('desc')}
          >
            <span className="flex-1 pl-6.5 dark:text-zinc-300">Activity</span>
            {sortDirection === 'desc' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900 dark:text-zinc-100" />}
          </button>
          <button 
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
            onClick={() => setSortDirection('asc')}
          >
            <span className="flex-1 pl-6.5 dark:text-zinc-300">Name</span>
            {sortDirection === 'asc' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900 dark:text-zinc-100" />}
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
              className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="flex-1">Grid View</span>
              {viewMode === 'grid' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900 dark:text-zinc-100" />}
            </button>
            <button 
              className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left dark:hover:bg-zinc-800"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="mr-3 h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="flex-1">List View</span>
              {viewMode === 'list' && <Check className="ml-auto h-3.5 w-3.5 text-slate-900 dark:text-zinc-100" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Meninggal": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "Pindah": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"; // Aktif
    }
  };

  return (
    <>
    <div className="flex h-full flex-col bg-body-bg">
      <PageHeader 
        title="Penduduk" 
        subtitle="Kelola data kependudukan desa"
      />

       {/* 2. Area Konten (Canvas) */}
       <div className="flex-1 overflow-hidden p-4 md:p-6 space-y-4 flex flex-col">
          
          {/* 3. Toolbar & Filter (SaaS Style - Vercel Inspired) */}
          <div className="flex flex-row items-center justify-between gap-3">
              {/* Search Bar (Left) */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-md bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all hover:border-gray-300 font-sans dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="Cari penduduk..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2">
                {/* View Options (Desktop Only) */}
                <div className="hidden md:flex items-center bg-white border border-zinc-200 rounded-md p-1 gap-1 dark:bg-zinc-900 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-zinc-100 text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === 'list' 
                        ? 'bg-zinc-100 text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                    title="List View"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Filter Button */}
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                       <button 
                         type="button"
                         className="p-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors relative dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
                       >
                           <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                           {(statusFilter !== "Semua" || dusunFilter !== "Semua" || genderFilter !== "Semua" || agamaFilter !== "Semua" || kawinFilter !== "Semua") && (
                             <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-slate-900 ring-1 ring-white" />
                           )}
                       </button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent 
                      align="end" 
                      className="w-[280px] p-0 border border-border-color shadow-xl rounded-xl bg-card-bg list-none z-50"
                      sideOffset={8}
                      onInteractOutside={() => setOpenFilterCategory(null)}
                    >
                        <FilterList />
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Add Button */}
                <AddPendudukSheet 
                    onSuccess={fetchResidents} 
                    trigger={
                        <button 
                          type="button"
                          className="p-2 md:px-3 md:py-2 bg-slate-900 dark:bg-zinc-100 border border-slate-900 dark:border-zinc-100 rounded-md hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors text-white dark:text-zinc-900 shadow-sm flex items-center gap-1.5"
                        >
                           <Plus className="w-3.5 h-3.5" />
                           <span className="hidden md:inline text-xs font-medium">Tambah Penduduk</span>
                        </button>
                    }
                />
              </div>
            </div>

          {/* 4. Tabel Presisi (Pixel Perfect) - Unified Scrollable Table */}
          <div className="flex-1 overflow-hidden">
            <div className="border border-border-color rounded-lg overflow-hidden h-full flex flex-col bg-card-bg shadow-sm">
              <div className="flex-1 overflow-auto">
                {/* Mobile Table View (Visible only on mobile) */}
                <table className="w-full text-left text-sm table-fixed md:hidden">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-20 border-b border-border-color">
                    <tr>
                        <th className="h-10 px-3 text-[10px] font-medium text-secondary-text uppercase tracking-wider w-[12%] text-center border-b border-border-color">No</th>
                        <th className="h-10 px-3 text-[10px] font-medium text-secondary-text uppercase tracking-wider w-[38%] border-b border-border-color">Nama Lengkap</th>
                        <th className="h-10 px-3 text-[10px] font-medium text-secondary-text uppercase tracking-wider w-[25%] border-b border-border-color">TTL</th>
                        <th className="h-10 px-3 text-[10px] font-medium text-secondary-text uppercase tracking-wider w-[10%] text-center border-b border-border-color">L/P</th>
                        <th className="h-10 px-3 text-[10px] font-medium text-secondary-text uppercase tracking-wider w-[15%] text-center border-b border-border-color">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="bg-card-bg divide-y divide-border-color">
                    {loading ? (
                        <tr>
                        <td colSpan={5} className="h-32 text-center text-secondary-text text-xs">
                            Memuat data...
                        </td>
                        </tr>
                    ) : currentData.length === 0 ? (
                        <tr>
                        <td colSpan={5} className="h-32 text-center text-secondary-text text-xs">
                            Tidak ada data penduduk ditemukan
                        </td>
                        </tr>
                    ) : (
                        currentData.map((penduduk, index) => (
                        <tr 
                            key={penduduk.id} 
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group cursor-pointer border-b border-border-color last:border-0"
                            onClick={() => handleDetail(penduduk.nik)}
                        >
                            <td className="py-3 px-3 align-top text-[10px] text-secondary-text text-center">
                                {startIndex + index + 1}
                            </td>

                            <td className="py-3 px-3 align-top w-[38%]">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[12px] text-primary-text capitalize leading-tight font-medium">
                                    {(penduduk.nama || "").toLowerCase()}
                                </span>
                                <span className="text-[10px] text-secondary-text font-mono">
                                    {penduduk.nik}
                                </span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border w-fit mt-1 ${getStatusColor(penduduk.status_penduduk)}`}>
                                    {penduduk.status_penduduk || "Aktif"}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top text-[11px] text-secondary-text w-[25%]">
                                <div className="flex flex-col">
                                    <span className="capitalize text-primary-text leading-tight">
                                        {(penduduk.tempat_lahir || "-").toLowerCase()}
                                    </span>
                                    <span className="text-secondary-text text-[10px]">
                                        {formatDate(penduduk.tanggal_lahir)}
                                    </span>
                                    <span className="text-secondary-text/70 text-[10px] mt-0.5">
                                        {penduduk.dusun || "-"}
                                    </span>
                                </div>
                            </td>

                            <td className="py-3 px-3 align-top text-[11px] text-secondary-text w-[10%] text-center">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium ${
                                    (penduduk.jenis_kelamin || "").toUpperCase().startsWith("L") 
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" 
                                    : "bg-pink-50 text-pink-700 ring-1 ring-pink-100"
                                }`}>
                                    {(penduduk.jenis_kelamin || "-").charAt(0).toUpperCase()}
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
                                            <DropdownMenuItem onClick={() => handleDetail(penduduk.nik)}>
                                                <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                                Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setEditNik(penduduk.nik);
                                                setIsEditOpen(true);
                                            }}>
                                                <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                                Edit Data
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={(e) => handleDelete(e as any, penduduk.id!, penduduk.nama)}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                Hapus Data
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/* Desktop Table View (Visible only on desktop) */}
                <table className="hidden md:table w-full text-left text-sm table-fixed">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-20 border-b border-border-color">
                    <tr>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[4%] text-center border-b border-border-color">No</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[14%] border-b border-border-color">Nama Lengkap</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[11%] border-b border-border-color">NIK</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[11%] border-b border-border-color">No. KK</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[8%] border-b border-border-color">L/P</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[10%] border-b border-border-color">Tempat Lahir</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[9%] border-b border-border-color">Tgl Lahir</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[5%] border-b border-border-color">Umur</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider w-[10%] border-b border-border-color">Dusun</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider text-right w-[10%] border-b border-border-color">Status</th>
                        <th className="h-10 px-4 text-xs font-medium text-secondary-text uppercase tracking-wider text-center w-[8%] border-b border-border-color">
                            Aksi
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-card-bg divide-y divide-border-color">
                    {loading ? (
                        <tr>
                        <td colSpan={11} className="h-32 text-center text-secondary-text text-xs">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="h-5 w-5 border-2 border-border-color border-t-secondary-text rounded-full animate-spin" />
                                <span>Memuat data...</span>
                            </div>
                        </td>
                        </tr>
                    ) : currentData.length === 0 ? (
                        <tr>
                        <td colSpan={11} className="h-48 text-center text-secondary-text text-xs">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search className="w-8 h-8 text-secondary-text/50" />
                                <p className="text-primary-text font-medium">Tidak ada data ditemukan</p>
                                <p className="text-secondary-text">Coba ubah filter atau kata kunci pencarian</p>
                            </div>
                        </td>
                        </tr>
                    ) : (
                        currentData.map((penduduk, index) => (
                        <tr 
                            key={penduduk.id} 
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group cursor-pointer border-b border-border-color last:border-0"
                            onClick={() => handleDetail(penduduk.nik)}
                        >
                            <td className="py-3 px-4 align-middle text-xs text-secondary-text text-center">
                                {startIndex + index + 1}
                            </td>
                            <td className="py-3 px-4 align-middle w-[14%]">
                            <span className="text-xs font-medium text-primary-text truncate block uppercase">
                                {penduduk.nama}
                            </span>
                            </td>

                            <td className="py-3 px-4 align-middle w-[11%]">
                            <span className="text-xs text-secondary-text font-mono">
                                {penduduk.nik}
                            </span>
                            </td>

                            <td className="py-3 px-4 align-middle w-[11%]">
                            <span className="text-xs text-secondary-text font-mono">
                                {penduduk.no_kk}
                            </span>
                            </td>

                            <td className="py-3 px-4 align-middle text-xs text-secondary-text w-[10%]">
                            <span className="truncate block">
                                {penduduk.jenis_kelamin === "LAKI-LAKI" ? "L" : penduduk.jenis_kelamin === "PEREMPUAN" ? "P" : penduduk.jenis_kelamin}
                            </span>
                            </td>

                            <td className="py-3 px-4 align-middle text-xs text-secondary-text w-[9%]">
                            <span className="truncate block capitalize">
                                {(penduduk.tempat_lahir || "").toLowerCase()}
                            </span>
                            </td>

                            <td className="py-3 px-4 align-middle text-xs text-secondary-text w-[9%]">
                            {formatDate(penduduk.tanggal_lahir)}
                            </td>

                            <td className="py-3 px-4 align-middle text-xs text-secondary-text w-[5%]">
                            {calculateAge(penduduk.tanggal_lahir)}
                            </td>

                            <td className="py-3 px-4 align-middle text-xs text-secondary-text w-[10%]">
                            <span className="truncate block capitalize">
                                {penduduk.dusun || "-"}
                            </span>
                            </td>

                            <td className="py-3 px-4 align-middle text-right w-[9%]">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(penduduk.status_penduduk)} shadow-sm`}>
                                {penduduk.status_penduduk || "Aktif"}
                            </span>
                            </td>

                            <td className="py-2.5 px-4 align-middle text-center w-[8%]">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-secondary-text hover:text-primary-text hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuItem onClick={() => handleDetail(penduduk.nik)}>
                                                <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                                                Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setEditNik(penduduk.nik);
                                                setIsEditOpen(true);
                                            }}>
                                                <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                                                Edit Data
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={(e) => handleDelete(e as any, penduduk.id!, penduduk.nama)}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                Hapus Data
                                            </DropdownMenuItem>
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
            
              {/* Simple Pagination */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-border-color bg-card-bg">
                <div className="flex items-center gap-4">
                    <span className="text-xs text-secondary-text">
                        Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredResidents.length)} dari {filteredResidents.length} data
                    </span>
                    <div className="hidden md:flex items-center gap-2">
                        <select 
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="h-7 text-xs border border-border-color rounded px-2 bg-card-bg focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 text-primary-text"
                        >
                            <option value={10}>10 baris</option>
                            <option value={20}>20 baris</option>
                            <option value={50}>50 baris</option>
                            <option value={100}>100 baris</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border-color bg-card-bg hover:bg-zinc-50 dark:hover:bg-zinc-800 h-8 px-3 text-secondary-text shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border-color bg-card-bg hover:bg-zinc-50 dark:hover:bg-zinc-800 h-8 px-3 text-secondary-text shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
       </div>
    </div>
    
    <EditPendudukSheet 
      nik={editNik}
      open={isEditOpen}
      onOpenChange={setIsEditOpen}
      onSuccess={fetchResidents}
    />
    </>
  )
}