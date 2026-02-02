
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { 
  getSuratTasks, 
  processSuratFlow, 
  SuratFlowStatus, 
  SuratTask,
  getFlowHistory,
  SuratFlowLog,
  getSuratDetail,
  updateSuratSignature,
  updateSuratDocument
} from "@/lib/services/surat-flow";
import { getIdentitasDesa, IdentitasDesa, getPamong, Pamong } from "@/lib/services/surat";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Editor } from "@/components/editor/Editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Send, 
  History,
  Eye,
  PenTool,
  User,
  Download,
  Upload,
  Printer
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet";
// @ts-ignore
import html2pdf from "html2pdf.js";

// Helper for status badges
const getStatusBadge = (status: number) => {
  switch (status) {
    case SuratFlowStatus.DRAFT:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">Draft</span>;
    case SuratFlowStatus.PENDING_SEKDES:
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Verifikasi Sekdes</span>;
    case SuratFlowStatus.PENDING_KADES:
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Tanda Tangan Kades</span>;
    case SuratFlowStatus.SIGNED:
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Selesai (Ditandatangani)</span>;
    case SuratFlowStatus.REJECTED_SEKDES:
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Ditolak Sekdes</span>;
    case SuratFlowStatus.REJECTED_KADES:
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Ditolak Kades</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100">Unknown</span>;
  }
};

export default function VerifikasiSuratPage() {
  const [role, setRole] = useState<'operator' | 'sekdes' | 'kades'>('operator'); // Simulating role
  const [tasks, setTasks] = useState<SuratTask[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedSurat, setSelectedSurat] = useState<SuratTask | null>(null);
  const [detailSurat, setDetailSurat] = useState<any | null>(null);
  const [identitasDesa, setIdentitasDesa] = useState<IdentitasDesa | null>(null);
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  const [history, setHistory] = useState<SuratFlowLog[]>([]);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Signature States
  const [signStep, setSignStep] = useState<'initial' | 'selecting' | 'signed'>('initial');
  const [signMode, setSignMode] = useState<'electronic' | 'manual' | null>(null);

  useEffect(() => {
    fetchTasks();
    getIdentitasDesa().then(setIdentitasDesa);
    getPamong().then(setPamongList);
  }, [role]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getSuratTasks(role);
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReview = async (surat: SuratTask) => {
    setSelectedSurat(surat);
    setDetailSurat(null);
    setComment("");
    setSignStep('initial');
    setSignMode(null);
    setIsSheetOpen(true);
    setLoadingDetail(true);
    // Fetch history and detail
    try {
      const [logs, detail] = await Promise.all([
        getFlowHistory(surat.id),
        getSuratDetail(surat.id)
      ]);
      setHistory(logs || []);
      setDetailSurat(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'reject' | 'sign') => {
    if (!selectedSurat) return;
    
    // Intercept sign action
    if (action === 'sign' && role === 'kades') {
        setSignStep('selecting');
        return;
    }

    setProcessing(true);
    try {
      await processSuratFlow(selectedSurat.id, action, role, comment);
      setIsSheetOpen(false);
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error("Action failed", error);
      alert("Action failed: " + error);
    } finally {
      setProcessing(false);
    }
  };

  const executeSign = async (mode: 'electronic' | 'manual') => {
    if (!selectedSurat) return;
    setProcessing(true);
    try {
        const uniqueId = crypto.randomUUID();
        const signatureData = {
            id: uniqueId,
            date: new Date().toISOString(),
            signed_by: identitasDesa?.nama_kepala_desa || "Kepala Desa",
            verification_url: `${window.location.origin}/verifikasi/doc/${uniqueId}`,
            type: mode
        };
        
        await updateSuratSignature(selectedSurat.id, signatureData);
        await processSuratFlow(selectedSurat.id, 'sign', role, "Ditandatangani secara " + mode);
        
        // Update local detail for preview
        setDetailSurat((prev: any) => ({
            ...prev,
            form_data: {
                ...prev.form_data,
                signature: signatureData
            },
            status: SuratFlowStatus.SIGNED
        }));
        
        setSignMode(mode);
        setSignStep('signed');
        fetchTasks(); // Background refresh
    } catch (e: any) {
        console.error(e);
        alert("Gagal menandatangani: " + e.message);
    } finally {
        setProcessing(false);
    }
  };
  
  const handleDownloadPdf = async () => {
      if (!selectedSurat || !detailSurat) return;
      
      const element = document.querySelector('#surat-preview-wrapper .bg-white.shadow-2xl');
      if (!element) {
          alert("Gagal menemukan dokumen untuk didownload. Pastikan preview dokumen sudah muncul.");
          return;
      }

      setProcessing(true);
      try {
          // Determine page size from template data
          let size = 'A4';
          let orientation = 'portrait';
          
          try {
             if (typeof detailSurat.surat_formats?.template === 'string') {
                 const template = JSON.parse(detailSurat.surat_formats.template);
                 const nodes = template.nodes || {};
                 const pageNode = nodes['page_1'] || Object.values(nodes).find((n: any) => n.type?.resolvedName === 'Page');
                 if (pageNode && pageNode.props) {
                     size = pageNode.props.size || 'A4';
                     orientation = pageNode.props.orientation || 'portrait';
                 }
             } else if (typeof detailSurat.surat_formats?.template === 'object') {
                 const template = detailSurat.surat_formats.template;
                 const nodes = template.nodes || {};
                 const pageNode = nodes['page_1'] || Object.values(nodes).find((n: any) => n.type?.resolvedName === 'Page');
                 if (pageNode && pageNode.props) {
                     size = pageNode.props.size || 'A4';
                     orientation = pageNode.props.orientation || 'portrait';
                 }
             }
          } catch (e) {
              console.warn("Could not parse template for page size, defaulting to A4", e);
          }

          // Clone the element to manipulate it without affecting the view
          const clone = element.cloneNode(true) as HTMLElement;
          
          // Reset styles that might cause issues (shadows, margins, transforms)
          // We want the clean "paper" look, not the UI card look
          clone.classList.remove('shadow-2xl', 'shadow-xl', 'shadow-lg', 'shadow-md', 'shadow-sm', 'shadow');
          
          // Apply global print fix (break-after: avoid, etc)
          clone.classList.add('fit-content-page'); 
          
          clone.style.boxShadow = 'none';
          clone.style.margin = '0'; // Remove external margins
          // clone.style.padding = '0'; // REMOVED: Do NOT reset padding, it is part of the document layout!
          
          clone.style.transform = 'none'; // Reset any scaling from preview
          clone.style.transformOrigin = 'top left';

          // MANUAL FIX: Ensure last element has no margin bottom
           // This addresses the "invisible" cause #1
           const lastChild = clone.lastElementChild as HTMLElement;
           if (lastChild) {
               lastChild.style.marginBottom = '0';
               // lastChild.style.paddingBottom = '0'; // REMOVED: Do not reset padding!
           }
          
          // Ensure the clone has the correct dimensions based on the target paper size
          // This ensures WYSIWYG relative to the paper format
          const dimensions = {
              A4: { width: 210, height: 297 },
              F4: { width: 215, height: 330 },
              Legal: { width: 216, height: 356 },
              Letter: { width: 216, height: 279 }
          };
          
          // @ts-ignore
          const dim = dimensions[size] || dimensions.A4;
          
          // STRICT DIMENSION ENFORCEMENT
          // Instead of relying on computed pixels (which depend on screen DPI/Zoom),
          // we force the physical dimensions (mm) that jsPDF expects.
          // This ensures 1:1 mapping between DOM element and PDF Page.
          clone.style.width = `${dim.width}mm`;
          clone.style.maxWidth = `${dim.width}mm`;
          clone.style.minWidth = `${dim.width}mm`;
          
          // Height strictness with SAFETY MARGIN
          // We subtract 0.5mm from the element height to ensure it is strictly SMALLER than the PDF page.
          // This prevents sub-pixel rendering issues where the browser renders 297mm as 297.0001mm, triggering a new page.
          // The visual difference (0.5mm) is negligible/invisible to the naked eye.
          const safeHeight = dim.height - 0.5;
          clone.style.height = `${safeHeight}mm`; 
          clone.style.minHeight = `${safeHeight}mm`;
          clone.style.maxHeight = `${safeHeight}mm`;
          clone.style.overflow = 'hidden'; // Clip overflow
          
          // CLEANUP FOOTER (User Suspicion)
          // Find the FooterArea (usually absolute positioned at bottom) and ensure it behaves
          const footerElement = clone.querySelector('[data-id="page_footer"]') || clone.querySelector('.absolute.bottom-0');
          if (footerElement) {
              (footerElement as HTMLElement).style.marginBottom = '0';
              (footerElement as HTMLElement).style.bottom = '0';
              // Remove min-height to prevent it from being taller than necessary
              (footerElement as HTMLElement).style.minHeight = '0';
          }

          // Create a container to hold the clone off-screen
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '0';
          
          // Container must also be constrained to the safe height
          container.style.width = `${dim.width}mm`;
          container.style.height = `${safeHeight}mm`;
          
          // Apply computed styles that affect layout internals (fonts, line-heights)
          // BUT NOT dimensions that conflict with the paper size.
          const computedStyle = window.getComputedStyle(element);
          
          // Force box-sizing to border-box so padding doesn't add to width
          clone.style.boxSizing = 'border-box';
          
          // Copy Padding - But be careful if padding + width > paper width
          // If box-sizing is border-box, padding is included in width.
          clone.style.paddingTop = computedStyle.paddingTop;
          clone.style.paddingBottom = computedStyle.paddingBottom;
          clone.style.paddingLeft = computedStyle.paddingLeft;
          clone.style.paddingRight = computedStyle.paddingRight;

          container.appendChild(clone);
          document.body.appendChild(container);
          
          // Wait for images/fonts to stabilize
          await new Promise(resolve => setTimeout(resolve, 100));

          const opt = {
              margin: 0,
              filename: `${selectedSurat.surat_formats?.nama || 'Surat'}_${selectedSurat.penduduk?.nama || 'Warga'}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                  scale: 2, 
                  useCORS: true, 
                  logging: false,
                  scrollY: 0,
                  windowWidth: dim.width * 3.7795275591, // Convert mm to px (approx) for canvas context
                  windowHeight: safeHeight * 3.7795275591
              },
              jsPDF: { 
                  unit: 'mm', 
                  format: [dim.width, dim.height], // Keep the PDF paper size standard (A4/F4)
                  orientation: orientation 
              }
          };

          await html2pdf().set(opt).from(clone).save();
          
          // Clean up
          document.body.removeChild(container);
          
      } catch (error: any) {
          console.error("Download failed:", error);
          alert("Gagal mendownload dokumen: " + error.message);
      } finally {
          setProcessing(false);
      }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!selectedSurat) return;

      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
          alert("Hanya file PDF yang diperbolehkan");
          return;
      }

      setProcessing(true);
      try {
          const supabase = createSupabaseBrowserClient();
          const fileExt = file.name.split('.').pop();
          const fileName = `signed_${selectedSurat.id}_${Date.now()}.${fileExt}`;
          const filePath = `signed_surat/${fileName}`;
          
          let bucketName = 'surat-documents';
          
          const { error: uploadError } = await supabase.storage
              .from(bucketName)
              .upload(filePath, file);

          if (uploadError) {
               throw new Error("Gagal upload ke storage (surat-documents): " + uploadError.message);
          }

          const { data: { publicUrl } } = supabase.storage
              .from(bucketName)
              .getPublicUrl(filePath);

          const documentData = {
              url: publicUrl,
              name: file.name,
              path: filePath,
              bucket: bucketName,
              uploaded_at: new Date().toISOString()
          };

          await updateSuratDocument(selectedSurat.id, documentData);
          
          setDetailSurat((prev: any) => ({
              ...prev,
              form_data: {
                  ...prev.form_data,
                  uploaded_document: documentData
              }
          }));
          
          alert("Dokumen berhasil diupload!");
          setIsSheetOpen(false);
          
      } catch (error: any) {
          console.error("Upload failed:", error);
          alert("Gagal upload dokumen: " + error.message);
      } finally {
          setProcessing(false);
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-hidden">
      <PageHeader 
        title="Verifikasi Surat" 
        subtitle="Alur Persetujuan dan Tanda Tangan" 
        actions={
            // Role Switcher for Demo
            <div className="flex gap-2 items-center bg-white p-1 rounded-lg border border-zinc-200">
                <span className="text-xs font-medium px-2 text-zinc-500">Mode:</span>
                <button 
                    onClick={() => setRole('operator')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${role === 'operator' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-zinc-50'}`}
                >Operator</button>
                <button 
                    onClick={() => setRole('sekdes')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${role === 'sekdes' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-zinc-50'}`}
                >Sekdes</button>
                <button 
                    onClick={() => setRole('kades')} 
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${role === 'kades' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-zinc-50'}`}
                >Kades</button>
            </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
            <div className="flex items-center justify-center h-40">
                <span className="text-zinc-400 text-sm">Loading tasks...</span>
            </div>
        ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                <CheckCircle2 className="w-8 h-8 text-zinc-300 mb-2" />
                <span className="text-zinc-500 font-medium">Tidak ada surat yang perlu diproses</span>
                <span className="text-zinc-400 text-xs">Anda sudah menyelesaikan semua tugas.</span>
            </div>
        ) : (
            <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 w-16 text-center">No</th>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Nomor Surat</th>
                                <th className="px-4 py-3">Jenis Surat</th>
                                <th className="px-4 py-3">Penduduk</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {tasks.map((task, index) => (
                                <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-4 py-3 text-center text-zinc-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-zinc-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                            {new Date(task.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                                        {task.no_surat || "-"}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-zinc-800">
                                        {task.surat_formats?.nama || task.nama_surat || "Surat Tanpa Judul"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-800 font-medium">{task.penduduk?.nama || "Tanpa Nama"}</span>
                                            <span className="text-zinc-400 text-xs">{task.penduduk?.nik || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {getStatusBadge(task.status)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 px-3 text-xs gap-1.5"
                                            onClick={() => openReview(task)}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Detail & Proses
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* Review Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-screen h-screen max-w-none sm:max-w-none p-0 flex flex-col rounded-none border-none focus:outline-none font-sans">
          <SheetHeader className="hidden">
            <SheetTitle>Verifikasi Surat</SheetTitle>
          </SheetHeader>
          {selectedSurat && (
          <div className="flex-1 w-full h-full flex flex-col lg:flex-row overflow-hidden relative">
            
            {/* Left Panel: Preview */}
            <div className="flex-1 border-r border-zinc-200 flex flex-col overflow-hidden bg-[#F3F4F6] relative">
               {loadingDetail ? (
                 <div className="flex flex-col items-center justify-center h-full gap-3">
                   <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
                   <p className="text-sm text-zinc-500 font-medium">Memuat dokumen...</p>
                 </div>
               ) : detailSurat && detailSurat.surat_formats?.template ? (
                 <div className="flex-1 w-full h-full relative" id="surat-preview-wrapper">
                    <Editor 
                      initialJson={detailSurat.surat_formats.template}
                      readOnly={true}
                      hideHeaderNavigation={true}
                      previewData={{
                        surat: {
                          nomor: detailSurat.no_surat || "SURAT/2024/XXX",
                          no_surat: detailSurat.no_surat || "SURAT/2024/XXX",
                          tanggal: new Date(detailSurat.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                          nama_surat: detailSurat.surat_formats.nama,
                          keterangan: detailSurat.keterangan,
                          kode: detailSurat.surat_formats.kode_surat
                        },
                        form_data: detailSurat.form_data,
                        desa: identitasDesa ? {
                          ...identitasDesa,
                          nama: identitasDesa.nama_desa,
                          alamat: identitasDesa.alamat_kantor,
                          kecamatan: identitasDesa.nama_kecamatan,
                          kabupaten: identitasDesa.nama_kabupaten,
                          provinsi: identitasDesa.nama_provinsi,
                          sebutan_desa: identitasDesa.sebutan_desa || "DESA",
                          sebutan_kabupaten: identitasDesa.sebutan_kabupaten || "KABUPATEN"
                        } : undefined,
                        penduduk: detailSurat.penduduk ? (() => {
                            const p = detailSurat.penduduk;
                            const toTitleCase = (str: string) => str ? str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
                            const tempatLahir = p.tempat_lahir ? toTitleCase(p.tempat_lahir) : (p.tempatlahir ? toTitleCase(p.tempatlahir) : '-');
                            
                            // Date formatting
                            const tglStr = p.tanggal_lahir || p.tanggallahir;
                            const tglFormatted = tglStr ? new Date(tglStr).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                            }) : "-";

                            // Gender Normalization
                            const getJenisKelamin = (res: any) => {
                                const val = res.sex || res.jenis_kelamin || res.jk;
                                if (val === 1 || val === "1" || val === "LAKI-LAKI" || val === "Laki-Laki" || val === "Laki-laki") return "Laki-Laki";
                                if (val === 2 || val === "2" || val === "PEREMPUAN" || val === "Perempuan") return "Perempuan";
                                return val || "-";
                            };
                            const jenisKelamin = getJenisKelamin(p);

                            // Address Construction
                            // Fallback to alamat_sebelumnya if alamat_saat_ini is empty
                            const jalanRaw = p.alamat_saat_ini || p.alamat_sebelumnya || p.alamat || "";
                            const jalan = (jalanRaw && jalanRaw !== '-') ? (jalanRaw.toLowerCase().startsWith('jl') ? jalanRaw : `Jl. ${jalanRaw}`) : '';
                            
                            const alamatFull = [
                                jalan,
                                `${identitasDesa?.sebutan_dusun || 'Dusun'} ${p.dusun || '-'}`,
                                `RT ${p.rt || '-'} / RW ${p.rw || '-'}`,
                                `${identitasDesa?.sebutan_desa || 'Desa'} ${identitasDesa?.nama_desa || '-'}`,
                                `${identitasDesa?.sebutan_kecamatan || 'Kecamatan'} ${identitasDesa?.nama_kecamatan || '-'}`,
                                `${identitasDesa?.sebutan_kabupaten || 'Kabupaten'} ${identitasDesa?.nama_kabupaten || '-'}`
                            ].filter(part => part && part.trim() !== '' && !part.includes('undefined') && !part.includes('null') && !part.includes(' -') && part !== '-').join(', ');

                            return {
                                ...p,
                                nama: p.nama,
                                nik: p.nik,
                                tempat_lahir: tempatLahir,
                                tanggal_lahir: tglFormatted,
                                // Pre-formatted TTL for variables like [ttl] or [Tempat/Tanggal Lahir]
                                ttl: `${tempatLahir}, ${tglFormatted}`,
                                "tempat_tanggal_lahir": `${tempatLahir}, ${tglFormatted}`,
                                
                                sex: jenisKelamin,
                                jenis_kelamin: jenisKelamin,
                                
                                // Explicitly provide formatted address
                                alamat: alamatFull, 
                                alamat_penduduk: alamatFull,
                                alamat_tempat_tinggal: alamatFull,
                                
                                rt: p.rt,
                                rw: p.rw,
                                dusun: p.dusun,
                                desa: p.nama_desa,
                                kecamatan: p.nama_kecamatan,
                                kabupaten: p.nama_kabupaten,
                                provinsi: p.nama_provinsi,
                                agama: p.agama,
                                status_kawin: p.status_kawin,
                                pekerjaan: p.pekerjaan,
                                warganegara: p.kewarganegaraan || "WNI"
                            };
                        })() : undefined,
                        pamong: (() => {
                          const p = pamongList.find(p => p.pamong_id === detailSurat?.id_pamong) || pamongList.find(p => p.pamong_ttd === 1 && p.pamong_status === 1);
                          return p ? {
                            nama: p.pamong_nama,
                            nip: p.pamong_nip,
                            pangkat: p.pamong_pangkat,
                            jabatan: "Kepala Desa" 
                          } : undefined;
                        })(),
                        form_data: detailSurat.form_data
                      }}
                    />
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                   <FileText className="w-16 h-16 opacity-10" />
                   <p className="font-medium">Tidak ada preview tersedia</p>
                 </div>
               )}
            </div>

            {/* Right Panel: Info & Actions */}
            <div className="w-full lg:w-[320px] flex-none flex flex-col bg-white border-l border-zinc-200 z-20 shadow-xl lg:shadow-none h-full font-sans">
                {/* Header */}
                <div className="h-16 border-b border-zinc-100 flex items-center justify-between px-5 bg-white shrink-0">
                    <h2 className="font-semibold text-zinc-800 text-sm">Verifikasi Surat</h2>
                    <div className="flex items-center gap-2 scale-90 origin-right">
                         {getStatusBadge(selectedSurat.status)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-6">
                        {/* Key Details Grid */}
                        <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Informasi Surat</h3>
                            <div className="grid grid-cols-1 gap-y-3">
                                <div className="flex justify-between items-start border-b border-zinc-50 pb-2">
                                   <span className="text-xs text-zinc-500">Pemohon</span>
                                   <div className="text-right">
                                       <div className="text-xs font-medium text-zinc-900">{selectedSurat.penduduk?.nama || detailSurat?.penduduk?.nama}</div>
                                       <div className="text-[10px] text-zinc-400 font-mono">{selectedSurat.penduduk?.nik || detailSurat?.penduduk?.nik}</div>
                                   </div>
                                </div>
                                
                                <div className="flex justify-between items-start border-b border-zinc-50 pb-2">
                                   <span className="text-xs text-zinc-500">Jenis Surat</span>
                                   <div className="text-right">
                                       <div className="text-xs font-medium text-zinc-900">{selectedSurat.surat_formats?.nama || selectedSurat.nama_surat}</div>
                                       <div className="text-[10px] text-zinc-400 font-mono">{selectedSurat.no_surat || "-"}</div>
                                   </div>
                                </div>

                                <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
                                   <span className="text-xs text-zinc-500">Tanggal</span>
                                   <span className="text-xs text-zinc-900">{new Date(selectedSurat.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                                </div>
                            </div>
                        </section>

                        {/* History */}
                        <section>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Riwayat</h3>
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-500">{history.length} aktivitas</span>
                          </div>
                          
                          <div className="relative pl-4 border-l border-zinc-200 space-y-5 ml-1.5">
                            {history.map((log, i) => (
                              <div key={log.id} className="relative">
                                <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${
                                  i === 0 ? 'bg-blue-600 ring-2 ring-blue-50' : 'bg-zinc-300'
                                }`} />
                                <div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-zinc-900 text-xs">{log.action.toUpperCase().replace('_', ' ')}</span>
                                    <span className="text-[10px] text-zinc-400">
                                      {new Date(log.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                      {(log.user_name || log.role || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[10px] text-zinc-500">
                                      {log.user_name || log.role}
                                    </span>
                                  </div>
                                  {log.comment && (
                                    <div className="mt-2 text-xs bg-amber-50/50 p-2 rounded text-amber-800 border border-amber-100/50 italic">
                                      "{log.comment}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-zinc-100 bg-white flex flex-col gap-3 flex-none">
                     
                     {/* Step 1: Initial Actions */}
                     {signStep === 'initial' && (
                        <>
                            {/* Comment Input */}
                            {(['operator', 'sekdes', 'kades'].includes(role)) && (
                                <Input
                                    placeholder="Catatan (opsional)..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="bg-white text-xs h-9"
                                />
                            )}
                            
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsSheetOpen(false)} disabled={processing} className="flex-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100">
                                    Tutup
                                </Button>

                                {/* Operator Actions */}
                                {role === 'operator' && (
                                    (selectedSurat.status === SuratFlowStatus.DRAFT || selectedSurat.status === SuratFlowStatus.REJECTED_SEKDES) && (
                                        <Button onClick={() => handleAction('submit')} disabled={processing} className="flex-[2] bg-blue-600 hover:bg-blue-700 h-9 text-xs">
                                            <Send className="w-3.5 h-3.5 mr-2" />
                                            Ajukan
                                        </Button>
                                    )
                                )}

                                {/* Sekdes Actions */}
                                {role === 'sekdes' && (
                                    <>
                                        <Button variant="outline" onClick={() => handleAction('reject')} disabled={processing} className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9 text-xs">
                                            Tolak
                                        </Button>
                                        <Button onClick={() => handleAction('approve')} disabled={processing} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                            Verifikasi
                                        </Button>
                                    </>
                                )}

                                {/* Kades Actions */}
                                {role === 'kades' && (
                                    <>
                                        <Button variant="outline" onClick={() => handleAction('reject')} disabled={processing} className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9 text-xs">
                                            Tolak
                                        </Button>
                                        <Button onClick={() => handleAction('sign')} disabled={processing} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs whitespace-nowrap">
                                            <PenTool className="w-3.5 h-3.5 mr-2" />
                                            Tanda Tangan
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                     )}

                     {/* Step 2: Selecting Mode */}
                     {signStep === 'selecting' && (
                        <div className="flex flex-col gap-3">
                            <div className="text-center">
                                <h4 className="text-sm font-semibold text-zinc-800">Pilih Metode Tanda Tangan</h4>
                                <p className="text-xs text-zinc-500">Silakan pilih metode tanda tangan yang diinginkan</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    onClick={() => executeSign('electronic')} 
                                    disabled={processing}
                                    variant="outline"
                                    className="h-auto py-3 flex flex-col items-center gap-2 border-zinc-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                >
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                        <PenTool className="w-4 h-4" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-semibold">Elektronik (TTE)</span>
                                        <span className="block text-[10px] text-zinc-400 font-normal">Menggunakan QR Code BSrE</span>
                                    </div>
                                </Button>

                                <Button 
                                    onClick={() => executeSign('manual')} 
                                    disabled={processing}
                                    variant="outline"
                                    className="h-auto py-3 flex flex-col items-center gap-2 border-zinc-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700"
                                >
                                    <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-semibold">Manual (Basah)</span>
                                        <span className="block text-[10px] text-zinc-400 font-normal">Tanda tangan basah / cap</span>
                                    </div>
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={() => setSignStep('initial')} className="text-zinc-500 h-8 text-xs">
                                Batal
                            </Button>
                        </div>
                     )}

                     {/* Step 3: Signed / Post-Sign Actions */}
                     {signStep === 'signed' && (
                        <div className="flex flex-col gap-3">
                             {signMode === 'electronic' && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                                    <h5 className="text-xs font-semibold text-blue-700 mb-1">SOP</h5>
                                    <p className="text-[10px] text-blue-600 leading-relaxed text-justify">
                                        "QR Code pada dokumen berfungsi sebagai sarana verifikasi status dan keaslian dokumen melaui Sistem Informasi Desa. Pengesahan dokumen dilakukan melalui Tanda Tangan Elektronik Tersertifikasi BSrE, dan dokumen yang dapat diunduh publik adalah dokumen hasil pengesahan tersebut."
                                    </p>
                                </div>
                             )}

                             <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                                <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-green-800">Surat Berhasil Ditandatangani!</h4>
                                    <p className="text-[10px] text-green-600 mt-0.5">
                                        {signMode === 'electronic' 
                                            ? "QR Code telah digenerate. Silakan unduh dokumen." 
                                            : "Dokumen telah ditandai manual. Silakan unduh untuk ditandatangani basah, lalu scan dan upload kembali."}
                                    </p>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                <Button onClick={handleDownloadPdf} className="h-9 text-xs bg-zinc-800 hover:bg-zinc-900 text-white gap-2">
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                </Button>
                                
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        id="upload-signed-doc" 
                                        className="hidden" 
                                        accept=".pdf"
                                        onChange={handleUploadDocument}
                                    />
                                    <label htmlFor="upload-signed-doc">
                                        <div className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium cursor-pointer transition-colors shadow-sm w-full">
                                            <Upload className="w-3.5 h-3.5" />
                                            Upload
                                        </div>
                                    </label>
                                </div>
                             </div>

                             <Button variant="ghost" onClick={() => setIsSheetOpen(false)} className="text-zinc-500 h-8 text-xs">
                                Tutup
                             </Button>
                        </div>
                     )}
                </div>
            </div>
          </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
