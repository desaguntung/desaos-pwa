"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  FilePlus, 
  Edit3, 
  History, 
  Users, 
  Printer, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  X, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Resident } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { formatChunkedNIK, parseChunkedNIK } from "@/lib/utils/formatters";
import VisualAuditTrailModal from "@/components/audit/VisualAuditTrailModal";
import ResidentContextDrawer from "@/components/penduduk/ResidentContextDrawer";

export default function UniversalServiceDesk() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const query = parseChunkedNIK(searchTerm).trim() || searchTerm.trim();
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      try {
        const isNumeric = /^\d+$/.test(query);
        let builder = supabase.from("penduduk").select("*").limit(8);

        if (isNumeric) {
          builder = builder.like("nik", `%${query}%`);
        } else {
          builder = builder.ilike("nama", `%${query}%`);
        }

        const { data, error } = await builder;
        if (!error && data) {
          setResults(data as Resident[]);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedResident(null);
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Header Container */}
      <div className="relative rounded-2xl border border-border-color bg-card-bg/90 shadow-sm p-4 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                Meja Layanan Cepat
              </span>
              <h2 className="text-base font-semibold tracking-tight text-primary-text">
                1 Warga, 1 Layar Selesai
              </h2>
            </div>
            <p className="text-xs text-secondary-text">
              Ketik Nama atau NIK warga untuk memulai pelayanan surat, update biodata, atau verifikasi seketika.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-secondary-text bg-body-bg px-2.5 py-1 rounded-lg border border-border-color">
            <span>Shortcut: Ketik NIK langsung</span>
          </div>
        </div>

        {/* Big Search Input */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-secondary-text pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari warga (Contoh: 3507... atau Siti Aminah)..."
              className="w-full h-13 pl-12 pr-12 rounded-xl bg-body-bg border border-border-color text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all font-medium"
            />
            {loading ? (
              <div className="absolute right-4">
                <Loader2 className="w-5 h-5 animate-spin text-secondary-text" />
              </div>
            ) : searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-4 p-1 rounded-md text-secondary-text hover:text-primary-text hover:bg-hover-bg"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-card-bg border border-border-color rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50 duration-100">
              <div className="p-2 border-b border-border-color text-[11px] font-mono uppercase text-secondary-text tracking-wider bg-hover-bg/40">
                Ditemukan {results.length} Warga
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border-color/60 custom-scrollbar">
                {results.map((r) => (
                  <button
                    key={r.id || r.nik}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="w-full text-left p-3 hover:bg-hover-bg flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-border-color flex items-center justify-center text-primary-text font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {r.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary-text group-hover:underline">
                          {r.nama}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary-text font-mono">
                          <span>{formatChunkedNIK(r.nik)}</span>
                          <span>•</span>
                          <span>{r.dusun || "Dusun -"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-secondary-text font-medium">
                      <span>Pilih Warga</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Resident Profile Hub */}
        {selectedResident && (
          <div className="mt-4 pt-4 border-t border-border-color animate-in slide-in-from-top-2 duration-150">
            <div className="bg-body-bg/80 rounded-xl border border-border-color p-4 sm:p-5 space-y-4">
              {/* Resident Card Top Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                    {selectedResident.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-primary-text tracking-tight">
                        {selectedResident.nama}
                      </h3>
                      <Badge variant="default" className="text-[10px] font-mono">
                        {selectedResident.jenis_kelamin?.toUpperCase().startsWith("L") ? "Laki-laki" : "Perempuan"}
                      </Badge>
                      <Badge variant="default" className="text-[10px] font-mono">
                        {selectedResident.hubungan_keluarga || "Warga"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-text font-mono mt-0.5">
                      <span>NIK: <strong className="text-primary-text">{formatChunkedNIK(selectedResident.nik)}</strong></span>
                      <span>•</span>
                      <span>No. KK: <strong className="text-primary-text">{formatChunkedNIK(selectedResident.no_kk)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-xs text-secondary-text hover:text-primary-text"
                  >
                    Ganti Warga
                  </Button>
                </div>
              </div>

              {/* Resident Quick Bio Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border-color/60 text-xs">
                <div className="bg-card-bg p-2.5 rounded-lg border border-border-color">
                  <span className="text-[10px] uppercase font-mono text-secondary-text block">Wilayah / Dusun</span>
                  <span className="font-semibold text-primary-text truncate block mt-0.5">
                    {selectedResident.dusun || "-"} (RT {selectedResident.alamat_rt || "-"})
                  </span>
                </div>
                <div className="bg-card-bg p-2.5 rounded-lg border border-border-color">
                  <span className="text-[10px] uppercase font-mono text-secondary-text block">Pekerjaan</span>
                  <span className="font-semibold text-primary-text truncate block mt-0.5">
                    {selectedResident.pekerjaan || "-"}
                  </span>
                </div>
                <div className="bg-card-bg p-2.5 rounded-lg border border-border-color">
                  <span className="text-[10px] uppercase font-mono text-secondary-text block">Tempat, Tgl Lahir</span>
                  <span className="font-semibold text-primary-text truncate block mt-0.5">
                    {selectedResident.tempat_lahir || "-"}, {selectedResident.tanggal_lahir || "-"}
                  </span>
                </div>
                <div className="bg-card-bg p-2.5 rounded-lg border border-border-color">
                  <span className="text-[10px] uppercase font-mono text-secondary-text block">Agama / Pendidikan</span>
                  <span className="font-semibold text-primary-text truncate block mt-0.5">
                    {selectedResident.agama || "-"} • {selectedResident.pendidikan_kk || "-"}
                  </span>
                </div>
              </div>

              {/* Rapid Action Buttons (Zero Context Switching) */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/surat/cetak?nik=${selectedResident.nik}`)}
                  className="gap-2 text-xs font-semibold shadow-sm"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>+ Buat Surat Langsung</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContextDrawerOpen(true)}
                  className="gap-2 text-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Lihat Profil & Anggota KK</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/penduduk/edit/${selectedResident.nik}`)}
                  className="gap-2 text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Data Warga</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="gap-2 text-xs text-secondary-text hover:text-primary-text ml-auto"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Jejak Audit & Riwayat</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Audit Trail Modal */}
      {selectedResident && (
        <VisualAuditTrailModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          entityType="PENDUDUK"
          entityId={selectedResident.id || selectedResident.nik}
          entityIdentifier={selectedResident.nik}
          title={`Rekam Jejak Data: ${selectedResident.nama}`}
          subtitle={`NIK: ${formatChunkedNIK(selectedResident.nik)}`}
        />
      )}

      {/* Master-Detail Context Drawer */}
      <ResidentContextDrawer
        resident={selectedResident}
        isOpen={isContextDrawerOpen}
        onClose={() => setIsContextDrawerOpen(false)}
        onEdit={(r) => router.push(`/penduduk/edit/${r.nik}`)}
      />
    </div>
  );
}
