"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { 
  User, 
  MapPin, 
  FileText, 
  Activity,
  Baby,
  GraduationCap,
  Flag,
  Users,
  HeartHandshake,
} from "lucide-react";
import { Resident, IDENTITAS_ELEKTRONIK_OPTIONS, STATUS_REKAM_OPTIONS, STATUS_HAMIL_OPTIONS, formatDusunName } from "@/lib/services/penduduk";
import { useReferenceData } from "@/lib/services/referensi";
import { parseIndonesianNIK } from "@/lib/utils/nik-parser";
import { formatChunkedNIK } from "@/lib/utils/formatters";
import { useFormDraft } from "@/lib/hooks/useFormDraft";
import { toast } from "sonner";

// New Standard Components
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { 
  InputField, 
  SelectField, 
  DatePickerField, 
  TextAreaField, 
  SectionTitle 
} from "@/components/ui/FormFields";
import { Checkbox } from "@/components/ui/Checkbox";

interface ResidentFormProps {
  initialData?: Partial<Resident>;
  mode?: "create" | "edit";
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
  embedded?: boolean;
  hideActions?: boolean;
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

export default function ResidentForm({
  initialData,
  mode = "create",
  onSubmit,
  isSubmitting = false,
  embedded = false,
  hideActions = false,
  title,
  subtitle,
  backButtonHref
}: ResidentFormProps) {
  const [activeSection, setActiveSection] = useState("data-diri");
  const [formData, setFormData] = useState<Partial<Resident>>(initialData || {});
  const [showGelar, setShowGelar] = useState(!!(initialData?.gelar_depan || initialData?.gelar_belakang));

  // Form Auto-Save Draft Hook
  const isCreateMode = !initialData?.nik;
  const { hasDraft, draftTimestamp, restoreDraft, clearDraft, saveDraft } = useFormDraft<Partial<Resident>>({
    key: `resident_${initialData?.nik || "new"}`,
    initialData: initialData || {},
    enabled: isCreateMode,
    onRestore: (restored) => setFormData(restored),
  });

  // Dynamic Reference Hook
  const {
    agama,
    jenisKelamin,
    pekerjaan,
    pendidikan,
    pendidikanKK,
    statusKawin,
    golDarah,
    warganegara,
    hubKeluarga,
    statusPenduduk,
    cacat,
    sakitMenahun,
    asuransi,
    caraKB,
    dusun,
    rw,
    rt,
  } = useReferenceData();

  const formatNumber = (num: string | number) => {
    return num?.toString().padStart(3, "0") || "";
  };

  // Derived state for filtered wilayah
  const filteredRw = rw.filter((item) => {
    const selectedDusun = dusun.find((d) => d.nama === formData.dusun);
    return selectedDusun && String(item.dusun_id) === String(selectedDusun.id);
  });

  const filteredRt = rt.filter((item) => {
    const selectedDusun = dusun.find((d) => d.nama === formData.dusun);
    if (!selectedDusun) return false;

    const selectedRw = rw.find(
      (r) =>
        String(r.dusun_id) === String(selectedDusun.id) &&
        formatNumber(r.nomor_rw) === formData.rw
    );

    return selectedRw && String(item.rw_id) === String(selectedRw.id);
  });

  const handleDusunChange = (val: string) => {
    updateField("dusun", val);
    updateField("rw", "");
    updateField("rt", "");
  };

  const handleRwChange = (val: string) => {
    updateField("rw", val);
    updateField("rt", "");
  };

  const sections = [
    { id: "data-diri", title: "Data Diri", description: "Identitas utama penduduk", icon: User },
    { id: "data-kelahiran", title: "Data Kelahiran", description: "Informasi seputar kelahiran", icon: Baby },
    { id: "pendidikan-pekerjaan", title: "Pendidikan & Pekerjaan", description: "Riwayat pendidikan & profesi", icon: GraduationCap },
    { id: "data-kewarganegaraan", title: "Data Kewarganegaraan", description: "Status kewarganegaraan", icon: Flag },
    { id: "data-orang-tua", title: "Data Orang Tua", description: "Informasi ayah dan ibu", icon: Users },
    { id: "alamat", title: "Alamat", description: "Domisili dan kontak", icon: MapPin },
    { id: "status-perkawinan", title: "Status Perkawinan", description: "Riwayat pernikahan", icon: HeartHandshake },
    { id: "data-kesehatan", title: "Data Kesehatan", description: "Kondisi kesehatan & asuransi", icon: Activity },
    { id: "lainnya", title: "Lainnya", description: "Informasi tambahan", icon: FileText },
  ];

  const updateField = (field: keyof Resident, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      saveDraft(updated);
      return updated;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Smart Field Inference on NIK change
    if (name === "nik") {
      const cleanDigits = value.replace(/\D/g, "");
      const updated: Partial<Resident> = { ...formData, nik: cleanDigits };

      if (cleanDigits.length === 16) {
        const parsed = parseIndonesianNIK(cleanDigits);
        if (parsed.isValid) {
          if (parsed.gender) {
            updated.jenis_kelamin = parsed.gender;
            updated.jenis_kelamin_id = parsed.genderId;
          }
          if (parsed.birthDate) {
            updated.tanggal_lahir = parsed.birthDate;
          }
          toast.success(`Smart NIK: Jenis Kelamin (${parsed.gender}) & Tanggal Lahir (${parsed.birthDateFormatted}) terisi otomatis!`);
        }
      }

      setFormData(updated);
      saveDraft(updated);
      return;
    }

    updateField(name as keyof Resident, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      clearDraft();
      onSubmit(formData);
    }
  };

  // Scroll spy logic
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
        threshold: 0.1,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const simpleOptions = (items: string[]) => items.map((s) => ({ label: s, value: s }));

  const content = (
    <form id="resident-form" onSubmit={handleSubmit} className="space-y-8">
      {/* Draft Recovery Alert */}
      {hasDraft && isCreateMode && (
        <div className="flex items-center justify-between p-3 bg-secondary-bg border border-border-color rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-secondary-text">
              Draf formulir sebelumnya tersimpan secara lokal {draftTimestamp ? `(${new Date(draftTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ""}.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => restoreDraft()} className="h-7 text-xs">
              Pulihkan Draf
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => clearDraft()} className="h-7 text-xs text-secondary-text">
              Abaikan
            </Button>
          </div>
        </div>
      )}

      {/* DATA DIRI */}
      <div id="data-diri" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Data Diri" description="Identitas utama penduduk" icon={User} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <InputField 
              label="NIK (Nomor Induk Kependudukan)" 
              name="nik" 
              value={formatChunkedNIK(formData.nik || "")} 
              onChange={handleChange} 
              placeholder="Contoh: 3507 1234 5678 0001" 
              maxLength={19}
              className="font-mono tracking-wider font-semibold"
              required 
            />
            <p className="text-[11px] text-secondary-text">
              ✨ Format 4-digit mempermudah pencocokan dengan KTP fisik. Smart Inference akan otomatis mengisi data kelahiran.
            </p>
          </div>
          <InputField label="Nama Lengkap" name="nama" value={formData.nama || ""} onChange={handleChange} placeholder="Nama Lengkap" required />

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="ceklis_gelar"
                checked={showGelar}
                onChange={(e) => setShowGelar(e.target.checked)}
              />
              <label htmlFor="ceklis_gelar" className="text-sm cursor-pointer text-primary-text">Ceklis Gelar (Tampilkan input Gelar)</label>
            </div>

            {showGelar && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-card-bg/50 rounded-lg border border-border-color">
                <InputField label="Gelar Depan" name="gelar_depan" value={formData.gelar_depan || ""} onChange={handleChange} placeholder="Contoh: Dr., Ir." />
                <InputField label="Gelar Belakang" name="gelar_belakang" value={formData.gelar_belakang || ""} onChange={handleChange} placeholder="Contoh: S.Kom, M.Pd" />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4 border border-border-color rounded-lg p-4 bg-card-bg/50">
             <h4 className="text-sm font-semibold text-primary-text">Status Kepemilikan Identitas</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Wajib Identitas"
                  value={formData.status_kepemilikan_identitas}
                  onValueChange={(val) => updateField("status_kepemilikan_identitas", val)}
                  options={[
                    { label: "WAJIB", value: "WAJIB" },
                    { label: "TIDAK WAJIB", value: "TIDAK WAJIB" }
                  ]}
                />
                <SelectField
                  label="Identitas Elektronik"
                  value={formData.identitas_elektronik}
                  onValueChange={(val) => updateField("identitas_elektronik", val)}
                  options={simpleOptions(IDENTITAS_ELEKTRONIK_OPTIONS)}
                />
                <SelectField
                  label="Status Rekam"
                  value={formData.status_rekam}
                  onValueChange={(val) => updateField("status_rekam", val)}
                  options={simpleOptions(STATUS_REKAM_OPTIONS)}
                />
                <InputField label="Tag ID Card" name="tag_id_card" value={formData.tag_id_card || ""} onChange={handleChange} placeholder="Tag ID Card" />
             </div>
          </div>

          <InputField label="Nomor KK Sebelumnya" name="no_kk_sebelumnya" value={formData.no_kk_sebelumnya || ""} onChange={handleChange} placeholder="No KK Sebelumnya" />
          <InputField label="Nomor KK" name="no_kk" value={formData.no_kk || ""} onChange={handleChange} placeholder="Nomor KK Saat Ini" />

          <SelectField
            label="Hubungan Dalam Keluarga"
            value={formData.hubungan_keluarga}
            onValueChange={(val) => updateField("hubungan_keluarga", val)}
            options={hubKeluarga.map((r) => ({ label: r.nama, value: r.nama }))}
          />

          <SelectField
            label="Jenis Kelamin"
            value={formData.jenis_kelamin}
            onValueChange={(val) => updateField("jenis_kelamin", val)}
            options={
              jenisKelamin.length > 0
                ? jenisKelamin.map((r) => ({ label: r.nama, value: r.nama }))
                : [
                    { label: "LAKI-LAKI", value: "LAKI-LAKI" },
                    { label: "PEREMPUAN", value: "PEREMPUAN" }
                  ]
            }
          />

          <SelectField
            label="Agama"
            value={formData.agama}
            onValueChange={(val) => updateField("agama", val)}
            options={agama.map((r) => ({ label: r.nama, value: r.nama }))}
          />

          <SelectField
            label="Status Penduduk"
            value={formData.status_penduduk}
            onValueChange={(val) => updateField("status_penduduk", val)}
            options={statusPenduduk.map((r) => ({ label: r.nama, value: r.nama }))}
          />
        </div>
      </div>

      {/* DATA KELAHIRAN */}
      <div id="data-kelahiran" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Data Kelahiran" description="Informasi seputar kelahiran" icon={Baby} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Nomor Akta Kelahiran" name="akta_kelahiran_nomor" value={formData.akta_kelahiran_nomor || ""} onChange={handleChange} placeholder="Nomor Akta Kelahiran" />
          <InputField label="Tempat Dilahirkan" name="tempat_lahir" value={formData.tempat_lahir || ""} onChange={handleChange} placeholder="Kota/Kabupaten" />

          <DatePickerField label="Tanggal Lahir" name="tanggal_lahir" value={formData.tanggal_lahir || ""} onChange={handleChange} />

          <InputField type="time" label="Waktu Kelahiran" name="waktu_lahir" value={formData.waktu_lahir || ""} onChange={handleChange} />

          <SelectField
            label="Jenis Kelahiran"
            value={formData.jenis_kelahiran}
            onValueChange={(val) => updateField("jenis_kelahiran", val)}
            options={simpleOptions(["TUNGGAL", "KEMBAR 2", "KEMBAR 3", "KEMBAR 4"])}
          />

          <InputField type="number" label="Anak Ke" name="anak_ke" value={formData.anak_ke || ""} onChange={handleChange} placeholder="Isi dengan angka" />

          <SelectField
            label="Penolong Kelahiran"
            value={formData.cara_lahir}
            onValueChange={(val) => updateField("cara_lahir", val)}
            options={simpleOptions(["DOKTER", "BIDAN", "DUKUN", "LAINNYA"])}
          />

          <InputField type="number" label="Berat Lahir (Gram)" name="berat_lahir" value={formData.berat_lahir || ""} onChange={handleChange} placeholder="Contoh: 3000" />
          <InputField type="number" label="Panjang Lahir (cm)" name="panjang_lahir" value={formData.panjang_lahir || ""} onChange={handleChange} placeholder="Contoh: 50" />
        </div>
      </div>

      {/* PENDIDIKAN DAN PEKERJAAN */}
      <div id="pendidikan-pekerjaan" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Pendidikan & Pekerjaan" description="Riwayat pendidikan & profesi" icon={GraduationCap} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Pendidikan Dalam KK"
            value={formData.pendidikan_kk}
            onValueChange={(val) => updateField("pendidikan_kk", val)}
            options={pendidikanKK.map((r) => ({ label: r.nama, value: r.nama }))}
          />
          <SelectField
            label="Pendidikan Sedang Ditempuh"
            value={formData.pendidikan_saat_ini}
            onValueChange={(val) => updateField("pendidikan_saat_ini", val)}
            options={pendidikan.map((r) => ({ label: r.nama, value: r.nama }))}
          />
          <div className="md:col-span-2">
            <SelectField
              label="Pekerjaan"
              value={formData.pekerjaan}
              onValueChange={(val) => updateField("pekerjaan", val)}
              options={pekerjaan.map((r) => ({ label: r.nama, value: r.nama }))}
            />
          </div>
        </div>
      </div>

      {/* DATA KEWARGANEGARAAN */}
      <div id="data-kewarganegaraan" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Data Kewarganegaraan" description="Status kewarganegaraan" icon={Flag} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <InputField label="Suku/Etnis" name="suku_etnis" value={formData.suku_etnis || ""} onChange={handleChange} placeholder="Suku/Etnis" />
           <SelectField
              label="Status Warga Negara"
              value={formData.kewarganegaraan}
              onValueChange={(val) => updateField("kewarganegaraan", val)}
              options={warganegara.map((r) => ({ label: r.nama, value: r.nama }))}
           />
           <InputField label="Nomor Paspor" name="no_paspor" value={formData.no_paspor || ""} onChange={handleChange} placeholder="Nomor Paspor" />
           <DatePickerField label="Tgl Berakhir Paspor" name="tgl_berakhir_paspor" value={formData.tgl_berakhir_paspor || ""} onChange={handleChange} />
        </div>
      </div>

      {/* DATA ORANG TUA */}
      <div id="data-orang-tua" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Data Orang Tua" description="Informasi ayah dan ibu" icon={Users} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <InputField label="NIK Ayah" name="nik_ayah" value={formData.nik_ayah || ""} onChange={handleChange} placeholder="NIK Ayah" />
           <InputField label="Nama Ayah" name="nama_ayah" value={formData.nama_ayah || ""} onChange={handleChange} placeholder="Nama Ayah" />
           <InputField label="NIK Ibu" name="nik_ibu" value={formData.nik_ibu || ""} onChange={handleChange} placeholder="NIK Ibu" />
           <InputField label="Nama Ibu" name="nama_ibu" value={formData.nama_ibu || ""} onChange={handleChange} placeholder="Nama Ibu" />
        </div>
      </div>

      {/* ALAMAT */}
      <div id="alamat" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Alamat" description="Domisili dan kontak" icon={MapPin} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="md:col-span-2">
             <TextAreaField label="Alamat Saat Ini" name="alamat_saat_ini" value={formData.alamat_saat_ini || ""} onChange={handleChange} placeholder="Jalan / Gang / Blok" />
           </div>

           <SelectField
              label="Dusun"
              value={formData.dusun}
              onValueChange={handleDusunChange}
              options={dusun.map((d) => ({ label: formatDusunName(d.nama), value: d.nama }))}
           />

           <div className="grid grid-cols-2 gap-4">
             <SelectField
                label="RW"
                value={formData.rw}
                onValueChange={handleRwChange}
                options={filteredRw.map((item) => ({ label: formatNumber(item.nomor_rw), value: formatNumber(item.nomor_rw) }))}
                disabled={!formData.dusun}
             />
             <SelectField
                label="RT"
                value={formData.rt}
                onValueChange={(val) => updateField("rt", val)}
                options={filteredRt.map((item) => ({ label: formatNumber(item.nomor_rt), value: formatNumber(item.nomor_rt) }))}
                disabled={!formData.rw}
             />
           </div>

           <InputField label="Nomor Telepon/HP" name="telepon" value={formData.telepon || ""} onChange={handleChange} placeholder="08..." />
           <InputField type="email" label="Alamat Email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="contoh@email.com" />
        </div>
      </div>

      {/* STATUS PERKAWINAN */}
      <div id="status-perkawinan" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Status Perkawinan" description="Riwayat pernikahan" icon={HeartHandshake} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Status Perkawinan"
            value={formData.status_kawin}
            onValueChange={(val) => updateField("status_kawin", val)}
            options={statusKawin.map((r) => ({ label: r.nama, value: r.nama }))}
          />

          {formData.status_kawin && formData.status_kawin !== "Belum Kawin" && formData.status_kawin !== "BELUM KAWIN" && (
            <>
               <InputField label="No. Akta Perkawinan/Buku Nikah" name="akta_perkawinan" value={formData.akta_perkawinan || ""} onChange={handleChange} placeholder="Nomor Akta" />
               <DatePickerField label="Tanggal Perkawinan" name="tanggal_perkawinan" value={formData.tanggal_perkawinan || ""} onChange={handleChange} />
            </>
          )}

          {formData.status_kawin && (formData.status_kawin.toUpperCase().includes("CERAI")) && (
            <>
               <InputField label="No. Akta Perceraian" name="akta_perceraian" value={formData.akta_perceraian || ""} onChange={handleChange} placeholder="Nomor Akta" />
               <DatePickerField label="Tanggal Perceraian" name="tanggal_perceraian" value={formData.tanggal_perceraian || ""} onChange={handleChange} />
            </>
          )}
        </div>
      </div>

      {/* DATA KESEHATAN */}
      <div id="data-kesehatan" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Data Kesehatan" description="Kondisi kesehatan & asuransi" icon={Activity} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <SelectField
             label="Golongan Darah"
             value={formData.golongan_darah}
             onValueChange={(val) => updateField("golongan_darah", val)}
             options={golDarah.map((r) => ({ label: r.nama, value: r.nama }))}
           />
           <SelectField
             label="Cacat Fisik/Mental"
             value={formData.cacat_fisik_mental || ""}
             onValueChange={(val) => updateField("cacat_fisik_mental", val)}
             options={cacat.map((opt) => ({ label: opt.nama, value: opt.nama }))}
           />
           <SelectField
             label="Sakit Menahun"
             value={formData.sakit_menahun || ""}
             onValueChange={(val) => updateField("sakit_menahun", val)}
             options={sakitMenahun.map((opt) => ({ label: opt.nama, value: opt.nama }))}
           />
           <SelectField
             label="Akseptor KB"
             value={formData.cara_kb_id?.toString()}
             onValueChange={(val) => updateField("cara_kb_id", parseInt(val))}
             options={caraKB.map((opt) => ({ label: opt.nama, value: opt.id.toString() }))}
           />
           {formData.jenis_kelamin?.toUpperCase().startsWith("P") && (
             <SelectField
               label="Status Kehamilan"
               value={formData.status_kehamilan}
               onValueChange={(val) => updateField("status_kehamilan", val)}
               options={simpleOptions(STATUS_HAMIL_OPTIONS)}
             />
           )}
           <SelectField
             label="Asuransi Kesehatan"
             value={formData.kepesertaan_asuransi || ""}
             onValueChange={(val) => updateField("kepesertaan_asuransi", val)}
             options={asuransi.map((opt) => ({ label: opt.nama, value: opt.nama }))}
           />
        </div>
      </div>

      {/* LAINNYA */}
      <div id="lainnya" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Lainnya" description="Informasi tambahan" icon={FileText} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <InputField label="Keahlian Khusus" name="keahlian_khusus" value={formData.keahlian_khusus || ""} onChange={handleChange} placeholder="Keahlian yang dimiliki" />
           <InputField label="Akun Facebook" name="akun_facebook" value={formData.akun_facebook || ""} onChange={handleChange} placeholder="Link/Nama Akun" />
           <InputField label="Akun Instagram" name="akun_instagram" value={formData.akun_instagram || ""} onChange={handleChange} placeholder="Link/Nama Akun" />
           <InputField label="Akun Twitter (X)" name="akun_twitter" value={formData.akun_twitter || ""} onChange={handleChange} placeholder="Link/Nama Akun" />
        </div>
      </div>

      {/* Floating or Footer Actions */}
      {!hideActions && (
        <div className="sticky bottom-4 z-10 flex justify-end gap-3 p-4 bg-card-bg/90 backdrop-blur border border-border-color rounded-xl shadow-lg">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? "Menyimpan..." : mode === "create" ? "Tambah Penduduk" : "Simpan Perubahan"}
          </Button>
        </div>
      )}
    </form>
  );

  if (embedded) {
    return content;
  }

  return (
    <FormLayout
      title={title || (mode === "create" ? "Tambah Penduduk" : "Edit Penduduk")}
      subtitle={subtitle || (mode === "create" ? "Formulir pendataan penduduk baru" : "Perbarui informasi data penduduk")}
      backButtonHref={backButtonHref || "/penduduk"}
      sidebar={
        <FormSidebarNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={(id) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      }
    >
      {content}
    </FormLayout>
  );
}
