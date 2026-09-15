"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Search, X, Check, Sparkles, Folder, Layers, ArrowRight } from "lucide-react";
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

const CATEGORIES = [
  { id: "all", label: "Semua Format" },
  { id: "keterangan", label: "Surat Keterangan" },
  { id: "izin", label: "Izin & Kuasa" },
  { id: "nikah", label: "Pernikahan & Keluarga" },
  { id: "pertanahan", label: "Tanah & Usaha" },
  { id: "dinas", label: "Kedinasan & SPPD" },
];

export default function FormatPickerModal({
  open,
  formats: initialFormats,
  onClose,
  onOpenChange,
  onSelect,
}: FormatPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    let result = activeFormats;

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter((format) => {
        const url = (format.url_surat || "").toLowerCase();
        const nama = (format.nama || "").toLowerCase();
        if (selectedCategory === "keterangan") {
          return url.includes("ket_") || nama.includes("keterangan");
        }
        if (selectedCategory === "izin") {
          return url.includes("izin") || url.includes("kuasa") || nama.includes("izin") || nama.includes("kuasa");
        }
        if (selectedCategory === "nikah") {
          return url.includes("nikah") || url.includes("keluarga") || url.includes("kk") || url.includes("cerai") || url.includes("rujuk") || url.includes("wali");
        }
        if (selectedCategory === "pertanahan") {
          return url.includes("tanah") || url.includes("sporadik") || url.includes("usaha") || url.includes("jual_beli") || url.includes("kendaraan");
        }
        if (selectedCategory === "dinas") {
          return url.includes("dinas") || url.includes("jalan") || url.includes("pas_lintas") || url.includes("perintah");
        }
        return true;
      });
    }

    // Filter by Search Term
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((format) => {
        const nama = format.nama?.toLowerCase() ?? "";
        const kode = format.kode_surat?.toLowerCase() ?? "";
        const url = format.url_surat?.toLowerCase() ?? "";
        return nama.includes(term) || kode.includes(term) || url.includes(term);
      });
    }
    
    return result;
  }, [activeFormats, selectedCategory, searchTerm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-border-color shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-card-bg/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-text flex items-center gap-2">
                Pilih Format Dokumen Resmi
                <Badge variant="default" className="text-[10px] font-medium bg-body-bg text-secondary-text border-border-color">
                  46 Format Standar
                </Badge>
              </h3>
              <p className="text-xs text-secondary-text">
                Pilih format surat baku yang telah tersinkronisasi dengan database desa.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-secondary-text hover:text-primary-text rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 border-b border-border-color bg-body-bg/40 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-secondary-text">
              <Search className="w-4 h-4" />
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari format surat, kode klasifikasi (contoh: 470, SKCK, Usaha, Domisili)..."
              className="pl-10 h-10 bg-card-bg border-border-color focus:border-accent"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-text hover:text-primary-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-accent text-white shadow-xs"
                    : "bg-card-bg text-secondary-text hover:text-primary-text hover:bg-hover-bg border border-border-color"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format List Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-card-bg">
          {activeFormats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 bg-body-bg rounded-2xl flex items-center justify-center mb-3 border border-border-color">
                <FileText className="w-7 h-7 text-secondary-text/40" />
              </div>
              <h3 className="text-sm font-medium text-primary-text mb-1">
                Data Format Belum Tersedia
              </h3>
              <p className="text-xs text-secondary-text max-w-[280px] mx-auto">
                Silakan periksa koneksi database atau jalankan seeder template surat.
              </p>
            </div>
          ) : filteredFormats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredFormats.map((format) => (
                <button
                  type="button"
                  key={format.id}
                  onClick={() => onSelect(format)}
                  className="flex items-start gap-3 w-full p-3.5 text-left rounded-xl bg-card-bg hover:bg-body-bg border border-border-color hover:border-accent/40 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-body-bg text-secondary-text flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors border border-border-color mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="font-semibold text-xs text-primary-text truncate group-hover:text-accent transition-colors">
                        {format.nama}
                      </span>
                      {format.kode_surat && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-body-bg text-secondary-text border border-border-color shrink-0">
                          {format.kode_surat}
                        </span>
                      )}
                    </div>
                    {format.url_surat && (
                      <p className="text-[11px] text-secondary-text truncate font-mono">
                        {format.url_surat}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-[10px] text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <span>Pilih Format Ini</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-body-bg flex items-center justify-center mb-3 border border-border-color">
                <Search className="w-7 h-7 text-secondary-text/40" />
              </div>
              <p className="text-sm font-semibold text-primary-text">
                Format Tidak Ditemukan
              </p>
              <p className="text-xs text-secondary-text mt-1 max-w-sm">
                Tidak ada format surat yang cocok dengan kata kunci &quot;{searchTerm}&quot;. Coba cari dengan kata kunci lain.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border-color bg-body-bg/60 flex justify-between items-center text-xs text-secondary-text">
          <span className="font-medium">
            Menampilkan <span className="text-primary-text font-semibold">{filteredFormats.length}</span> dari {activeFormats.length} format surat
          </span>
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="rounded-lg"
          >
            Tutup (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
}
