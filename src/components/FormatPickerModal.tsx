"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Search, X, Check } from "lucide-react";
import { FormatSurat, getFormatSurat } from "@/lib/services/surat";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
        try {
          const data = await getFormatSurat();
          if (data) {
            setLocalFormats(data as FormatSurat[]);
          }
        } catch (err) {
          console.error("Error fetching formats:", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card-bg rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-border-color shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-color flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary-text">
                Pilih Jenis Surat
              </h3>
              <p className="text-xs text-secondary-text">
                {activeFormats.length} format template tersedia
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-secondary-text hover:text-primary-text"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border-color bg-body-bg/40">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-secondary-text">
              <Search className="w-4 h-4" />
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari jenis surat atau kode..."
              className="pl-9 bg-card-bg"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {activeFormats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 bg-body-bg rounded-full flex items-center justify-center mb-3 border border-border-color">
                <FileText className="w-6 h-6 text-secondary-text/50" />
              </div>
              <h3 className="text-sm font-medium text-primary-text mb-1">
                Data Format Kosong
              </h3>
              <p className="text-xs text-secondary-text max-w-[260px] mx-auto">
                Belum ada format surat yang tersedia. Silakan tambahkan di menu Pengaturan Surat.
              </p>
            </div>
          ) : filteredFormats.length > 0 ? (
            <div className="grid gap-1.5">
              {filteredFormats.map((format) => (
                <button
                  type="button"
                  key={format.id}
                  onClick={() => onSelect(format)}
                  className="flex items-center gap-3.5 w-full p-3 text-left rounded-xl hover:bg-hover-bg border border-transparent hover:border-border-color transition-all group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-body-bg text-secondary-text flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors border border-border-color">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-primary-text truncate">
                        {format.nama}
                      </span>
                      {format.kode_surat && (
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
                          {format.kode_surat}
                        </Badge>
                      )}
                    </div>
                    {format.url_surat && (
                      <p className="text-xs text-secondary-text truncate mt-0.5 font-mono">
                        Kode Dok: {format.url_surat}
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-body-bg flex items-center justify-center mb-3 border border-border-color">
                <Search className="w-6 h-6 text-secondary-text/50" />
              </div>
              <p className="text-sm font-medium text-primary-text">
                Tidak Ditemukan
              </p>
              <p className="text-xs text-secondary-text mt-1">
                Tidak ada jenis surat yang cocok dengan kata kunci &quot;{searchTerm}&quot;.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-color bg-body-bg/60 flex justify-between items-center text-xs text-secondary-text">
          <span>{filteredFormats.length} format surat tersedia</span>
          <Button 
            type="button"
            variant="outline"
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
