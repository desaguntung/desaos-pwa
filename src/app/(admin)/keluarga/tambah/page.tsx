"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users as UsersIcon,
  UserPlus,
  CreditCard,
  Search,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useRbac } from "@/useRbac";
import {
  getResidents,
  updateResident,
  Resident,
} from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";

// --- Helper Components ---

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <label className={cn("text-[13px] font-medium text-zinc-700 mb-1.5 block", className)}>
        {children}
    </label>
);

const SectionContainer = ({ 
  id, 
  title, 
  description, 
  children, 
  sectionRef 
}: { 
  id: string; 
  title: string; 
  description?: string; 
  children: React.ReactNode;
  sectionRef: (el: HTMLDivElement | null) => void;
}) => (
  <div 
    id={id} 
    ref={sectionRef} 
    className="scroll-mt-6 bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-8 shadow-sm"
  >
    <div className="mb-6 border-b border-zinc-200 pb-4">
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
    </div>
    {children}
  </div>
);

function ResidentItem({ 
  resident, 
  action, 
  actionIcon: Icon, 
  variant = "default" 
}: { 
  resident: Resident; 
  action: () => void; 
  actionIcon: any; 
  variant?: "default" | "selected" 
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
      variant === "selected" 
        ? "bg-white border-zinc-200 shadow-sm" 
        : "bg-white border-zinc-200 hover:border-zinc-300"
    )}>
      <div className="min-w-0 flex-1 mr-3">
        <p className="text-sm font-semibold text-zinc-900 truncate">
          {resident.nama.toUpperCase()}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500 font-mono">
            {resident.nik}
          </span>
          <span className="text-[10px] border border-zinc-200 px-1.5 py-0.5 rounded-full text-zinc-500">
            {resident.jenis_kelamin}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          action();
        }}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          variant === "selected"
            ? "text-rose-500 hover:bg-rose-50"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        )}
      >
        <Icon className="w-4 h-4" />
      </button>
    </div>
  );
}

function TambahKeluargaPageInner() {
  const router = useRouter();
  const { canCreate, canUpdate } = useRbac("keluarga");
  const searchParams = useSearchParams();
  const initialHeadId = searchParams.get("headId");
  const editNoKK = searchParams.get("no_kk");

  // State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHead, setSelectedHead] = useState<Resident | null>(null);
  const [members, setMembers] = useState<Resident[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Resident[]>([]);
  const [noKK, setNoKK] = useState("");
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("informasi-utama");
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  const sections = [
    { id: "informasi-utama", label: "Informasi Utama" },
    { id: "anggota-keluarga", label: "Anggota Keluarga" },
  ];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const residentsData = await fetchResidents();
      if (editNoKK) {
        await fetchFamilyData(editNoKK, residentsData);
      }
      setLoading(false);
      // Trigger animation
      setTimeout(() => setIsVisible(true), 50);
    };
    init();
  }, [editNoKK]);

  const fetchResidents = async () => {
    try {
      const data = await getResidents();
      setResidents(data || []);
      
      if (initialHeadId && data && !editNoKK) {
        const head = data.find(r => r.id && String(r.id) === initialHeadId);
        if (head) handleSelectHead(head);
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Gagal memuat data penduduk");
      return [];
    }
  };

  const fetchFamilyData = async (kk: string, currentResidents: Resident[]) => {
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Fetch Family
      const { data: family, error: familyError } = await supabase
        .from("keluarga")
        .select("*")
        .eq("no_kk", kk)
        .single();

      if (familyError) throw familyError;

      if (family) {
        setFamilyId(family.id);
        setNoKK(family.no_kk);

        // Identify Head and Members from residents list
        const familyMembers = currentResidents.filter(r => r.no_kk === kk);
        const head = familyMembers.find(m => m.nik === family.nik_kepala);
        const otherMembers = familyMembers.filter(m => m.nik !== family.nik_kepala);

        if (head) setSelectedHead(head);
        setMembers(otherMembers);
        setOriginalMembers(otherMembers); // Track original members for removal logic
      }
    } catch (error) {
      console.error("Error fetching family data:", error);
      toast.error("Gagal memuat data keluarga");
    }
  };

  const handleSelectHead = (resident: Resident) => {
    setSelectedHead(resident);
    if (resident.no_kk) setNoKK(resident.no_kk);
    setMembers(prev => prev.filter(m => m.id !== resident.id));
  };

  const handleAddMember = (resident: Resident) => {
    if (members.some(m => m.id === resident.id)) {
      toast.error("Penduduk sudah ada dalam daftar anggota");
      return;
    }
    setMembers(prev => [...prev, resident]);
  };

  const handleRemoveMember = (residentId: string) => {
    setMembers(prev => prev.filter(m => m.id !== residentId));
  };

  const handleSubmit = async () => {
    if (!selectedHead || !noKK) {
      toast.error("Mohon lengkapi data kepala keluarga dan nomor KK");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      let targetFamilyId = familyId;

      if (targetFamilyId) {
        // UPDATE Existing Family
        const { error: updateError } = await supabase
          .from("keluarga")
          .update({
            no_kk: noKK,
            nik_kepala: selectedHead.nik,
            alamat: selectedHead.alamat_saat_ini || selectedHead.dusun || "-",
            dusun: selectedHead.dusun || "-",
            rw: selectedHead.rw || "-",
            rt: selectedHead.rt || "-",
          })
          .eq("id", targetFamilyId);

        if (updateError) throw updateError;
        
        // Handle removed members
        const removedMembers = originalMembers.filter(
          om => !members.some(m => m.id === om.id)
        );
        
        for (const removed of removedMembers) {
           if (removed.id) {
             await updateResident(removed.id, {
               no_kk: "",
               status_dalam_keluarga: null,
               keluarga_id: null
             });
           }
        }

      } else {
        // CREATE New Family
        const { data: keluargaData, error: keluargaError } = await supabase
          .from("keluarga")
          .insert({
            no_kk: noKK,
            nik_kepala: selectedHead.nik,
            alamat: selectedHead.alamat_saat_ini || selectedHead.dusun || "-",
            dusun: selectedHead.dusun || "-",
            rw: selectedHead.rw || "-",
            rt: selectedHead.rt || "-",
            kode_pos: "00000",
            desa_kelurahan: "Desa",
            kecamatan: "Kecamatan",
            kabupaten_kota: "Kabupaten",
            provinsi: "Provinsi",
          })
          .select()
          .single();

        if (keluargaError) throw keluargaError;
        targetFamilyId = keluargaData.id;
      }

      // Update Head
      if (selectedHead.id) {
        await updateResident(selectedHead.id, {
          no_kk: noKK,
          status_dalam_keluarga: "KEPALA KELUARGA",
          keluarga_id: targetFamilyId,
        });
      }

      // Update Members
      for (const member of members) {
        if (member.id) {
          await updateResident(member.id, {
            no_kk: noKK,
            status_dalam_keluarga: member.status_dalam_keluarga || "ANAK",
            keluarga_id: targetFamilyId,
          });
        }
      }

      toast.success(familyId ? "Keluarga berhasil diperbarui" : "Keluarga berhasil ditambahkan");
      router.push("/keluarga");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving family:", error);
      toast.error(error.message || "Gagal menyimpan data keluarga");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableResidents = useMemo(() => {
    return residents.filter(r => {
      if (selectedHead?.id === r.id) return false;
      if (members.some(m => m.id === r.id)) return false;
      return true;
    });
  }, [residents, selectedHead, members]);

  const filteredResidents = useMemo(() => {
    if (showUnassignedOnly) {
      return availableResidents.filter(r => !r.no_kk).slice(0, 10);
    }

    if (!searchTerm) return [];
    const lowerTerm = searchTerm.toLowerCase();
    return availableResidents.filter(
      (r) =>
        r.nama.toLowerCase().includes(lowerTerm) ||
        r.nik.includes(lowerTerm)
    ).slice(0, 5);
  }, [availableResidents, searchTerm, showUnassignedOnly]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: document.getElementById("form-scroll-container"), rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const isSectionComplete = (id: string) => {
    if (id === "informasi-utama") return !!(selectedHead && noKK);
    if (id === "anggota-keluarga") return members.length > 0;
    return false;
  };

  if (!canCreate && !canUpdate) return null;

  return (
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader
        title={familyId ? "Edit Keluarga" : "Tambah Keluarga"}
        subtitle={familyId ? "Perbarui data keluarga yang sudah ada." : "Tambahkan data keluarga baru ke dalam sistem."}
        showBackButton={true}
        backButtonHref="/keluarga"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedHead || !noKK}
              className="bg-zinc-900 text-white hover:bg-zinc-800 h-8 text-xs px-3"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 overflow-hidden p-4">
        <div 
            className={cn(
                "flex h-full w-full bg-white flex-col md:flex-row overflow-hidden border border-zinc-200 rounded-xl shadow-sm transition-all duration-500 ease-out transform",
                isVisible 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-8"
            )}
        >
            {/* Sidebar Navigation - Fixed Left Panel */}
            <div className="hidden md:flex flex-col w-64 shrink-0 border-r border-zinc-200 bg-zinc-50/50 h-full">
                <div className="p-4 sticky top-0 bg-zinc-50/50 z-10 border-b border-zinc-200/50 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-zinc-900">Daftar Isian</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Progress pengisian data</p>
                </div>
                <div className="p-3 space-y-0.5 flex-1 overflow-y-auto">
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        const isComplete = isSectionComplete(section.id);
                        
                        return (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={cn(
                                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-all relative group",
                                    isActive
                                        ? "bg-zinc-200/50 text-zinc-900 font-medium shadow-sm"
                                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                                )}
                            >
                                {/* Status Indicator */}
                                <div className={cn(
                                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    isComplete 
                                        ? "border-zinc-900 bg-zinc-900 text-white"
                                        : isActive 
                                            ? "border-zinc-400 bg-transparent"
                                            : "border-zinc-300 bg-transparent group-hover:border-zinc-400"
                                )}>
                                    {isComplete && <Check className="h-2 w-2" />}
                                    {!isComplete && isActive && <div className="h-1.5 w-1.5 rounded-full bg-zinc-900" />}
                                </div>

                                <span className="text-[13px] truncate">
                                    {section.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="h-[80px] px-6 border-t border-zinc-200 bg-zinc-50/80 flex items-center">
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Status</span>
                            <span className="text-xs font-medium text-zinc-700">
                                {sections.filter(s => isSectionComplete(s.id)).length} dari {sections.length} Lengkap
                            </span>
                        </div>
                        {/* Mini Progress Bar */}
                        <div className="h-1 flex-1 bg-zinc-200 rounded-full overflow-hidden ml-2">
                            <div 
                                className="h-full bg-zinc-900 transition-all duration-500" 
                                style={{ width: `${(sections.filter(s => isSectionComplete(s.id)).length / sections.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 h-full overflow-y-auto bg-white" id="form-scroll-container">
                <div className="max-w-4xl mx-auto py-8 px-8 pb-24">
                    
                    {/* Section 1: Informasi Utama */}
                    <SectionContainer 
                        id="informasi-utama" 
                        title="Informasi Utama" 
                        description="Tentukan kepala keluarga dan nomor Kartu Keluarga."
                        sectionRef={(el) => (sectionRefs.current["informasi-utama"] = el)}
                    >
                        <div className="space-y-6">
                            {/* Cari Kepala Keluarga */}
                            <div className="space-y-2">
                                <Label>Kepala Keluarga</Label>
                                {selectedHead ? (
                                    <ResidentItem 
                                        resident={selectedHead} 
                                        action={() => setSelectedHead(null)} 
                                        actionIcon={X}
                                        variant="selected"
                                    />
                                ) : (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder={showUnassignedOnly ? "Cari di daftar penduduk tanpa KK..." : "Cari nama atau NIK penduduk..."}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                        {(searchTerm || showUnassignedOnly) && filteredResidents.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredResidents.map((resident) => (
                                                    <div
                                                        key={resident.id}
                                                        onClick={() => {
                                                            handleSelectHead(resident);
                                                            setSearchTerm("");
                                                            setShowUnassignedOnly(false);
                                                        }}
                                                        className="p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-medium text-zinc-900">{resident.nama}</p>
                                                                <p className="text-xs text-zinc-500">{resident.nik}</p>
                                                            </div>
                                                            {!resident.no_kk && (
                                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                                                                    Tanpa KK
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showUnassignedOnly && filteredResidents.length === 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 text-center">
                                                <p className="text-sm text-zinc-500">Tidak ada penduduk tanpa KK yang ditemukan.</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                                        className={cn(
                                            "px-3 shrink-0 transition-colors", 
                                            showUnassignedOnly ? "bg-zinc-100 border-zinc-400 text-zinc-900" : "text-zinc-500"
                                        )}
                                        title="Tampilkan penduduk yang belum memiliki keluarga"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                                )}
                            </div>

                            {/* Nomor KK */}
                            <div className="space-y-2">
                                <Label>Nomor Kartu Keluarga</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CreditCard className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        value={noKK}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            if (val.length <= 16) setNoKK(val);
                                        }}
                                        placeholder="16 digit Nomor KK"
                                        className="pl-10 font-mono tracking-wide"
                                        maxLength={16}
                                    />
                                </div>
                                <p className="text-[11px] text-zinc-500 text-right">
                                    {noKK.length}/16 digit
                                </p>
                            </div>
                        </div>
                    </SectionContainer>

                    {/* Section 2: Anggota Keluarga */}
                    <SectionContainer 
                        id="anggota-keluarga" 
                        title="Anggota Keluarga" 
                        description="Tambahkan anggota keluarga lainnya."
                        sectionRef={(el) => (sectionRefs.current["anggota-keluarga"] = el)}
                    >
                        <div className="space-y-6">
                            {/* Search Member */}
                            <div className="space-y-2">
                                <Label>Tambah Anggota</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserPlus className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder={showUnassignedOnly ? "Cari di daftar penduduk tanpa KK..." : "Cari anggota keluarga..."}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                        {(searchTerm || showUnassignedOnly) && filteredResidents.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredResidents.map((resident) => (
                                                    <div
                                                        key={resident.id}
                                                        onClick={() => {
                                                            handleAddMember(resident);
                                                            setSearchTerm("");
                                                            // Keep showUnassignedOnly true if it was true, to allow adding multiple
                                                        }}
                                                        className="p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-medium text-zinc-900">{resident.nama}</p>
                                                                <p className="text-xs text-zinc-500">{resident.nik}</p>
                                                            </div>
                                                            {!resident.no_kk && (
                                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                                                                    Tanpa KK
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showUnassignedOnly && filteredResidents.length === 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 text-center">
                                                <p className="text-sm text-zinc-500">Tidak ada penduduk tanpa KK yang ditemukan.</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                                        className={cn(
                                            "px-3 shrink-0 transition-colors", 
                                            showUnassignedOnly ? "bg-zinc-100 border-zinc-400 text-zinc-900" : "text-zinc-500"
                                        )}
                                        title="Tampilkan penduduk yang belum memiliki keluarga"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* List Members */}
                            <div className="space-y-2">
                                <Label>Daftar Anggota ({members.length})</Label>
                                {members.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50">
                                        <UsersIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                        <p className="text-sm text-zinc-500">Belum ada anggota keluarga ditambahkan</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {members.map((member) => (
                                            <ResidentItem 
                                                key={member.id}
                                                resident={member} 
                                                action={() => handleRemoveMember(member.id!)} 
                                                actionIcon={X}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionContainer>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function TambahKeluargaPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
        </div>
    }>
      <TambahKeluargaPageInner />
    </Suspense>
  );
}
