"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, Search, Loader2 } from "lucide-react";
import { Resident } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { InputField } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";

interface ResidentPickerModalProps {
  open: boolean;
  residents?: Resident[];
  onClose: () => void;
  onSelect: (resident: Resident) => void;
  onlyUnassigned?: boolean; // Filters for no_kk
  onlyUnassignedHousehold?: boolean; // Filters for no rumah_tangga_id
}

export default function ResidentPickerModal({
  open,
  residents = [],
  onClose,
  onSelect,
  onlyUnassigned = false,
  onlyUnassignedHousehold = false,
}: ResidentPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localResidents, setLocalResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset search and fetch initial data when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setLocalResidents([]);
      fetchResidents("");
    }
  }, [open]);

  // Determine if we should use server-side fetching (when no residents prop provided)
  const isServerSide = residents.length === 0;

  // Debounced search for server-side mode
  useEffect(() => {
    if (!isServerSide || !open) return;

    // Skip if search term is empty (handled by initial fetch)
    // unless we want to clear results when user clears input manually
    if (!searchTerm.trim() && localResidents.length > 0) {
        // Optional: decide if clearing input should re-fetch all (or unassigned)
        // For now, let's allow re-fetching default list if user clears input
        const timer = setTimeout(() => {
            fetchResidents("");
        }, 500);
        return () => clearTimeout(timer);
    }
    
    if (!searchTerm.trim()) return;

    const timer = setTimeout(() => {
      fetchResidents(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, open, isServerSide]);

  const fetchResidents = async (term: string) => {
    // if (!term.trim()) return; // Removed restriction to allow initial fetch
    
    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("penduduk")
        .select("*")
        .limit(50)
        .order("nama", { ascending: true });

      if (onlyUnassigned) {
        // Filter for NULL or empty string
        query = query.or('no_kk.is.null,no_kk.eq.""');
      }

      if (onlyUnassignedHousehold) {
        query = query.is('rumah_tangga_id', null);
      }

      if (term.trim()) {
        query = query.or(`nama.ilike.%${term}%,nik.ilike.%${term}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching residents:", error);
        return;
      }

      if (data) {
        setLocalResidents(data);
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
        return nik.includes(term) || nama.includes(term);
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

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-border-color animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-color flex items-center justify-between bg-card-bg">
          <div>
            <h3 className="text-sm font-semibold text-primary-text">
              Pilih Penduduk
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
            Cari dan pilih penduduk dari database desa.
          </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-medium text-secondary-text hover:text-primary-text"
          >
            Tutup (Esc)
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 border-b border-border-color bg-body-bg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-secondary-text" />
            </div>
            <InputField
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ketik Nama atau NIK..."
              className="pl-10 bg-card-bg border-border-color focus:ring-primary-text/20"
              autoFocus
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                <Loader2 className="w-4 h-4 text-secondary-text animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto bg-card-bg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-body-bg border-b border-border-color sticky top-0 z-10 backdrop-blur-sm bg-body-bg/90">
              <tr>
                <th className="px-5 py-3 font-medium text-xs text-secondary-text uppercase tracking-wider w-32">
                  NIK
                </th>
                <th className="px-5 py-3 font-medium text-xs text-secondary-text uppercase tracking-wider w-32">
                  No. KK
                </th>
                <th className="px-5 py-3 font-medium text-xs text-secondary-text uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-5 py-3 font-medium text-xs text-secondary-text uppercase tracking-wider w-24">
                  Umur
                </th>
                <th className="px-5 py-3 font-medium text-[11px] text-secondary-text uppercase tracking-wider">
                  Alamat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-secondary-text">
                    {loading ? "Memuat data..." : (searchTerm ? "Tidak ada data penduduk yang cocok." : "Tidak ada data penduduk tersedia.")}
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
                  
                  return (
                    <tr
                      key={resident.nik}
                      className="hover:bg-body-bg cursor-pointer transition-colors group"
                      onClick={() => onSelect(resident)}
                    >
                      <td className="px-5 py-3 text-xs font-medium text-secondary-text font-mono group-hover:text-primary-text transition-colors">
                        {resident.nik}
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-secondary-text font-mono group-hover:text-primary-text transition-colors">
                        {resident.no_kk || "-"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-primary-text">{resident.nama}</span>
                          <span className="text-[10px] text-secondary-text">
                             {resident.tempat_lahir}, {resident.tanggal_lahir}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-secondary-text">
                        {umur} Th
                      </td>
                      <td className="px-5 py-3 text-xs text-secondary-text truncate max-w-[200px]">
                        {alamat}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-5 py-2 border-t border-border-color bg-body-bg text-[10px] text-secondary-text flex justify-between">
            <span>Menampilkan maksimal 50 data</span>
            <span>Tekan Esc untuk menutup</span>
        </div>
      </div>
    </div>
  );
}
