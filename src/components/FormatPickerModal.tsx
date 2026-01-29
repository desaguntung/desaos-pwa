"use client";

import { useState, useMemo } from "react";
import { FileText, Search, X, Check } from "lucide-react";
import { FormatSurat } from "@/lib/services/surat";

interface FormatPickerModalProps {
  open: boolean;
  formats: FormatSurat[];
  onClose: () => void;
  onSelect: (format: FormatSurat) => void;
}

export default function FormatPickerModal({
  open,
  formats,
  onClose,
  onSelect,
}: FormatPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFormats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return formats;
    
    return formats.filter((format) => {
      const nama = format.nama?.toLowerCase() ?? "";
      const kode = format.kode_surat?.toLowerCase() ?? "";
      return nama.includes(term) || kode.includes(term);
    });
  }, [formats, searchTerm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-zinc-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">
              Pilih Jenis Surat <span className="text-zinc-400 font-normal">({formats.length})</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari jenis surat..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {formats.length === 0 ? (
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-mono">
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
          <button 
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md shadow-xs hover:bg-zinc-50 font-medium text-zinc-700 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
