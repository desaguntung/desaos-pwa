"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Printer, 
  Search,
  PenTool,
  RotateCw,
  Eye,
  X,
  Send
} from "lucide-react";
import { 
  getFormatSurat, 
  getPamong, 
  getIdentitasDesa,
  createLogSurat,
  generateNomorSurat,
  incrementNomorSurat,
  FormatSurat,
  Pamong,
  IdentitasDesa
} from "@/lib/services/surat";
import { Editor } from "@/components/editor/Editor";
import { extractFieldsFromTemplate, FormFieldDefinition, SuratFlowStatus } from "@/lib/services/surat-flow";
import { getResidents, Resident } from "@/lib/services/penduduk";
import ResidentPickerModal from "@/components/ResidentPickerModal";
import FormatPickerModal from "@/components/FormatPickerModal";
import LandSketchInput from "@/components/surat/LandSketchInput";
import { PageHeader } from "@/components/layout/PageHeader";

// --- UI Components ---
const SectionTitle = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-2 pb-2 mb-6 border-b border-zinc-100">
    <Icon className="w-4 h-4 text-zinc-400" />
    <h3 className="text-sm font-medium text-zinc-800">{title}</h3>
  </div>
);

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  required = false, 
  placeholder,
  className = "",
  readOnly = false,
  onClick,
  icon: Icon,
  ...props 
}: any) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        onClick={onClick}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`
          block w-full rounded-md border border-zinc-200 
          bg-white px-3 py-1.5 text-xs text-zinc-900 shadow-sm
          placeholder:text-zinc-400 
          focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none
          transition-all duration-200
          disabled:bg-zinc-50 disabled:text-zinc-500
          ${readOnly ? "bg-zinc-50 cursor-default" : ""}
          ${onClick && !readOnly ? "cursor-pointer hover:border-zinc-300" : ""}
          ${Icon ? "pl-9" : ""}
        `}
        {...props}
      />
    </div>
  </div>
);

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

  useEffect(() => {
    loadData();
  }, []);

  // Parse template and generate number when format changes
  useEffect(() => {
    if (selectedFormat?.template) {
      console.log("Parsing template for fields...", selectedFormat.id);
      const fields = extractFieldsFromTemplate(selectedFormat.template);
      console.log("Extracted fields:", fields);
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
      console.log("Fetching formats...");
      const formats = await getFormatSurat();
      console.log("Formats fetched:", formats?.length);
      setFormatList(formats || []);
    } catch (error) {
      console.error("Error fetching formats:", error);
      setFormatList([]);
      // Jangan alert di sini agar tidak memblokir jika pamong berhasil
    }

    try {
      console.log("Fetching pamongs...");
      const pamongs = await getPamong();
      console.log("Pamongs fetched:", pamongs?.length);
      setPamongList(pamongs || []);
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
    console.log("Loading finished");
  };

  const handleSelectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsPickerOpen(false);
  };

  const handleSelectFormat = (format: FormatSurat) => {
    setSelectedFormat(format);
    setIsFormatPickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi input utama (Penduduk & Format)
    // Pamong sementara di-bypass untuk ujicoba jika kosong
    if (!selectedResident || !selectedFormat) {
      alert("Mohon lengkapi data surat (Penduduk & Jenis Surat).");
      return;
    }

    setLoading(true);
    try {
      // Increment counter if we used auto-generated number
      if (counterKey && nomorSurat) {
        await incrementNomorSurat(counterKey);
      }

      // Gunakan pamong terpilih, atau default ke ID 1 / pamong pertama jika kosong (untuk ujicoba)
      const pamongId = selectedPamong ? parseInt(selectedPamong) : (pamongList.length > 0 ? pamongList[0].pamong_id : 1);

      await createLogSurat({
        id_format_surat: selectedFormat.id!,
        id_pend: selectedResident.id, // UUID string
        id_pamong: pamongId,
        id_user: 1, // Dummy user ID
        tanggal: new Date().toISOString(),
        no_surat: nomorSurat || `SURAT/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`, // Auto generate if empty
        nama_surat: selectedFormat.nama,
        keterangan: keterangan,
        status: SuratFlowStatus.PENDING_SEKDES, // 1 = Menunggu Verifikasi Sekdes
        nama_non_warga: selectedResident.nama,
        form_data: dynamicValues // Save dynamic values
      });

      alert("Surat berhasil diproses dan dikirim ke Verifikasi!");
      router.push("/surat/verifikasi");
    } catch (error: any) {
      console.error("Error creating surat:", error);
      
      // Check for specific error about missing column
      if (error?.code === '42703' && error?.message?.includes('form_data')) {
         alert("GAGAL: Kolom 'form_data' tidak ditemukan di database.\n\nMohon jalankan script SQL 'supabase_schema_update_form_data.sql' di Supabase SQL Editor untuk memperbaiki masalah ini.");
      } else {
         alert("Gagal memproses surat. Silakan coba lagi atau hubungi administrator.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-hidden">
      {/* Header */}
      <PageHeader 
        title="Cetak Surat" 
        subtitle="Surat / Keluar / Cetak"
        showBackButton={true}
        backButtonHref="/surat/keluar"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!selectedResident || !selectedFormat) {
                  alert("Mohon pilih Penduduk dan Jenis Surat terlebih dahulu.");
                  return;
                }
                setIsPreviewOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              type="submit"
              form="cetak-surat-form"
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-text rounded-md hover:bg-primary-text/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? "Memproses..." : "Proses Surat"}
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 w-full bg-body-bg overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full pt-6 px-4 sm:px-6 pb-24">
          <form id="cetak-surat-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-zinc-200/60 divide-y divide-zinc-50">
            
            {/* Section 1: Penerima (Penduduk) */}
            <div className="p-5 sm:p-6">
              <SectionTitle title="Penerima Surat" icon={User} />
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <InputField
                    label="NIK / Nama Penduduk"
                    value={selectedResident ? `${selectedResident.nik} - ${selectedResident.nama}` : ""}
                    placeholder="Pilih penduduk..."
                    readOnly
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-primary-text rounded-md hover:bg-primary-text/90 transition-colors h-[34px] mb-[1px] shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  Cari Penduduk
                </button>
              </div>
            </div>

            {/* Data Otomatis (Dari Database) */}
            {selectedResident && (
              <div className="px-5 sm:px-6 pb-6 pt-2 bg-zinc-50/50 border-y border-zinc-100">
                <div className="flex items-center gap-2 mb-4">
                  <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Data Otomatis (Dari Database)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputField label="Nama Lengkap" value={selectedResident.nama} readOnly className="bg-white/50" />
                   <InputField label="NIK" value={selectedResident.nik} readOnly className="bg-white/50" />
                   <InputField label="Tempat, Tanggal Lahir" value={`${selectedResident.tempat_lahir || '-'}, ${selectedResident.tanggal_lahir || '-'}`} readOnly className="bg-white/50" />
                   <InputField label="Alamat" value={selectedResident.alamat_saat_ini || '-'} readOnly className="bg-white/50" />
                </div>
                <p className="mt-3 text-[10px] text-zinc-400 italic">
                  * Data ini akan otomatis dimasukkan ke dalam surat. Anda tidak perlu mengisinya secara manual.
                </p>
              </div>
            )}

            {/* Section 2: Format & Isi */}
            <div className="p-5 sm:p-6">
              <SectionTitle title="Detail Surat" icon={FileText} />
              <div className="space-y-4">
                {/* Jenis Surat */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                    Jenis Surat
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        readOnly
                        value={selectedFormat ? selectedFormat.nama : ""}
                        placeholder={isLoadingData ? "Memuat data..." : "Pilih jenis surat..."}
                        className={`
                          block w-full rounded-md border border-zinc-200 
                          bg-white px-3 py-1.5 text-xs text-zinc-900 shadow-sm
                          placeholder:text-zinc-400 
                          focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none
                          transition-all duration-200
                          ${isLoadingData ? "cursor-wait opacity-70" : "cursor-pointer hover:border-zinc-300"}
                        `}
                        onClick={() => !isLoadingData && setIsFormatPickerOpen(true)}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isLoadingData}
                      onClick={() => setIsFormatPickerOpen(true)}
                      className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors h-[34px] shadow-sm disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Pilih Surat
                    </button>
                    <button
                      type="button"
                      disabled={isLoadingData}
                      onClick={loadData}
                      className="p-2 text-zinc-500 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors h-[34px] shadow-sm disabled:opacity-50"
                      title="Muat Ulang Data"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Nomor Surat */}
                <InputField
                  label="Nomor Surat (Opsional)"
                  value={nomorSurat}
                  onChange={(e: any) => setNomorSurat(e.target.value)}
                  placeholder="Kosongkan untuk auto-generate"
                />
              </div>
            </div>

            {/* Form Isian Dinamis */}
            {dynamicFields.length > 0 && (
              <div className="p-5 sm:p-6 bg-zinc-50/30">
                <SectionTitle title="Form Isian Surat" icon={PenTool} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {dynamicFields.map((field) => (
                    <div 
                      key={field.id} 
                      className={`space-y-1 ${
                        field.type === 'land_sketch' || field.type === 'land_boundaries' 
                          ? 'col-span-1 md:col-span-2' 
                          : ''
                      }`}
                    >
                      {field.type !== 'land_sketch' && field.type !== 'land_boundaries' && (
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                      )}
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          value={dynamicValues[field.key] || ""}
                          onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                          className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none transition-all duration-200"
                          rows={3}
                          placeholder={field.placeholder || `Masukkan ${field.label}...`}
                          required={field.required}
                        />
                      ) : field.type === 'land_sketch' ? (
                        <div className="w-full space-y-1">
                          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                          <LandSketchInput
                             value={dynamicValues[field.key]}
                             onChange={(val) => setDynamicValues({...dynamicValues, [field.key]: val})}
                          />
                        </div>
                      ) : field.type === 'land_boundaries' ? (
                        <div className="w-full p-4 bg-white border border-zinc-200 rounded-md shadow-sm">
                           <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 pb-2">
                              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Preview Batas Tanah</span>
                           </div>
                           {dynamicValues['land_sketch']?.labels?.length > 0 ? (
                              <div className="space-y-2">
                                {dynamicValues['land_sketch'].points.map((_: any, idx: number) => {
                                  const labels = dynamicValues['land_sketch'].labels;
                                  const points = dynamicValues['land_sketch'].points;
                                  const labelData = labels.find((l: any) => l.edgeIndex === idx);
                                  
                                  // Calculate length again for display
                                  const p1 = points[idx];
                                  const p2 = points[(idx + 1) % points.length];
                                  const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                                  const scale = dynamicValues['land_sketch'].scale || 10;
                                  const lengthM = (dist / scale).toFixed(1);

                                  // Determine cardinal direction if 4 sides
                                  let sideName = `Sisi ${idx + 1}`;
                                  if (points.length === 4) {
                                     const directions = ["Utara", "Timur", "Selatan", "Barat"];
                                     sideName = directions[idx];
                                  }

                                  return (
                                    <div key={idx} className="flex items-end w-full text-xs text-zinc-700">
                                      <div className="w-16 font-semibold shrink-0 mb-1">{sideName}</div>
                                      <div className="mr-2 mb-1">:</div>
                                      <div className="mb-1 truncate max-w-[200px]">berbatas dengan <span className="font-medium text-zinc-900">{labelData?.text || (
                                          labelData?.type === 'road' ? 'Jalan' :
                                          labelData?.type === 'ditch' ? 'Parit' :
                                          labelData?.type === 'river' ? 'Sungai' :
                                          labelData?.type === 'coast' ? 'Pantai' :
                                          labelData?.type === 'sea' ? 'Laut' :
                                          '-'
                                      )}</span></div>
                                      <div className="flex-1 mx-1 border-b border-dotted border-zinc-300 mb-1"></div>
                                      <div className="w-16 text-right font-mono mb-1 shrink-0">{lengthM} m</div>
                                    </div>
                                  );
                                })}
                              </div>
                           ) : (
                              <p className="text-[10px] text-zinc-400 italic">Data batas diambil dari Sketsa Tanah.</p>
                           )}
                        </div>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={dynamicValues[field.key] || ""}
                          onChange={(e) => setDynamicValues({...dynamicValues, [field.key]: e.target.value})}
                          className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none transition-all duration-200"
                          placeholder={field.placeholder || `Masukkan ${field.label}...`}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keterangan */}
            <div className="p-5 sm:p-6">
              <SectionTitle title="Keterangan Tambahan" icon={FileText} />
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none transition-all duration-200"
                placeholder="Tambahkan keterangan tambahan jika diperlukan..."
              />
            </div>



            {/* Penanda Tangan (Hidden/Disabled) */}
            <div className="hidden">
              <label>Penanda Tangan (Pamong)</label>
              <select
                value={selectedPamong}
                onChange={(e) => setSelectedPamong(e.target.value)}
              >
                 <option value="">Pilih Pamong...</option>
                 {pamongList.map((p) => (
                   <option key={p.pamong_id} value={p.pamong_id}>{p.pamong_nama}</option>
                 ))}
              </select>
            </div>

          </form>
        </div>
      </div>

      <ResidentPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectResident}
      />

      <FormatPickerModal
        open={isFormatPickerOpen}
        formats={formatList}
        onClose={() => setIsFormatPickerOpen(false)}
        onSelect={handleSelectFormat}
      />

      {/* Preview Modal */}
       {isPreviewOpen && selectedFormat && (
         <div className="fixed inset-0 z-50 flex flex-col bg-zinc-100">
           <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200 shadow-sm print:hidden">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setIsPreviewOpen(false)}
                  className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm font-medium text-zinc-900">Preview Surat</h2>
                  <p className="text-xs text-zinc-500">{selectedFormat.nama}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => {
                   // Print via window.print() inside the preview context
                   // Since Editor is in readOnly, it handles print via Header if we pass it, 
                   // or we can just trigger window.print() here but we need to hide the modal header.
                   // For now let's rely on the Editor's Header print button if available, 
                   // or add a global print style that hides this modal header.
                   window.print();
                 }}
                 className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
               >
                 <Printer className="w-3.5 h-3.5" />
                 Print
               </button>
               <button 
                 onClick={() => setIsPreviewOpen(false)}
                 className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
               >
                 Tutup
               </button>
             </div>
          </header>
          <div className="flex-1 overflow-hidden relative bg-zinc-100 print:bg-white">
             <Editor
                initialJson={selectedFormat.template}
                readOnly={true}
                previewData={{
                    surat: {
                        nomor: nomorSurat || "SURAT/2024/XXX",
                        no_surat: nomorSurat || "SURAT/2024/XXX",
                        tanggal: new Date().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }),
                        tanggal_surat: new Date().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }),
                        nama_surat: selectedFormat.nama,
                        keterangan: keterangan,
                        kode: selectedFormat.kode_surat
                    },
                    desa: identitasDesa ? {
                        ...identitasDesa,
                        nama: identitasDesa.nama_desa,
                        alamat: identitasDesa.alamat_kantor,
                        kecamatan: identitasDesa.nama_kecamatan,
                        kabupaten: identitasDesa.nama_kabupaten,
                        provinsi: identitasDesa.nama_provinsi,
                        sebutan_desa: "DESA", 
                        sebutan_kabupaten: "KABUPATEN"
                    } : {
                        nama: "Desa Digital",
                        nama_desa: "Desa Digital",
                        alamat: "Jl. Merdeka No. 45",
                        alamat_kantor: "Jl. Merdeka No. 45",
                        kecamatan: "Kecamatan Maju",
                        kabupaten: "Kabupaten Sejahtera",
                        provinsi: "Provinsi Makmur",
                        kode_pos: "55555",
                        sebutan_desa: "DESA",
                        sebutan_kabupaten: "KABUPATEN"
                    },
                    penduduk: selectedResident ? (() => {
                        const toTitleCase = (str: string) => str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        const tempatLahir = selectedResident.tempat_lahir ? toTitleCase(selectedResident.tempat_lahir) : '-';
                        
                        const jalan = (selectedResident.alamat_saat_ini && selectedResident.alamat_saat_ini !== '-') 
                            ? `Jl.${selectedResident.alamat_saat_ini}` 
                            : '';
                            
                        const alamat = [
                            jalan,
                            `${identitasDesa?.sebutan_dusun || 'Dusun'} ${selectedResident.dusun || '-'}`,
                            `${identitasDesa?.sebutan_desa || 'Desa'} ${identitasDesa?.nama_desa || '-'}`,
                            `${identitasDesa?.sebutan_kecamatan || 'Kecamatan'} ${identitasDesa?.nama_kecamatan || '-'}`,
                            `${identitasDesa?.sebutan_kabupaten || 'Kabupaten'} ${identitasDesa?.nama_kabupaten || '-'}`
                        ].filter(part => part && part.trim() !== '').join(' ');

                        const getJenisKelamin = (res: any) => {
                            // Cek sex (integer) atau jenis_kelamin (string/int)
                            const val = res.sex || res.jenis_kelamin;
                            if (val === 1 || val === "1" || val === "LAKI-LAKI" || val === "Laki-Laki") return "Laki-Laki";
                            if (val === 2 || val === "2" || val === "PEREMPUAN" || val === "Perempuan") return "Perempuan";
                            return val || "-";
                        };

                        const jenisKelamin = getJenisKelamin(selectedResident);

                        return {
                            ...selectedResident,
                            nama: selectedResident.nama,
                            nik: selectedResident.nik,
                            tempat_lahir: tempatLahir,
                            tanggal_lahir: selectedResident.tanggal_lahir,
                            ttl: `${tempatLahir}, ${selectedResident.tanggal_lahir ? new Date(selectedResident.tanggal_lahir).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                            }) : "-"}`,
                            sex: jenisKelamin,
                            jenis_kelamin: jenisKelamin,
                            alamat: alamat,
                            alamat_jalan: selectedResident.alamat_saat_ini,
                            rt: selectedResident.rt,
                            rw: selectedResident.rw,
                            desa: selectedResident.nama_desa,
                            kecamatan: selectedResident.nama_kecamatan,
                            kabupaten: selectedResident.nama_kabupaten,
                            provinsi: selectedResident.nama_provinsi,
                            agama: selectedResident.agama,
                            status_kawin: selectedResident.status_kawin,
                            pekerjaan: selectedResident.pekerjaan,
                            warganegara: selectedResident.kewarganegaraan
                        };
                    })() : undefined,
                    pamong: (() => {
                        // Priority: Selected Pamong -> Kepala Desa -> First Pamong
                        const selected = selectedPamong ? pamongList.find(item => item.pamong_id === parseInt(selectedPamong)) : null;
                        
                        // Try to find Kepala Desa if no specific pamong selected
                        const kades = !selected ? pamongList.find(item => 
                            item.pamong_pangkat?.toLowerCase().includes('kepala desa') || 
                            item.pamong_nama?.toLowerCase().includes('kepala desa')
                        ) : null;
                        
                        const p = selected || kades || (pamongList.length > 0 ? pamongList[0] : null);

                        return p ? {
                            nama: p.pamong_nama,
                            nip: p.pamong_nip,
                            jabatan: p.pamong_pangkat || "Pamong Desa",
                            pangkat: p.pamong_pangkat,
                            niap: p.pamong_niap
                        } : undefined;
                    })(),
                    form_data: dynamicValues
                }}
             />
          </div>
        </div>
      )}
    </div>
  );
}
