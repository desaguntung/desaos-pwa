"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  Search, 
  Check, 
  X,
  User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { getResidents, updateResident, Resident } from "@/lib/services/penduduk";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/FormFields";
import { FormSection } from "@/components/ui/FormSection";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import ResidentPickerModal from "@/components/ResidentPickerModal";

interface FamilyFormProps {
  initialData?: {
    familyId?: string;
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
  const [familyId, setFamilyId] = useState<string | null>(initialData?.familyId || null);

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

        // If editNoKK provided, fetch family data
        if (editNoKK) {
            setFetchingFamily(true);
            const supabase = createSupabaseBrowserClient();
            
            // Fetch family details
            const { data: family, error: familyError } = await supabase
                .from("keluarga")
                .select("*")
                .eq("no_kk", editNoKK)
                .single();

            if (familyError) throw familyError;

            if (family) {
                setFamilyId(family.id);
                setNoKK(family.no_kk);

                // Fetch residents related to this family
                const { data: familyMembers, error: membersError } = await supabase
                  .from("penduduk")
                  .select("*")
                  .eq("no_kk", editNoKK);
                  
                if (membersError) throw membersError;

                if (familyMembers) {
                  const head = familyMembers.find(m => m.nik === family.nik_kepala);
                  const otherMembers = familyMembers.filter(m => m.nik !== family.nik_kepala);

                  if (head) setSelectedHead(head);
                  setMembers(otherMembers);
                  setOriginalMembers(otherMembers); 
                }
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
        setMembers(initialData.members);
        setOriginalMembers(initialData.members);
      }
      if (initialData.familyId) setFamilyId(initialData.familyId);
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
  }, [loading]); // Re-run when loading finishes and refs are populated

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    const container = document.getElementById("form-scroll-container");
    
    if (element && container) {
      const offset = 24;
      // Calculate position relative to container
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
    setMembers(prev => prev.filter(m => m.id !== resident.id));
    setPickerMode(null);
  };

  const handleAddMember = (resident: Resident) => {
    // Check if already head
    if (selectedHead?.id === resident.id) {
        toast.error("Penduduk sudah terpilih sebagai Kepala Keluarga");
        return;
    }

    // Check if already in members
    if (members.some(m => m.id === resident.id)) {
      toast.error("Penduduk sudah ada dalam daftar anggota");
      return;
    }
    setMembers(prev => [...prev, resident]);
    setPickerMode(null);
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
      let targetFamilyId = initialData?.familyId;

      if (targetFamilyId) {
        // UPDATE
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
        // CREATE
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

      toast.success(initialData?.familyId ? "Keluarga berhasil diperbarui" : "Keluarga berhasil ditambahkan");
      router.push("/keluarga");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving family:", error);
      toast.error(error.message || "Gagal menyimpan data keluarga");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Helpers
  const ResidentItem = ({ 
    resident, 
    action, 
    actionIcon: Icon, 
    variant = "default" 
  }: { 
    resident: Resident; 
    action: () => void; 
    actionIcon: any; 
    variant?: "default" | "selected" 
  }) => (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
      variant === "selected" 
        ? "bg-card-bg border-border-color" 
        : "bg-card-bg border-border-color hover:border-primary-text/30"
    )}>
      <div className="min-w-0 flex-1 mr-3">
        <p className="text-sm font-semibold text-primary-text truncate">
          {resident.nama.toUpperCase()}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-secondary-text font-mono">
            {resident.nik}
          </span>
          <span className="text-xs border border-border-color px-1.5 py-0.5 rounded-full text-secondary-text">
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
            ? "text-error-text hover:bg-error-bg border-error-border"
            : "bg-body-bg text-secondary-text hover:bg-border-color"
        )}
      >
        <Icon className="w-4 h-4" />
      </button>
    </div>
  );

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
        disabled={isSubmitting || !selectedHead || !noKK}
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
                <ResidentItem 
                  resident={selectedHead} 
                  action={() => {
                    setSelectedHead(null);
                    setNoKK("");
                  }} 
                  actionIcon={X}
                  variant="selected"
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-secondary-text border-dashed h-12"
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
            <p className="text-xs text-secondary-text text-right -mt-4">
                {noKK.length}/16 digit
            </p>
          </div>
        </FormSection>

        {/* Section 2: Anggota Keluarga */}
        <FormSection
          id="anggota-keluarga"
          ref={(el) => { sectionRefs.current["anggota-keluarga"] = el; }}
          title="Anggota Keluarga"
          description="Tambahkan anggota keluarga lainnya."
          icon={Users}
        >
          <div className="space-y-6">
            {/* Search Member */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-text">Tambah Anggota</label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal text-secondary-text border-dashed h-12"
                onClick={() => setPickerMode("member")}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cari & Tambah Anggota Keluarga...
              </Button>
            </div>

            {/* List Members */}
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-color rounded-lg bg-body-bg/50">
                  <Users className="w-8 h-8 text-secondary-text mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-secondary-text">Belum ada anggota keluarga yang ditambahkan.</p>
                </div>
              ) : (
                members.map((member) => (
                  <ResidentItem 
                    key={member.id}
                    resident={member} 
                    action={() => handleRemoveMember(member.id!)} 
                    actionIcon={X}
                  />
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