import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  FileText
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SuratMasuk } from "@/lib/services/surat";

interface SuratMasukRowProps {
  surat: SuratMasuk;
  rowNumber: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDisposisi: (id: number) => void;
}

export default function SuratMasukTableRow({
  surat,
  rowNumber,
  onEdit,
  onDelete,
  onDisposisi,
}: SuratMasukRowProps) {
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
            {formatDate(surat.tanggal_penerimaan)}
          </span>
          <span className="text-xs text-secondary-text">
            Tgl Surat: {formatDate(surat.tanggal_surat)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-primary-text">
            {surat.nomor_surat}
          </span>
          <span className="text-xs text-secondary-text">
            Kode: {surat.kode_surat}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-primary-text">
        {surat.pengirim}
      </td>
      <td className="px-4 py-3 text-xs text-secondary-text max-w-xs truncate">
        {surat.isi_singkat}
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
                onDisposisi(surat.id!);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-primary-text hover:bg-zinc-50 flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              Disposisi
            </button>
            <button
              onClick={() => {
                onEdit(surat.id!);
                setShowActions(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-primary-text hover:bg-zinc-50 flex items-center gap-2"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
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
