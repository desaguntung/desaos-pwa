"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
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
import { Resident, IDENTITAS_ELEKTRONIK_OPTIONS, STATUS_REKAM_OPTIONS, STATUS_HAMIL_OPTIONS } from "@/lib/services/penduduk";
import {
  ReferenceItem,
  getRefAgama,
  getRefPekerjaan,
  getRefPendidikan,
  getRefPendidikanKK,
  getRefStatusKawin,
  getRefGolonganDarah,
  getRefWarganegara,
  getRefHubunganKeluarga,
  getRefStatusPenduduk,
  getRefCacat,
  getRefSakitMenahun,
  getRefAsuransi,
  getRefCaraKB
} from "@/lib/services/referensi";

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
  // Page header props
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

// Fallback Options (Legacy)
const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Khonghucu", "Lainnya"];
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];
const STATUS_PERKAWINAN_OPTIONS = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];
const GOL_DARAH_OPTIONS = ["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Tidak Tahu"];
const WARGANEGARA_OPTIONS = ["WNI", "WNA"];
const PENDIDIKAN_OPTIONS = ["Tidak/Belum Sekolah", "Belum Tamat SD/Sederajat", "Tamat SD/Sederajat", "SLTP/Sederajat", "SLTA/Sederajat", "Diploma I/II", "Akademi/Diploma III/S. Muda", "Diploma IV/Strata I", "Strata II", "Strata III"];
const PEKERJAAN_OPTIONS = ["Belum/Tidak Bekerja", "Mengurus Rumah Tangga", "Pelajar/Mahasiswa", "Pensiunan", "Pegawai Negeri Sipil", "Tentara Nasional Indonesia", "Kepolisian RI", "Perdagangan", "Petani/Pekebun", "Peternak", "Nelayan/Perikanan", "Industri", "Konstruksi", "Transportasi", "Karyawan Swasta", "Karyawan BUMN", "Karyawan BUMD", "Karyawan Honorer", "Buruh Harian Lepas", "Buruh Tani/Perkebunan", "Buruh Nelayan/Perikanan", "Buruh Peternakan", "Pembantu Rumah Tangga", "Tukang Cukur", "Tukang Listrik", "Tukang Batu", "Tukang Kayu", "Tukang Sol Sepatu", "Tukang Las/Pandai Besi", "Tukang Jahit", "Tukang Gigi", "Penata Rias", "Penata Busana", "Penata Rambut", "Mekanik", "Seniman", "Tabib", "Paraji", "Perancang Busana", "Penterjemah", "Imam Masjid", "Pendeta", "Pastor", "Wartawan", "Ustadz/Mubaligh", "Juru Masak", "Promotor Acara", "Anggota DPR-RI", "Anggota DPD", "Anggota DPRD Provinsi", "Anggota DPRD Kabupaten/Kota", "Presiden", "Wakil Presiden", "Anggota Mahkamah Konstitusi", "Anggota Kabinet/Kementerian", "Duta Besar", "Gubernur", "Wakil Gubernur", "Bupati", "Wakil Bupati", "Walikota", "Wakil Walikota", "Penyiar Televisi", "Penyiar Radio", "Pelaut", "Peneliti", "Sopir", "Pialang", "Paranormal", "Pedagang", "Perangkat Desa", "Kepala Desa", "Biarawati", "Wiraswasta", "Lainnya"];
const HUBUNGAN_KELUARGA_OPTIONS = ["KEPALA KELUARGA", "SUAMI", "ISTRI", "ANAK", "MENANTU", "CUCU", "ORANG TUA", "MERTUA", "FAMILI LAIN", "PEMBANTU", "LAINNYA"];
const STATUS_PENDUDUK_OPTIONS = ["TETAP", "TIDAK TETAP", "PINDAH DATANG", "PENDUDUK SEMENTARA"];

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

  // Reference Data States
  const [agamaRef, setAgamaRef] = useState<ReferenceItem[]>([]);
  const [pekerjaanRef, setPekerjaanRef] = useState<ReferenceItem[]>([]);
  const [pendidikanRef, setPendidikanRef] = useState<ReferenceItem[]>([]); // Current education
  const [pendidikanKKRef, setPendidikanKKRef] = useState<ReferenceItem[]>([]); // Last education (KK)
  const [statusKawinRef, setStatusKawinRef] = useState<ReferenceItem[]>([]);
  const [golDarahRef, setGolDarahRef] = useState<ReferenceItem[]>([]);
  const [warganegaraRef, setWarganegaraRef] = useState<ReferenceItem[]>([]);
  const [hubKeluargaRef, setHubKeluargaRef] = useState<ReferenceItem[]>([]);
  const [statusPendudukRef, setStatusPendudukRef] = useState<ReferenceItem[]>([]);
  const [cacatRef, setCacatRef] = useState<ReferenceItem[]>([]);
  const [sakitMenahunRef, setSakitMenahunRef] = useState<ReferenceItem[]>([]);
  const [asuransiRef, setAsuransiRef] = useState<ReferenceItem[]>([]);
  const [caraKBRef, setCaraKBRef] = useState<ReferenceItem[]>([]);

  // Wilayah Data States
  const [dusunOptions, setDusunOptions] = useState<any[]>([]);
  const [rwOptions, setRwOptions] = useState<any[]>([]);
  const [rtOptions, setRtOptions] = useState<any[]>([]);

  const formatNumber = (num: string | number) => {
    return num?.toString().padStart(3, "0") || "";
  };

  // Derived state for filtered options
  const filteredRw = rwOptions.filter(rw => {
     const selectedDusun = dusunOptions.find(d => d.nama === formData.dusun);
     return selectedDusun && rw.dusun_id === selectedDusun.id;
  });

  const filteredRt = rtOptions.filter(rt => {
     const selectedDusun = dusunOptions.find(d => d.nama === formData.dusun);
     if (!selectedDusun) return false;
     
     const selectedRw = rwOptions.find(r => 
       r.dusun_id === selectedDusun.id && formatNumber(r.nomor_rw) === formData.rw
     );
     
     return selectedRw && rt.rw_id === selectedRw.id;
  });

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [
          agama, 
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
          caraKB
        ] = await Promise.all([
          getRefAgama(),
          getRefPekerjaan(),
          getRefPendidikan(),
          getRefPendidikanKK(),
          getRefStatusKawin(),
          getRefGolonganDarah(),
          getRefWarganegara(),
          getRefHubunganKeluarga(),
          getRefStatusPenduduk(),
          getRefCacat(),
          getRefSakitMenahun(),
          getRefAsuransi(),
          getRefCaraKB()
        ]);

        if (agama) setAgamaRef(agama);
        if (pekerjaan) setPekerjaanRef(pekerjaan);
        if (pendidikan) setPendidikanRef(pendidikan);
        if (pendidikanKK) setPendidikanKKRef(pendidikanKK);
        if (statusKawin) setStatusKawinRef(statusKawin);
        if (golDarah) setGolDarahRef(golDarah);
        if (warganegara) setWarganegaraRef(warganegara);
        if (hubKeluarga) setHubKeluargaRef(hubKeluarga);
        if (statusPenduduk) setStatusPendudukRef(statusPenduduk);
        if (cacat) setCacatRef(cacat);
        if (sakitMenahun) setSakitMenahunRef(sakitMenahun);
        if (asuransi) setAsuransiRef(asuransi);
        if (caraKB) setCaraKBRef(caraKB);
      } catch (error) {
        console.error("Error fetching references:", error);
      }
    };

    const fetchWilayah = async () => {
      const supabase = createSupabaseBrowserClient();
      
      const { data: dusun } = await supabase.from("wilayah_dusun").select("*").order("nama");
      if (dusun) setDusunOptions(dusun);
      
      const { data: rw } = await supabase.from("wilayah_rw").select("*").order("nomor_rw");
      if (rw) setRwOptions(rw);
      
      const { data: rt } = await supabase.from("wilayah_rt").select("*").order("nomor_rt");
      if (rt) setRtOptions(rt);
    };
    
    fetchReferences();
    fetchWilayah();
  }, []);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof Resident, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
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
        threshold: 0.1 
      }
    );

    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Helpers to convert options
  const toOptions = (refs: ReferenceItem[], fallback: string[]) => {
    if (refs.length > 0) return refs.map(r => ({ label: r.nama, value: r.nama }));
    return fallback.map(s => ({ label: s, value: s }));
  };

  const simpleOptions = (items: string[]) => items.map(s => ({ label: s, value: s }));

  const content = (
    <form id="resident-form" onSubmit={handleSubmit} className="space-y-8">
      {/* DATA DIRI */}
      <div id="data-diri" className="scroll-mt-24 space-y-6">
        <SectionTitle title="Data Diri" description="Identitas utama penduduk" icon={User} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="NIK" name="nik" value={formData.nik || ""} onChange={handleChange} placeholder="Nomor Induk Kependudukan" required />
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
            options={toOptions(hubKeluargaRef, HUBUNGAN_KELUARGA_OPTIONS)}
          />

          <SelectField 
            label="Jenis Kelamin"
            value={formData.jenis_kelamin} 
            onValueChange={(val) => updateField("jenis_kelamin", val)}
            options={simpleOptions(GENDER_OPTIONS)}
          />

          <SelectField 
            label="Agama"
            value={formData.agama} 
            onValueChange={(val) => updateField("agama", val)}
            options={toOptions(agamaRef, AGAMA_OPTIONS)}
          />

          <SelectField 
            label="Status Penduduk"
            value={formData.status_penduduk} 
            onValueChange={(val) => updateField("status_penduduk", val)}
            options={toOptions(statusPendudukRef, STATUS_PENDUDUK_OPTIONS)}
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
            options={toOptions(pendidikanKKRef, PENDIDIKAN_OPTIONS)}
          />
          <SelectField 
            label="Pendidikan Sedang Ditempuh"
            value={formData.pendidikan_saat_ini} 
            onValueChange={(val) => updateField("pendidikan_saat_ini", val)}
            options={toOptions(pendidikanRef, PENDIDIKAN_OPTIONS)}
          />
          <div className="md:col-span-2">
            <SelectField 
              label="Pekerjaan"
              value={formData.pekerjaan} 
              onValueChange={(val) => updateField("pekerjaan", val)}
              options={toOptions(pekerjaanRef, PEKERJAAN_OPTIONS)}
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
              options={toOptions(warganegaraRef, WARGANEGARA_OPTIONS)}
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
              options={dusunOptions.map(d => ({ label: d.nama, value: d.nama }))}
           />
           
           <div className="grid grid-cols-2 gap-4">
             <SelectField 
                label="RW"
                value={formData.rw} 
                onValueChange={handleRwChange}
                options={filteredRw.map(rw => ({ label: formatNumber(rw.nomor_rw), value: formatNumber(rw.nomor_rw) }))}
                disabled={!formData.dusun}
             />
             <SelectField 
                label="RT"
                value={formData.rt} 
                onValueChange={(val) => updateField("rt", val)}
                options={filteredRt.map(rt => ({ label: formatNumber(rt.nomor_rt), value: formatNumber(rt.nomor_rt) }))}
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
            options={toOptions(statusKawinRef, STATUS_PERKAWINAN_OPTIONS)}
          />
          
          {formData.status_kawin && formData.status_kawin !== "Belum Kawin" && (
            <>
               <InputField label="No. Akta Perkawinan/Buku Nikah" name="akta_perkawinan" value={formData.akta_perkawinan || ""} onChange={handleChange} placeholder="Nomor Akta" />
               <DatePickerField label="Tanggal Perkawinan" name="tanggal_perkawinan" value={formData.tanggal_perkawinan || ""} onChange={handleChange} />
            </>
          )}

          {formData.status_kawin && (formData.status_kawin === "Cerai Hidup" || formData.status_kawin === "Cerai Mati") && (
            <>
               <InputField label="No. Akta Perceraian" name="akta_perceraian" value={formData.akta_perceraian || ""} onChange={handleChange} placeholder="Nomor Akta" />
               <DatePickerField label="Tanggal Perceraian" name="tanggalperceraian" value={formData.tanggalperceraian || ""} onChange={handleChange} />
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
             options={toOptions(golDarahRef, GOL_DARAH_OPTIONS)}
           />
           <SelectField 
             label="Cacat Fisik/Mental"
             value={formData.cacat_fisik_mental || ""} 
             onValueChange={(val) => updateField("cacat_fisik_mental", val)}
             options={cacatRef.map(opt => ({ label: opt.nama, value: opt.nama }))}
           />
           <SelectField 
             label="Sakit Menahun"
             value={formData.sakit_menahun || ""} 
             onValueChange={(val) => updateField("sakit_menahun", val)}
             options={sakitMenahunRef.map(opt => ({ label: opt.nama, value: opt.nama }))}
           />
           <SelectField 
             label="Akseptor KB"
             value={formData.cara_kb_id?.toString()} 
             onValueChange={(val) => updateField("cara_kb_id", parseInt(val))}
             options={caraKBRef.map(opt => ({ label: opt.nama, value: opt.id.toString() }))}
           />
           {formData.jenis_kelamin === "Perempuan" && (
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
             options={asuransiRef.map(opt => ({ label: opt.nama, value: opt.nama }))}
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
    </form>
  );

  // If embedded, just return the content
  if (embedded) {
    return content;
  }

  // Action buttons
  const formActions = !hideActions && (
    <div className="flex items-center gap-2">
      <Button 
        type="submit" 
        form="resident-form"
        disabled={isSubmitting} 
        className="min-w-[120px]"
      >
        {isSubmitting ? "Menyimpan..." : (mode === "create" ? "Simpan Data" : "Simpan Perubahan")}
      </Button>
    </div>
  );

  return (
    <FormLayout
      title={title}
      subtitle={subtitle}
      backButtonHref={backButtonHref}
      actions={formActions}
      sidebar={
        <FormSidebarNav 
          sections={sections} 
          activeSection={activeSection} 
          onSectionClick={(id) => {
            setActiveSection(id);
            const element = document.getElementById(id);
            const container = document.getElementById("form-scroll-container");
            
            if (element && container) {
              const headerOffset = 24;
              const elementPosition = element.getBoundingClientRect().top;
              const containerPosition = container.getBoundingClientRect().top;
              const offsetPosition = elementPosition - containerPosition + container.scrollTop - headerOffset;
              
              container.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
              });
            }
          }} 
        />
      }
    >
      <div className="bg-card-bg rounded-xl border border-border-color p-6 md:p-8">
        {content}
      </div>
    </FormLayout>
  );
}
