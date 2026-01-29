"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
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
  Check,
  Circle,
  CalendarIcon,
  Clock
} from "lucide-react";
import { Resident, IDENTITAS_ELEKTRONIK_OPTIONS, STATUS_REKAM_OPTIONS } from "@/lib/services/penduduk";

// Internal UI Components
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-[13px] font-medium text-zinc-700 mb-1.5 block dark:text-zinc-300", className)} {...props} />
);

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[14px] font-medium text-[#171717] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 resize-y dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const DateInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="relative">
    <Input
      type="date"
      className={cn(
        "pl-10 text-left uppercase [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
        !props.value && "text-zinc-400",
        "dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert",
        className
      )}
      ref={ref}
      {...props}
    />
    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none dark:text-zinc-500" />
  </div>
));
DateInput.displayName = "DateInput";

const TimeInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="relative">
    <Input
      type="time"
      className={cn(
        "pl-10 text-left [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
        !props.value && "text-zinc-400",
        "dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert",
        className
      )}
      ref={ref}
      {...props}
    />
    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none dark:text-zinc-500" />
  </div>
));
TimeInput.displayName = "TimeInput";

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
    className="scroll-mt-6 bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
  >
    <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>}
    </div>
    {children}
  </div>
);

interface ResidentFormProps {
  initialData?: Partial<Resident>;
  mode?: "create" | "edit";
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
  embedded?: boolean;
  hideActions?: boolean;
}

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
}: ResidentFormProps) {
  const [activeSection, setActiveSection] = useState("data-diri");
  const [formData, setFormData] = useState<Partial<Resident>>(initialData || {});
  const [showGelar, setShowGelar] = useState(!!(initialData?.gelar_depan || initialData?.gelar_belakang));

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
    const fetchWilayah = async () => {
      const supabase = createSupabaseBrowserClient();
      
      const { data: dusun } = await supabase.from("wilayah_dusun").select("*").order("nama");
      if (dusun) setDusunOptions(dusun);
      
      const { data: rw } = await supabase.from("wilayah_rw").select("*").order("nomor_rw");
      if (rw) setRwOptions(rw);
      
      const { data: rt } = await supabase.from("wilayah_rt").select("*").order("nomor_rt");
      if (rt) setRtOptions(rt);
    };
    
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
    { id: "data-diri", label: "Data Diri", description: "Identitas utama penduduk", icon: User },
    { id: "data-kelahiran", label: "Data Kelahiran", description: "Informasi seputar kelahiran", icon: Baby },
    { id: "pendidikan-pekerjaan", label: "Pendidikan & Pekerjaan", description: "Riwayat pendidikan & profesi", icon: GraduationCap },
    { id: "data-kewarganegaraan", label: "Data Kewarganegaraan", description: "Status kewarganegaraan", icon: Flag },
    { id: "data-orang-tua", label: "Data Orang Tua", description: "Informasi ayah dan ibu", icon: Users },
    { id: "alamat", label: "Alamat", description: "Domisili dan kontak", icon: MapPin },
    { id: "status-perkawinan", label: "Status Perkawinan", description: "Riwayat pernikahan", icon: HeartHandshake },
    { id: "data-kesehatan", label: "Data Kesehatan", description: "Kondisi kesehatan & asuransi", icon: Activity },
    { id: "lainnya", label: "Lainnya", description: "Informasi tambahan", icon: FileText },
  ];

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  // Helper to check if a section is "complete" (has key fields filled)
  const isSectionComplete = (sectionId: string) => {
    switch (sectionId) {
      case "data-diri":
        return !!(formData.nik && formData.nama);
      case "data-kelahiran":
        return !!(formData.tempat_lahir && formData.tanggal_lahir);
      case "pendidikan-pekerjaan":
        return !!(formData.pendidikan_kk || formData.pekerjaan);
      case "data-kewarganegaraan":
        return !!(formData.kewarganegaraan);
      case "data-orang-tua":
        return !!(formData.nama_ayah || formData.nama_ibu);
      case "alamat":
        return !!(formData.alamat_saat_ini || formData.dusun);
      case "status-perkawinan":
        return !!(formData.status_kawin);
      case "data-kesehatan":
        return !!(formData.golongan_darah);
      default:
        return false;
    }
  };

  // Scroll spy logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "flex h-full w-full bg-white flex-col md:flex-row overflow-hidden border border-zinc-200 rounded-xl transition-all duration-500 ease-out transform dark:bg-zinc-950 dark:border-zinc-800",
        embedded && "border-0",
        isVisible 
          ? "opacity-100 translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.15)]" 
          : "opacity-0 -translate-x-8 shadow-none",
        embedded && "shadow-none"
      )}
    >
      {/* Sidebar Navigation - Fixed Left Panel */}
      <div className="hidden md:flex flex-col w-64 shrink-0 border-r border-zinc-200 bg-zinc-50/50 h-full dark:bg-zinc-900/50 dark:border-zinc-800">
        <div className="p-4 sticky top-0 bg-zinc-50/50 z-10 border-b border-zinc-200/50 backdrop-blur-sm dark:bg-zinc-900/50 dark:border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daftar Isian</h3>
            <p className="text-xs text-zinc-500 mt-0.5 dark:text-zinc-400">Progress pengisian data</p>
        </div>
          <div className="p-3 space-y-0.5 flex-1">
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
                      ? "bg-zinc-200/50 text-zinc-900 font-medium shadow-sm dark:bg-zinc-800/50 dark:text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  )}
                >
                  {/* Status Indicator */}
                  <div className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                     isComplete 
                       ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                       : isActive 
                         ? "border-zinc-400 bg-transparent dark:border-zinc-500"
                         : "border-zinc-300 bg-transparent group-hover:border-zinc-400 dark:border-zinc-600 dark:group-hover:border-zinc-500"
                  )}>
                    {isComplete && <Check className="h-2 w-2" />}
                    {!isComplete && isActive && <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />}
                  </div>

                  <span className="text-[13px] truncate">
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="h-[80px] px-6 border-t border-zinc-200 bg-zinc-50/80 flex items-center dark:bg-zinc-900/80 dark:border-zinc-800">
             <div className="flex items-center gap-3 w-full">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold dark:text-zinc-500">Status</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {sections.filter(s => isSectionComplete(s.id)).length} dari {sections.length} Lengkap
                    </span>
                 </div>
                 {/* Mini Progress Bar */}
                 <div className="h-1 flex-1 bg-zinc-200 rounded-full overflow-hidden ml-2 dark:bg-zinc-700">
                    <div 
                      className="h-full bg-zinc-900 transition-all duration-500 dark:bg-zinc-100" 
                      style={{ width: `${(sections.filter(s => isSectionComplete(s.id)).length / sections.length) * 100}%` }}
                    />
                 </div>
             </div>
          </div>
        </div>


      {/* Main Content - Right Panel Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white relative dark:bg-zinc-950">
        
        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth" id="form-scroll-container">
          <form id="resident-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto py-8 px-8">
          
          {/* DATA DIRI */}
          <SectionContainer
            id="data-diri"
            title="DATA DIRI"
            description="Informasi identitas utama penduduk."
            sectionRef={(el) => { sectionRefs.current["data-diri"] = el; }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" name="nik" value={formData.nik || ""} onChange={handleChange} placeholder="Nomor Induk Kependudukan" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" name="nama" value={formData.nama || ""} onChange={handleChange} placeholder="Nama Lengkap" required />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="ceklis_gelar" 
                    checked={showGelar} 
                    onChange={(e) => setShowGelar(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600 dark:text-zinc-100 dark:focus:ring-zinc-100"
                  />
                  <Label htmlFor="ceklis_gelar" className="mb-0 cursor-pointer">Ceklis Gelar (Tampilkan input Gelar)</Label>
                </div>
                
                {showGelar && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-100 rounded-md dark:bg-zinc-800">
                    <div className="space-y-2">
                      <Label htmlFor="gelar_depan">Gelar Depan</Label>
                      <Input id="gelar_depan" name="gelar_depan" value={formData.gelar_depan || ""} onChange={handleChange} placeholder="Contoh: Dr., Ir." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gelar_belakang">Gelar Belakang</Label>
                      <Input id="gelar_belakang" name="gelar_belakang" value={formData.gelar_belakang || ""} onChange={handleChange} placeholder="Contoh: S.Kom, M.Pd" />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-4 border border-zinc-200 rounded-md p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                 <Label className="text-sm font-semibold">Status Kepemilikan Identitas</Label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Wajib Identitas</Label>
                      <Select value={formData.status_kepemilikan_identitas} onValueChange={(val) => updateField("status_kepemilikan_identitas", val)}>
                        <SelectTrigger className={cn(!formData.status_kepemilikan_identitas && "text-zinc-400 font-normal")}>
                          <SelectValue placeholder="Pilih Wajib Identitas..." />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="WAJIB">WAJIB</SelectItem>
                           <SelectItem value="TIDAK WAJIB">TIDAK WAJIB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Identitas Elektronik</Label>
                      <Select value={formData.identitas_elektronik} onValueChange={(val) => updateField("identitas_elektronik", val)}>
                        <SelectTrigger className={cn(!formData.identitas_elektronik && "text-zinc-400 font-normal")}>
                          <SelectValue placeholder="Pilih Identitas Elektronik..." />
                        </SelectTrigger>
                        <SelectContent>
                          {IDENTITAS_ELEKTRONIK_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status Rekam</Label>
                      <Select value={formData.status_rekam} onValueChange={(val) => updateField("status_rekam", val)}>
                        <SelectTrigger className={cn(!formData.status_rekam && "text-zinc-400 font-normal")}>
                          <SelectValue placeholder="Pilih Status Rekam..." />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_REKAM_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tag ID Card</Label>
                      <Input name="tag_id_card" value={formData.tag_id_card || ""} onChange={handleChange} placeholder="Tag ID Card" />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_kk_sebelumnya">Nomor KK Sebelumnya</Label>
                <Input id="no_kk_sebelumnya" name="no_kk_sebelumnya" value={formData.no_kk_sebelumnya || ""} onChange={handleChange} placeholder="No KK Sebelumnya" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="no_kk">Nomor KK</Label>
                 <Input id="no_kk" name="no_kk" value={formData.no_kk || ""} onChange={handleChange} placeholder="Nomor KK Saat Ini" />
              </div>

              <div className="space-y-2">
                <Label>Hubungan Dalam Keluarga</Label>
                <Select value={formData.hubungan_keluarga} onValueChange={(val) => updateField("hubungan_keluarga", val)}>
                  <SelectTrigger className={cn(!formData.hubungan_keluarga && "text-zinc-400 font-normal")}>
                    <SelectValue placeholder="Pilih Hubungan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {HUBUNGAN_KELUARGA_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={formData.jenis_kelamin} onValueChange={(val) => updateField("jenis_kelamin", val)}>
                  <SelectTrigger className={cn(!formData.jenis_kelamin && "text-zinc-400 font-normal")}>
                    <SelectValue placeholder="Pilih Jenis Kelamin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Agama</Label>
                <Select value={formData.agama} onValueChange={(val) => updateField("agama", val)}>
                  <SelectTrigger className={cn(!formData.agama && "text-zinc-400 font-normal")}>
                    <SelectValue placeholder="Pilih Agama..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AGAMA_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status Penduduk</Label>
                <Select value={formData.status_penduduk} onValueChange={(val) => updateField("status_penduduk", val)}>
                  <SelectTrigger className={cn(!formData.status_penduduk && "text-zinc-400 font-normal")}>
                    <SelectValue placeholder="Pilih Status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_PENDUDUK_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionContainer>

          {/* DATA KELAHIRAN */}
          <SectionContainer
            id="data-kelahiran"
            title="DATA KELAHIRAN"
            description="Informasi seputar kelahiran."
            sectionRef={(el) => { sectionRefs.current["data-kelahiran"] = el; }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="akta_kelahiran_nomor">Nomor Akta Kelahiran</Label>
                <Input id="akta_kelahiran_nomor" name="akta_kelahiran_nomor" value={formData.akta_kelahiran_nomor || ""} onChange={handleChange} placeholder="Nomor Akta Kelahiran" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tempat_lahir">Tempat Dilahirkan</Label>
                <Input id="tempat_lahir" name="tempat_lahir" value={formData.tempat_lahir || ""} onChange={handleChange} placeholder="Kota/Kabupaten" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <DateInput 
                  id="tanggal_lahir" 
                  name="tanggal_lahir" 
                  value={formData.tanggal_lahir || ""} 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waktu_lahir">Waktu Kelahiran</Label>
                <TimeInput 
                  id="waktu_lahir" 
                  name="waktu_lahir" 
                  value={formData.waktu_lahir || ""} 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Jenis Kelahiran</Label>
                <Select value={formData.jenis_kelahiran} onValueChange={(val) => updateField("jenis_kelahiran", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUNGGAL">TUNGGAL</SelectItem>
                    <SelectItem value="KEMBAR 2">KEMBAR 2</SelectItem>
                    <SelectItem value="KEMBAR 3">KEMBAR 3</SelectItem>
                    <SelectItem value="KEMBAR 4">KEMBAR 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anak_ke">Anak Ke</Label>
                <Input type="number" id="anak_ke" name="anak_ke" value={formData.anak_ke || ""} onChange={handleChange} placeholder="Isi dengan angka" />
              </div>

              <div className="space-y-2">
                <Label>Penolong Kelahiran</Label>
                <Select value={formData.cara_lahir} onValueChange={(val) => updateField("cara_lahir", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Penolong" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOKTER">DOKTER</SelectItem>
                    <SelectItem value="BIDAN">BIDAN</SelectItem>
                    <SelectItem value="DUKUN">DUKUN</SelectItem>
                    <SelectItem value="LAINNYA">LAINNYA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="berat_lahir">Berat Lahir (Gram)</Label>
                <Input type="number" id="berat_lahir" name="berat_lahir" value={formData.berat_lahir || ""} onChange={handleChange} placeholder="Contoh: 3000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="panjang_lahir">Panjang Lahir (cm)</Label>
                <Input type="number" id="panjang_lahir" name="panjang_lahir" value={formData.panjang_lahir || ""} onChange={handleChange} placeholder="Contoh: 50" />
              </div>
            </div>
          </SectionContainer>

          {/* PENDIDIKAN DAN PEKERJAAN */}
          <SectionContainer
            id="pendidikan-pekerjaan"
            title="PENDIDIKAN DAN PEKERJAAN"
            sectionRef={(el) => { sectionRefs.current["pendidikan-pekerjaan"] = el; }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pendidikan Dalam KK</Label>
                <Select value={formData.pendidikan_kk} onValueChange={(val) => updateField("pendidikan_kk", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Pendidikan KK" /></SelectTrigger>
                  <SelectContent>
                    {PENDIDIKAN_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pendidikan Sedang Ditempuh</Label>
                <Select value={formData.pendidikan_saat_ini} onValueChange={(val) => updateField("pendidikan_saat_ini", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                  <SelectContent>
                    {PENDIDIKAN_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Pekerjaan</Label>
                <Select value={formData.pekerjaan} onValueChange={(val) => updateField("pekerjaan", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
                  <SelectContent>
                    {PEKERJAAN_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionContainer>

          {/* DATA KEWARGANEGARAAN */}
          <SectionContainer
            id="data-kewarganegaraan"
            title="DATA KEWARGANEGARAAN"
            sectionRef={(el) => { sectionRefs.current["data-kewarganegaraan"] = el; }}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label htmlFor="suku_etnis">Suku/Etnis</Label>
                   <Input id="suku_etnis" name="suku_etnis" value={formData.suku_etnis || ""} onChange={handleChange} placeholder="Suku/Etnis" />
                </div>
                <div className="space-y-2">
                  <Label>Status Warga Negara</Label>
                  <Select value={formData.kewarganegaraan} onValueChange={(val) => updateField("kewarganegaraan", val)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Warga Negara" /></SelectTrigger>
                    <SelectContent>
                      {WARGANEGARA_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="no_paspor">Nomor Paspor</Label>
                   <Input id="no_paspor" name="no_paspor" value={formData.no_paspor || ""} onChange={handleChange} placeholder="Nomor Paspor" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="tgl_berakhir_paspor">Tgl Berakhir Paspor</Label>
                   <DateInput id="tgl_berakhir_paspor" name="tgl_berakhir_paspor" value={formData.tgl_berakhir_paspor || ""} onChange={handleChange} />
                </div>
             </div>
          </SectionContainer>

          {/* DATA ORANG TUA */}
          <SectionContainer
            id="data-orang-tua"
            title="DATA ORANG TUA"
            sectionRef={(el) => { sectionRefs.current["data-orang-tua"] = el; }}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label htmlFor="nik_ayah">NIK Ayah</Label>
                   <Input id="nik_ayah" name="nik_ayah" value={formData.nik_ayah || ""} onChange={handleChange} placeholder="NIK Ayah" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="nama_ayah">Nama Ayah</Label>
                   <Input id="nama_ayah" name="nama_ayah" value={formData.nama_ayah || ""} onChange={handleChange} placeholder="Nama Ayah" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="nik_ibu">NIK Ibu</Label>
                   <Input id="nik_ibu" name="nik_ibu" value={formData.nik_ibu || ""} onChange={handleChange} placeholder="NIK Ibu" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="nama_ibu">Nama Ibu</Label>
                   <Input id="nama_ibu" name="nama_ibu" value={formData.nama_ibu || ""} onChange={handleChange} placeholder="Nama Ibu" />
                </div>
             </div>
          </SectionContainer>

          {/* ALAMAT */}
          <SectionContainer
            id="alamat"
            title="ALAMAT"
            sectionRef={(el) => { sectionRefs.current["alamat"] = el; }}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label htmlFor="dusun">Dusun</Label>
                   <Select value={formData.dusun} onValueChange={handleDusunChange}>
                     <SelectTrigger className={cn(!formData.dusun && "text-zinc-400 font-normal")}>
                       <SelectValue placeholder="Pilih Dusun..." />
                     </SelectTrigger>
                     <SelectContent>
                       {dusunOptions.map(d => (
                         <SelectItem key={d.id} value={d.nama}>{d.nama}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                </div>
                
                {/* RW Selection */}
                {formData.dusun && (
                  <div className="space-y-2">
                     <Label htmlFor="rw">RW</Label>
                     <Select value={formData.rw} onValueChange={handleRwChange}>
                       <SelectTrigger className={cn(!formData.rw && "text-zinc-400 font-normal")}>
                         <SelectValue placeholder="Pilih RW..." />
                       </SelectTrigger>
                       <SelectContent>
                         {filteredRw.length > 0 ? (
                           filteredRw.map(r => (
                             <SelectItem key={r.id} value={formatNumber(r.nomor_rw)}>
                               {formatNumber(r.nomor_rw)}
                             </SelectItem>
                           ))
                         ) : (
                           <SelectItem value="-">-</SelectItem>
                         )}
                       </SelectContent>
                     </Select>
                  </div>
                )}

                {/* RT Selection */}
                {formData.rw && (
                  <div className="space-y-2">
                     <Label htmlFor="rt">RT</Label>
                     <Select value={formData.rt} onValueChange={(val) => updateField("rt", val)}>
                       <SelectTrigger className={cn(!formData.rt && "text-zinc-400 font-normal")}>
                         <SelectValue placeholder="Pilih RT..." />
                       </SelectTrigger>
                       <SelectContent>
                         {filteredRt.length > 0 ? (
                           filteredRt.map(r => (
                             <SelectItem key={r.id} value={formatNumber(r.nomor_rt)}>
                               {formatNumber(r.nomor_rt)}
                             </SelectItem>
                           ))
                         ) : (
                           <SelectItem value="-">-</SelectItem>
                         )}
                       </SelectContent>
                     </Select>
                  </div>
                )}

                <div className="space-y-2">
                   <Label htmlFor="alamat_sebelumnya">Alamat Sebelumnya</Label>
                   <Input id="alamat_sebelumnya" name="alamat_sebelumnya" value={formData.alamat_sebelumnya || ""} onChange={handleChange} placeholder="Alamat Sebelumnya" />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <Label htmlFor="alamat_saat_ini">Alamat Sekarang</Label>
                   <Textarea id="alamat_saat_ini" name="alamat_saat_ini" value={formData.alamat_saat_ini || ""} onChange={handleChange} placeholder="Alamat Sekarang" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="telepon">Nomor Telepon</Label>
                   <Input id="telepon" name="telepon" value={formData.telepon || ""} onChange={handleChange} placeholder="Nomor Telepon" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input id="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="Email" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="telegram">Telegram</Label>
                   <Input id="telegram" name="telegram" value={formData.telegram || ""} onChange={handleChange} placeholder="Telegram" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="cara_hubung_warga">Cara Hubung Warga</Label>
                   <Input id="cara_hubung_warga" name="cara_hubung_warga" value={formData.cara_hubung_warga || ""} onChange={handleChange} placeholder="Email / Telepon / Telegram" />
                </div>
             </div>
          </SectionContainer>

          {/* STATUS PERKAWINAN */}
          <SectionContainer
            id="status-perkawinan"
            title="STATUS PERKAWINAN"
            sectionRef={(el) => { sectionRefs.current["status-perkawinan"] = el; }}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Status Perkawinan</Label>
                  <Select value={formData.status_kawin} onValueChange={(val) => updateField("status_kawin", val)}>
                    <SelectTrigger className={cn(!formData.status_kawin && "text-zinc-400 font-normal")}>
                      <SelectValue placeholder="Pilih Status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_PERKAWINAN_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="no_akta_nikah">No. Akta Nikah (Buku Nikah)</Label>
                   <Input id="no_akta_nikah" name="no_akta_nikah" value={formData.no_akta_nikah || ""} onChange={handleChange} placeholder="Nomor Akta Nikah" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="tanggal_perkawinan">Tanggal Perkawinan</Label>
                   <DateInput 
                      id="tanggal_perkawinan" 
                      name="tanggal_perkawinan" 
                      value={formData.tanggal_perkawinan || ""} 
                      onChange={handleChange} 
                      required={formData.status_kawin === "Kawin"}
                    />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="akta_perceraian">Akta Perceraian</Label>
                   <Input id="akta_perceraian" name="akta_perceraian" value={formData.akta_perceraian || ""} onChange={handleChange} placeholder="Akta Perceraian" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="tanggal_perceraian">Tanggal Perceraian</Label>
                   <DateInput 
                      id="tanggal_perceraian" 
                      name="tanggal_perceraian" 
                      value={formData.tanggal_perceraian || ""} 
                      onChange={handleChange} 
                      required={formData.status_kawin?.includes("Cerai")}
                    />
                </div>
             </div>
          </SectionContainer>

          {/* DATA KESEHATAN */}
          <SectionContainer
            id="data-kesehatan"
            title="DATA KESEHATAN"
            sectionRef={(el) => { sectionRefs.current["data-kesehatan"] = el; }}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Golongan Darah</Label>
                  <Select value={formData.golongan_darah} onValueChange={(val) => updateField("golongan_darah", val)}>
                    <SelectTrigger className={cn(!formData.golongan_darah && "text-zinc-400 font-normal")}>
                      <SelectValue placeholder="Pilih Gol. Darah..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GOL_DARAH_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="cacat_fisik_mental">Cacat</Label>
                   <Input id="cacat_fisik_mental" name="cacat_fisik_mental" value={formData.cacat_fisik_mental || ""} onChange={handleChange} placeholder="Jenis Cacat" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="sakit_menahun">Sakit Menahun</Label>
                   <Input id="sakit_menahun" name="sakit_menahun" value={formData.sakit_menahun || ""} onChange={handleChange} placeholder="Sakit Menahun" />
                </div>
                <div className="space-y-2">
                   <Label>Asuransi Kesehatan</Label>
                   <Select value={formData.kepesertaan_asuransi} onValueChange={(val) => updateField("kepesertaan_asuransi", val)}>
                    <SelectTrigger className={cn(!formData.kepesertaan_asuransi && "text-zinc-400 font-normal")}>
                      <SelectValue placeholder="Pilih Asuransi..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BPJS KESEHATAN">BPJS KESEHATAN</SelectItem>
                      <SelectItem value="JAMKESMAS">JAMKESMAS</SelectItem>
                      <SelectItem value="ASURANSI SWASTA">ASURANSI SWASTA</SelectItem>
                      <SelectItem value="TIDAK ADA">TIDAK ADA</SelectItem>
                    </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                  <Label>Akseptor KB</Label>
                  <Select value={formData.akseptor_kb} onValueChange={(val) => updateField("akseptor_kb", val)}>
                    <SelectTrigger className={cn(!formData.akseptor_kb && "text-zinc-400 font-normal")}>
                      <SelectValue placeholder="Pilih Akseptor KB..." />
                    </SelectTrigger>
                    <SelectContent>
                      {AKSEPTOR_KB_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(formData.jenis_kelamin === "PEREMPUAN" || formData.jenis_kelamin === "P") && (
                  <div className="space-y-2">
                    <Label>Status Kehamilan</Label>
                    <Select value={formData.status_kehamilan} onValueChange={(val) => updateField("status_kehamilan", val)}>
                      <SelectTrigger className={cn(!formData.status_kehamilan && "text-zinc-400 font-normal")}>
                        <SelectValue placeholder="Pilih Status Hamil..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_HAMIL_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                   <Label htmlFor="nomor_bpjs_ketenagakerjaan">Nomor BPJS Ketenagakerjaan</Label>
                   <Input id="nomor_bpjs_ketenagakerjaan" name="nomor_bpjs_ketenagakerjaan" value={formData.nomor_bpjs_ketenagakerjaan || ""} onChange={handleChange} placeholder="No BPJS Ketenagakerjaan" />
                </div>
             </div>
          </SectionContainer>

          {/* LAINNYA */}
          <SectionContainer
            id="lainnya"
            title="LAINNYA"
            sectionRef={(el) => { sectionRefs.current["lainnya"] = el; }}
          >
             <div className="space-y-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Data tambahan lainnya dapat diisi di sini jika diperlukan.</p>
             </div>
          </SectionContainer>

          {/* Spacer for bottom scroll */}
          <div className="h-10"></div>

        </form>
        </div>

        {/* Fixed Bottom Action Bar */}
        {!hideActions && (
          <div className="h-[80px] shrink-0 border-t border-zinc-200 bg-white px-6 flex items-center justify-end gap-3 z-30 dark:bg-zinc-900 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => window.history.back()} className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Batal
            </Button>
            <Button 
              type="submit" 
              form="resident-form"
              disabled={isSubmitting}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? "Menyimpan..." : (mode === "create" ? "Simpan Data" : "Update Data")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

