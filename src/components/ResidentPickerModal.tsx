"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, Search, Loader2, X, Copy, Check, User, MapPin } from "lucide-react";
import { Resident, mapResidentFromDb } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ResidentPickerModalProps {
  open: boolean;
  residents?: Resident[];
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSelect: (resident: Resident) => void;
  onlyUnassigned?: boolean; // Filters for no_kk
  onlyUnassignedHousehold?: boolean; // Filters for no rumah_tangga_id
}

export default function ResidentPickerModal({
  open,
  residents = [],
  onClose,
  onOpenChange,
  onSelect,
  onlyUnassigned = false,
  onlyUnassignedHousehold = false,
}: ResidentPickerModalProps) {
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [localResidents, setLocalResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedNik, setCopiedNik] = useState<string | null>(null);

  // Reset search and fetch initial data when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setLocalResidents([]);
      fetchResidents("");
    }
  }, [open]);

  const isServerSide = residents.length === 0;

  // Debounced search for server-side mode
  useEffect(() => {
    if (!isServerSide || !open) return;

    if (!searchTerm.trim() && localResidents.length > 0) {
        const timer = setTimeout(() => {
            fetchResidents("");
        }, 400);
        return () => clearTimeout(timer);
    }
    
    if (!searchTerm.trim()) return;

    const timer = setTimeout(() => {
      fetchResidents(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, open, isServerSide]);

  const fetchResidents = async (term: string) => {
    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("penduduk")
        .select("*")
        .limit(50)
        .order("nama", { ascending: true });

      if (onlyUnassigned) {
        query = query.or('no_kk.is.null,no_kk.eq.""');
      }

      if (onlyUnassignedHousehold) {
        query = query.is('rumah_tangga_id', null);
      }

      if (term.trim()) {
        query = query.or(`nama.ilike.%${term}%,nik.ilike.%${term}%,no_kk.ilike.%${term}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching residents:", error);
        return;
      }

      if (data) {
        setLocalResidents((data || []).map(mapResidentFromDb));
      }
    } catch (error) {
      console.error("Error in fetchResidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = useMemo(() => {
    if (isServerSide) {
      return localResidents;
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return residents.slice(0, 50);
    }
    return residents
      .filter((resident) => {
        const nik = resident.nik?.toLowerCase() ?? "";
        const nama = resident.nama?.toLowerCase() ?? "";
        const kk = resident.no_kk?.toLowerCase() ?? "";
        return nik.includes(term) || nama.includes(term) || kk.includes(term);
      })
      .slice(0, 50);
  }, [residents, searchTerm, localResidents, isServerSide]);

  const calculateAge = (dobString?: string) => {
    if (!dobString) return "-";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return "-";
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970).toString();
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedNik(text);
    setTimeout(() => setCopiedNik(null), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border-color animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-card-bg/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-text flex items-center gap-2">
                Pilih Data Penduduk (Pemohon)
              </h3>
              <p className="text-xs text-secondary-text">
                Cari warga berdasarkan Nama Lengkap, NIK (16 digit), atau Nomor Kartu Keluarga.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-secondary-text hover:text-primary-text rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3.5 border-b border-border-color bg-body-bg/40">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-secondary-text">
              <Search className="w-4 h-4" />
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik Nama Lengkap, NIK, atau No. Kartu Keluarga..."
              className="pl-10 h-10 bg-card-bg border-border-color focus:border-accent"
              autoFocus
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto bg-card-bg custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-body-bg/80 border-b border-border-color sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">
                  Data Identitas Pemohon
                </th>
                <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider w-40">
                  Nomor KK
                </th>
                <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider w-24 text-center">
                  Umur
                </th>
                <th className="px-6 py-3 font-semibold text-xs text-secondary-text uppercase tracking-wider">
                  Alamat Domisili
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-secondary-text">
                    <div className="w-12 h-12 rounded-2xl bg-body-bg flex items-center justify-center mx-auto mb-3 border border-border-color">
                      <Users className="w-6 h-6 text-secondary-text/40" />
                    </div>
                    <p className="text-sm font-semibold text-primary-text">
                      {loading ? "Memuat data penduduk..." : (searchTerm ? "Tidak ada penduduk yang cocok." : "Belum ada data penduduk.")}
                    </p>
                    <p className="text-xs text-secondary-text mt-1">
                      {searchTerm ? `Pencarian "${searchTerm}" tidak menemukan hasil di database.` : "Data kependudukan belum tersedia."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => {
                  const umur = calculateAge(resident.tanggal_lahir);
                  const alamat =
                    resident.alamat_saat_ini ||
                    resident.alamat_rt ||
                    resident.dusun ||
                    "-";
                  
                  const initials = resident.nama
                    ? resident.nama.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                    : "W";

                  return (
                    <tr
                      key={resident.id || resident.nik}
                      className="hover:bg-body-bg/60 cursor-pointer transition-all group"
                      onClick={() => onSelect(resident)}
                    >
                      {/* Name & NIK */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent font-bold text-xs flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-primary-text truncate group-hover:text-accent transition-colors">
                              {resident.nama}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-secondary-text">
                                {resident.nik}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => copyToClipboard(resident.nik, e)}
                                title="Salin NIK"
                                className="p-0.5 text-secondary-text hover:text-primary-text rounded transition-colors"
                              >
                                {copiedNik === resident.nik ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* No KK */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-secondary-text">
                          {resident.no_kk || "-"}
                        </span>
                      </td>

                      {/* Umur */}
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant="outline" className="text-[10px] font-medium bg-body-bg text-secondary-text border-border-color">
                          {umur} Th
                        </Badge>
                      </td>

                      {/* Alamat */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-start gap-1.5 text-xs text-secondary-text">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-secondary-text/60" />
                          <span className="truncate max-w-xs">{alamat}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border-color bg-body-bg/60 flex justify-between items-center text-xs text-secondary-text">
          <span className="font-medium">
            Menampilkan maksimal 50 data penduduk tercepat
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
