"use client";

import { useEffect, useState, useMemo } from "react";
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
import { getIdentitasDesa, IdentitasDesa, getPamong, Pamong, buildSuratPreviewData } from "@/lib/services/surat";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Editor } from "@/components/editor/Editor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Eye,
  User,
  Search,
  Filter as FilterIcon,
  Check,
  RotateCw as RefreshClockwise,
  MoreHorizontal,
  Send, 
  Upload, 
  Download,
  PenTool
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

// Helper for status badges
const getStatusBadge = (status: number) => {
  switch (status) {
    case SuratFlowStatus.DRAFT:
      return <Badge variant="default">Draft</Badge>;
    case SuratFlowStatus.PENDING_SEKDES:
      return <Badge variant="warning">Verifikasi Sekdes</Badge>;
    case SuratFlowStatus.PENDING_KADES:
      return <Badge variant="info">Tanda Tangan Kades</Badge>;
    case SuratFlowStatus.SIGNED:
      return <Badge variant="success">Selesai (Ditandatangani)</Badge>;
    case SuratFlowStatus.REJECTED_SEKDES:
      return <Badge variant="error">Ditolak Sekdes</Badge>;
    case SuratFlowStatus.REJECTED_KADES:
      return <Badge variant="error">Ditolak Kades</Badge>;
    default:
      return <Badge variant="default">Unknown</Badge>;
  }
};

export default function VerifikasiSuratPage() {
  const [role, setRole] = useState<'operator' | 'sekdes' | 'kades'>('operator'); // Simulating role
  const [tasks, setTasks] = useState<SuratTask[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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

  // Filter Logic
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Status Filter
    if (statusFilter !== "Semua") {
       filtered = filtered.filter((r) => {
         // Map badge status to filter string or simple check
         const status = r.status;
         // This is a simplification, ideally map enum to string
         if (statusFilter === "Draft" && status === SuratFlowStatus.DRAFT) return true;
         if (statusFilter === "Verifikasi Sekdes" && status === SuratFlowStatus.PENDING_SEKDES) return true;
         if (statusFilter === "Tanda Tangan Kades" && status === SuratFlowStatus.PENDING_KADES) return true;
         if (statusFilter === "Selesai" && status === SuratFlowStatus.SIGNED) return true;
         if (statusFilter.includes("Ditolak") && (status === SuratFlowStatus.REJECTED_SEKDES || status === SuratFlowStatus.REJECTED_KADES)) return true;
         return false;
       });
    }

    // Search Filter
    const searchLower = searchTerm.toLowerCase();
    if (searchLower) {
      filtered = filtered.filter((r) => 
        (r.no_surat && r.no_surat.toLowerCase().includes(searchLower)) ||
        (r.penduduk?.nama && r.penduduk.nama.toLowerCase().includes(searchLower)) ||
        (r.penduduk?.nik && r.penduduk.nik.toLowerCase().includes(searchLower)) ||
        (r.nama_surat && r.nama_surat.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [tasks, statusFilter, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredTasks.slice(startIndex, endIndex);

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

  const columns: Column<SuratTask>[] = useMemo(() => [
    {
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-secondary-text/70" />
          {new Date(row.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      header: "Nomor Surat",
      accessorKey: "no_surat",
      className: "font-mono text-xs text-secondary-text",
      cell: (row) => row.no_surat || "-"
    },
    {
      header: "Jenis Surat",
      accessorKey: "nama_surat",
      className: "font-medium text-primary-text",
      cell: (row) => row.surat_formats?.nama || row.nama_surat || "Surat Tanpa Judul"
    },
    {
      header: "Penduduk",
      accessorKey: "penduduk",
      cell: (row) => (
          <div className="flex flex-col">
              <span className="text-primary-text font-medium">{row.penduduk?.nama || "Tanpa Nama"}</span>
              <span className="text-secondary-text/70 text-xs">{row.penduduk?.nik || "-"}</span>
          </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      className: "text-center",
      cell: (row) => getStatusBadge(row.status)
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-right",
      cell: (row) => (
          <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-3 text-xs gap-1.5 shadow-sm"
              onClick={(e) => {
                  e.stopPropagation();
                  openReview(row);
              }}
          >
              <Eye className="w-3.5 h-3.5" />
              Detail & Proses
          </Button>
      )
    }
  ], []);

  const mobileConfig: MobileConfig<SuratTask> = {
    titleKey: (row) => row.surat_formats?.nama || row.nama_surat || "Surat Tanpa Judul",
    subtitleKey: (row) => row.no_surat || "-",
    statusKey: (row) => getStatusBadge(row.status),
    action: (row) => (
      <Button 
          size="sm" 
          variant="outline" 
          className="h-8 w-8 p-0"
          onClick={(e) => {
              e.stopPropagation();
              openReview(row);
          }}
      >
          <Eye className="w-3.5 h-3.5" />
      </Button>
    )
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
      
      const element = document.querySelector('#surat-preview-wrapper .bg-white');
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
          
          clone.style.transform = 'none'; // Reset any scaling from preview
          clone.style.transformOrigin = 'top left';

          // MANUAL FIX: Ensure last element has no margin bottom
           const lastChild = clone.lastElementChild as HTMLElement;
           if (lastChild) {
               lastChild.style.marginBottom = '0';
           }
          
          // Ensure the clone has the correct dimensions based on the target paper size
          const dimensions = {
              A4: { width: 210, height: 297 },
              F4: { width: 215, height: 330 },
              Legal: { width: 216, height: 356 },
              Letter: { width: 216, height: 279 }
          };
          
          // @ts-ignore
          const dim = dimensions[size] || dimensions.A4;
          
          // STRICT DIMENSION ENFORCEMENT
          clone.style.width = `${dim.width}mm`;
          clone.style.maxWidth = `${dim.width}mm`;
          clone.style.minWidth = `${dim.width}mm`;
          
          // Height strictness with SAFETY MARGIN
          const safeHeight = dim.height - 0.5;
          clone.style.height = `${safeHeight}mm`; 
          clone.style.minHeight = `${safeHeight}mm`;
          clone.style.maxHeight = `${safeHeight}mm`;
          clone.style.overflow = 'hidden'; // Clip overflow
          
          // CLEANUP FOOTER
          const footerElement = clone.querySelector('[data-id="page_footer"]') || clone.querySelector('.absolute.bottom-0');
          if (footerElement) {
              (footerElement as HTMLElement).style.marginBottom = '0';
              (footerElement as HTMLElement).style.bottom = '0';
              (footerElement as HTMLElement).style.minHeight = '0';
          }

          // Create a container to hold the clone off-screen
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '0';
          
          container.style.width = `${dim.width}mm`;
          container.style.height = `${safeHeight}mm`;
          
          const computedStyle = window.getComputedStyle(element);
          
          clone.style.boxSizing = 'border-box';
          
          clone.style.paddingTop = computedStyle.paddingTop;
          clone.style.paddingBottom = computedStyle.paddingBottom;
          clone.style.paddingLeft = computedStyle.paddingLeft;
          clone.style.paddingRight = computedStyle.paddingRight;

          container.appendChild(clone);
          document.body.appendChild(container);
          
          await new Promise(resolve => setTimeout(resolve, 100));

          const opt = {
              margin: 0,
              filename: `${(selectedSurat.surat_formats?.nama || 'Surat').replace(/\//g, '-')}_${selectedSurat.penduduk?.nama || 'Warga'}.pdf`,
              image: { type: 'jpeg', quality: 0.98 } as any,
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

          // @ts-ignore
          const html2pdf = (await import("html2pdf.js")).default;
          await (html2pdf as any)().set(opt as any).from(clone).save();
          
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
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Verifikasi Surat" 
        subtitle="Alur Persetujuan dan Tanda Tangan" 
      />

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Search */}
            <div className="w-full md:w-auto flex-1 relative max-w-sm">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
                   <Search className="w-4 h-4" />
               </div>
               <Input 
                  placeholder="Cari nomor surat, nama..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
               />
            </div>
            
            {/* Right: Actions & Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-2 md:pb-0">
                 {/* Role Switcher (Custom Segmented Control) */}
                 <div className="flex bg-body-bg p-1 rounded-lg border border-border-color shrink-0">
                    {(['operator', 'sekdes', 'kades'] as const).map((r) => (
                        <Button
                            key={r}
                            variant={role === r ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setRole(r)}
                            className={`h-7 px-3 text-xs capitalize ${role === r ? "shadow-sm" : "text-secondary-text hover:text-primary-text"}`}
                        >
                            {r}
                        </Button>
                    ))}
                </div>

                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 shrink-0 text-secondary-text">
                            <FilterIcon className="w-3.5 h-3.5 mr-2" />
                            <span className="hidden sm:inline text-xs font-medium">{statusFilter}</span>
                            {statusFilter !== "Semua" && (
                               <div className="ml-2 w-1.5 h-1.5 rounded-full bg-accent" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {["Semua", "Draft", "Verifikasi Sekdes", "Tanda Tangan Kades", "Selesai", "Ditolak"].map((status) => (
                            <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                                {status === statusFilter && <Check className="w-4 h-4 mr-2" />}
                                <span className="flex-1">{status}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Refresh */}
                <Button variant="outline" size="icon" onClick={fetchTasks} className="shrink-0 text-secondary-text" title="Refresh Data">
                    <RefreshClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
        </div>
      </Card>

      <DataTable 
          columns={columns} 
          data={currentData} 
          loading={loading}
          mobileConfig={mobileConfig}
          onRowClick={openReview}
      />

      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredTasks.length}
          itemsPerPage={pageSize}
          onItemsPerPageChange={setPageSize}
          sticky={true}
      />

      {/* Review Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-screen h-screen max-w-none sm:max-w-none p-0 flex flex-col rounded-none border-none focus:outline-none font-sans">
          <SheetHeader className="hidden">
            <SheetTitle>Verifikasi Surat</SheetTitle>
          </SheetHeader>
          {selectedSurat && (
          <div className="flex-1 w-full h-full flex flex-col lg:flex-row overflow-hidden relative">
            
            {/* Left Panel: Preview */}
            <div className="flex-1 border-r border-border-color flex flex-col overflow-hidden bg-body-bg relative">
               {loadingDetail ? (
                 <div className="flex flex-col items-center justify-center h-full gap-3">
                   <div className="w-8 h-8 border-2 border-border-color border-t-primary-text rounded-full animate-spin" />
                   <p className="text-sm text-secondary-text font-medium">Memuat dokumen...</p>
                 </div>
               ) : detailSurat && detailSurat.surat_formats?.template ? (
                 <div className="flex-1 w-full h-full relative" id="surat-preview-wrapper">
                     <Editor 
                      initialJson={detailSurat.surat_formats.template}
                      readOnly={true}
                      hideHeaderNavigation={true}
                      previewData={buildSuratPreviewData({
                        surat: {
                          id: detailSurat.id,
                          nomor: detailSurat.no_surat || "SURAT/2024/XXX",
                          no_surat: detailSurat.no_surat || "SURAT/2024/XXX",
                          tanggal: detailSurat.tanggal,
                          tanggal_surat: detailSurat.tanggal,
                          nama_surat: detailSurat.surat_formats?.nama,
                          keterangan: detailSurat.keterangan,
                          kode: detailSurat.surat_formats?.kode_surat
                        },
                        resident: detailSurat.penduduk,
                        pamong: pamongList.find(p => p.pamong_id === detailSurat?.id_pamong) || pamongList.find(p => p.pamong_ttd === 1 && p.pamong_status === 1) || pamongList[0],
                        identitasDesa: identitasDesa,
                        formData: detailSurat.form_data || {},
                        signature: detailSurat.form_data?.signature
                      })}
                    />
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-secondary-text gap-2">
                   <FileText className="w-16 h-16 opacity-10" />
                   <p className="font-medium">Tidak ada preview tersedia</p>
                 </div>
               )}
            </div>

            {/* Right Panel: Info & Actions */}
            <div className="w-full lg:w-[320px] flex-none flex flex-col bg-card-bg border-l border-border-color z-20 h-full font-sans">
                {/* Header */}
                <div className="h-16 border-b border-border-color flex items-center justify-between px-5 bg-card-bg shrink-0">
                    <h2 className="font-semibold text-primary-text text-sm">Verifikasi Surat</h2>
                    <div className="flex items-center gap-2 scale-90 origin-right">
                         {getStatusBadge(selectedSurat.status)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-6">
                        {/* Key Details Grid */}
                        <section>
                            <h3 className="text-xs font-medium uppercase tracking-wide text-secondary-text mb-3">Informasi Surat</h3>
                            <div className="grid grid-cols-1 gap-y-3">
                                <div className="flex justify-between items-start border-b border-border-color pb-2">
                                   <span className="text-xs text-secondary-text">Pemohon</span>
                                   <div className="text-right">
                                       <div className="text-xs font-medium text-primary-text">{selectedSurat.penduduk?.nama || detailSurat?.penduduk?.nama}</div>
                                       <div className="text-xs text-secondary-text font-mono">{selectedSurat.penduduk?.nik || detailSurat?.penduduk?.nik}</div>
                                   </div>
                                </div>
                                
                                <div className="flex justify-between items-start border-b border-border-color pb-2">
                                   <span className="text-xs text-secondary-text">Jenis Surat</span>
                                   <div className="text-right">
                                       <div className="text-xs font-medium text-primary-text">{selectedSurat.surat_formats?.nama || selectedSurat.nama_surat}</div>
                                       <div className="text-[10px] text-secondary-text font-mono">{selectedSurat.no_surat || "-"}</div>
                                   </div>
                                </div>

                                <div className="flex justify-between items-center border-b border-border-color pb-2">
                                   <span className="text-xs text-secondary-text">Tanggal</span>
                                   <span className="text-xs text-primary-text">{new Date(selectedSurat.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                                </div>
                            </div>
                        </section>

                        {/* History */}
                        <section>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-medium uppercase tracking-wide text-secondary-text">Riwayat</h3>
                            <span className="text-[10px] px-1.5 py-0.5 bg-body-bg rounded text-secondary-text border border-border-color">{history.length} aktivitas</span>
                          </div>
                          
                          <div className="relative pl-4 border-l border-border-color space-y-5 ml-1.5">
                            {history.map((log, i) => (
                              <div key={log.id} className="relative">
                                <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card-bg transition-colors ${
                                  i === 0 ? 'bg-primary-text ring-2 ring-border-color' : 'bg-border-color'
                                }`} />
                                <div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-primary-text text-xs">{log.action.toUpperCase().replace('_', ' ')}</span>
                                    <span className="text-[10px] text-secondary-text">
                                      {new Date(log.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-3.5 h-3.5 rounded-full bg-body-bg flex items-center justify-center text-[0.5rem] font-bold text-secondary-text border border-border-color">
                                      {(log.user_name || log.role || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[10px] text-secondary-text">
                                      {log.user_name || log.role}
                                    </span>
                                  </div>
                                  {log.comment && (
                                    <div className="mt-2 text-xs bg-warning-bg/50 p-2 rounded text-warning-text border border-warning-border/50 italic">
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
                <div className="p-4 border-t border-border-color bg-card-bg flex flex-col gap-3 flex-none">
                     
                     {/* Step 1: Initial Actions */}
                     {signStep === 'initial' && (
                        <>
                            {/* Comment Input */}
                            {(['operator', 'sekdes', 'kades'].includes(role)) && (
                                <Input
                                    placeholder="Catatan (opsional)..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="bg-body-bg text-xs h-9 text-primary-text border-border-color placeholder:text-secondary-text"
                                />
                            )}
                            
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsSheetOpen(false)} disabled={processing} className="flex-1 text-secondary-text hover:text-primary-text hover:bg-body-bg">
                                    Tutup
                                </Button>

                                {/* Operator Actions */}
                                {role === 'operator' && (
                                    (selectedSurat.status === SuratFlowStatus.DRAFT || selectedSurat.status === SuratFlowStatus.REJECTED_SEKDES) && (
                                        <Button onClick={() => handleAction('submit')} disabled={processing} className="flex-[2] bg-info-text hover:bg-info-text/90 h-9 text-xs">
                                            <Send className="w-3.5 h-3.5 mr-2" />
                                            Ajukan
                                        </Button>
                                    )
                                )}

                                {/* Sekdes Actions */}
                                {role === 'sekdes' && (
                                    <>
                                        <Button variant="outline" onClick={() => handleAction('reject')} disabled={processing} className="flex-1 border-error-border text-error-text hover:bg-error-bg h-9 text-xs">
                                            Tolak
                                        </Button>
                                        <Button onClick={() => handleAction('approve')} disabled={processing} className="flex-[2] bg-success-text hover:bg-success-text/90 text-white h-9 text-xs">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                            Verifikasi
                                        </Button>
                                    </>
                                )}

                                {/* Kades Actions */}
                                {role === 'kades' && (
                                    <>
                                        <Button variant="outline" onClick={() => handleAction('reject')} disabled={processing} className="flex-1 border-error-border text-error-text hover:bg-error-bg h-9 text-xs">
                                            Tolak
                                        </Button>
                                        <Button onClick={() => handleAction('sign')} disabled={processing} className="flex-[2] bg-info-text hover:bg-info-text/90 text-white h-9 text-xs whitespace-nowrap">
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
                                <h4 className="text-sm font-semibold text-primary-text">Pilih Metode Tanda Tangan</h4>
                                <p className="text-xs text-secondary-text">Silakan pilih metode tanda tangan yang diinginkan</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    onClick={() => executeSign('electronic')} 
                                    disabled={processing}
                                    variant="outline"
                                    className="h-auto py-3 flex flex-col items-center gap-2 border-border-color hover:bg-info-bg hover:border-info-border hover:text-info-text"
                                >
                                    <div className="p-2 bg-info-border rounded-full text-info-text">
                                        <PenTool className="w-4 h-4" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-semibold">Elektronik (TTE)</span>
                                        <span className="block text-[10px] text-secondary-text font-normal">Menggunakan QR Code BSrE</span>
                                    </div>
                                </Button>

                                <Button 
                                    onClick={() => executeSign('manual')} 
                                    disabled={processing}
                                    variant="outline"
                                    className="h-auto py-3 flex flex-col items-center gap-2 border-border-color hover:bg-warning-bg hover:border-warning-border hover:text-warning-text"
                                >
                                    <div className="p-2 bg-warning-border rounded-full text-warning-text">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-semibold">Manual (Basah)</span>
                                        <span className="block text-xs text-secondary-text font-normal">Tanda tangan basah / cap</span>
                                    </div>
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={() => setSignStep('initial')} className="text-secondary-text h-8 text-xs hover:text-primary-text hover:bg-secondary-text/10">
                                Batal
                            </Button>
                        </div>
                     )}

                     {/* Step 3: Signed / Post-Sign Actions */}
                     {signStep === 'signed' && (
                        <div className="flex flex-col gap-3">
                             {signMode === 'electronic' && (
                                <div className="p-3 bg-info-bg border border-info-border rounded-md">
                                    <h5 className="text-xs font-semibold text-info-text mb-1">SOP</h5>
                                    <p className="text-[10px] text-info-text leading-relaxed text-justify">
                                        "QR Code pada dokumen berfungsi sebagai sarana verifikasi status dan keaslian dokumen melaui Sistem Informasi Desa. Pengesahan dokumen dilakukan melalui Tanda Tangan Elektronik Tersertifikasi BSrE, dan dokumen yang dapat diunduh publik adalah dokumen hasil pengesahan tersebut."
                                    </p>
                                </div>
                             )}

                             <div className="p-3 bg-success-bg border border-success-border rounded-lg flex items-start gap-3">
                                <div className="p-1.5 bg-success-border rounded-full text-success-text mt-0.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-success-text">Surat Berhasil Ditandatangani!</h4>
                                    <p className="text-xs text-success-text mt-0.5">
                                        {signMode === 'electronic' 
                                            ? "QR Code telah digenerate. Silakan unduh dokumen." 
                                            : "Dokumen telah ditandai manual. Silakan unduh untuk ditandatangani basah, lalu scan dan upload kembali."}
                                    </p>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                <Button onClick={handleDownloadPdf} className="h-9 text-xs bg-primary-text hover:bg-primary-text/90 text-body-bg gap-2">
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
                                    <Button
                                        onClick={() => document.getElementById('upload-signed-doc')?.click()}
                                        className="w-full bg-accent hover:opacity-90 text-white gap-2"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload
                                    </Button>
                                </div>
                             </div>

                             <Button variant="ghost" onClick={() => setIsSheetOpen(false)} className="text-secondary-text h-8 text-xs hover:text-primary-text hover:bg-secondary-text/10">
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
