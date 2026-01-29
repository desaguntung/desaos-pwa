"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users as UsersIcon,
  UserPlus,
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

function TambahRumahTanggaPageInner() {
  const router = useRouter();
  const { canCreate, canUpdate } = useRbac("rumah_tangga");
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHead, setSelectedHead] = useState<Resident | null>(null);
  const [members, setMembers] = useState<Resident[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Resident[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Additional Fields
  const [keterangan, setKeterangan] = useState("");
  const [bdtId, setBdtId] = useState("");
  const [dtksId, setDtksId] = useState("");

  // Layout State
  const [activeSection, setActiveSection] = useState("kepala-rtm");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  const sections = [
    { id: "kepala-rtm", label: "Kepala RTM" },
    { id: "informasi-rtm", label: "Informasi RTM" },
    { id: "anggota-rtm", label: "Anggota RTM" },
  ];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const residentsData = await fetchResidents();
      if (editId) {
        await fetchHouseholdData(editId, residentsData);
      }
      setLoading(false);
      // Trigger animation
      setTimeout(() => setIsVisible(true), 50);
    };
    init();
  }, [editId]);

  const fetchResidents = async () => {
    try {
      const data = await getResidents();
      setResidents(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Gagal memuat data penduduk");
      return [];
    }
  };

  const fetchHouseholdData = async (id: string, currentResidents: Resident[]) => {
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Fetch Household
      const { data: household, error: householdError } = await supabase
        .from("rumah_tangga")
        .select("*")
        .eq("id", id)
        .single();

      if (householdError) throw householdError;

      if (household) {
        setKeterangan(household.keterangan || "");
        setBdtId(household.bdt_id || "");
        setDtksId(household.dtks_id || "");

        // Identify Head and Members
        const householdMembers = currentResidents.filter(r => r.rumah_tangga_id === id);
        const head = householdMembers.find(m => m.nik === household.nik_kepala);
        const otherMembers = householdMembers.filter(m => m.nik !== household.nik_kepala);

        if (head) setSelectedHead(head);
        setMembers(otherMembers);
        setOriginalMembers(otherMembers);
      }
    } catch (error) {
      console.error("Error fetching household data:", error);
      toast.error("Gagal memuat data rumah tangga");
    }
  };

  const handleSelectHead = (resident: Resident) => {
    setSelectedHead(resident);
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
    if (!selectedHead) {
      toast.error("Mohon pilih kepala rumah tangga");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      let targetRtId = editId;

      if (targetRtId) {
        // UPDATE Existing Household
        const { error: rtError } = await supabase
          .from("rumah_tangga")
          .update({
            nik_kepala: selectedHead.nik,
            no_kk: selectedHead.no_kk || "-",
            alamat: selectedHead.alamat_saat_ini || selectedHead.dusun || "-",
            dusun: selectedHead.dusun || "-",
            rw: selectedHead.rw || "-",
            rt: selectedHead.rt || "-",
            keterangan: keterangan || null,
            bdt_id: bdtId || null,
            dtks_id: dtksId || null,
          })
          .eq("id", targetRtId);

        if (rtError) throw rtError;

        // Handle removed members
        const removedMembers = originalMembers.filter(
          om => !members.some(m => m.id === om.id)
        );

        for (const removed of removedMembers) {
           if (removed.id) {
             await updateResident(removed.id, {
               status_dalam_rumah_tangga: null,
               rumah_tangga_id: null
             });
           }
        }

      } else {
        // CREATE New Household
        const { data: rtData, error: rtError } = await supabase
          .from("rumah_tangga")
          .insert({
            nik_kepala: selectedHead.nik,
            no_kk: selectedHead.no_kk || "-",
            alamat: selectedHead.alamat_saat_ini || selectedHead.dusun || "-",
            dusun: selectedHead.dusun || "-",
            rw: selectedHead.rw || "-",
            rt: selectedHead.rt || "-",
            keterangan: keterangan || null,
            bdt_id: bdtId || null,
            dtks_id: dtksId || null,
            program_bantuan: [],
            tgl_daftar: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (rtError) throw rtError;
        targetRtId = rtData.id;
      }

      // Update Head
      if (selectedHead.id) {
        await updateResident(selectedHead.id, {
          status_dalam_rumah_tangga: "KEPALA RUMAH TANGGA",
          rumah_tangga_id: targetRtId,
        });
      }

      // Update Members
      for (const member of members) {
        if (member.id) {
          await updateResident(member.id, {
            status_dalam_rumah_tangga: member.status_dalam_rumah_tangga || "ANGGOTA",
            rumah_tangga_id: targetRtId,
          });
        }
      }

      toast.success(editId ? "Rumah Tangga berhasil diperbarui" : "Rumah Tangga berhasil ditambahkan");
      router.push("/rumah-tangga");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving household:", error);
      toast.error(error.message || "Gagal menyimpan data rumah tangga");
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
      return availableResidents.filter(r => !r.rumah_tangga_id).slice(0, 10);
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
    if (id === "kepala-rtm") return !!selectedHead;
    if (id === "anggota-rtm") return members.length > 0;
    return false;
  };

  if (!canCreate && !canUpdate) return null;

  return (
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader
        title={editId ? "Edit Rumah Tangga" : "Tambah Rumah Tangga"}
        subtitle={editId ? "Perbarui data rumah tangga yang sudah ada." : "Tambahkan data rumah tangga baru ke dalam sistem."}
        showBackButton={true}
        backButtonHref="/rumah-tangga"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedHead}
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
                <div className="max-w-3xl mx-auto p-6 md:p-10 pb-24">
                    
                    {/* Section 1: Kepala RTM */}
                    <SectionContainer 
                        id="kepala-rtm" 
                        title="Kepala Rumah Tangga" 
                        description="Pilih Kepala Rumah Tangga dari daftar penduduk."
                        sectionRef={(el) => (sectionRefs.current["kepala-rtm"] = el)}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Kepala RTM</Label>
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
                                                placeholder={showUnassignedOnly ? "Cari di daftar penduduk tanpa RTM..." : "Cari nama atau NIK penduduk..."}
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
                                                                {!resident.rumah_tangga_id && (
                                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                                                                        Tanpa RTM
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {showUnassignedOnly && filteredResidents.length === 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 text-center">
                                                    <p className="text-sm text-zinc-500">Tidak ada penduduk tanpa RTM yang ditemukan.</p>
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
                                            title="Tampilkan penduduk yang belum memiliki rumah tangga"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionContainer>

                    {/* Section 2: Informasi RTM */}
                    <SectionContainer 
                        id="informasi-rtm" 
                        title="Informasi RTM" 
                        description="Data tambahan terkait rumah tangga."
                        sectionRef={(el) => (sectionRefs.current["informasi-rtm"] = el)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Nomor BDT (Opsional)</Label>
                                <Input
                                    type="text"
                                    value={bdtId}
                                    onChange={(e) => setBdtId(e.target.value)}
                                    placeholder="Contoh: BDT-2024-001"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nomor DTKS (Opsional)</Label>
                                <Input
                                    type="text"
                                    value={dtksId}
                                    onChange={(e) => setDtksId(e.target.value)}
                                    placeholder="Contoh: DTKS-2024-001"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label>Keterangan Tambahan</Label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[14px] font-medium text-[#171717] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                    placeholder="Keterangan lain jika diperlukan..."
                                />
                            </div>
                        </div>
                    </SectionContainer>

                    {/* Section 3: Anggota RTM */}
                    <SectionContainer 
                        id="anggota-rtm" 
                        title="Anggota RTM" 
                        description="Tambahkan anggota rumah tangga lainnya."
                        sectionRef={(el) => (sectionRefs.current["anggota-rtm"] = el)}
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
                                            placeholder={showUnassignedOnly ? "Cari di daftar penduduk tanpa RTM..." : "Cari anggota rumah tangga..."}
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
                                                            {!resident.rumah_tangga_id && (
                                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                                                                    Tanpa RTM
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showUnassignedOnly && filteredResidents.length === 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 text-center">
                                                <p className="text-sm text-zinc-500">Tidak ada penduduk tanpa RTM yang ditemukan.</p>
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
                                        title="Tampilkan penduduk yang belum memiliki rumah tangga"
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
                                        <p className="text-sm text-zinc-500">Belum ada anggota rumah tangga ditambahkan</p>
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

export default function TambahRumahTanggaPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
        </div>
    }>
      <TambahRumahTanggaPageInner />
    </Suspense>
  );
}
