import {
  MoreHorizontal,
  Printer,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Download,
  Edit,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import { LogSurat } from "@/lib/services/surat";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";

interface SuratKeluarRowProps {
  surat: LogSurat & { 
    surat_formats?: { nama: string };
    penduduk?: { nama: string; nik: string };
  };
  rowNumber: number;
  onCetak: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: number) => void;
  onUpload: (id: number) => void;
}

export default function SuratKeluarTableRow({
  surat,
  rowNumber,
  onCetak,
  onDelete,
  onStatusChange,
  onUpload,
}: SuratKeluarRowProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Get signed file URL if available
  useEffect(() => {
    if (surat.status === 4 && surat.signed_file_path) {
       const supabase = createSupabaseBrowserClient();
       const { data } = supabase.storage.from('surat-documents').getPublicUrl(surat.signed_file_path);
       setDownloadUrl(data.publicUrl);
    }
  }, [surat.status, surat.signed_file_path]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: // Konsep
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">Konsep</span>;
      case 1: // Verifikasi Sekdes
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Verifikasi Sekdes</span>;
      case 2: // Perbaikan
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">Perbaikan</span>;
      case 3: // Tanda Tangan Kades
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Tanda Tangan Kades</span>;
      case 4: // Selesai
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const handleDownload = async () => {
    if (!surat.signed_file_path) {
      // Fallback to system generation if no file uploaded (should not happen for status 4 if workflow is followed)
      onCetak(surat.id!); 
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      toast.info("Sedang mendownload dokumen...");
      
      const { data, error } = await supabase.storage
        .from('surat-documents')
        .download(surat.signed_file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Surat-${surat.no_surat?.replace(/\//g, '-') || surat.id}.pdf`; // Replace slashes for safe filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error("Gagal mendownload file: " + error.message);
    }
  };

  const handleLihat = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      onCetak(surat.id!);
    }
  };

  return (
    <tr 
      className="hover:bg-gray-50 transition-colors group cursor-pointer"
      onClick={() => onCetak(surat.id!)}
    >
      <td className="px-4 py-3 align-middle text-xs text-gray-500 text-center font-medium">
        {rowNumber}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-900">
            {surat.no_surat || "Belum ada nomor"}
          </span>
          <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
             <FileText className="w-3 h-3" />
             {formatDate(surat.tanggal)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-xs text-gray-900 font-medium">
        {surat.surat_formats?.nama || surat.nama_surat || "Surat Keterangan"}
      </td>
      <td className="px-4 py-3 align-middle text-xs text-gray-500">
        {surat.nama_non_warga ? (
          <div>
            <div className="font-medium text-gray-900 text-xs uppercase">{surat.nama_non_warga}</div>
            <div className="text-[10px] text-gray-500">Non-Warga</div>
          </div>
        ) : surat.penduduk ? (
          <div>
            <div className="font-medium text-gray-900 text-xs uppercase">{surat.penduduk.nama}</div>
            <div className="text-[10px] text-gray-500">NIK: {surat.penduduk.nik}</div>
          </div>
        ) : (
          "-"
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        {getStatusBadge(surat.status)}
      </td>
      <td className="px-4 py-3 align-middle text-center w-[8%]">
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                  <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              {/* Action for Draft/Konsep */}
              {surat.status === 0 && (
                 <DropdownMenuItem
                  onClick={() => onStatusChange(surat.id!, 1)}
                  className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Ajukan Verifikasi
                </DropdownMenuItem>
              )}

              {/* Action for Verifikasi Sekdes (Status 1) */}
              {surat.status === 1 && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(surat.id!, 3)}
                    className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-2" />
                    Verifikasi & Lanjut
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(surat.id!, 2)}
                    className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-2" />
                    Kembalikan (Perbaikan)
                  </DropdownMenuItem>
                </>
              )}
              
              {/* Actions for Perbaikan - Back to Draft */}
              {surat.status === 2 && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(surat.id!, 0)}
                  className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                >
                  <Edit className="w-3.5 h-3.5 mr-2" />
                  Perbaiki Surat
                </DropdownMenuItem>
              )}

              {/* Action for Tanda Tangan Kades (Status 3) */}
              {surat.status === 3 && (
                <>
                  <DropdownMenuItem
                    onClick={() => onCetak(surat.id!)}
                    className="text-zinc-700 focus:text-zinc-800 focus:bg-zinc-50"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Unduh Draft (Untuk TTD)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpload(surat.id!)}
                    className="text-purple-600 focus:text-purple-700 focus:bg-purple-50"
                  >
                    <Upload className="w-3.5 h-3.5 mr-2" />
                    Upload Surat TTD
                  </DropdownMenuItem>
                </>
              )}

              {/* Action for Selesai (Status 4) */}
              {surat.status === 4 && (
                <>
                  <DropdownMenuItem onClick={handleLihat}>
                    <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                    Lihat Dokumen
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDownload}
                    className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Download Surat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCetak(surat.id!)}>
                     <Printer className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                     Cetak
                  </DropdownMenuItem>
                </>
              )}

              {/* Always allow viewing detail if not Selesai (since Selesai has specific view actions) */}
              {surat.status !== 4 && (
                <DropdownMenuItem onClick={handleLihat}>
                  <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                  Lihat Detail
                </DropdownMenuItem>
              )}
              
              {surat.status !== 4 && (
                 <DropdownMenuItem onClick={() => onCetak(surat.id!)}>
                  <Edit className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                  Edit Data
                </DropdownMenuItem>
              )}

              <DropdownMenuItem 
                onClick={() => onDelete(surat.id!)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Hapus Arsip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}