"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  FileText, 
  Search,
  PenTool,
  Send,
  MessageSquare,
  Printer,
  X,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  RotateCcw,
  Maximize2,
  FileCheck2,
  ChevronRight,
  ChevronDown
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
import { Editor } from "@/components/editor/Editor";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function CetakSuratPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Data Lists
  const [formatList, setFormatList] = useState<FormatSurat[]>([]);
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  const [identitasDesa, setIdentitasDesa] = useState<IdentitasDesa | null>(null);
  
  // Modal & View State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFormatPickerOpen, setIsFormatPickerOpen] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(80);
  const [fullscreenZoom, setFullscreenZoom] = useState(100);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "form">("form");
  
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

  // Keyboard shortcut listener (Alt+P: Pick resident, Alt+F: Pick format, Alt+V: Preview, Esc: Close fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false);
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPickerOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFormatPickerOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (selectedResident && selectedFormat) {
          setIsFullscreenPreview(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedResident, selectedFormat, isFullscreenPreview]);

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

  const selectedPamongObj = useMemo(() => {
    return pamongList.find(p => String(p.pamong_id) === String(selectedPamong))
      || pamongList.find(p => p.pamong_ttd === 1)
      || pamongList[0];
  }, [pamongList, selectedPamong]);

  const currentPreviewData = useMemo(() => {
    return buildSuratPreviewData({
      surat: {
        nomor: nomorSurat || "[Nomor Registrasi Surat]",
        no_surat: nomorSurat || "[Nomor Registrasi Surat]",
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
  }, [nomorSurat, selectedFormat, keterangan, selectedResident, selectedPamongObj, identitasDesa, dynamicValues]);

  const isFormComplete = !!(selectedResident && selectedFormat);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident || !selectedFormat) {
      toast.error("Mohon lengkapi data surat (Pilih Penduduk & Format Surat terlebih dahulu).");
      return;
    }

    setLoading(true);
    try {
      if (counterKey && nomorSurat) {
        await incrementNomorSurat(counterKey);
      }

      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      let userId = 1;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
        // Fallback or use standard integer user identifier
        userId = 1;
      }

      const pamongId = selectedPamong ? parseInt(selectedPamong) : (selectedPamongObj ? selectedPamongObj.pamong_id : 1);

      await createLogSurat({
        id_format_surat: selectedFormat.id!,
        id_pend: selectedResident.id,
        id_pamong: pamongId,
        id_user: userId,
        tanggal: new Date().toISOString(),
        no_surat: nomorSurat || `SURAT/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
        nama_surat: selectedFormat.nama,
        keterangan: keterangan,
        status: SuratFlowStatus.PENDING_SEKDES,
        nama_non_warga: selectedResident.nama,
        form_data: dynamicValues
      });

      toast.success("Surat berhasil diproses dan dikirim ke antrian Verifikasi!");
      router.push("/surat/verifikasi");
    } catch (error: any) {
      console.error("Error creating surat:", error);
      if (error?.code === '42703' && error?.message?.includes('form_data')) {
         toast.error("Kolom 'form_data' tidak ditemukan di database. Mohon jalankan script update schema di Supabase.");
      } else {
         toast.error("Gagal memproses surat. Silakan coba lagi atau hubungi administrator.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedResident(null);
    setSelectedFormat(null);
    setDynamicValues({});
    setKeterangan("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-body-bg">
      {/* Top Header Bar */}
      <header className="h-14 flex-shrink-0 bg-card-bg/95 backdrop-blur-md border-b border-border-color px-4 lg:px-6 flex items-center justify-between z-20">
        
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/surat/keluar")}
            className="p-1.5 rounded-lg hover:bg-hover-bg text-secondary-text hover:text-primary-text transition-colors"
            title="Kembali ke Surat Keluar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm lg:text-base font-bold text-primary-text tracking-tight">
                Cetak Naskah Dinas
              </h1>
              {isFormComplete ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Siap Cetak
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-hover-bg text-secondary-text border border-border-color">
                  Draft Konsep
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Hub */}
        <div className="flex items-center gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-body-bg p-0.5 rounded-lg text-xs font-medium mr-1 border border-border-color">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                activeTab === "preview" ? "bg-card-bg text-primary-text shadow-xs font-semibold" : "text-secondary-text"
              )}
            >
              Pratinjau
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                activeTab === "form" ? "bg-card-bg text-primary-text shadow-xs font-semibold" : "text-secondary-text"
              )}
            >
              Editor
            </button>
          </div>

          <ThemeToggle />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 rounded-lg text-xs gap-1.5 text-secondary-text hover:text-primary-text"
          >
            <RotateCcw className="w-3.5 h-3.5 opacity-60" />
            <span className="hidden md:inline">Reset</span>
          </Button>

          {isFormComplete && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsFullscreenPreview(true)}
              className="h-8 rounded-lg text-xs gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5 text-accent" />
              <span className="hidden md:inline">Layar Penuh (Alt+V)</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={loading || !isFormComplete}
            onClick={handleSubmit}
            className="h-8 rounded-lg text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Memproses..." : "Ajukan Verifikasi"}</span>
          </Button>
        </div>
      </header>

      {/* Main 2-Pane Split Cockpit */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        
        {/* ========================================================================= */}
        {/* LEFT PANE: Real-Time Live Document Preview Studio (50%)                   */}
        {/* ========================================================================= */}
        <div className={cn(
          "w-full lg:w-1/2 xl:w-7/12 h-full flex flex-col border-r border-border-color bg-body-bg/60 overflow-hidden",
          activeTab === "form" ? "hidden lg:flex" : "flex"
        )}>
          {/* Studio Canvas Toolbar */}
          <div className="h-10 flex-shrink-0 px-4 bg-card-bg border-b border-border-color flex items-center justify-between text-secondary-text">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-primary-text">
                Live Naskah Dinas (A4)
              </span>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                className="p-1 hover:bg-hover-bg rounded text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-secondary-text min-w-[38px] text-center">
                {previewZoom}%
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoom(Math.min(120, previewZoom + 10))}
                className="p-1 hover:bg-hover-bg rounded text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-px bg-border-color mx-1"></div>

              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                disabled={!isFormComplete}
                className="p-1 hover:bg-hover-bg rounded text-secondary-text hover:text-primary-text transition-colors disabled:opacity-40 cursor-pointer"
                title="Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                disabled={!isFormComplete}
                className="p-1 bg-card-bg hover:bg-hover-bg border border-border-color rounded text-primary-text transition-colors disabled:opacity-40 shadow-xs cursor-pointer"
                title="Cetak Dokumen Langsung"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Area with independent scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex items-start justify-center custom-scrollbar bg-body-bg">
            {!isFormComplete ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-secondary-text max-w-xs my-auto">
                <div className="w-12 h-12 rounded-2xl bg-card-bg border border-border-color shadow-xs flex items-center justify-center text-secondary-text mb-3">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-primary-text mb-1">
                  Menunggu Pemohon & Format
                </p>
                <p className="text-[11px] text-secondary-text leading-relaxed">
                  Pilih warga pemohon dan format naskah di sebelah kanan untuk melihat render dokumen dinas secara langsung.
                </p>
              </div>
            ) : (
              <div 
                style={{ 
                  transform: `scale(${previewZoom / 100})`, 
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease-out"
                }}
                className="shrink-0 my-2 bg-transparent border-0 shadow-none"
              >
                <Editor
                  initialJson={selectedFormat?.template}
                  letterType={selectedFormat?.url_surat || selectedFormat?.kode_surat || selectedFormat?.nama}
                  letterName={selectedFormat?.nama}
                  previewData={currentPreviewData}
                  readOnly={true}
                  hideHeaderNavigation={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: Independent Scrollable Form Panel (50%)                       */}
        {/* ========================================================================= */}
        <div className={cn(
          "w-full lg:w-1/2 xl:w-5/12 h-full flex flex-col bg-card-bg overflow-hidden",
          activeTab === "preview" ? "hidden lg:flex" : "flex"
        )}>
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar bg-body-bg/30">
            
            {/* Card 1: Penerima Surat (Pemohon) */}
            <div className="bg-card-bg rounded-xl border border-border-color shadow-xs overflow-hidden transition-all">
              <div className="px-4 py-3 bg-card-bg border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5.5 h-5.5 rounded-md bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider">
                    Pemohon Surat
                  </h3>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPickerOpen(true)}
                  className="h-7 text-xs rounded-lg gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-secondary-text" />
                  <span>{selectedResident ? "Ganti" : "Pilih Warga (Alt+P)"}</span>
                </Button>
              </div>

              <div className="p-4">
                {!selectedResident ? (
                  <div 
                    onClick={() => setIsPickerOpen(true)}
                    className="p-5 border border-dashed border-border-color rounded-xl bg-card-bg hover:bg-hover-bg hover:border-accent/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                  >
                    <div className="w-9 h-9 rounded-full bg-body-bg shadow-xs border border-border-color flex items-center justify-center text-secondary-text group-hover:text-accent transition-colors mb-2">
                      <User className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-primary-text mb-0.5">
                      Klik untuk memilih data warga
                    </p>
                    <p className="text-[11px] text-secondary-text">
                      Tekan <kbd className="px-1 py-0.2 bg-body-bg border border-border-color rounded text-[10px] font-mono text-secondary-text">Alt+P</kbd> untuk cari penduduk
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Identity Banner */}
                    <div className="flex items-center justify-between p-3 bg-body-bg/50 rounded-xl border border-border-color">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0 tracking-wider shadow-xs">
                          {selectedResident.nama.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary-text truncate">
                              {selectedResident.nama}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              Terdaftar
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-secondary-text mt-0.5">
                            <span className="font-mono text-[11px]">NIK: {selectedResident.nik}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedResident.nik)}
                              className="text-secondary-text hover:text-primary-text cursor-pointer"
                              title="Salin NIK"
                            >
                              {copiedText === selectedResident.nik ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <span>•</span>
                            <span className="font-mono text-[11px]">KK: {selectedResident.no_kk || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata List */}
                    <div className="bg-card-bg rounded-xl border border-border-color divide-y divide-border-color text-xs">
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-secondary-text text-[11px]">Tempat / Tgl Lahir</span>
                        <span className="font-semibold text-primary-text truncate max-w-[200px]">
                          {currentPreviewData.penduduk?.tempat_tanggal_lahir || "-"}
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-secondary-text text-[11px]">Jenis Kelamin</span>
                        <span className="font-semibold text-primary-text">
                          {currentPreviewData.penduduk?.jenis_kelamin || "-"}
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-secondary-text text-[11px]">Agama / Pekerjaan</span>
                        <span className="font-semibold text-primary-text truncate max-w-[220px]">
                          {currentPreviewData.penduduk?.agama || "-"} • {currentPreviewData.penduduk?.pekerjaan || "-"}
                        </span>
                      </div>
                      <div className="p-2.5 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-secondary-text mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-secondary-text block text-[10px]">Alamat Domisili</span>
                          <span className="font-semibold text-primary-text block text-[11px]">
                            {currentPreviewData.penduduk?.alamat || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Detail Format Naskah & Registrasi */}
            <div className="bg-card-bg rounded-xl border border-border-color shadow-xs overflow-hidden transition-all">
              <div className="px-4 py-3 bg-card-bg border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5.5 h-5.5 rounded-md bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider">
                    Format Naskah & Penomoran
                  </h3>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormatPickerOpen(true)}
                  className="h-7 text-xs rounded-lg gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-secondary-text" />
                  <span>{selectedFormat ? "Ganti Format" : "Pilih (Alt+F)"}</span>
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {/* Format Trigger Input */}
                <div 
                  onClick={() => setIsFormatPickerOpen(true)}
                  className="group cursor-pointer"
                >
                  <label className="block text-xs font-semibold text-primary-text mb-1">
                    Jenis Naskah Dinas <span className="text-error-text">*</span>
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border-color bg-body-bg/50 group-hover:border-accent group-hover:bg-hover-bg transition-colors">
                    <span className={cn("text-xs font-medium truncate", selectedFormat ? "text-primary-text font-semibold" : "text-secondary-text")}>
                      {selectedFormat ? selectedFormat.nama : "Pilih jenis format surat dari katalog (Alt+F)..."}
                    </span>
                    <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-accent transition-colors shrink-0" />
                  </div>
                </div>

                {selectedFormat && (
                  <div className="flex items-center gap-2 text-[11px] text-secondary-text px-1">
                    <span className="px-1.5 py-0.2 rounded font-mono bg-body-bg text-primary-text border border-border-color text-[10px]">
                      Kode: {selectedFormat.kode_surat || "470"}
                    </span>
                    <span>•</span>
                    <span className="truncate">Template: <span className="font-mono text-primary-text">{selectedFormat.url_surat || "standar"}</span></span>
                  </div>
                )}

                {/* Nomor Registrasi */}
                <div>
                  <label className="block text-xs font-semibold text-primary-text mb-1">
                    Nomor Registrasi Surat
                  </label>
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Nomor surat digenerate otomatis mengikuti penomoran desa"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-color bg-body-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Form Isian Khusus Format (Conditional) */}
            {dynamicFields.length > 0 && (
              <div className="bg-card-bg rounded-xl border border-border-color shadow-xs overflow-hidden transition-all animate-in fade-in duration-200">
                <div className="px-4 py-3 bg-card-bg border-b border-border-color flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5.5 h-5.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider">
                      Isian Khusus Format
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-secondary-text bg-body-bg border border-border-color px-1.5 py-0.5 rounded">
                    {dynamicFields.length} Kolom
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dynamicFields.map((field) => (
                    <div 
                      key={field.id} 
                      className={cn(
                        "space-y-1",
                        field.type === 'land_sketch' || field.type === 'land_boundaries' || field.type === 'textarea'
                          ? "col-span-1 md:col-span-2" 
                          : ""
                      )}
                    >
                      {field.type === 'textarea' ? (
                        <div>
                          <label className="block text-xs font-semibold text-primary-text mb-1">
                            {field.label} {field.required && <span className="text-error-text">*</span>}
                          </label>
                          <textarea
                            value={dynamicValues[field.key] || ""}
                            onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                            rows={3}
                            placeholder={field.placeholder || `Masukkan ${field.label}...`}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-border-color bg-body-bg text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                            required={field.required}
                          />
                        </div>
                      ) : field.type === 'land_sketch' ? (
                        <div className="w-full space-y-2 p-3 bg-body-bg/50 rounded-xl border border-border-color">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-primary-text uppercase tracking-wide">
                              {field.label} {field.required && <span className="text-error-text">*</span>}
                            </label>
                            <span className="text-[10px] text-accent font-medium">Interactive Canvas</span>
                          </div>
                          <LandSketchInput
                            value={dynamicValues[field.key]}
                            onChange={(val) => setDynamicValues({...dynamicValues, [field.key]: val})}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-primary-text mb-1">
                            {field.label} {field.required && <span className="text-error-text">*</span>}
                          </label>
                          <input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={dynamicValues[field.key] || ""}
                            onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                            placeholder={field.placeholder || `Masukkan ${field.label}...`}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-border-color bg-body-bg text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            required={field.required}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 4: Penandatangan Naskah */}
            <div className="bg-card-bg rounded-xl border border-border-color shadow-xs overflow-hidden transition-all">
              <div className="px-4 py-3 bg-card-bg border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5.5 h-5.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {dynamicFields.length > 0 ? "4" : "3"}
                  </div>
                  <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider">
                    Pejabat Penandatangan
                  </h3>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-primary-text mb-1">
                    Pilih Pejabat Penandatangan <span className="text-error-text">*</span>
                  </label>
                  <select
                    value={selectedPamong}
                    onChange={(e) => setSelectedPamong(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-color bg-body-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer"
                  >
                    {pamongList.map(p => (
                      <option key={p.pamong_id} value={String(p.pamong_id)}>
                        {p.pamong_nama} ({p.jabatan || p.pamong_pangkat || "Perangkat Desa"})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPamongObj && (
                  <div className="p-2.5 bg-body-bg/50 rounded-lg border border-border-color flex items-center gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-primary-text truncate">
                        {selectedPamongObj.pamong_nama}
                      </div>
                      <div className="text-[11px] text-secondary-text">
                        {selectedPamongObj.jabatan || "Kepala Desa"} • NIP: {selectedPamongObj.pamong_nip || "-"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Card 5: Catatan Internal */}
            <div className="bg-card-bg rounded-xl border border-border-color shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="w-full px-4 py-3 bg-card-bg flex items-center justify-between text-left hover:bg-hover-bg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-secondary-text" />
                  <span className="text-xs font-semibold text-primary-text">
                    Catatan Internal Arsip (Opsional)
                  </span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-secondary-text transition-transform", showNotes ? "rotate-180" : "")} />
              </button>

              {showNotes && (
                <div className="p-4 pt-0 border-t border-border-color animate-in fade-in duration-150 bg-card-bg">
                  <textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Diajukan untuk syarat registrasi beasiswa anak, lampiran KTP sudah diverifikasi..."
                    className="w-full mt-2.5 px-3 py-2 text-xs rounded-lg border border-border-color bg-body-bg text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                  />
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-2 pb-6 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-lg text-xs"
              >
                Reset Form
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={loading || !isFormComplete}
                onClick={handleSubmit}
                className="gap-1.5 rounded-lg text-xs font-semibold shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Memproses..." : "Ajukan ke Verifikasi"}</span>
              </Button>
            </div>

          </div>
        </div>

      </div>


      {/* ========================================================================= */}
      {/* FULLSCREEN PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isFullscreenPreview && selectedFormat && (
        <div 
          className="fixed inset-0 z-[3000] flex flex-col bg-neutral-950/95 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header Bar */}
          <div className="h-16 border-b border-neutral-800 bg-neutral-900 px-4 md:px-6 flex items-center justify-between shadow-lg shrink-0 print:hidden text-white">
            
            {/* Left: Prominent Back Button */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsFullscreenPreview(false)}
                className="gap-2 bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-700 rounded-xl text-xs font-semibold px-3.5 py-2 shadow-xs"
                title="Tutup Pratinjau (Esc)"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Editor</span>
              </Button>

              <div className="h-6 w-px bg-neutral-800 hidden md:block"></div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="truncate max-w-[200px] md:max-w-[320px]">{selectedFormat.nama}</span>
                  <Badge variant="outline" className="text-[10px] font-mono text-neutral-300 border-neutral-700 shrink-0">
                    A4 Naskah Dinas
                  </Badge>
                </h3>
                <p className="text-xs text-neutral-400 truncate max-w-[260px] md:max-w-md">
                  Pemohon: <span className="text-white font-medium">{selectedResident?.nama || "Warga"}</span> ({selectedResident?.nik || "-"})
                </p>
              </div>
            </div>

            {/* Right: Zoom Controls & Print Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setFullscreenZoom(Math.max(60, fullscreenZoom - 10))}
                  className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-neutral-300 min-w-[45px] text-center">
                  {fullscreenZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setFullscreenZoom(Math.min(140, fullscreenZoom + 10))}
                  className="p-1.5 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="gap-2 rounded-xl text-xs font-semibold px-4 shadow-md bg-blue-600 hover:bg-blue-500"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreenPreview(false)}
                className="p-2 h-9 w-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Modal Body: Centered A4 Canvas Paper */}
          <div 
            className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar bg-neutral-950" 
            id="surat-preview-wrapper"
          >
            <div 
              style={{ 
                transform: `scale(${fullscreenZoom / 100})`, 
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out"
              }}
              className="shrink-0 my-2 bg-transparent border-0 shadow-none"
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

      {/* Modals */}
      <ResidentPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleSelectResident}
      />

      <FormatPickerModal
        open={isFormatPickerOpen}
        onOpenChange={setIsFormatPickerOpen}
        onSelect={handleSelectFormat}
      />
    </div>
  );
}
