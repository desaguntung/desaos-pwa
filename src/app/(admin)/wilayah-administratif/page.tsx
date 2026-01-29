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
  X,
  User,
  ChevronsUpDown,
  Filter,
  Check,
  ArrowUpDown
} from "lucide-react";
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
import ResidentPickerModal from "@/components/ResidentPickerModal";
import { cn } from "@/lib/utils";

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
      alert("Gagal memuat data wilayah.");
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
      alert("Nama dusun wajib diisi.");
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
      } else {
        const { error } = await supabase.from("wilayah_dusun").insert(payload);
        if (error) throw error;
      }

      await fetchData();
      setIsDusunSheetOpen(false);
    } catch (error) {
      console.error("Error saving dusun:", error);
      alert("Gagal menyimpan data dusun.");
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
            alert("Dusun tidak dapat dihapus karena masih memiliki RW.");
            return;
        }

        const { error } = await supabase.from("wilayah_dusun").delete().eq("id", id);
        if (error) throw error;
        
        await fetchData();
    } catch (error) {
        console.error("Error deleting dusun:", error);
        alert("Gagal menghapus dusun.");
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
        await fetchData();
      } catch (err) {
        console.error("Failed to update head directly:", err);
        alert("Gagal memperbarui Kepala Dusun.");
      }
    }
    setShowHeadPicker(false);
  };

  // Helper to find resident for display
  const getResidentByNik = (nik: string | null) => {
    if (!nik) return null;
    return residents.find(r => r.nik === nik);
  };

  return (
    <div className="flex h-full flex-col bg-body-bg">
      <PageHeader 
        title="Wilayah Administratif" 
        subtitle="Kelola data wilayah administratif desa (Dusun, RW, RT)." 
      />

      <div className="flex-1 overflow-hidden p-4 md:p-6 space-y-4 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Cari dusun atau kepala dusun..."
                    className="pl-9 bg-card-bg border-border-color text-primary-text dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {(filterStatus !== "all" || sortOrder !== "asc") && (
                      <div className="ml-2 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Urutkan</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortOrder("asc")} className="justify-between">
                    <span>Nama (A-Z)</span>
                    {sortOrder === "asc" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("desc")} className="justify-between">
                    <span>Nama (Z-A)</span>
                    {sortOrder === "desc" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status Kepala</DropdownMenuLabel>
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

            <Button onClick={handleOpenAddDusun} className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Dusun
            </Button>
        </div>

        {/* Clean Table */}
        <div className="flex-1 overflow-hidden border border-border-color rounded-xl bg-card-bg shadow-sm flex flex-col dark:bg-zinc-900 dark:border-zinc-800">
            <div className="overflow-auto flex-1">
            <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-secondary-text font-medium border-b border-border-color sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                    <th className="px-4 py-3 w-12 font-normal">No</th>
                    <th className="px-4 py-3 font-normal">Nama Dusun</th>
                    <th className="px-4 py-3 font-normal">Kepala Dusun</th>
                    <th className="px-4 py-3 font-normal">Kantor Dusun</th>
                    <th className="px-4 py-3 text-center font-normal">Struktur</th>
                    <th className="px-4 py-3 text-center font-normal">Penduduk</th>
                    <th className="px-4 py-3 text-right font-normal">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                {filteredDusunList.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-8 text-secondary-text">
                            Tidak ada data dusun ditemukan.
                        </td>
                    </tr>
                ) : (
                    filteredDusunList.map((dusun, idx) => (
                        <tr 
                            key={dusun.id} 
                            className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                        <td className="px-4 py-3 text-secondary-text">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-primary-text">{dusun.nama}</td>
                        <td className="px-4 py-3">
                            <button 
                                onClick={() => handleDirectHeadChange(dusun.id)}
                                className="flex items-center gap-2 group/head cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-md transition-all w-full sm:w-auto"
                                title="Klik untuk mengganti Kepala Dusun"
                            >
                                {dusun.kepalaNama ? (
                                    <>
                                        <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border-color flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                            {dusun.kepalaNama.substring(0, 1)}
                                        </div>
                                        <span className="text-primary-text font-medium">{dusun.kepalaNama}</span>
                                    </>
                                ) : (
                                    <span className="text-secondary-text italic text-[11px] flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Pilih Kepala
                                    </span>
                                )}
                            </button>
                        </td>
                        <td className="px-4 py-3 text-secondary-text">
                            {dusun.kantorAlamat ? (
                                <div className="flex items-center gap-2 max-w-[200px] truncate" title={dusun.kantorAlamat}>
                                    <MapPin className="h-3 w-3 text-secondary-text" />
                                    <span className="truncate">{dusun.kantorAlamat}</span>
                                </div>
                            ) : (
                                <span className="text-secondary-text italic">-</span>
                            )}
                        </td>
                        <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border-color text-[10px] text-zinc-600 dark:text-zinc-400">
                                <Layers className="h-3 w-3" />
                                <span>{dusun.stats.totalRw} RW</span>
                                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                                <span>{dusun.stats.totalRt} RT</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center">
                                <span className="font-medium text-primary-text">{dusun.stats.totalPenduduk}</span>
                                <span className="text-[10px] text-secondary-text">{dusun.stats.totalKk} KK</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-text hover:text-primary-text">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuLabel>Aksi Dusun</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleManageStructure(dusun.id)}>
                                        <Layers className="h-4 w-4 mr-2" />
                                        Struktur RW/RT
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditDusun(dusun)}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Info
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeleteDusun(dusun.id)} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </DropdownMenuItem>
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

        {/* Dusun Form Sheet */}
        <Sheet open={isDusunSheetOpen} onOpenChange={setIsDusunSheetOpen}>
          <SheetContent className="bg-white dark:bg-zinc-900 border-l border-border-color">
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
                  className="bg-card-bg border-border-color text-primary-text dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat" className="text-primary-text">Alamat Kantor (Opsional)</Label>
                <Input
                  id="alamat"
                  value={dusunForm.kantorAlamat}
                  onChange={(e) => setDusunForm({ ...dusunForm, kantorAlamat: e.target.value })}
                  placeholder="Contoh: Jl. Mawar No. 1"
                   className="bg-card-bg border-border-color text-primary-text dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-text">Kepala Dusun</Label>
                {dusunForm.kepalaNik ? (
                  <div className="flex items-center justify-between p-3 border border-border-color rounded-md bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                           {getResidentByNik(dusunForm.kepalaNik)?.nama.substring(0, 1)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-primary-text">{getResidentByNik(dusunForm.kepalaNik)?.nama}</p>
                            <p className="text-xs text-secondary-text">{dusunForm.kepalaNik}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDusunForm({...dusunForm, kepalaNik: null})} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full justify-start text-zinc-500 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700" onClick={() => { setHeadPickerContext({ mode: "form" }); setShowHeadPicker(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Pilih Kepala Dusun
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsDusunSheetOpen(false)} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700">Batal</Button>
              <Button onClick={handleSubmitDusun} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">Simpan</Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Structure Management Sheet */}
        <Sheet open={isStructureSheetOpen} onOpenChange={setIsStructureSheetOpen}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white dark:bg-zinc-900 border-l border-border-color dark:border-zinc-800">
                {selectedDusun && (
                    <>
                        <SheetHeader>
                            <SheetTitle>Struktur Wilayah: {selectedDusun.nama}</SheetTitle>
                            <SheetDescription>Kelola daftar Rukun Warga (RW) dan Rukun Tetangga (RT).</SheetDescription>
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

        {/* Resident Picker Modal */}
        <ResidentPickerModal
            open={showHeadPicker}
            onClose={() => setShowHeadPicker(false)}
            onSelect={handleSelectHead}
            residents={residents}
        />
      </div>
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
            alert("Gagal menambah RW");
            console.error(error);
        } else {
            onUpdate();
        }
    };

    const handleDeleteRw = async (rwId: number) => {
        if (!confirm("Hapus RW ini? Pastikan tidak ada RT di dalamnya.")) return;
        const { error } = await supabase.from("wilayah_rw").delete().eq("id", rwId);
        if (error) {
            alert("Gagal menghapus RW (Mungkin masih ada RT)");
        } else {
            onUpdate();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-lg dark:bg-blue-950/20 dark:border-blue-900/50">
                <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Daftar Rukun Warga (RW)</h4>
                    <p className="text-xs text-blue-600 mt-1 dark:text-blue-400">Total {sortedRw.length} RW terdaftar</p>
                </div>
                <Button size="sm" onClick={handleAddRw} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none dark:bg-blue-600 dark:hover:bg-blue-500">
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah RW
                </Button>
            </div>

            <div className="space-y-4">
                {sortedRw.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <Layers className="h-8 w-8 text-zinc-300 mb-2 dark:text-zinc-700" />
                        <p className="text-sm text-zinc-500 font-medium dark:text-zinc-400">Belum ada RW</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">Silakan tambahkan RW baru untuk dusun ini.</p>
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
            alert("Gagal menambah RT");
        } else {
            onUpdate();
            setIsExpanded(true);
        }
    };

    const handleDeleteRt = async (rtId: number) => {
        if (!confirm("Hapus RT ini?")) return;
        const { error } = await supabase.from("wilayah_rt").delete().eq("id", rtId);
        if (error) {
            alert("Gagal menghapus RT");
        } else {
            onUpdate();
        }
    };

    return (
        <div className="border border-zinc-200 rounded-lg bg-white shadow-sm overflow-hidden transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-bold shadow-sm transition-colors",
                        isExpanded ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50" : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700"
                    )}>
                        {formatNumberCode(rw.nomor_rw)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            RW {formatNumberCode(rw.nomor_rw)}
                            {isExpanded && <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium dark:bg-green-900/30 dark:text-green-400">Active</span>}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{sortedRt.length} Rukun Tetangga (RT)</div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-900/20" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 dark:text-zinc-500" onClick={() => setIsExpanded(!isExpanded)}>
                        <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                    </Button>
                </div>
            </div>
            
            {isExpanded && (
                <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 animate-in slide-in-from-top-1 duration-200 dark:bg-zinc-900/50 dark:border-zinc-800">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sortedRt.map(rt => (
                            <div key={rt.id} className="group relative flex items-center justify-between p-2.5 rounded-md border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">RT {formatNumberCode(rt.nomor_rt)}</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteRt(rt.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-all dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                    title="Hapus RT"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={handleAddRt}
                            className="flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-zinc-300 text-xs font-medium text-zinc-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-transparent dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah RT</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
