"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  FileText, 
  Search,
  PenTool,
  Eye,
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
  Sparkles,
  Maximize2,
  Minimize2,
  FileCheck2,
  ChevronRight,
  ChevronDown,
  Info
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
import { InputField, TextAreaField, SelectField } from "@/components/ui/FormFields";
import { Editor } from "@/components/editor/Editor";

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
  const [previewZoom, setPreviewZoom] = useState(75);
  const [fullscreenZoom, setFullscreenZoom] = useState(100);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  
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
         alert("GAGAL: Kolom 'form_data' tidak ditemukan di database.\n\nMohon jalankan script SQL 'supabase_schema_update_form_data.sql' di Supabase SQL Editor.");
      } else {
         alert("Gagal memproses surat. Silakan coba lagi atau hubungi administrator.");
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/surat/keluar")}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
              title="Kembali ke Surat Keluar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Cetak Naskah Dinas
                </h1>
                {isFormComplete ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Siap Cetak
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Draft Konsep
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
                Generator dokumen administrasi desa terstandarisasi dengan live preview.
              </p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium mr-1">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all",
                  activeTab === "form" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400"
                )}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all",
                  activeTab === "preview" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-zinc-400"
                )}
              >
                Pratinjau
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8.5 rounded-lg text-xs gap-1.5 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300"
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
                className="h-8.5 rounded-lg text-xs gap-1.5 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200"
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden md:inline">Layar Penuh (Alt+V)</span>
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={loading || !isFormComplete}
              onClick={handleSubmit}
              className="h-8.5 rounded-lg text-xs gap-1.5 font-semibold shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Memproses..." : "Ajukan Verifikasi"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content: 2-Column Split Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Configuration & Input Panel (7 Cols) */}
          {/* ========================================================================= */}
          <div className={cn("space-y-4", activeTab === "preview" ? "hidden lg:block lg:col-span-6 xl:col-span-7" : "lg:col-span-6 xl:col-span-7")}>
            
            {/* Card 1: Penerima Surat (Pemohon) */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Pemohon Surat
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Warga desa yang mengajukan naskah dinas
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPickerOpen(true)}
                  className="h-7.5 text-xs rounded-lg gap-1.5 border-slate-200 dark:border-zinc-800 hover:border-blue-500"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedResident ? "Ganti" : "Pilih (Alt+P)"}</span>
                </Button>
              </div>

              <div className="p-5">
                {!selectedResident ? (
                  <div 
                    onClick={() => setIsPickerOpen(true)}
                    className="p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors mb-2.5">
                      <User className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-0.5">
                      Klik untuk memilih data warga
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      Tekan <kbd className="px-1 py-0.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-[10px] font-mono">Alt+P</kbd> untuk pencarian instan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Compact Identity Chip */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 tracking-wider shadow-xs">
                          {selectedResident.nama.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                              {selectedResident.nama}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                              Terdata
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span className="font-mono text-[11px]">NIK: {selectedResident.nik}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedResident.nik)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
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

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-lg border border-slate-200/50 dark:border-zinc-800">
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Tempat / Tgl Lahir</span>
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block mt-0.5">
                          {currentPreviewData.penduduk?.tempat_tanggal_lahir || "-"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-lg border border-slate-200/50 dark:border-zinc-800">
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Jenis Kelamin</span>
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block mt-0.5">
                          {currentPreviewData.penduduk?.jenis_kelamin || "-"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-lg border border-slate-200/50 dark:border-zinc-800">
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Agama</span>
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block mt-0.5">
                          {currentPreviewData.penduduk?.agama || "-"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-lg border border-slate-200/50 dark:border-zinc-800">
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Pekerjaan</span>
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block mt-0.5">
                          {currentPreviewData.penduduk?.pekerjaan || "-"}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-4 p-2.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-lg border border-slate-200/50 dark:border-zinc-800 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Alamat Terdaftar</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 block truncate mt-0.5">
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
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Format Naskah & Registrasi
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Klasifikasi surat dan konfigurasi nomor resmi
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormatPickerOpen(true)}
                  className="h-7.5 text-xs rounded-lg gap-1.5 border-slate-200 dark:border-zinc-800 hover:border-indigo-500"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedFormat ? "Ganti Format" : "Pilih (Alt+F)"}</span>
                </Button>
              </div>

              <div className="p-5 space-y-4">
                {/* Format Trigger Input */}
                <div 
                  onClick={() => setIsFormatPickerOpen(true)}
                  className="group cursor-pointer"
                >
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Jenis Naskah Dinas <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 group-hover:border-indigo-500 transition-colors">
                    <span className={cn("text-xs font-medium truncate", selectedFormat ? "text-slate-900 dark:text-zinc-100 font-semibold" : "text-slate-400 dark:text-zinc-500")}>
                      {selectedFormat ? selectedFormat.nama : "Pilih jenis format surat dari katalog (Alt+F)..."}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </div>
                </div>

                {selectedFormat && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
                      Kode: {selectedFormat.kode_surat || "470"}
                    </span>
                    <span>•</span>
                    <span className="truncate">Template: <span className="font-mono text-slate-700 dark:text-zinc-300">{selectedFormat.url_surat || "standar"}</span></span>
                  </div>
                )}

                {/* Nomor Registrasi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nomor Registrasi Surat
                  </label>
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Nomor surat digenerate otomatis mengikuti buku registrasi desa"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Digenerate otomatis dari penomoran desa, dapat disesuaikan manual jika diperlukan.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Form Isian Khusus Format (Conditional) */}
            {dynamicFields.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all animate-in fade-in duration-200">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        Isian Khusus Format Naskah
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Parameter variabel yang dicetak langsung ke dalam naskah
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {dynamicFields.length} Kolom
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicFields.map((field) => (
                    <div 
                      key={field.id} 
                      className={cn(
                        "space-y-1.5",
                        field.type === 'land_sketch' || field.type === 'land_boundaries' || field.type === 'textarea'
                          ? "col-span-1 md:col-span-2" 
                          : ""
                      )}
                    >
                      {field.type === 'textarea' ? (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <textarea
                            value={dynamicValues[field.key] || ""}
                            onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                            rows={3}
                            placeholder={field.placeholder || `Masukkan ${field.label}...`}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            required={field.required}
                          />
                        </div>
                      ) : field.type === 'land_sketch' ? (
                        <div className="w-full space-y-2 p-3.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-700">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Interactive Canvas</span>
                          </div>
                          <LandSketchInput
                            value={dynamicValues[field.key]}
                            onChange={(val) => setDynamicValues({...dynamicValues, [field.key]: val})}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={dynamicValues[field.key] || ""}
                            onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                            placeholder={field.placeholder || `Masukkan ${field.label}...`}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {dynamicFields.length > 0 ? "4" : "3"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Pejabat Penandatangan
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Aparatur berwenang yang mengesahkan naskah dinas
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Pilih Pejabat Penandatangan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPamong}
                    onChange={(e) => setSelectedPamong(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {pamongList.map(p => (
                      <option key={p.pamong_id} value={String(p.pamong_id)}>
                        {p.pamong_nama} ({p.jabatan || p.pamong_pangkat || "Perangkat Desa"})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPamongObj && (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200/60 dark:border-zinc-700 flex items-center gap-3 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">
                        {selectedPamongObj.pamong_nama}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {selectedPamongObj.jabatan || "Kepala Desa"} • NIP: {selectedPamongObj.pamong_nip || "-"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Card 5: Catatan Internal */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Catatan Internal Arsip (Opsional)
                  </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showNotes ? "rotate-180" : "")} />
              </button>

              {showNotes && (
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-zinc-800/80 animate-in fade-in duration-150">
                  <textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Diajukan untuk syarat registrasi beasiswa anak, lampiran KTP sudah diverifikasi..."
                    className="w-full mt-3 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Real-Time Live Document Canvas (5 Cols) */}
          {/* ========================================================================= */}
          <div className={cn("lg:col-span-6 xl:col-span-5 sticky top-20", activeTab === "form" ? "hidden lg:block" : "block")}>
            <div className="bg-slate-900 dark:bg-zinc-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-6.5rem)]">
              
              {/* Document HUD Bar */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold tracking-tight text-slate-200">
                    Live Preview A4
                  </span>
                </div>

                {/* Zoom & Action Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1.5 text-slate-400">
                    {previewZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(Math.min(110, previewZoom + 10))}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-3.5 w-px bg-slate-800 mx-1"></div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(true)}
                    disabled={!isFormComplete}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                    title="Buka Layar Penuh"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={!isFormComplete}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors disabled:opacity-30 shadow-xs"
                    title="Cetak Dokumen Langsung"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas Preview Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex items-start justify-center custom-scrollbar bg-slate-950/60">
                {!isFormComplete ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 max-w-xs my-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mb-1">
                      Menunggu Pemohon & Format
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Pilih warga pemohon dan jenis format surat di sebelah kiri untuk melihat live render dokumen dinas di sini.
                    </p>
                  </div>
                ) : (
                  <div 
                    style={{ 
                      transform: `scale(${previewZoom / 100})`, 
                      transformOrigin: "top center",
                      transition: "transform 0.15s ease-out"
                    }}
                    className="shadow-2xl rounded-sm shrink-0 my-2"
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
          </div>

        </div>
      </main>

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
