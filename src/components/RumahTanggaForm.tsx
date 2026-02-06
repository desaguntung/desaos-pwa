"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  Home, 
  Search, 
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { updateResident, Resident } from "@/lib/services/penduduk";
import { getWilayahData, Dusun, Rw, Rt } from "@/lib/services/wilayah";
import { Button } from "@/components/ui/Button";
import { InputField, TextAreaField, DatePickerField } from "@/components/ui/FormFields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { FormSection } from "@/components/ui/FormSection";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import ResidentPickerModal from "@/components/ResidentPickerModal";

interface RumahTanggaFormProps {
  initialData?: {
    id?: string;
    no_rtm?: string;
    tgl_daftar?: string;
    kelas_sosial?: number;
    bdt?: string; // BDT ID
    dtks?: string; // DTKS ID
    alamat?: string;
    dusun?: string;
    rw?: string;
    rt?: string;
    keterangan?: string;
    head?: Resident;
    members?: Resident[];
  };
  editId?: string;
  mode?: "create" | "edit";
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

export default function RumahTanggaForm({
  initialData,
  editId,
  mode = "create",
  title,
  subtitle,
  backButtonHref = "/rumah-tangga"
}: RumahTanggaFormProps) {
  const router = useRouter();
  
  // Form State
  const [noRtm, setNoRtm] = useState(initialData?.no_rtm || "");
  const [tglDaftar, setTglDaftar] = useState(initialData?.tgl_daftar || new Date().toISOString().split('T')[0]);
  const [kelasSosial, setKelasSosial] = useState<string>(initialData?.kelas_sosial ? String(initialData.kelas_sosial) : "");
  const [bdt, setBdt] = useState(initialData?.bdt || "");
  const [dtks, setDtks] = useState(initialData?.dtks || "");
  const [alamat, setAlamat] = useState(initialData?.alamat || "");
  const [dusun, setDusun] = useState(initialData?.dusun || "");
  const [rw, setRw] = useState(initialData?.rw || "");
  const [rt, setRt] = useState(initialData?.rt || "");
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || "");
  
  const [selectedHead, setSelectedHead] = useState<Resident | null>(initialData?.head || null);
  const [members, setMembers] = useState<Resident[]>(initialData?.members || []);
  const [originalMembers, setOriginalMembers] = useState<Resident[]>(initialData?.members || []); // To track removals
  const [rtmId, setRtmId] = useState<string | null>(initialData?.id || null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [fetchingRtm, setFetchingRtm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("kepala-rtm");
  
  // Modal State
  const [pickerMode, setPickerMode] = useState<"head" | "member" | null>(null);

  // Wilayah Data
  const [dusunList, setDusunList] = useState<Dusun[]>([]);
  const [rwList, setRwList] = useState<Rw[]>([]);
  const [rtList, setRtList] = useState<Rt[]>([]);
  
  // Layout Refs
  const sections = [
    { id: "kepala-rtm", title: "Kepala Rumah Tangga", icon: Users, description: "Pilih Kepala Rumah Tangga" },
    { id: "informasi-rtm", title: "Informasi RTM", icon: Home, description: "Data Rumah Tangga" },
    { id: "anggota-rtm", title: "Anggota Rumah Tangga", icon: UserPlus, description: "Daftar Anggota" },
  ];
  
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch Residents & RTM Data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Fetch Wilayah Data
        const wilayah = await getWilayahData();
        setDusunList(wilayah.dusunList);
        setRwList(wilayah.rwList);
        setRtList(wilayah.rtList);

        if (!editId) {
            setLoading(false);
            return;
        }

        setFetchingRtm(true);
        const supabase = createSupabaseBrowserClient();
        
        // 1. Fetch RTM Data
        const { data: rtm, error: rtmError } = await supabase
            .from("rumah_tangga")
            .select("*")
            .eq("id", editId)
            .single();

        if (rtmError) throw rtmError;

        if (rtm) {
            setRtmId(rtm.id);
            setNoRtm(rtm.no_rtm || "");
            setTglDaftar(rtm.tgl_daftar || "");
            setKelasSosial(rtm.kelas_sosial ? String(rtm.kelas_sosial) : "");
            setBdt(rtm.bdt || rtm.bdt_id || "");
            setDtks(rtm.dtks_id || "");
            setAlamat(rtm.alamat || "");
            setDusun(rtm.dusun || "");
            setRw(rtm.rw || "");
            setRt(rtm.rt || "");
            setKeterangan(rtm.keterangan || "");

            // 2. Fetch Members for this RTM
            const { data: rtmMembers, error: membersError } = await supabase
                .from("penduduk")
                .select("*")
                .eq("rumah_tangga_id", editId);
            
            if (membersError) throw membersError;

            if (rtmMembers) {
                const head = rtmMembers.find((m: Resident) => m.nik === rtm.nik_kepala);
                const otherMembers = rtmMembers.filter((m: Resident) => m.nik !== rtm.nik_kepala);

                if (head) setSelectedHead(head);
                setMembers(otherMembers);
                setOriginalMembers(otherMembers);
            }
        }
        setFetchingRtm(false);
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [editId]);

  const formatNumberCode = (value: number) => {
    if (value <= 0) return "00";
    if (value < 10) return `0${value}`;
    return String(value);
  };

  const filteredRwList = dusun ? (() => {
    const selectedDusunId = dusunList.find(d => d.nama === dusun)?.id;
    if (!selectedDusunId) return [];
    return rwList.filter(r => r.dusun_id === selectedDusunId);
  })() : [];

  const filteredRtList = rw ? (() => {
    const selectedDusunId = dusunList.find(d => d.nama === dusun)?.id;
    // We match RW by number AND dusun_id because RW numbers repeat across Dusuns
    // BUT wait, in the form RW is just stored as string (number).
    // If user selects RW '01', we need to find WHICH '01' it is (the one in current Dusun).
    if (!selectedDusunId) return [];
    
    // rw is stored as formatted string e.g. "01" or "1".
    // rwList has nomor_rw as number.
    const rwNum = parseInt(rw);
    const selectedRwId = rwList.find(r => r.dusun_id === selectedDusunId && r.nomor_rw === rwNum)?.id;
    
    if (!selectedRwId) return [];
    return rtList.filter(r => r.rw_id === selectedRwId);
  })() : [];

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
    
    // Auto-fill address info if empty
    if (!alamat && resident.alamat_saat_ini) setAlamat(resident.alamat_saat_ini);
    else if (!alamat && resident.dusun) setAlamat(resident.dusun); // Fallback
    
    if (!dusun && resident.dusun) setDusun(resident.dusun);
    if (!rw && resident.rw) setRw(resident.rw);
    if (!rt && resident.rt) setRt(resident.rt);

    // If head was in members, remove from members
    setMembers(prev => prev.filter(m => m.id !== resident.id));
    setPickerMode(null);
  };

  const handleAddMember = (resident: Resident) => {
    if (selectedHead?.id === resident.id) {
      toast.error("Penduduk sudah terpilih sebagai Kepala Rumah Tangga");
      return;
    }

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
    if (!selectedHead) {
      toast.error("Mohon pilih Kepala Rumah Tangga");
      return;
    }
    // No RTM is optional in some contexts but usually required. Let's make it required if user enters it, 
    // but looking at existing code it seems important.
    // If empty, maybe auto-generate? But for now let's warn if empty.
    if (!noRtm) {
        toast.error("Nomor Rumah Tangga (RTM) wajib diisi");
        return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      let targetRtmId = rtmId;

      const payload: any = {
        no_rtm: noRtm,
        nik_kepala: selectedHead.nik,
        tgl_daftar: tglDaftar,
        kelas_sosial: kelasSosial ? Number(kelasSosial) : null,
        bdt_id: bdt || null, // Mapping to bdt_id as seen in insert
        bdt: bdt || null,    // Also map to bdt for compatibility
        dtks_id: dtks || null,
        alamat: alamat || null,
        dusun: dusun || null,
        rw: rw || null,
        rt: rt || null,
        keterangan: keterangan || null,
      };

      if (targetRtmId) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("rumah_tangga")
          .update(payload)
          .eq("id", targetRtmId);

        if (updateError) throw updateError;
        
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
        // CREATE
        // Ensure default fields for create
        payload.program_bantuan = [];
        
        const { data: rtmData, error: rtmError } = await supabase
          .from("rumah_tangga")
          .insert(payload)
          .select()
          .single();

        if (rtmError) throw rtmError;
        targetRtmId = rtmData.id;
      }

      // Update Head
      if (selectedHead.id && targetRtmId) {
        await updateResident(selectedHead.id, {
          status_dalam_rumah_tangga: "KEPALA RUMAH TANGGA",
          rumah_tangga_id: targetRtmId,
        });
      }

      // Update Members
      if (targetRtmId) {
        for (const member of members) {
            if (member.id) {
            await updateResident(member.id, {
                status_dalam_rumah_tangga: member.status_dalam_rumah_tangga || "ANGGOTA",
                rumah_tangga_id: targetRtmId,
            });
            }
        }
      }

      toast.success(editId ? "Rumah Tangga berhasil diperbarui" : "Rumah Tangga berhasil ditambahkan");
      router.push("/rumah-tangga");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving rumah tangga:", error);
      toast.error(error.message || "Gagal menyimpan data rumah tangga");
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
        disabled={isSubmitting || !selectedHead}
        variant="primary"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Data"}
      </Button>
    </div>
  );

  return (
    <FormLayout
      title={title || (mode === "create" ? "Tambah Rumah Tangga" : "Edit Rumah Tangga")}
      subtitle={subtitle || (mode === "create" ? "Tambahkan data rumah tangga baru." : "Perbarui data rumah tangga.")}
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
        {/* Section 1: Kepala RTM */}
        <FormSection
          id="kepala-rtm"
          ref={(el) => { sectionRefs.current["kepala-rtm"] = el; }}
          title="Kepala Rumah Tangga"
          description="Pilih Kepala Rumah Tangga dari daftar penduduk."
          icon={Users}
        >
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-text">Kepala Rumah Tangga</label>
              {selectedHead ? (
                <ResidentItem 
                  resident={selectedHead} 
                  action={() => setSelectedHead(null)} 
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
                  Cari Kepala Rumah Tangga...
                </Button>
              )}
            </div>
          </div>
        </FormSection>

        {/* Section 2: Informasi RTM */}
        <FormSection
          id="informasi-rtm"
          ref={(el) => { sectionRefs.current["informasi-rtm"] = el; }}
          title="Informasi Rumah Tangga"
          description="Data detail rumah tangga."
          icon={Home}
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nomor Rumah Tangga (RTM)"
              placeholder="Contoh: 001"
              value={noRtm}
              onChange={(e) => setNoRtm(e.target.value)}
              required
            />
            <DatePickerField
              label="Tanggal Daftar"
              value={tglDaftar}
              onChange={(e) => setTglDaftar(e.target.value)}
            />
            <InputField
              label="Kelas Sosial"
              placeholder="Contoh: 1"
              type="number"
              value={kelasSosial}
              onChange={(e) => setKelasSosial(e.target.value)}
            />
            <div className="hidden md:block"></div>

            <InputField
              label="Nomor BDT"
              placeholder="Masukkan nomor BDT"
              value={bdt}
              onChange={(e) => setBdt(e.target.value)}
              description="Biarkan kosong jika tidak ada"
            />
            <InputField
              label="Nomor DTKS"
              placeholder="Masukkan nomor DTKS"
              value={dtks}
              onChange={(e) => setDtks(e.target.value)}
              description="Biarkan kosong jika tidak ada"
            />

            <div className="md:col-span-2">
                <TextAreaField
                    label="Alamat Rumah Tangga"
                    placeholder="Alamat lengkap..."
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[13px] font-medium text-secondary-text">Dusun</label>
                    <Select
                        value={dusun}
                        onValueChange={(val) => {
                            setDusun(val);
                            setRw(""); // Reset RW when Dusun changes
                            setRt(""); // Reset RT when Dusun changes
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Dusun" />
                        </SelectTrigger>
                        <SelectContent>
                            {dusunList.map((d) => (
                                <SelectItem key={d.id} value={d.nama}>
                                    {d.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-secondary-text">RW</label>
                        <Select
                            value={rw}
                            onValueChange={(val) => {
                                setRw(val);
                                setRt(""); // Reset RT when RW changes
                            }}
                        >
                            <SelectTrigger disabled={!dusun}>
                                <SelectValue placeholder="Pilih RW" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredRwList.map((r) => (
                                    <SelectItem key={r.id} value={formatNumberCode(r.nomor_rw)}>
                                        {formatNumberCode(r.nomor_rw)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-secondary-text">RT</label>
                        <Select
                            value={rt}
                            onValueChange={(val) => setRt(val)}
                        >
                            <SelectTrigger disabled={!rw}>
                                <SelectValue placeholder="Pilih RT" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredRtList.map((r) => (
                                    <SelectItem key={r.id} value={formatNumberCode(r.nomor_rt)}>
                                        {formatNumberCode(r.nomor_rt)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2">
                <TextAreaField
                    label="Keterangan Tambahan"
                    placeholder="Catatan tambahan..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                />
            </div>
          </div>
        </FormSection>

        {/* Section 3: Anggota RTM */}
        <FormSection
          id="anggota-rtm"
          ref={(el) => { sectionRefs.current["anggota-rtm"] = el; }}
          title="Anggota Rumah Tangga"
          description="Tambahkan anggota rumah tangga lainnya."
          icon={UserPlus}
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
                Cari & Tambah Anggota Rumah Tangga...
              </Button>
            </div>

            {/* List Members */}
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-color rounded-lg bg-body-bg/50">
                  <UserPlus className="w-8 h-8 text-secondary-text mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-secondary-text">Belum ada anggota rumah tangga yang ditambahkan.</p>
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
        onlyUnassignedHousehold={true}
      />
    </FormLayout>
  );
}
