import {
  MoreVertical,
  Eye,
  Printer,
  Trash2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LogSurat } from "@/lib/services/surat";

interface SuratKeluarRowProps {
  surat: LogSurat & { 
    tweb_surat_format?: { nama: string };
    penduduk?: { nama: string; nik: string };
  };
  rowNumber: number;
  onCetak: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function SuratKeluarTableRow({
  surat,
  rowNumber,
  onCetak,
  onDelete,
}: SuratKeluarRowProps) {
  const [showActions, setShowActions] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <tr className="group hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-none">
      <td className="px-4 py-3 text-xs text-secondary-text w-12 text-center">
        {rowNumber}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-primary-text">
            {surat.no_surat || "Belum ada nomor"}
          </span>
          <span className="text-xs text-secondary-text">
            Tgl: {formatDate(surat.tanggal)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-primary-text">
        {surat.tweb_surat_format?.nama || surat.nama_surat || "Surat Keterangan"}
      </td>
      <td className="px-4 py-3 text-xs text-secondary-text">
        {surat.nama_non_warga ? (
          <div>
            <div className="font-medium text-primary-text">{surat.nama_non_warga}</div>
            <div className="text-xs">Non-Warga</div>
          </div>
        ) : surat.penduduk ? (
          <div>
            <div className="font-medium text-primary-text">{surat.penduduk.nama}</div>
            <div className="text-xs">{surat.penduduk.nik}</div>
          </div>
        ) : (
          "-"
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          surat.status === 1 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          {surat.status === 1 ? "Tercetak" : "Konsep"}
        </span>
      </td>
      <td className="px-4 py-3 w-10 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="p-1 rounded-md hover:bg-zinc-100 text-secondary-text transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showActions && (
          <div
            ref={actionMenuRef}
            className="absolute right-8 top-0 z-50 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 py-1"
          >
            <button
              onClick={() => {
                onCetak(surat.id!);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-primary-text hover:bg-zinc-50 flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Ulang
            </button>
            <button
              onClick={() => {
                onDelete(surat.id!);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
