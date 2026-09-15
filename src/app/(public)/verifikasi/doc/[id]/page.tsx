import { createSupabaseAdminClient, createSupabaseServerClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
    CheckCircle2, Clock, FileText, Download, ShieldCheck, XCircle, 
    User, Calendar, FileCheck, Building2, QrCode, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function VerificationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  // Debug logs
  console.log(`Verifying document ID: ${id}`);
  
  const supabase = createSupabaseAdminClient();

  // Query Data - Attempt direct match first
  let { data: suratList, error } = await supabase
    .from("log_surat")
    .select("*, surat_formats(nama), penduduk(nama, nik), pamong:id_pamong(pamong_nama, pamong_nip, pamong_pangkat)")
    .contains('form_data', { signature: { id: id } })
    .order('id', { ascending: false });

  // Fallback: If not found, try fetching recent logs and searching manually (in case of JSON structure mismatch)
  if (!error && (!suratList || suratList.length === 0)) {
      console.log("Direct query returned no results, trying fallback search...");
      const { data: allLogs, error: fallbackError } = await supabase
        .from("log_surat")
        .select("*, surat_formats(nama), penduduk(nama, nik), pamong:id_pamong(pamong_nama, pamong_nip, pamong_pangkat)")
        .order('id', { ascending: false })
        .limit(50);
        
      if (!fallbackError && allLogs) {
          const found = allLogs.filter((s: any) => s.form_data?.signature?.id === id);
          if (found.length > 0) {
              console.log(`Found ${found.length} records via manual filter.`);
              suratList = found;
          }
      } else {
          console.error("Fallback search error:", fallbackError);
       }
   }

   // Fallback 2: Try using Anon Client (in case Admin client has auth issues but RLS allows public read)
   if ((error || !suratList || suratList.length === 0)) {
       console.log("Admin client failed/empty, trying Anon client...");
       const supabaseAnon = createSupabaseServerClient();
       const { data: anonData, error: anonError } = await supabaseAnon
           .from("log_surat")
           .select("*, surat_formats(nama), penduduk(nama, nik), pamong:id_pamong(pamong_nama, pamong_nip, pamong_pangkat)")
           .contains('form_data', { signature: { id: id } });

       if (!anonError && anonData && anonData.length > 0) {
           console.log("Found record using Anon client");
           suratList = anonData;
           error = null;
       } else if (anonError) {
           console.error("Anon client error:", anonError);
       }
   }
 
   if (error) {
      console.error("Supabase query error:", error);
  }

  // Filter Logic: Prioritize SIGNED (3) or Uploaded documents to handle duplicates
  let surat = null;
  if (suratList && suratList.length > 0) {
      // 1. Priority: Status SIGNED (3)
      const signedDoc = suratList.find((s: any) => s.status === 3);
      // 2. Priority: Has signed file path
      const uploadedDoc = suratList.find((s: any) => s.signed_file_path);
      // 3. Fallback: Newest record
      surat = signedDoc || uploadedDoc || suratList[0];
  }

  // Identitas Desa
  const { data: identitasDesa } = await supabase
    .from("identitas_desa")
    .select("nama_desa")
    .limit(1)
    .single();
    
  if (error || !surat) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-body-bg p-6 font-sans">
            <div className="bg-card-bg p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] max-w-md w-full text-center border border-border-color relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-600"></div>
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-primary-text mb-3 tracking-tight">Dokumen Tidak Ditemukan</h1>
                <p className="text-secondary-text mb-8 text-sm leading-relaxed px-4">
                    Sistem tidak dapat memverifikasi ID dokumen ini. Kemungkinan dokumen telah dihapus atau ID yang Anda masukkan salah.
                    <br/>
                    {error && (
                        <span className="text-xs text-red-500 font-mono mt-2 block bg-red-50 p-2 rounded">
                            Error: {error.message}
                        </span>
                    )}
                </p>
                <div className="space-y-3">
                    <Link href="/" className="w-full py-3.5 bg-primary-text text-card-bg rounded-xl hover:opacity-90 transition-all text-sm font-semibold shadow-lg shadow-primary-text/20 flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Verifikasi Ulang
                    </Link>
                    <Link href="/" className="w-full py-3.5 bg-card-bg text-secondary-text border border-border-color rounded-xl hover:bg-body-bg transition-all text-sm font-semibold block">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
          </div>
      );
  }

  // Logic Status
  const signature = surat.form_data?.signature;
  const isElectronic = signature?.type === 'electronic';
  const isUploaded = !!surat.signed_file_path;
  
  // Signed URL
  let downloadUrl = null;
  if (isUploaded) {
      const { data } = await supabase.storage.from('surat-documents').createSignedUrl(surat.signed_file_path, 3600);
      downloadUrl = data?.signedUrl;
  }

  // Configuration
  const getStatusConfig = () => {
    if (isElectronic) {
        if (isUploaded) {
            return {
                theme: "emerald",
                icon: ShieldCheck,
                label: "VALID & SAH",
                title: "Tanda Tangan Elektronik",
                desc: "Dokumen ini telah ditandatangani secara elektronik dan sah menurut hukum.",
                legal: "UU ITE No. 11 Tahun 2008 Pasal 5 Ayat 1",
                downloadable: true
            };
        } else {
            return {
                theme: "amber",
                icon: Clock,
                label: "PROSES",
                title: "Menunggu TTE",
                desc: "Dokumen sedang dalam antrian penandatanganan elektronik.",
                legal: "Menunggu persetujuan pejabat berwenang.",
                downloadable: false
            };
        }
    } else {
        if (isUploaded) {
            return {
                theme: "blue",
                icon: FileCheck,
                label: "TERVERIFIKASI",
                title: "Tanda Tangan Basah",
                desc: "Salinan digital dari dokumen fisik yang telah ditandatangani basah.",
                legal: "Sesuai arsip fisik Pemerintah Desa.",
                downloadable: true
            };
        } else {
            return {
                theme: "slate",
                icon: FileText,
                label: "DRAFT",
                title: "Draf Dokumen",
                desc: "Dokumen belum disahkan.",
                legal: "Belum memiliki kekuatan hukum.",
                downloadable: false
            };
        }
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  // Modern Styles
  const themeMap = {
    emerald: {
        sidebar: "bg-emerald-600",
        sidebarPattern: "opacity-20",
        icon: "text-emerald-100",
        text: "text-white",
        subtext: "text-emerald-100",
        button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
    },
    amber: {
        sidebar: "bg-amber-500",
        sidebarPattern: "opacity-20",
        icon: "text-amber-100",
        text: "text-white",
        subtext: "text-amber-100",
        button: "bg-primary-text hover:opacity-90 text-card-bg"
    },
    blue: {
        sidebar: "bg-blue-600",
        sidebarPattern: "opacity-20",
        icon: "text-blue-100",
        text: "text-white",
        subtext: "text-blue-100",
        button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
    },
    slate: {
        sidebar: "bg-zinc-600",
        sidebarPattern: "opacity-20",
        icon: "text-zinc-300",
        text: "text-white",
        subtext: "text-zinc-300",
        button: "bg-primary-text hover:opacity-90 text-card-bg"
    }
  };
  const currentTheme = themeMap[status.theme as keyof typeof themeMap] || themeMap.slate;

  return (
    <div className="min-h-screen bg-body-bg flex items-center justify-center p-4 sm:p-6 font-sans text-primary-text">
        
        {/* Main Card: Horizontal Layout for Desktop */}
        <div className="w-full max-w-5xl bg-card-bg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            
            {/* LEFT SIDEBAR: Visual Status Indicator */}
            <div className={`w-full md:w-[320px] shrink-0 ${currentTheme.sidebar} relative p-8 md:p-10 flex flex-col justify-between overflow-hidden`}>
                {/* Abstract Pattern */}
                <div className={`absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay`}></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8 opacity-90">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-white">DesaOS Verifier</span>
                    </div>

                    <div className="mb-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/30">
                            <StatusIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{status.title}</h2>
                        <p className={`text-sm ${currentTheme.subtext} leading-relaxed opacity-90`}>{status.desc}</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Status Dokumen</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.theme === 'emerald' ? 'bg-green-400 animate-pulse' : 'bg-white/50'}`}></div>
                            <span className="text-sm font-bold text-white">{status.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT: Details & Data */}
            <div className="flex-1 p-8 md:p-10 flex flex-col">
                
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 border-b border-border-color pb-6">
                    <div>
                        <span className="inline-block px-3 py-1 bg-zinc-100 text-secondary-text rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                            {surat.surat_formats?.nama || "Dokumen Resmi"}
                        </span>
                        <h1 className="text-xl md:text-2xl font-bold text-primary-text leading-tight">
                            {surat.surat_formats?.nama}
                        </h1>
                        <p className="text-sm text-secondary-text mt-1">
                            No: <span className="font-mono text-primary-text bg-body-bg px-1 rounded">{surat.no_surat || "Belum Terbit"}</span>
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Tanggal Terbit</p>
                        <p className="text-sm font-semibold text-primary-text flex items-center sm:justify-end gap-2">
                            <Calendar className="w-4 h-4 text-secondary-text" />
                            {surat.tanggal ? format(new Date(surat.tanggal), "d MMMM yyyy", { locale: idLocale }) : "-"}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                {status.downloadable ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
                        
                        {/* Signer Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-primary-text uppercase tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4 text-secondary-text" />
                                Penandatangan
                            </h4>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-secondary-text font-bold text-xs border border-border-color">
                                    {surat.pamong?.pamong_nama?.charAt(0) || "P"}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary-text">{surat.pamong?.pamong_nama}</p>
                                    <p className="text-xs text-secondary-text">{surat.pamong?.pamong_pangkat || "Pejabat Desa"}</p>
                                </div>
                            </div>
                            {/* Instansi */}
                            <div className="pl-14">
                                <p className="text-xs font-semibold text-secondary-text">Pemerintah Desa {identitasDesa?.nama_desa}</p>
                            </div>
                        </div>

                        {/* Applicant Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-primary-text uppercase tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4 text-secondary-text" />
                                Pemohon
                            </h4>
                            <div className="bg-body-bg rounded-xl p-4 border border-border-color">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-primary-text">{surat.penduduk?.nama || surat.nama_non_warga}</p>
                                        <p className="text-xs text-secondary-text font-mono mt-0.5">{surat.penduduk?.nik || surat.nik_non_warga}</p>
                                    </div>
                                    <div className="bg-card-bg p-1 rounded border border-border-color">
                                        <QrCode className="w-6 h-6 text-primary-text" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-body-bg rounded-xl p-8 text-center border-2 border-dashed border-border-color mb-8">
                        <p className="text-sm text-secondary-text">Detail dokumen belum tersedia untuk publik karena masih dalam proses.</p>
                    </div>
                )}

                {/* Footer Actions & Legal */}
                <div className="mt-auto pt-6 border-t border-border-color flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Legal Blurb */}
                    <div className="flex-1">
                        <div className="flex items-start gap-3">
                            {isElectronic && (
                                <div className="relative w-20 h-10 opacity-80 shrink-0">
                                    <Image src="/bsre-logo.png" alt="BSrE" fill className="object-contain object-left" />
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-bold text-primary-text uppercase tracking-wide mb-1">Kepastian Hukum</p>
                                <p className="text-[10px] text-secondary-text leading-relaxed max-w-xs">
                                    {status.legal} <br/>
                                    {isElectronic && "Sertifikat Elektronik diterbitkan oleh BSrE BSSN."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {downloadUrl && (
                        <a 
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold shadow-lg shadow-zinc-200/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 ${currentTheme.button}`}
                        >
                            <Download className="w-5 h-5" />
                            <span>{isElectronic ? "Unduh Asli" : "Unduh Salinan"}</span>
                        </a>
                    )}
                </div>

            </div>
        </div>
        
        {/* Simple Footer */}
        <div className="fixed bottom-4 left-0 w-full text-center pointer-events-none">
            <p className="text-[10px] text-secondary-text bg-card-bg/80 backdrop-blur px-4 py-1 rounded-full inline-block shadow-sm">
                Powered by DesaOS &bull; Verifikasi Resmi Pemerintah Desa
            </p>
        </div>

    </div>
  );
}
