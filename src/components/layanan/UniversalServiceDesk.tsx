"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  FileText, 
  Pencil, 
  Users, 
  X, 
  ArrowRight,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Resident, mapResidentFromDb } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { formatChunkedNIK } from "@/lib/utils/formatters";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search with support for NIK, No KK, and Nama
  useEffect(() => {
    const cleanRaw = searchTerm.trim();
    const cleanDigits = cleanRaw.replace(/\D/g, "");

    if (cleanRaw.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      try {
        let builder = supabase.from("penduduk").select("*").limit(10);

        if (cleanDigits.length >= 2) {
          builder = builder.or(`nik.ilike.%${cleanDigits}%,no_kk.ilike.%${cleanDigits}%,nama.ilike.%${cleanRaw}%`);
        } else {
          builder = builder.ilike("nama", `%${cleanRaw}%`);
        }

        const { data, error } = await builder;
        if (!error && data) {
          const mapped = data.map(mapResidentFromDb);
          setResults(mapped);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

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
      {/* Search Bar Container */}
      <div className="relative rounded-xl border border-border-color bg-card-bg p-3 sm:p-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-secondary-text pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari NIK, Nomor KK, atau nama warga..."
            className="w-full h-11 pl-10 pr-10 rounded-lg bg-body-bg border border-border-color text-sm text-primary-text placeholder:text-secondary-text focus:border-primary-text transition-colors"
          />
          {loading ? (
            <div className="absolute right-3.5">
              <Loader2 className="w-4 h-4 animate-spin text-secondary-text" />
            </div>
          ) : searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3.5 p-1 rounded text-secondary-text hover:text-primary-text hover:bg-hover-bg"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && results.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card-bg border border-border-color rounded-xl overflow-hidden divide-y divide-border-color"
          >
            <div className="p-2 bg-body-bg text-[11px] font-mono text-secondary-text">
              Ditemukan {results.length} data warga
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border-color">
              {results.map((r) => (
                <div
                  key={r.id || r.nik}
                  onClick={() => handleSelect(r)}
                  className="p-3 hover:bg-hover-bg cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-body-bg border border-border-color text-primary-text font-bold text-xs flex items-center justify-center shrink-0">
                      {r.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary-text truncate text-sm">
                        {r.nama}
                      </p>
                      <div className="flex items-center gap-2 text-secondary-text text-[11px] font-mono">
                        <span>NIK: {formatChunkedNIK(r.nik)}</span>
                        {r.dusun && <span>• {r.dusun}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-secondary-text font-medium">
                      {r.hubungan_keluarga || "Warga"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-secondary-text opacity-70" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Resident Profile Hub */}
        {selectedResident && (
          <div className="mt-3 pt-3 border-t border-border-color">
            <div className="bg-body-bg rounded-lg border border-border-color p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-card-bg border border-border-color text-primary-text font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedResident.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-primary-text">
                        {selectedResident.nama}
                      </h3>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                        {selectedResident.jenis_kelamin?.toUpperCase().startsWith("L") ? "Laki-laki" : "Perempuan"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                        {selectedResident.hubungan_keluarga || "Warga"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text font-mono mt-0.5">
                      <span>NIK: <strong className="text-primary-text">{formatChunkedNIK(selectedResident.nik)}</strong></span>
                      {selectedResident.no_kk && (
                        <>
                          <span>•</span>
                          <span>No. KK: <strong className="text-primary-text">{formatChunkedNIK(selectedResident.no_kk)}</strong></span>
                        </>
                      )}
                      {selectedResident.dusun && (
                        <>
                          <span>•</span>
                          <span>{selectedResident.dusun}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/surat/cetak?nik=${selectedResident.nik}`)}
                    className="gap-1.5 text-xs font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Terbitkan Surat</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsContextDrawerOpen(true)}
                    className="gap-1.5 text-xs font-medium"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Detail Warga</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAuditModalOpen(true)}
                    className="text-xs"
                    title="Jejak Audit"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-secondary-text hover:text-primary-text text-xs"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Drawer & Audit Modal */}
      {selectedResident && (
        <>
          <ResidentContextDrawer
            isOpen={isContextDrawerOpen}
            onClose={() => setIsContextDrawerOpen(false)}
            resident={selectedResident}
            onSelectResident={(r) => setSelectedResident(r)}
            onEdit={(r) => router.push(`/penduduk/edit/${r.nik}`)}
          />

          <VisualAuditTrailModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
            entityType="PENDUDUK"
            entityId={selectedResident.id || selectedResident.nik}
            entityIdentifier={selectedResident.nik}
            title={`Jejak Audit: ${selectedResident.nama}`}
            subtitle={`NIK: ${formatChunkedNIK(selectedResident.nik)}`}
          />
        </>
      )}
    </div>
  );
}
