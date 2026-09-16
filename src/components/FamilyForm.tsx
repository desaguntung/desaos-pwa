"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  Search, 
  X,
  User,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateResident, Resident, HUBUNGAN_KELUARGA_OPTIONS } from "@/lib/services/penduduk";
import { getFamilyByNoKK, sortFamilyMembers } from "@/lib/services/keluarga";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/FormFields";
import { FormSection } from "@/components/ui/FormSection";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import ResidentPickerModal from "@/components/ResidentPickerModal";

interface FamilyFormProps {
  initialData?: {
    noKK?: string;
    head?: Resident;
    members?: Resident[];
  };
  editNoKK?: string;
  mode?: "create" | "edit";
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

export default function FamilyForm({
  initialData,
  editNoKK,
  mode = "create",
  title,
  subtitle,
  backButtonHref = "/keluarga"
}: FamilyFormProps) {
  const router = useRouter();
  
  // Form State
  const [noKK, setNoKK] = useState(initialData?.noKK || "");
  const [selectedHead, setSelectedHead] = useState<Resident | null>(initialData?.head || null);
  const [members, setMembers] = useState<Resident[]>(initialData?.members || []);
  const [originalMembers, setOriginalMembers] = useState<Resident[]>(initialData?.members || []); // To track removals

  // UI State
  const [loading, setLoading] = useState(true);
  const [fetchingFamily, setFetchingFamily] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("informasi-utama");
  
  // Modal State
  const [pickerMode, setPickerMode] = useState<"head" | "member" | null>(null);

  // Layout Refs
  const sections = [
    { id: "informasi-utama", title: "Informasi Utama", icon: CreditCard, description: "Kepala Keluarga & No. KK" },
    { id: "anggota-keluarga", title: "Anggota Keluarga", icon: Users, description: "Daftar Anggota Keluarga" },
  ];
  
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch Family Data (if edit mode)
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        if (editNoKK) {
          setFetchingFamily(true);
          const family = await getFamilyByNoKK(editNoKK);

          if (family && family.members.length > 0) {
            setNoKK(family.nomorKK);
            
            const head = family.members.find(
              m => (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA" || (m as any).hubungan_keluarga_id === 1
            ) || family.members[0];

            const otherMembers = family.members.filter(m => m.nik !== head.nik);

            setSelectedHead(head);
            setMembers(sortFamilyMembers(otherMembers));
            setOriginalMembers(sortFamilyMembers(otherMembers));
          } else {
            toast.error("Data keluarga tidak ditemukan");
          }
          setFetchingFamily(false);
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("Gagal memuat data keluarga");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [editNoKK]);

  // Sync initial data if provided later (e.g. async fetch in parent)
  useEffect(() => {
    if (initialData) {
      if (initialData.noKK) setNoKK(initialData.noKK);
      if (initialData.head) setSelectedHead(initialData.head);
      if (initialData.members) {
        setMembers(sortFamilyMembers(initialData.members));
        setOriginalMembers(sortFamilyMembers(initialData.members));
      }
    }
  }, [initialData]);

  // Scroll Spy
  useEffect(() => {
    const container = document.getElementById("form-scroll-container");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        root: container, 
        rootMargin: "-20% 0px -60% 0px", 
        threshold: 0.1 
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    const container = document.getElementById("form-scroll-container");
    
    if (element && container) {
      const offset = 24;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top;
      
      container.scrollBy({
        top: relativeTop - offset,
        behavior: "smooth"
      });
    }
  };

  // Logic
  const handleSelectHead = (resident: Resident) => {
    setSelectedHead(resident);
    if (resident.no_kk && !noKK) setNoKK(resident.no_kk);
    // If head was in members, remove from members
    setMembers(prev => prev.filter(m => m.nik !== resident.nik));
    setPickerMode(null);
  };

  const handleAddMember = (resident: Resident) => {
    if (selectedHead?.nik === resident.nik) {
      toast.error("Penduduk sudah terpilih sebagai Kepala Keluarga");
      return;
    }

    if (members.some(m => m.nik === resident.nik)) {
      toast.error("Penduduk sudah ada dalam daftar anggota");
      return;
    }
    
    const newMember: Resident = {
      ...resident,
      hubungan_keluarga: resident.hubungan_keluarga || "ANAK"
    };
    
    setMembers(prev => sortFamilyMembers([...prev, newMember]));
    setPickerMode(null);
  };

  const handleRemoveMember = (nik: string) => {
    setMembers(prev => prev.filter(m => m.nik !== nik));
  };

  const handleMemberRelationshipChange = (nik: string, hubungan: string) => {
    setMembers(prev => {
      const updated = prev.map(m => m.nik === nik ? { ...m, hubungan_keluarga: hubungan } : m);
      return sortFamilyMembers(updated);
    });
  };

  const handleSubmit = async () => {
    if (!selectedHead || !noKK.trim()) {
      toast.error("Mohon lengkapi data kepala keluarga dan nomor KK (16 digit)");
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanNoKK = noKK.trim();

      // 1. Update Head
      const headTargetId = selectedHead.id ? String(selectedHead.id) : selectedHead.nik;
      await updateResident(headTargetId, {
        no_kk: cleanNoKK,
        hubungan_keluarga: "KEPALA KELUARGA",
        hubungan_keluarga_id: 1,
        status_dalam_keluarga: "KEPALA KELUARGA"
      });

      // 2. Update Members
      for (const member of members) {
        const memberTargetId = member.id ? String(member.id) : member.nik;
        await updateResident(memberTargetId, {
          no_kk: cleanNoKK,
          hubungan_keluarga: member.hubungan_keluarga || "ANAK",
          status_dalam_keluarga: member.hubungan_keluarga || "ANAK",
        });
      }

      // 3. Handle removed members
      const removedMembers = originalMembers.filter(
        om => om.nik !== selectedHead.nik && !members.some(m => m.nik === om.nik)
      );

      for (const removed of removedMembers) {
        const removedTargetId = removed.id ? String(removed.id) : removed.nik;
        await updateResident(removedTargetId, {
          no_kk: "",
          hubungan_keluarga: "",
          status_dalam_keluarga: null,
        });
      }

      toast.success(mode === "edit" || editNoKK ? "Data keluarga berhasil diperbarui" : "Data keluarga berhasil ditambahkan");
      router.push("/keluarga");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving family:", error);
      toast.error(error.message || "Gagal menyimpan data keluarga");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={() => router.push(backButtonHref)}
        className="text-secondary-text hover:text-primary-text"
        disabled={isSubmitting}
      >
        Batal
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedHead || !noKK.trim()}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Data"}
      </Button>
    </div>
  );

  return (
    <FormLayout
      title={title || (mode === "create" ? "Tambah Keluarga" : "Edit Keluarga")}
      subtitle={subtitle || (mode === "create" ? "Tambahkan data keluarga baru." : "Perbarui data keluarga.")}
      backButtonHref={backButtonHref}
      actions={formActions}
      sidebar={
        <FormSidebarNav 
          sections={sections} 
          activeSection={activeSection} 
          onSectionClick={scrollToSection} 
        />
      }
    >
      <div className="space-y-8 pb-24">
        {/* Section 1: Informasi Utama */}
        <FormSection
          id="informasi-utama"
          ref={(el) => { sectionRefs.current["informasi-utama"] = el; }}
          title="Informasi Utama"
          description="Tentukan kepala keluarga dan nomor Kartu Keluarga."
          icon={CreditCard}
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Cari Kepala Keluarga */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-text">Kepala Keluarga</label>
              {selectedHead ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border-color bg-card-bg">
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {selectedHead.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-primary-text truncate uppercase">
                        {selectedHead.nama}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-secondary-text">
                        <span className="font-mono">NIK: {selectedHead.nik}</span>
                        <span>•</span>
                        <span>{selectedHead.jenis_kelamin || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedHead(null);
                    }}
                    className="text-secondary-text hover:text-error-text"
                    title="Ganti Kepala Keluarga"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-secondary-text border-dashed h-12 rounded-xl"
                  onClick={() => setPickerMode("head")}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Cari Kepala Keluarga...
                </Button>
              )}
            </div>

            {/* Nomor KK */}
            <InputField
              label="Nomor Kartu Keluarga"
              placeholder="16 digit Nomor KK"
              value={noKK}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 16) setNoKK(val);
              }}
              icon={<CreditCard className="h-4 w-4 text-secondary-text" />}
              maxLength={16}
            />
            <p className="text-xs text-secondary-text text-right -mt-4 font-mono">
              {noKK.length}/16 digit
            </p>
          </div>
        </FormSection>

        {/* Section 2: Anggota Keluarga */}
        <FormSection
          id="anggota-keluarga"
          ref={(el) => { sectionRefs.current["anggota-keluarga"] = el; }}
          title="Anggota Keluarga"
          description="Tambahkan anggota keluarga lainnya serta tentukan status hubungannya."
          icon={Users}
        >
          <div className="space-y-6">
            {/* Search Member */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-text">Tambah Anggota</label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal text-secondary-text border-dashed h-12 rounded-xl"
                onClick={() => setPickerMode("member")}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cari & Tambah Anggota Keluarga...
              </Button>
            </div>

            {/* List Members */}
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-color rounded-xl bg-body-bg/50">
                  <Users className="w-8 h-8 text-secondary-text mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-secondary-text">Belum ada anggota keluarga yang ditambahkan.</p>
                </div>
              ) : (
                members.map((member, index) => (
                  <div 
                    key={member.nik || index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border-color bg-card-bg gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-secondary-text flex items-center justify-center font-bold text-xs shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary-text truncate uppercase">
                          {member.nama}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-secondary-text">
                          <span className="font-mono">NIK: {member.nik}</span>
                          <span>•</span>
                          <span>{member.jenis_kelamin || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        value={(member.hubungan_keluarga || "ANAK").toUpperCase()}
                        onChange={(e) => handleMemberRelationshipChange(member.nik, e.target.value)}
                        className="h-8 px-2.5 text-xs font-medium rounded-lg border border-border-color bg-body-bg text-primary-text focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {HUBUNGAN_KELUARGA_OPTIONS.filter(opt => opt !== "KEPALA KELUARGA").map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.nik)}
                        className="h-8 w-8 text-secondary-text hover:text-error-text"
                        title="Hapus dari KK"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </FormSection>
      </div>

      <ResidentPickerModal
        open={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        onSelect={pickerMode === "head" ? handleSelectHead : handleAddMember}
        onlyUnassigned={true}
      />
    </FormLayout>
  );
}