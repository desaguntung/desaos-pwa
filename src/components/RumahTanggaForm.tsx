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
import { Resident, mapResidentFromDb } from "@/lib/services/penduduk";
import { getWilayahData, Dusun, Rw, Rt } from "@/lib/services/wilayah";
import { sortRtmMembers } from "@/lib/services/rumah_tangga";
import { Button } from "@/components/ui/Button";
import { InputField, TextAreaField, DatePickerField } from "@/components/ui/FormFields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { FormSection } from "@/components/ui/FormSection";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import ResidentPickerModal from "@/components/ResidentPickerModal";

interface RumahTanggaFormProps {
  initialData?: {
    id?: string;
    no_rtm?: string;
    tgl_daftar?: string;
    kelas_sosial?: number;
    bdt?: string;
    dtks?: string;
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
  const [alamat, setAlamat] = useState(initialData?.alamat || "");
  const [dusun, setDusun] = useState(initialData?.dusun || "");
  const [rw, setRw] = useState(initialData?.rw || "");
  const [rt, setRt] = useState(initialData?.rt || "");
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || "");
  
  const [selectedHead, setSelectedHead] = useState<Resident | null>(initialData?.head || null);
  const [members, setMembers] = useState<Resident[]>(initialData?.members || []);
  const [originalMembers, setOriginalMembers] = useState<Resident[]>(initialData?.members || []);
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
  
  // Layout Navigation
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
          .select("*, kepala_rtm:penduduk!fk_rumah_tangga_kepala(*)")
          .eq("id", editId)
          .single();

        if (rtmError) throw rtmError;

        if (rtm) {
          setRtmId(rtm.id);
          setNoRtm(rtm.no_rtm || "");
          setTglDaftar(rtm.tgl_daftar ? rtm.tgl_daftar.split("T")[0] : new Date().toISOString().split('T')[0]);
          setKelasSosial(rtm.kelas_sosial ? String(rtm.kelas_sosial) : "");
          setBdt(rtm.bdt || "");
          setAlamat(rtm.alamat || "");
          setDusun(rtm.dusun || "");
          setRw(rtm.rw || "");
          setRt(rtm.rt || "");
          setKeterangan(rtm.keterangan || "");

          if (rtm.kepala_rtm) {
            setSelectedHead(mapResidentFromDb(rtm.kepala_rtm));
          }

          // 2. Fetch Members for this RTM
          const { data: rtmMembers, error: membersError } = await supabase
            .from("penduduk")
            .select("*")
            .eq("rumah_tangga_id", editId);
          
          if (!membersError && rtmMembers) {
            const mappedMembers = rtmMembers.map(mapResidentFromDb);
            const headFromList = mappedMembers.find((m: Resident) => m.id === rtm.kepala_rtm_id || m.rtm_level_id === 1);
            if (!rtm.kepala_rtm && headFromList) {
              setSelectedHead(headFromList);
            }

            const headId = rtm.kepala_rtm_id || headFromList?.id;
            const otherMembers = mappedMembers.filter((m: Resident) => m.id !== headId);
            const sortedOthers = sortRtmMembers(otherMembers);
            setMembers(sortedOthers);
            setOriginalMembers(sortedOthers);
          }
        }
        setFetchingRtm(false);
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("Gagal memuat data rumah tangga");
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
    if (!selectedDusunId) return [];
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
    if (!alamat && resident.alamat_saat_ini && resident.alamat_saat_ini !== "-") {
      setAlamat(resident.alamat_saat_ini);
    }
    
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
    const updated = [...members, resident];
    setMembers(sortRtmMembers(updated));
    setPickerMode(null);
  };

  const handleRemoveMember = (residentId: string) => {
    setMembers(prev => prev.filter(m => m.id !== residentId));
  };

  const handleSubmit = async () => {
    if (!selectedHead) {
      toast.error("Mohon pilih Kepala Rumah Tangga terlebih dahulu");
      return;
    }

    if (!noRtm.trim()) {
      toast.error("Nomor Rumah Tangga (RTM) wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      let targetRtmId = rtmId;

      const payload: any = {
        no_rtm: noRtm.trim(),
        kepala_rtm_id: selectedHead.id,
        tgl_daftar: tglDaftar,
        kelas_sosial: kelasSosial ? Number(kelasSosial) : null,
        bdt: bdt.trim() || null,
        alamat: alamat.trim() || null,
        dusun: dusun || null,
        rw: rw || null,
        rt: rt || null,
        keterangan: keterangan.trim() || null,
      };

      if (targetRtmId) {
        // UPDATE RTM
        const { error: updateError } = await supabase
          .from("rumah_tangga")
          .update(payload)
          .eq("id", targetRtmId);

        if (updateError) throw updateError;
        
        // Handle removed members
        const removedMembers = originalMembers.filter(
          om => !members.some(m => m.id === om.id) && om.id !== selectedHead.id
        );
        
        for (const removed of removedMembers) {
          if (removed.id) {
            await supabase
              .from("penduduk")
              .update({
                rumah_tangga_id: null,
                id_rtm: null,
                rtm_level_id: null,
                status_dalam_rumah_tangga: null
              })
              .eq("id", removed.id);
          }
        }
      } else {
        // CREATE RTM
        const { data: rtmData, error: rtmError } = await supabase
          .from("rumah_tangga")
          .insert([payload])
          .select()
          .single();

        if (rtmError) throw rtmError;
        targetRtmId = rtmData.id;
      }

      // Update Head in penduduk
      if (selectedHead.id && targetRtmId) {
        await supabase
          .from("penduduk")
          .update({
            rumah_tangga_id: targetRtmId,
            id_rtm: noRtm.trim(),
            rtm_level_id: 1,
            status_dalam_rumah_tangga: "KEPALA RUMAH TANGGA"
          })
          .eq("id", selectedHead.id);
      }

      // Update Members in penduduk
      if (targetRtmId) {
        for (const member of members) {
          if (member.id) {
            await supabase
              .from("penduduk")
              .update({
                rumah_tangga_id: targetRtmId,
                id_rtm: noRtm.trim(),
                rtm_level_id: 2,
                status_dalam_rumah_tangga: member.status_dalam_rumah_tangga || "ANGGOTA"
              })
              .eq("id", member.id);
          }
        }
      }

      toast.success(editId ? "Data Rumah Tangga berhasil diperbarui" : "Rumah Tangga berhasil ditambahkan");
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
      "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200",
      variant === "selected" 
        ? "bg-card-bg border-primary/40 shadow-xs" 
        : "bg-card-bg border-border-color hover:border-primary-text/30"
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        <Avatar 
          alt={resident.nama}
          fallback={resident.nama} 
          className="w-10 h-10 text-xs font-bold ring-1 ring-border-color shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-primary-text uppercase truncate">
            {resident.nama}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-secondary-text">
            <span className="font-mono">NIK: {resident.nik}</span>
            <span>•</span>
            <span>{resident.jenis_kelamin || "-"}</span>
            {resident.hubungan_keluarga && (
              <>
                <span>•</span>
                <span className="capitalize">{resident.hubungan_keluarga.toLowerCase()}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          action();
        }}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors shrink-0",
          variant === "selected"
            ? "text-error-text hover:bg-error-bg border border-error-border"
            : "bg-body-bg text-secondary-text hover:bg-border-color"
        )}
        title="Hapus / Batal"
      >
        <Icon className="w-4 h-4" />
      </button>
    </div>
  );

  const formActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push(backButtonHref)}
        className="text-secondary-text hover:text-primary-text"
        disabled={isSubmitting}
      >
        Batal
      </Button>
      <Button
        type="button"
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
      subtitle={subtitle || (mode === "create" ? "Tambahkan data rumah tangga baru ke sistem." : "Perbarui data rumah tangga dan anggotanya.")}
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
          description="Pilih Kepala Rumah Tangga dari daftar penduduk yang terdaftar."
          icon={Users}
        >
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-primary-text">Kepala Rumah Tangga</label>
              {selectedHead ? (
                <ResidentItem 
                  resident={selectedHead} 
                  action={() => setSelectedHead(null)} 
                  actionIcon={X}
                  variant="selected"
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-secondary-text border-dashed h-14 rounded-xl gap-2 hover:border-primary hover:text-primary"
                  onClick={() => setPickerMode("head")}
                >
                  <Search className="w-4 h-4 text-secondary-text" />
                  <span>Cari & Pilih Kepala Rumah Tangga...</span>
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
          description="Nomor RTM, tanggal pendaftaran, klasifikasi sosial, dan alamat domisili."
          icon={Home}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nomor Rumah Tangga (RTM)"
              placeholder="Contoh: 121906200200001"
              value={noRtm}
              onChange={(e) => setNoRtm(e.target.value)}
              required
            />
            <DatePickerField
              label="Tanggal Pendaftaran"
              value={tglDaftar}
              onChange={(e) => setTglDaftar(e.target.value)}
            />
            <InputField
              label="Nomor BDT / DTKS"
              placeholder="Masukkan nomor BDT / DTKS"
              value={bdt}
              onChange={(e) => setBdt(e.target.value)}
              description="Biarkan kosong jika bukan penerima bantuan"
            />
            <InputField
              label="Klasifikasi / Kelas Sosial"
              placeholder="Contoh: 1 (Desil 1 / Sangat Miskin)"
              type="number"
              value={kelasSosial}
              onChange={(e) => setKelasSosial(e.target.value)}
            />

            <div className="md:col-span-2">
              <TextAreaField
                label="Alamat Rumah Tangga"
                placeholder="Alamat lengkap jalan, nomor rumah, atau gang..."
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-primary-text">Dusun</label>
                <Select
                  value={dusun}
                  onValueChange={(val) => {
                    setDusun(val);
                    setRw("");
                    setRt("");
                  }}
                >
                  <SelectTrigger className="h-10">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-primary-text">RW</label>
                  <Select
                    value={rw}
                    onValueChange={(val) => {
                      setRw(val);
                      setRt("");
                    }}
                  >
                    <SelectTrigger className="h-10" disabled={!dusun}>
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
                  <label className="text-[13px] font-semibold text-primary-text">RT</label>
                  <Select
                    value={rt}
                    onValueChange={(val) => setRt(val)}
                  >
                    <SelectTrigger className="h-10" disabled={!rw}>
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
                placeholder="Catatan tambahan mengenai rumah tangga..."
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
          description="Tambahkan anggota keluarga lain yang tinggal dalam rumah tangga ini."
          icon={UserPlus}
        >
          <div className="space-y-6">
            {/* Add Member Button */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-primary-text">Tambah Anggota</label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal text-secondary-text border-dashed h-12 rounded-xl gap-2 hover:border-primary hover:text-primary"
                onClick={() => setPickerMode("member")}
              >
                <UserPlus className="w-4 h-4" />
                <span>Cari & Tambah Anggota Rumah Tangga...</span>
              </Button>
            </div>

            {/* List Members */}
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-color rounded-xl bg-body-bg/50">
                  <UserPlus className="w-8 h-8 text-secondary-text mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-secondary-text">Belum ada anggota rumah tangga lain yang ditambahkan.</p>
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
