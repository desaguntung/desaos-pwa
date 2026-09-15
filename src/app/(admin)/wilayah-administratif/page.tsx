"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Users,
  MapPin,
  MoreHorizontal,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  ChevronsUpDown,
  Filter,
  Check,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { getResidents, Resident } from "@/lib/services/penduduk";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import ResidentPickerModal from "@/components/ResidentPickerModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Types ---

type DusunRow = {
  id: number;
  nama: string;
  kepala_nik: string | null;
  kantor_alamat: string | null;
  kantor_latitude: number | null;
  kantor_longitude: number | null;
};

type RwRow = {
  id: number;
  dusun_id: number;
  nomor_rw: number;
};

type RtRow = {
  id: number;
  rw_id: number;
  nomor_rt: number;
};

type DusunWithStats = {
  id: number;
  nama: string;
  kepalaNik: string | null;
  kepalaNama: string | null;
  kantorAlamat: string | null;
  hasLocation: boolean;
  stats: {
    totalRw: number;
    totalRt: number;
    totalKk: number;
    totalPenduduk: number;
  };
};

type DusunFormState = {
  id?: number;
  nama: string;
  kepalaNik: string | null;
  kantorAlamat: string;
};

type HeadPickerContext =
  | { mode: "form" } // Picking for the Add/Edit Form
  | { mode: "direct"; dusunId: number }; // Picking directly from table cell

function formatNumberCode(value: number) {
  if (value <= 0) return "00";
  if (value < 10) return `0${value}`;
  return String(value);
}

// --- Main Page Component ---

import { DataTable, Column } from "@/components/ui/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function WilayahAdministratifPage() {
  const supabase = createSupabaseBrowserClient();
  const [dusunList, setDusunList] = useState<DusunWithStats[]>([]);
  const [rwList, setRwList] = useState<RwRow[]>([]);
  const [rtList, setRtList] = useState<RtRow[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<"all" | "has_head" | "no_head">("all");
  const [openFilterCategory, setOpenFilterCategory] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sheet States
  const [isDusunSheetOpen, setIsDusunSheetOpen] = useState(false);
  const [isStructureSheetOpen, setIsStructureSheetOpen] = useState(false);
  
  // Form/Selection States
  const [dusunForm, setDusunForm] = useState<DusunFormState>({
    nama: "",
    kepalaNik: null,
    kantorAlamat: "",
  });
  const [selectedDusunId, setSelectedDusunId] = useState<number | null>(null);
  const [headPickerContext, setHeadPickerContext] = useState<HeadPickerContext | null>(null);
  const [showHeadPicker, setShowHeadPicker] = useState(false);

  // --- Data Fetching ---

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dusunResult, rwResult, rtResult, residentsData] = await Promise.all([
        supabase.from("wilayah_dusun").select("*").order("nama", { ascending: true }),
        supabase.from("wilayah_rw").select("*"),
        supabase.from("wilayah_rt").select("*"),
        getResidents(),
      ]);

      if (dusunResult.error) throw dusunResult.error;
      if (rwResult.error) throw rwResult.error;
      if (rtResult.error) throw rtResult.error;

      const dusunData = (dusunResult.data ?? []) as DusunRow[];
      const rwData = (rwResult.data ?? []) as RwRow[];
      const rtData = (rtResult.data ?? []) as RtRow[];
      const residentList = residentsData ?? [];

      // Process Data
      const residentByNik = new Map<string, Resident>();
      residentList.forEach(r => { if (r.nik) residentByNik.set(r.nik, r); });

      const dusunResidentsMap = new Map<string, Resident[]>();
      residentList.forEach(r => {
        const key = r.dusun ?? "";
        if (!key) return;
        const existing = dusunResidentsMap.get(key) ?? [];
        existing.push(r);
        dusunResidentsMap.set(key, existing);
      });

      const dusunWithStats: DusunWithStats[] = dusunData.map((dusun) => {
        const residentsForDusun = dusunResidentsMap.get(dusun.nama) ?? [];
        const kkSet = new Set(residentsForDusun.map(r => r.no_kk).filter(Boolean));
        
        const rwForDusun = rwData.filter(rw => rw.dusun_id === dusun.id);
        const rwIds = rwForDusun.map(rw => rw.id);
        const rtForDusun = rtData.filter(rt => rwIds.includes(rt.rw_id));
        
        const head = dusun.kepala_nik ? residentByNik.get(dusun.kepala_nik) : null;

        return {
          id: dusun.id,
          nama: dusun.nama,
          kepalaNik: dusun.kepala_nik,
          kepalaNama: head?.nama ?? null,
          kantorAlamat: dusun.kantor_alamat,
          hasLocation: typeof dusun.kantor_latitude === "number",
          stats: {
            totalRw: rwForDusun.length,
            totalRt: rtForDusun.length,
            totalKk: kkSet.size,
            totalPenduduk: residentsForDusun.length,
          },
        };
      });

      setDusunList(dusunWithStats);
      setRwList(rwData);
      setRtList(rtData);
      setResidents(residentList);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data wilayah.");
    } finally {
      setLoading(false);
    }
  };

  // --- Derived State ---

  const filteredDusunList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return dusunList;
    return dusunList.filter((dusun) => 
      dusun.nama.toLowerCase().includes(term) || 
      (dusun.kepalaNama?.toLowerCase() ?? "").includes(term)
    );
  }, [dusunList, searchTerm]);

  const selectedDusun = useMemo(
    () => dusunList.find((d) => d.id === selectedDusunId) ?? null,
    [dusunList, selectedDusunId]
  );

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredDusunList.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredDusunList.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // --- Handlers ---

  const handleOpenAddDusun = () => {
    setDusunForm({
      id: undefined,
      nama: "",
      kepalaNik: null,
      kantorAlamat: "",
    });
    setIsDusunSheetOpen(true);
  };

  const handleEditDusun = (dusun: DusunWithStats) => {
    setDusunForm({
      id: dusun.id,
      nama: dusun.nama,
      kepalaNik: dusun.kepalaNik,
      kantorAlamat: dusun.kantorAlamat ?? "",
    });
    setIsDusunSheetOpen(true);
  };

  const handleSubmitDusun = async () => {
    if (!dusunForm.nama.trim()) {
      toast.error("Nama dusun wajib diisi.");
      return;
    }
    
    try {
      const payload = {
        nama: dusunForm.nama.trim(),
        kepala_nik: dusunForm.kepalaNik,
        kantor_alamat: dusunForm.kantorAlamat.trim() || null,
      };

      if (dusunForm.id) {
        const { error } = await supabase
          .from("wilayah_dusun")
          .update(payload)
          .eq("id", dusunForm.id);
        if (error) throw error;
        toast.success("Data dusun berhasil diperbarui");
      } else {
        const { error } = await supabase.from("wilayah_dusun").insert(payload);
        if (error) throw error;
        toast.success("Dusun baru berhasil ditambahkan");
      }

      await fetchData();
      setIsDusunSheetOpen(false);
    } catch (error) {
      console.error("Error saving dusun:", error);
      toast.error("Gagal menyimpan data dusun.");
    }
  };

  const handleDeleteDusun = async (id: number) => {
    if (!confirm("Anda yakin ingin menghapus dusun ini beserta seluruh datanya?")) return;
    
    try {
        const { count } = await supabase
            .from("wilayah_rw")
            .select("*", { count: 'exact', head: true })
            .eq("dusun_id", id);
            
        if ((count ?? 0) > 0) {
            toast.error("Dusun tidak dapat dihapus karena masih memiliki RW.");
            return;
        }

        const { error } = await supabase.from("wilayah_dusun").delete().eq("id", id);
        if (error) throw error;
        
        toast.success("Dusun berhasil dihapus");
        await fetchData();
    } catch (error) {
        console.error("Error deleting dusun:", error);
        toast.error("Gagal menghapus dusun.");
    }
  };

  const handleManageStructure = (dusunId: number) => {
    setSelectedDusunId(dusunId);
    setIsStructureSheetOpen(true);
  };

  const handleDirectHeadChange = (dusunId: number) => {
    setHeadPickerContext({ mode: "direct", dusunId });
    setShowHeadPicker(true);
  };

  const handleSelectHead = async (resident: Resident) => {
    if (!headPickerContext) return;

    if (headPickerContext.mode === "form") {
      setDusunForm(prev => ({ ...prev, kepalaNik: resident.nik }));
    } else if (headPickerContext.mode === "direct") {
      try {
        const { error } = await supabase
          .from("wilayah_dusun")
          .update({ kepala_nik: resident.nik })
          .eq("id", headPickerContext.dusunId);
        
        if (error) throw error;
        toast.success("Kepala Dusun berhasil diperbarui");
        await fetchData();
      } catch (err) {
        console.error("Failed to update head directly:", err);
        toast.error("Gagal memperbarui Kepala Dusun.");
      }
    }
    setShowHeadPicker(false);
  };

  // Helper to find resident for display
  const getResidentByNik = (nik: string | null) => {
    if (!nik) return null;
    return residents.find(r => r.nik === nik);
  };

  // --- Table Configuration ---
  const columns = useMemo<Column<DusunWithStats & { no: number }>[]>(() => [
    { 
      header: "No", 
      accessorKey: "no", 
      className: "w-12 text-center font-mono text-xs text-secondary-text" 
    },
    { 
      header: "Nama Dusun", 
      accessorKey: "nama",
      className: "text-sm font-medium text-primary-text"
    },
    { 
      header: "Kepala Dusun", 
      accessorKey: "kepalaNama",
      cell: (row) => (
        <button 
            onClick={(e) => { e.stopPropagation(); handleDirectHeadChange(row.id); }}
            className="flex items-center gap-2 group/head cursor-pointer hover:bg-body-bg px-2 py-1 rounded-md transition-all w-full sm:w-auto"
            title="Klik untuk mengganti Kepala Dusun"
        >
            {row.kepalaNama ? (
                <>
                    <div className="w-5 h-5 rounded-full bg-body-bg border border-border-color flex items-center justify-center text-[10px] font-bold text-secondary-text">
                        {row.kepalaNama.substring(0, 1)}
                    </div>
                    <span className="text-sm text-primary-text font-medium">{row.kepalaNama}</span>
                </>
            ) : (
                <span className="text-secondary-text italic text-xs flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Pilih Kepala
                </span>
            )}
        </button>
      )
    },
    { 
      header: "Kantor Dusun", 
      accessorKey: "kantorAlamat",
      cell: (row) => row.kantorAlamat ? (
          <div className="flex items-center gap-2 max-w-[200px] truncate" title={row.kantorAlamat}>
              <MapPin className="h-3.5 w-3.5 text-secondary-text" />
              <span className="truncate">{row.kantorAlamat}</span>
          </div>
      ) : <span className="text-secondary-text/50 italic">-</span>
    },
    { 
      header: "Struktur", 
      accessorKey: "stats", 
      className: "text-center",
      cell: (row) => (
          <div className="flex justify-center">
              <Badge variant="default" className="gap-2">
                  <Layers className="h-3 w-3" />
                  <span>{row.stats.totalRw} RW</span>
                  <span className="text-border-color">|</span>
                  <span>{row.stats.totalRt} RT</span>
              </Badge>
          </div>
      )
    },
    { 
      header: "Penduduk", 
      accessorKey: "stats",
      className: "text-center",
      cell: (row) => (
          <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-primary-text">{row.stats.totalPenduduk}</span>
              <span className="text-[10px] text-secondary-text">{row.stats.totalKk} KK</span>
          </div>
      )
    },
    { 
      header: "Aksi", 
      accessorKey: "id",
      className: "text-right",
      cell: (row) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-secondary-text">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel className="text-xs font-semibold text-secondary-text uppercase tracking-wider">Aksi Dusun</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleManageStructure(row.id)}>
                          <Layers className="h-4 w-4 mr-2" />
                          Struktur RW/RT
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditDusun(row)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Info
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteDusun(row.id)} variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
      )
    }
  ], [handleDirectHeadChange, handleManageStructure, handleEditDusun, handleDeleteDusun, startIndex]);

  const mobileConfig = useMemo(() => ({
    titleKey: "nama",
    subtitleKey: (row: DusunWithStats) => (
      <span>{row.stats.totalRw} RW • {row.stats.totalRt} RT • {row.stats.totalPenduduk} Jiwa</span>
    ),
    action: (row: DusunWithStats) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-secondary-text">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel className="text-xs font-semibold text-secondary-text uppercase tracking-wider">Aksi Dusun</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleManageStructure(row.id)}>
                    <Layers className="h-4 w-4 mr-2" />
                    Struktur RW/RT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditDusun(row)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Info
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteDusun(row.id)} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
  }), [handleManageStructure, handleEditDusun, handleDeleteDusun]);

  const tableData = useMemo(() => {
    return currentData.map((dusun, idx) => ({
      ...dusun,
      no: startIndex + idx + 1
    }));
  }, [currentData, startIndex]);

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Wilayah Administratif" 
        subtitle="Kelola data wilayah administratif desa (Dusun, RW, RT)." 
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
                  className="pl-9 bg-card-bg border-border-color text-primary-text"
                  placeholder="Cari dusun..."
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
                  <Button variant="outline" className="text-secondary-text bg-card-bg border-border-color">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    <span className="text-xs font-medium">Filter</span>
                    {filterStatus !== "all" && (
                      <div className="ml-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-[200px]"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-secondary-text uppercase tracking-wider">Status Kepala</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")} className="justify-between">
                    <span>Semua</span>
                    {filterStatus === "all" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("has_head")} className="justify-between">
                    <span>Ada Kepala Dusun</span>
                    {filterStatus === "has_head" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("no_head")} className="justify-between">
                    <span>Belum Ada Kepala</span>
                    {filterStatus === "no_head" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link href="/wilayah-administratif/tambah">
              <Button variant="primary" className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Dusun
              </Button>
            </Link>
          </div>
        </Card>

        {/* DataTable */}
        <DataTable 
          columns={columns} 
          data={tableData}
          mobileConfig={mobileConfig}
          loading={loading}
        />

        {/* Pagination */}
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            totalItems={filteredDusunList.length}
            itemsPerPage={pageSize}
            onItemsPerPageChange={setPageSize}
            sticky={true}
        />

      {/* Sheets & Modals */}
      <Sheet open={isDusunSheetOpen} onOpenChange={setIsDusunSheetOpen}>
        <SheetContent className="bg-card-bg border-l border-border-color">
          <SheetHeader>
            <SheetTitle className="text-primary-text">{dusunForm.id ? "Edit Dusun" : "Tambah Dusun"}</SheetTitle>
            <SheetDescription className="text-secondary-text">
              {dusunForm.id ? "Ubah informasi dusun." : "Tambahkan dusun baru ke dalam sistem."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-primary-text">Nama Dusun</Label>
              <Input
                id="nama"
                value={dusunForm.nama}
                onChange={(e) => setDusunForm({ ...dusunForm, nama: e.target.value })}
                placeholder="Contoh: Dusun Krajan"
                className="bg-card-bg border-border-color text-primary-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat" className="text-primary-text">Alamat Kantor (Opsional)</Label>
              <Input
                id="alamat"
                value={dusunForm.kantorAlamat}
                onChange={(e) => setDusunForm({ ...dusunForm, kantorAlamat: e.target.value })}
                placeholder="Contoh: Jl. Mawar No. 1"
                 className="bg-card-bg border-border-color text-primary-text"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary-text">Kepala Dusun</Label>
              {dusunForm.kepalaNik ? (
                <div className="flex items-center justify-between p-3 border border-border-color rounded-md bg-body-bg">
                  <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-border-color flex items-center justify-center text-xs font-bold text-secondary-text">
                         {getResidentByNik(dusunForm.kepalaNik)?.nama.substring(0, 1)}
                      </div>
                      <div>
                          <p className="text-sm font-medium text-primary-text">{getResidentByNik(dusunForm.kepalaNik)?.nama}</p>
                          <p className="text-xs text-secondary-text">{dusunForm.kepalaNik}</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setDusunForm({...dusunForm, kepalaNik: null})} className="text-error-text hover:text-error-text hover:bg-error-bg">
                      <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full justify-start text-secondary-text" onClick={() => { setHeadPickerContext({ mode: "form" }); setShowHeadPicker(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Pilih Kepala Dusun
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsDusunSheetOpen(false)} className="bg-card-bg border-border-color text-primary-text hover:bg-body-bg">Batal</Button>
            <Button onClick={handleSubmitDusun} className="bg-primary-text text-card-bg hover:bg-primary-text/90">Simpan</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isStructureSheetOpen} onOpenChange={setIsStructureSheetOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card-bg border-l border-border-color">
              {selectedDusun && (
                  <>
                      <SheetHeader>
                          <SheetTitle className="text-primary-text">Struktur Wilayah: {selectedDusun.nama}</SheetTitle>
                          <SheetDescription className="text-secondary-text">Kelola daftar Rukun Warga (RW) dan Rukun Tetangga (RT).</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                          <StructureManager 
                              dusunId={selectedDusun.id}
                              rwList={rwList.filter(rw => rw.dusun_id === selectedDusun.id)}
                              rtList={rtList}
                              onUpdate={fetchData}
                              supabase={supabase}
                          />
                      </div>
                  </>
              )}
          </SheetContent>
      </Sheet>

      <ResidentPickerModal
          open={showHeadPicker}
          onClose={() => setShowHeadPicker(false)}
          onSelect={handleSelectHead}
          residents={residents}
      />
    </div>
  );
}

// --- Sub-component: Structure Manager ---

function StructureManager({ 
    dusunId, 
    rwList, 
    rtList, 
    onUpdate, 
    supabase 
}: { 
    dusunId: number; 
    rwList: RwRow[]; 
    rtList: RtRow[]; 
    onUpdate: () => void; 
    supabase: any; 
}) {
    const sortedRw = [...rwList].sort((a, b) => a.nomor_rw - b.nomor_rw);

    const handleAddRw = async () => {
        const existingNums = rwList.map(rw => rw.nomor_rw);
        const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
        
        const { error } = await supabase.from("wilayah_rw").insert({
            dusun_id: dusunId,
            nomor_rw: nextNum
        });
        
        if (error) {
            toast.error("Gagal menambah RW");
            console.error(error);
        } else {
            toast.success("RW berhasil ditambahkan");
            onUpdate();
        }
    };

    const handleDeleteRw = async (rwId: number) => {
        if (!confirm("Hapus RW ini? Pastikan tidak ada RT di dalamnya.")) return;
        const { error } = await supabase.from("wilayah_rw").delete().eq("id", rwId);
        if (error) {
            toast.error("Gagal menghapus RW (Mungkin masih ada RT)");
        } else {
            toast.success("RW berhasil dihapus");
            onUpdate();
        }
    };

    return (
        <div className="space-y-6">
            <Card className="flex items-center justify-between p-4 bg-body-bg/50">
                <div>
                    <h4 className="text-sm font-semibold text-primary-text">Daftar Rukun Warga (RW)</h4>
                    <p className="text-xs text-secondary-text mt-1">Total {sortedRw.length} RW terdaftar</p>
                </div>
                <Button size="sm" variant="primary" onClick={handleAddRw}>
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah RW
                </Button>
            </Card>

            <div className="space-y-4">
                {sortedRw.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border-color rounded-xl bg-body-bg/50">
                        <Layers className="h-8 w-8 text-secondary-text/30 mb-2" />
                        <p className="text-sm text-secondary-text font-medium">Belum ada RW</p>
                        <p className="text-xs text-secondary-text/70">Silakan tambahkan RW baru untuk dusun ini.</p>
                    </div>
                ) : (
                    sortedRw.map(rw => (
                        <RwItem 
                            key={rw.id} 
                            rw={rw} 
                            rtList={rtList.filter(rt => rt.rw_id === rw.id)} 
                            onUpdate={onUpdate}
                            supabase={supabase}
                            onDelete={() => handleDeleteRw(rw.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function RwItem({ 
    rw, 
    rtList, 
    onUpdate, 
    supabase,
    onDelete
}: { 
    rw: RwRow; 
    rtList: RtRow[]; 
    onUpdate: () => void; 
    supabase: any;
    onDelete: () => void;
}) {
    const sortedRt = [...rtList].sort((a, b) => a.nomor_rt - b.nomor_rt);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAddRt = async () => {
        const existingNums = rtList.map(rt => rt.nomor_rt);
        const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
        
        const { error } = await supabase.from("wilayah_rt").insert({
            rw_id: rw.id,
            nomor_rt: nextNum
        });
        
        if (error) {
            toast.error("Gagal menambah RT");
        } else {
            toast.success("RT berhasil ditambahkan");
            onUpdate();
            setIsExpanded(true);
        }
    };

    const handleDeleteRt = async (rtId: number) => {
        if (!confirm("Hapus RT ini?")) return;
        const { error } = await supabase.from("wilayah_rt").delete().eq("id", rtId);
        if (error) {
            toast.error("Gagal menghapus RT");
        } else {
            toast.success("RT berhasil dihapus");
            onUpdate();
        }
    };

    return (
        <Card className="overflow-hidden transition-all hover:bg-body-bg/30">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-bold transition-colors",
                        isExpanded ? "bg-primary-text text-card-bg border-primary-text" : "bg-card-bg text-secondary-text border-border-color"
                    )}>
                        {formatNumberCode(rw.nomor_rw)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-primary-text flex items-center gap-2">
                            RW {formatNumberCode(rw.nomor_rw)}
                            {isExpanded && <Badge variant="success">Active</Badge>}
                        </div>
                        <div className="text-[11px] text-secondary-text">{sortedRt.length} Rukun Tetangga (RT)</div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost-destructive" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-secondary-text" onClick={() => setIsExpanded(!isExpanded)}>
                        <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                    </Button>
                </div>
            </div>
            
            {isExpanded && (
                <div className="p-4 bg-body-bg/50 border-t border-border-color animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sortedRt.map(rt => (
                            <div key={rt.id} className="group relative flex items-center justify-between p-2.5 rounded-md border border-border-color bg-card-bg hover:border-secondary-text/50 transition-all">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-info-text"></div>
                                    <span className="text-xs font-semibold text-primary-text">RT {formatNumberCode(rt.nomor_rt)}</span>
                                </div>
                                <Button 
                                    variant="ghost-destructive"
                                    size="xs"
                                    onClick={() => handleDeleteRt(rt.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-all"
                                    title="Hapus RT"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                        <Button 
                            variant="outline"
                            onClick={handleAddRt}
                            className="h-full min-h-[46px] border-dashed text-secondary-text hover:text-primary-text hover:bg-body-bg bg-transparent"
                        >
                            <Plus className="h-3.5 w-3.5 mr-2" />
                            <span>Tambah RT</span>
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
