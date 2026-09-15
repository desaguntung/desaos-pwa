"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Search, X, Check } from "lucide-react";
import { FormatSurat } from "@/lib/services/surat";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { InputField } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";

interface FormatPickerModalProps {
  open: boolean;
  formats?: FormatSurat[];
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSelect: (format: FormatSurat) => void;
}

export default function FormatPickerModal({
  open,
  formats: initialFormats,
  onClose,
  onOpenChange,
  onSelect,
}: FormatPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localFormats, setLocalFormats] = useState<FormatSurat[]>([]);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  useEffect(() => {
    if (open && !initialFormats) {
      const fetchFormats = async () => {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("surat_formats")
          .select("*")
          .order("nama", { ascending: true });
        if (data) {
          setLocalFormats(data as FormatSurat[]);
        }
      };
      fetchFormats();
    }
  }, [open, initialFormats]);

  const activeFormats = initialFormats || localFormats;

  const filteredFormats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return activeFormats;
    
    return activeFormats.filter((format) => {
      const nama = format.nama?.toLowerCase() ?? "";
      const kode = format.kode_surat?.toLowerCase() ?? "";
      return nama.includes(term) || kode.includes(term);
    });
  }, [activeFormats, searchTerm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-zinc-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">
              Pilih Jenis Surat <span className="text-zinc-400 font-normal">({activeFormats.length})</span>
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-zinc-400" />
            </div>
            <InputField
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari jenis surat..."
              className="pl-9 bg-white"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeFormats.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3 border border-zinc-100">
                <FileText className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900 mb-1">
                Data Kosong
              </h3>
              <p className="text-xs text-zinc-500 max-w-[250px] mx-auto">
                Belum ada format surat yang tersedia. Silakan tambahkan di menu Pengaturan Surat.
              </p>
            </div>
          ) : filteredFormats.length > 0 ? (
            <div className="grid gap-1">
              {filteredFormats.map((format) => (
                <button
                  type="button"
                  key={format.id}
                  onClick={() => onSelect(format)}
                  className="flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-zinc-900 truncate">
                        {format.nama}
                      </span>
                      {format.kode_surat && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-mono">
                          {format.kode_surat}
                        </span>
                      )}
                    </div>
                    {format.url_surat && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        Kode: {format.url_surat}
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-4 h-4 text-zinc-900" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-900">
                Tidak ditemukan
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Tidak ada jenis surat yang cocok dengan pencarian Anda.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-between items-center text-xs text-zinc-500">
          <span>{filteredFormats.length} jenis surat tersedia</span>
          <Button 
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
          >
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
}
