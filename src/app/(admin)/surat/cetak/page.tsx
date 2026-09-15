"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  FileText, 
  Search,
  PenTool,
  RotateCw,
  Eye,
  Send,
  MessageSquare,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { 
  getFormatSurat, 
  getPamong, 
  getIdentitasDesa,
  createLogSurat,
  incrementNomorSurat,
  generateNomorSurat,
  buildSuratPreviewData,
  FormatSurat,
  Pamong,
  IdentitasDesa
} from "@/lib/services/surat";
import { extractFieldsFromTemplate, FormFieldDefinition, SuratFlowStatus } from "@/lib/services/surat-flow";
import { Resident } from "@/lib/services/penduduk";
import ResidentPickerModal from "@/components/ResidentPickerModal";
import FormatPickerModal from "@/components/FormatPickerModal";
import LandSketchInput from "@/components/surat/LandSketchInput";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { InputField, TextAreaField, SelectField, SectionTitle } from "@/components/ui/FormFields";
import { Editor } from "@/components/editor/Editor";

export default function CetakSuratPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Data Lists
  const [formatList, setFormatList] = useState<FormatSurat[]>([]);
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  const [identitasDesa, setIdentitasDesa] = useState<IdentitasDesa | null>(null);
  
  // Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFormatPickerOpen, setIsFormatPickerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Form State
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatSurat | null>(null);
  const [selectedPamong, setSelectedPamong] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [counterKey, setCounterKey] = useState("");

  // Dynamic Form State
  const [dynamicFields, setDynamicFields] = useState<FormFieldDefinition[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  // Scroll Spy
  const [activeSection, setActiveSection] = useState("penerima");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: "penerima", label: "Penerima Surat", icon: User },
    { id: "detail-surat", label: "Detail Surat", icon: FileText },
    ...(dynamicFields.length > 0 ? [{ id: "form-isian", label: "Form Isian Khusus", icon: PenTool }] : []),
    { id: "penandatangan", label: "Penandatangan", icon: ShieldCheck },
    { id: "keterangan", label: "Keterangan", icon: MessageSquare },
  ];

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  // Keyboard shortcut listener (Alt+P: Pick resident, Alt+F: Pick format, Alt+V: Preview)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPickerOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFormatPickerOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (selectedResident && selectedFormat) {
          setIsPreviewOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedResident, selectedFormat]);

  useEffect(() => {
    loadData();
  }, []);

  // Parse template and generate number when format changes
  useEffect(() => {
    if (selectedFormat) {
      const fields = extractFieldsFromTemplate(
        selectedFormat.template || "", 
        selectedFormat.url_surat || selectedFormat.nama,
        selectedFormat.form_isian
      );
      setDynamicFields(fields);
      
      // Initialize values
      const initialValues: Record<string, any> = {};
      fields.forEach(f => {
        if (f.defaultValue) initialValues[f.key] = f.defaultValue;
      });
      setDynamicValues(initialValues);

      // Generate Nomor Surat Otomatis
      generateNomorSurat('layanan', selectedFormat.kode_surat || '000', new Date(), selectedFormat.id)
        .then(result => {
          setNomorSurat(result.format_nomor);
          setCounterKey(result.key);
        })
        .catch(err => console.error("Error generating number:", err));

    } else {
      setDynamicFields([]);
      setDynamicValues({});
      setNomorSurat("");
      setCounterKey("");
    }
  }, [selectedFormat]);

  const loadData = async () => {
    setIsLoadingData(true);
    
    try {
      const formats = await getFormatSurat();
      setFormatList(formats || []);
    } catch (error) {
      console.error("Error fetching formats:", error);
      setFormatList([]);
    }

    try {
      const pamongs = await getPamong();
      setPamongList(pamongs || []);
      
      // Auto-select active Kepala Desa or Penandatangan
      if (pamongs && pamongs.length > 0) {
        const defaultPamong = pamongs.find(p => p.pamong_ttd === 1 && p.pamong_status === 1) 
          || pamongs.find(p => p.jabatan_id === 1)
          || pamongs[0];
        if (defaultPamong) {
          setSelectedPamong(String(defaultPamong.pamong_id));
        }
      }
    } catch (error) {
      console.error("Error fetching pamongs:", error);
      setPamongList([]);
    }

    try {
      const desa = await getIdentitasDesa();
      setIdentitasDesa(desa);
    } catch (error) {
      console.error("Error fetching identitas desa:", error);
    }

    setIsLoadingData(false);
  };

  const handleSelectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsPickerOpen(false);
  };

  const handleSelectFormat = (format: FormatSurat) => {
    setSelectedFormat(format);
    setIsFormatPickerOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const selectedPamongObj = pamongList.find(p => String(p.pamong_id) === String(selectedPamong))
    || pamongList.find(p => p.pamong_ttd === 1)
    || pamongList[0];

  const currentPreviewData = buildSuratPreviewData({
    surat: {
      nomor: nomorSurat || "[Nomor Surat Akan Digenerate]",
      no_surat: nomorSurat || "[Nomor Surat Akan Digenerate]",
      tanggal: new Date(),
      tanggal_surat: new Date(),
      nama_surat: selectedFormat?.nama || "Surat Pelayanan",
      kode: selectedFormat?.kode_surat || "000",
      keterangan: keterangan,
    },
    resident: selectedResident,
    pamong: selectedPamongObj,
    identitasDesa: identitasDesa,
    formData: dynamicValues,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident || !selectedFormat) {
      alert("Mohon lengkapi data surat (Pilih Penduduk & Format Surat terlebih dahulu).");
      return;
    }

    setLoading(true);
    try {
      if (counterKey && nomorSurat) {
        await incrementNomorSurat(counterKey);
      }

      const pamongId = selectedPamong ? parseInt(selectedPamong) : (selectedPamongObj ? selectedPamongObj.pamong_id : 1);

      await createLogSurat({
        id_format_surat: selectedFormat.id!,
        id_pend: selectedResident.id,
        id_pamong: pamongId,
        id_user: 1,
        tanggal: new Date().toISOString(),
        no_surat: nomorSurat || `SURAT/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
        nama_surat: selectedFormat.nama,
        keterangan: keterangan,
        status: SuratFlowStatus.PENDING_SEKDES,
        nama_non_warga: selectedResident.nama,
        form_data: dynamicValues
      });

      alert("Surat berhasil diproses dan dikirim ke antrian Verifikasi!");
      router.push("/surat/verifikasi");
    } catch (error: any) {
      console.error("Error creating surat:", error);
      if (error?.code === '42703' && error?.message?.includes('form_data')) {
         alert("GAGAL: Kolom 'form_data' tidak ditemukan di database.\n\nMohon jalankan script SQL 'supabase_schema_update_form_data.sql' di Supabase SQL Editor untuk memperbaiki masalah ini.");
      } else {
         alert("Gagal memproses surat. Silakan coba lagi atau hubungi administrator.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filledFieldsCount = Object.values(dynamicValues).filter(v => v !== undefined && v !== "").length;

  const formActions = (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setSelectedResident(null);
          setSelectedFormat(null);
          setDynamicValues({});
          setKeterangan("");
        }}
        className="rounded-xl text-xs"
      >
        Reset Form
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsPreviewOpen(true)}
        disabled={!selectedResident || !selectedFormat}
        className="gap-2 rounded-xl text-xs border border-border-color shadow-xs hover:border-accent"
      >
        <Eye className="w-4 h-4 text-accent" />
        <span>Pratinjau Surat (Alt+V)</span>
      </Button>

      <Button
        type="submit"
        variant="primary"
        disabled={loading || !selectedResident || !selectedFormat}
        className="gap-2 rounded-xl text-xs shadow-md shadow-accent/20"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? "Memproses..." : "Kirim ke Verifikasi"}</span>
      </Button>
    </div>
  );

  return (
    <>
      <FormLayout
        title="Cetak Surat Pelayanan & Administrasi Desa"
        actions={formActions}
        sidebar={
          <FormSidebarNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Workflow Stepper */}
          <div className="bg-card-bg rounded-2xl border border-border-color p-4 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedResident ? "bg-accent/5 border-accent/30 text-primary-text" : "bg-body-bg border-border-color text-secondary-text"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${selectedResident ? "bg-accent text-white" : "bg-card-bg border border-border-color"}`}>
                  {selectedResident ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">Data Pemohon</div>
                  <div className="text-[10px] text-secondary-text truncate">{selectedResident ? selectedResident.nama : "Belum dipilih"}</div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedFormat ? "bg-accent/5 border-accent/30 text-primary-text" : "bg-body-bg border-border-color text-secondary-text"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${selectedFormat ? "bg-accent text-white" : "bg-card-bg border border-border-color"}`}>
                  {selectedFormat ? <Check className="w-4 h-4" /> : "2"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">Jenis Format</div>
                  <div className="text-[10px] text-secondary-text truncate">{selectedFormat ? selectedFormat.nama : "Belum dipilih"}</div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${dynamicFields.length > 0 && filledFieldsCount > 0 ? "bg-accent/5 border-accent/30 text-primary-text" : "bg-body-bg border-border-color text-secondary-text"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${dynamicFields.length > 0 && filledFieldsCount === dynamicFields.length ? "bg-accent text-white" : "bg-card-bg border border-border-color"}`}>
                  {dynamicFields.length > 0 && filledFieldsCount === dynamicFields.length ? <Check className="w-4 h-4" /> : "3"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">Form Isian</div>
                  <div className="text-[10px] text-secondary-text truncate">
                    {dynamicFields.length > 0 ? `${filledFieldsCount}/${dynamicFields.length} Terisi` : "Standar"}
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedPamong ? "bg-accent/5 border-accent/30 text-primary-text" : "bg-body-bg border-border-color text-secondary-text"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${selectedPamong ? "bg-accent text-white" : "bg-card-bg border border-border-color"}`}>
                  {selectedPamong ? <Check className="w-4 h-4" /> : "4"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">Penandatangan</div>
                  <div className="text-[10px] text-secondary-text truncate">{selectedPamongObj ? selectedPamongObj.pamong_nama : "Kepala Desa"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Penerima Surat */}
          <div 
            id="penerima"
            ref={(el) => { sectionRefs.current["penerima"] = el; }}
            className="bg-card-bg rounded-2xl shadow-xs border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Penerima Surat (Pemohon)" 
              description="Pilih penduduk dari database desa untuk mengisi biodata resmi secara otomatis." 
              icon={User} 
            />

            {!selectedResident ? (
              <div className="mt-4 p-8 border-2 border-dashed border-border-color rounded-2xl bg-body-bg/40 flex flex-col items-center justify-center text-center group hover:border-accent/50 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-accent/20">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-primary-text mb-1">
                  Belum Ada Penduduk Dipilih
                </h4>
                <p className="text-xs text-secondary-text max-w-md mb-4">
                  Pilih penduduk yang mengajukan permohonan surat untuk memuat NIK, TTL, Alamat, dan identitas lengkap.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsPickerOpen(true)}
                  className="gap-2 rounded-xl text-xs shadow-md shadow-accent/20"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari & Pilih Penduduk (Alt+P)</span>
                </Button>
              </div>
            ) : (
              <div className="mt-4 bg-body-bg/60 rounded-2xl border border-border-color p-5 space-y-4">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-color">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-accent text-white font-bold text-base flex items-center justify-center shadow-sm shrink-0">
                      {selectedResident.nama.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-primary-text">{selectedResident.nama}</h4>
                        <Badge variant="success" className="text-[10px] font-medium">Terverifikasi</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-secondary-text">
                        <span className="font-mono font-medium text-primary-text">NIK: {selectedResident.nik}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedResident.nik)}
                          className="text-secondary-text hover:text-primary-text transition-colors"
                          title="Salin NIK"
                        >
                          {copiedText === selectedResident.nik ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                        <span>•</span>
                        <span className="font-mono">No. KK: {selectedResident.no_kk || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPickerOpen(true)}
                    className="rounded-xl text-xs gap-1.5 self-start sm:self-center"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Ganti Penduduk</span>
                  </Button>
                </div>

                {/* Resident Data Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-card-bg rounded-xl border border-border-color">
                    <span className="text-[10px] text-secondary-text block mb-0.5">Tempat / Tgl Lahir</span>
                    <span className="font-semibold text-primary-text truncate block">{currentPreviewData.penduduk?.tempat_tanggal_lahir || "-"}</span>
                  </div>
                  <div className="p-3 bg-card-bg rounded-xl border border-border-color">
                    <span className="text-[10px] text-secondary-text block mb-0.5">Jenis Kelamin</span>
                    <span className="font-semibold text-primary-text truncate block">{currentPreviewData.penduduk?.jenis_kelamin || "-"}</span>
                  </div>
                  <div className="p-3 bg-card-bg rounded-xl border border-border-color">
                    <span className="text-[10px] text-secondary-text block mb-0.5">Agama</span>
                    <span className="font-semibold text-primary-text truncate block">{currentPreviewData.penduduk?.agama || "-"}</span>
                  </div>
                  <div className="p-3 bg-card-bg rounded-xl border border-border-color">
                    <span className="text-[10px] text-secondary-text block mb-0.5">Pekerjaan</span>
                    <span className="font-semibold text-primary-text truncate block">{currentPreviewData.penduduk?.pekerjaan || "-"}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 lg:col-span-4 p-3 bg-card-bg rounded-xl border border-border-color flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-secondary-text block mb-0.5">Alamat Lengkap Domisili</span>
                      <span className="font-semibold text-primary-text">{currentPreviewData.penduduk?.alamat || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Detail Surat */}
          <div 
            id="detail-surat"
            ref={(el) => { sectionRefs.current["detail-surat"] = el; }}
            className="bg-card-bg rounded-2xl shadow-xs border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Detail & Format Surat" 
              description="Pilih jenis naskah dinas dan periksa nomor registrasi dokumen." 
              icon={FileText} 
            />

            <div className="space-y-5 mt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <InputField
                    label="Format Naskah Surat"
                    value={selectedFormat ? selectedFormat.nama : ""}
                    placeholder={isLoadingData ? "Memuat format surat..." : "Pilih jenis format surat..."}
                    readOnly
                    required
                    className={cn(
                      isLoadingData ? "cursor-wait opacity-70" : "cursor-pointer hover:border-accent"
                    )}
                    onClick={() => !isLoadingData && setIsFormatPickerOpen(true)}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoadingData}
                  onClick={() => setIsFormatPickerOpen(true)}
                  className="gap-2 h-[42px] rounded-xl text-xs border border-border-color"
                >
                  <FileText className="w-4 h-4 text-accent" />
                  <span>{selectedFormat ? "Ganti Format" : "Pilih Format (Alt+F)"}</span>
                </Button>
              </div>

              {selectedFormat && (
                <div className="p-3 bg-body-bg/60 rounded-xl border border-border-color flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-card-bg">
                      Kode: {selectedFormat.kode_surat || "470"}
                    </Badge>
                    <span className="text-secondary-text">File Template: <span className="font-mono text-primary-text">{selectedFormat.url_surat || "standar"}</span></span>
                  </div>
                  <Badge variant="default" className="text-[10px] bg-accent/10 text-accent border-accent/20">
                    Baku Permendagri 47/2016
                  </Badge>
                </div>
              )}

              <InputField
                label="Nomor Registrasi Surat"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="Nomor surat digenerate otomatis mengikuti penomoran desa"
                description="Nomor diisi otomatis mengikuti konfigurasi penomoran desa, atau dapat disesuaikan manual."
              />
            </div>
          </div>

          {/* Section 3: Form Isian Khusus */}
          {dynamicFields.length > 0 && (
            <div 
              id="form-isian"
              ref={(el) => { sectionRefs.current["form-isian"] = el; }}
              className="bg-card-bg rounded-2xl shadow-xs border border-border-color p-6 md:p-8 scroll-mt-24 animate-in fade-in duration-200"
            >
              <SectionTitle 
                title="Kolom Isian Khusus Format Ini" 
                description="Lengkapi rincian data spesifik yang dicantumkan pada naskah surat ini." 
                icon={PenTool} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {dynamicFields.map((field) => (
                  <div 
                    key={field.id} 
                    className={`space-y-1.5 ${
                      field.type === 'land_sketch' || field.type === 'land_boundaries' || field.type === 'textarea'
                        ? 'col-span-1 md:col-span-2' 
                        : ''
                    }`}
                  >
                    {field.type === 'textarea' ? (
                      <TextAreaField
                        label={field.label}
                        value={dynamicValues[field.key] || ""}
                        onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                        rows={3}
                        placeholder={field.placeholder || `Masukkan ${field.label}...`}
                        required={field.required}
                      />
                    ) : field.type === 'land_sketch' ? (
                      <div className="w-full space-y-2 p-4 bg-body-bg/40 rounded-2xl border border-border-color">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-primary-text uppercase tracking-wide">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <Badge variant="outline" className="text-[10px] bg-card-bg">Canvas Interaktif</Badge>
                        </div>
                        <LandSketchInput
                            value={dynamicValues[field.key]}
                            onChange={(val) => setDynamicValues({...dynamicValues, [field.key]: val})}
                        />
                      </div>
                    ) : field.type === 'land_boundaries' ? (
                      <div className="w-full p-4 bg-body-bg/40 border border-border-color rounded-2xl shadow-xs">
                          <div className="flex items-center justify-between mb-3 border-b border-border-color pb-2">
                            <span className="text-xs font-bold text-primary-text uppercase tracking-wide">Preview Rincian Batas Tanah</span>
                            <Badge variant="outline" className="text-[10px] bg-card-bg">Otomatis Terhubung</Badge>
                          </div>
                          {dynamicValues['Sketsa_Tanah']?.labels?.length > 0 || dynamicValues['land_sketch']?.labels?.length > 0 ? (
                            <div className="space-y-2">
                              {(dynamicValues['Sketsa_Tanah'] || dynamicValues['land_sketch']).points.map((_: any, idx: number) => {
                                const sketchData = dynamicValues['Sketsa_Tanah'] || dynamicValues['land_sketch'];
                                const labels = sketchData.labels || [];
                                const points = sketchData.points || [];
                                const labelData = labels.find((l: any) => l.edgeIndex === idx);
                                
                                const p1 = points[idx];
                                const p2 = points[(idx + 1) % points.length];
                                const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                                const scale = sketchData.scale || 10;
                                const lengthM = (dist / scale).toFixed(1);

                                let sideName = `Sisi ${idx + 1}`;
                                if (points.length === 4) {
                                    const directions = ["Utara", "Timur", "Selatan", "Barat"];
                                    sideName = directions[idx];
                                }

                                return (
                                  <div key={idx} className="flex items-end w-full text-xs text-primary-text/80">
                                    <div className="w-16 font-semibold shrink-0 mb-1">{sideName}</div>
                                    <div className="mr-2 mb-1">:</div>
                                    <div className="mb-1 truncate max-w-[200px]">berbatas dengan <span className="font-semibold text-primary-text">{labelData?.text || '-'}</span></div>
                                    <div className="flex-1 mx-1 border-b border-dotted border-border-color mb-1"></div>
                                    <div className="w-16 text-right font-mono mb-1 shrink-0">{lengthM} m</div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-secondary-text italic py-2">Data batas tanah akan tersinkronisasi otomatis saat Anda menggambar pada canvas sketsa tanah di atas.</p>
                          )}
                      </div>
                    ) : (
                      <InputField
                        label={field.label}
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={dynamicValues[field.key] || ""}
                        onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                        placeholder={field.placeholder || `Masukkan ${field.label}...`}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Section 4: Penandatangan */}
          <div 
            id="penandatangan"
            ref={(el) => { sectionRefs.current["penandatangan"] = el; }}
            className="bg-card-bg rounded-2xl shadow-xs border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Pejabat Penandatangan Naskah" 
              description="Pilih aparatur pemerintah desa yang berwenang menandatangani surat ini." 
              icon={ShieldCheck} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <SelectField
                label="Pejabat Penandatangan"
                placeholder="Pilih Pejabat Penandatangan..."
                options={pamongList.map(p => ({
                  label: `${p.pamong_nama} (${p.jabatan || p.pamong_pangkat || "Perangkat Desa"})`,
                  value: String(p.pamong_id)
                }))}
                value={selectedPamong}
                onChange={(val) => setSelectedPamong(val)}
                required
              />
              {selectedPamongObj && (
                <div className="p-4 bg-body-bg/60 rounded-xl border border-border-color flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 border border-accent/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-primary-text">{selectedPamongObj.pamong_nama}</div>
                    <div className="text-secondary-text">Jabatan: <span className="font-semibold text-primary-text">{selectedPamongObj.jabatan || "Kepala Desa"}</span></div>
                    <div className="text-secondary-text font-mono text-[11px]">NIP: {selectedPamongObj.pamong_nip || "-"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Keterangan */}
          <div 
            id="keterangan"
            ref={(el) => { sectionRefs.current["keterangan"] = el; }}
            className="bg-card-bg rounded-2xl shadow-xs border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Catatan Internal Surat (Opsional)" 
              description="Tambahkan catatan khusus untuk arsip dan buku register surat keluar desa." 
              icon={MessageSquare} 
            />
            <div className="mt-4">
              <TextAreaField
                label="Isi Catatan Internal"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                placeholder="Contoh: Diajukan untuk syarat pendaftaran beasiswa anak, lampiran KTP sudah diverifikasi..."
              />
            </div>
          </div>

        </form>
      </FormLayout>

      {/* Resident Picker Modal */}
      <ResidentPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleSelectResident}
      />

      {/* Format Picker Modal */}
      <FormatPickerModal
        open={isFormatPickerOpen}
        onOpenChange={setIsFormatPickerOpen}
        onSelect={handleSelectFormat}
      />

      {/* Fullscreen Live Preview & Print Modal */}
      {isPreviewOpen && selectedFormat && (
        <div className="fixed inset-0 z-[3000] flex flex-col bg-neutral-900/90 backdrop-blur-md animate-in fade-in duration-200">
          {/* Modal Header Bar */}
          <div className="h-16 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between shadow-lg shrink-0 print:hidden text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-xl text-accent border border-accent/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Pratinjau Resmi: {selectedFormat.nama}
                  <Badge variant="outline" className="text-[10px] font-mono text-neutral-300 border-neutral-700">
                    A4 Paper
                  </Badge>
                </h3>
                <p className="text-xs text-neutral-400">
                  Pemohon: <span className="text-white font-medium">{selectedResident?.nama || "Warga"}</span> ({selectedResident?.nik || "-"})
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2.5">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(Math.max(60, previewZoom - 10))}
                  className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-neutral-300 min-w-[45px] text-center">
                  {previewZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(Math.min(140, previewZoom + 10))}
                  className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="gap-2 rounded-xl text-xs shadow-md shadow-accent/30"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF Langsung</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 h-9 w-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Modal Body: Centered A4 Canvas Paper */}
          <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center custom-scrollbar bg-neutral-900" id="surat-preview-wrapper">
            <div 
              style={{ 
                transform: `scale(${previewZoom / 100})`, 
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out"
              }}
              className="shadow-2xl rounded-sm"
            >
              <Editor
                initialJson={selectedFormat.template}
                letterType={selectedFormat.url_surat || selectedFormat.kode_surat || selectedFormat.nama}
                letterName={selectedFormat.nama}
                previewData={currentPreviewData}
                readOnly={true}
                hideHeaderNavigation={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
