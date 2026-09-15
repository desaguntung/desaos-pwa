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
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    ...(dynamicFields.length > 0 ? [{ id: "form-isian", label: "Form Isian", icon: PenTool }] : []),
    { id: "penandatangan", label: "Penandatangan", icon: User },
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

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
      alert("Mohon lengkapi data surat (Penduduk & Jenis Surat).");
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

  const formActions = (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (!selectedResident || !selectedFormat) {
            alert("Mohon pilih Penduduk dan Jenis Surat terlebih dahulu.");
            return;
          }
          setIsPreviewOpen(true);
        }}
        className="gap-2"
      >
        <Eye className="w-3.5 h-3.5" />
        Preview
      </Button>
      <Button
        type="submit"
        form="cetak-surat-form"
        disabled={loading}
        size="sm"
        className="gap-2 bg-primary-text text-card-bg hover:bg-primary-text/90"
      >
        <Send className="w-3.5 h-3.5" />
        {loading ? "Memproses..." : "Proses Surat"}
      </Button>
    </div>
  );

  return (
    <>
      <FormLayout 
        title="Cetak Surat" 
        subtitle="Buat dan cetak surat pelayanan desa langsung dari data kependudukan"
        backButtonHref="/surat/keluar"
        actions={formActions}
        sidebar={
          <FormSidebarNav
            sections={sections}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        }
      >
        <form id="cetak-surat-form" onSubmit={handleSubmit} className="space-y-8 pb-24">
            
          {/* Section 1: Penerima (Penduduk) */}
          <div 
            id="penerima"
            ref={(el) => { sectionRefs.current["penerima"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Penerima Surat" 
              description="Pilih penduduk dari database desa untuk membaca data identitas secara lengkap." 
              icon={User} 
            />
            
            <div className="flex items-end gap-3 mb-6">
              <div className="flex-1">
                <InputField
                  label="NIK / Nama Penduduk"
                  value={selectedResident ? `${selectedResident.nik} - ${selectedResident.nama}` : ""}
                  placeholder="Klik tombol Cari untuk memilih penduduk..."
                  readOnly
                  required
                  onClick={() => setIsPickerOpen(true)}
                  className="cursor-pointer"
                />
              </div>
              <Button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="gap-2 h-[38px] mb-[2px]"
                variant="secondary"
              >
                <Search className="w-3.5 h-3.5" />
                Cari Penduduk
              </Button>
            </div>

            {/* Data Otomatis (Dari Database) */}
            {selectedResident && (
              <div className="p-5 bg-body-bg rounded-xl border border-border-color space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-semibold text-primary-text uppercase tracking-wide">
                      Data Terbaca dari Database
                    </h4>
                  </div>
                  <span className="text-[11px] text-secondary-text">
                    ID: {selectedResident.id?.substring(0, 8)}...
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputField label="Nama Lengkap" value={selectedResident.nama || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="NIK" value={selectedResident.nik || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="No. Kartu Keluarga" value={selectedResident.no_kk || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="Tempat, Tanggal Lahir" value={`${selectedResident.tempat_lahir || '-'}, ${selectedResident.tanggal_lahir || '-'}`} readOnly className="bg-card-bg text-xs" />
                    <InputField label="Jenis Kelamin" value={selectedResident.jenis_kelamin || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="Agama" value={selectedResident.agama || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="Pekerjaan" value={selectedResident.pekerjaan || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="Status Perkawinan" value={selectedResident.status_kawin || "-"} readOnly className="bg-card-bg text-xs" />
                    <InputField label="Kewarganegaraan" value={selectedResident.kewarganegaraan || "WNI"} readOnly className="bg-card-bg text-xs" />
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <InputField label="Alamat Lengkap" value={currentPreviewData.penduduk?.alamat || selectedResident.alamat_saat_ini || "-"} readOnly className="bg-card-bg text-xs" />
                    </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Detail Surat */}
          <div 
            id="detail-surat"
            ref={(el) => { sectionRefs.current["detail-surat"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Detail Surat" 
              description="Pilih jenis format surat dan nomor registrasi surat." 
              icon={FileText} 
            />

            <div className="space-y-6">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <InputField
                    label="Jenis Surat"
                    value={selectedFormat ? selectedFormat.nama : ""}
                    placeholder={isLoadingData ? "Memuat data format..." : "Pilih jenis surat..."}
                    readOnly
                    required
                    className={cn(
                      isLoadingData ? "cursor-wait opacity-70" : "cursor-pointer hover:border-primary-text"
                    )}
                    onClick={() => !isLoadingData && setIsFormatPickerOpen(true)}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoadingData}
                  onClick={() => setIsFormatPickerOpen(true)}
                  className="gap-2 h-[38px] mb-[2px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Pilih Format
                </Button>
              </div>

              <InputField
                label="Nomor Surat (Otomatis)"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="Nomor surat digenerate otomatis berdasarkan penomoran desa"
                description="Nomor diisi otomatis mengikuti konfigurasi penomoran desa, atau dapat diedit manual jika diperlukan."
              />
            </div>
          </div>

          {/* Form Isian Dinamis */}
          {dynamicFields.length > 0 && (
            <div 
              id="form-isian"
              ref={(el) => { sectionRefs.current["form-isian"] = el; }}
              className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
            >
              <SectionTitle 
                title="Form Isian Khusus Surat" 
                description="Lengkapi kolom data tambahan yang dibutuhkan oleh format surat ini." 
                icon={PenTool} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dynamicFields.map((field) => (
                  <div 
                    key={field.id} 
                    className={`space-y-1.5 ${
                      field.type === 'land_sketch' || field.type === 'land_boundaries' 
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
                      <div className="w-full space-y-1.5">
                        <label className="block text-[13px] font-medium text-primary-text">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <LandSketchInput
                            value={dynamicValues[field.key]}
                            onChange={(val) => setDynamicValues({...dynamicValues, [field.key]: val})}
                        />
                      </div>
                    ) : field.type === 'land_boundaries' ? (
                      <div className="w-full p-4 bg-card-bg border border-border-color rounded-md shadow-sm">
                          <div className="flex items-center gap-2 mb-3 border-b border-border-color pb-2">
                            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wide">Preview Batas Tanah</span>
                          </div>
                          {dynamicValues['land_sketch']?.labels?.length > 0 ? (
                            <div className="space-y-2">
                              {dynamicValues['land_sketch'].points.map((_: any, idx: number) => {
                                const labels = dynamicValues['land_sketch'].labels;
                                const points = dynamicValues['land_sketch'].points;
                                const labelData = labels.find((l: any) => l.edgeIndex === idx);
                                
                                const p1 = points[idx];
                                const p2 = points[(idx + 1) % points.length];
                                const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                                const scale = dynamicValues['land_sketch'].scale || 10;
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
                                    <div className="mb-1 truncate max-w-[200px]">berbatas dengan <span className="font-medium text-primary-text">{labelData?.text || (
                                        labelData?.type === 'road' ? 'Jalan' :
                                        labelData?.type === 'ditch' ? 'Parit' :
                                        labelData?.type === 'river' ? 'Sungai' :
                                        labelData?.type === 'coast' ? 'Pantai' :
                                        labelData?.type === 'sea' ? 'Laut' :
                                        '-'
                                    )}</span></div>
                                    <div className="flex-1 mx-1 border-b border-dotted border-border-color mb-1"></div>
                                    <div className="w-16 text-right font-mono mb-1 shrink-0">{lengthM} m</div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-secondary-text italic">Data batas diambil otomatis dari Sketsa Tanah.</p>
                          )}
                      </div>
                    ) : (
                      <InputField
                        label={field.label}
                        type={field.type === 'number' ? 'number' : 'text'}
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
          
          {/* Penandatangan */}
          <div 
            id="penandatangan"
            ref={(el) => { sectionRefs.current["penandatangan"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Penandatangan Surat" 
              description="Pilih aparatur pemerintah desa yang menandatangani dokumen ini." 
              icon={User} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="p-3 bg-body-bg rounded-lg border border-border-color flex flex-col justify-center text-xs space-y-1">
                  <div className="font-semibold text-primary-text">{selectedPamongObj.pamong_nama}</div>
                  <div className="text-secondary-text">Jabatan: <span className="font-medium text-primary-text">{selectedPamongObj.jabatan || "Kepala Desa"}</span></div>
                  <div className="text-secondary-text">NIP: <span className="font-medium text-primary-text">{selectedPamongObj.pamong_nip || "-"}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Keterangan */}
          <div 
            id="keterangan"
            ref={(el) => { sectionRefs.current["keterangan"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle 
              title="Keterangan Tambahan" 
              description="Catatan opsional internal untuk arsip surat ini." 
              icon={MessageSquare} 
            />
            <TextAreaField
              label="Isi Keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
              placeholder="Tambahkan keterangan tambahan jika diperlukan..."
            />
          </div>

        </form>
      </FormLayout>

      {/* Resident Picker */}
      <ResidentPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleSelectResident}
      />

      {/* Format Picker */}
      <FormatPickerModal
        open={isFormatPickerOpen}
        onOpenChange={setIsFormatPickerOpen}
        onSelect={handleSelectFormat}
      />

      {/* Fullscreen Live Preview & Print Modal */}
      {isPreviewOpen && selectedFormat && (
        <div className="fixed inset-0 z-[3000] flex flex-col bg-body-bg/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="h-16 border-b border-border-color bg-card-bg px-6 flex items-center justify-between shadow-sm shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-text">
                  Preview Surat: {selectedFormat.nama}
                </h3>
                <p className="text-xs text-secondary-text">
                  Pemohon: {selectedResident?.nama || "Warga"} ({selectedResident?.nik || "-"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2 bg-card-bg"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 h-9 w-9 text-secondary-text hover:text-primary-text"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Modal Body: Editor in ReadOnly Preview Mode */}
          <div className="flex-1 overflow-hidden relative" id="surat-preview-wrapper">
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
      )}
    </>
  );
}
