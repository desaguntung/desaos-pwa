"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, Search, Loader2 } from "lucide-react";
import { Resident } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

interface ResidentPickerModalProps {
  open: boolean;
  residents?: Resident[];
  onClose: () => void;
  onSelect: (resident: Resident) => void;
}

export default function ResidentPickerModal({
  open,
  residents = [],
  onClose,
  onSelect,
}: ResidentPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localResidents, setLocalResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine if we should use server-side fetching (when no residents prop provided)
  const isServerSide = residents.length === 0;

  // Initial fetch when modal opens in server-side mode
  useEffect(() => {
    if (open && isServerSide) {
      fetchResidents("");
    }
  }, [open, isServerSide]);

  // Debounced search for server-side mode
  useEffect(() => {
    if (!isServerSide || !open) return;

    const timer = setTimeout(() => {
      fetchResidents(searchTerm);
    }, 500);

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

      if (term) {
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Pilih Penduduk
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5 dark:text-zinc-400">
              Cari dan pilih penduduk dari database desa.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors font-medium dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            Tutup (Esc)
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/30 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ketik Nama atau NIK..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all placeholder:text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-600 dark:placeholder:text-zinc-600"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin dark:text-zinc-500" />
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10 backdrop-blur-sm bg-zinc-50/90 dark:bg-zinc-900/90 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium text-[11px] text-zinc-500 uppercase tracking-wider w-32 dark:text-zinc-400">
                  NIK
                </th>
                <th className="px-5 py-3 font-medium text-[11px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Nama Lengkap
                </th>
                <th className="px-5 py-3 font-medium text-[11px] text-zinc-500 uppercase tracking-wider w-24 dark:text-zinc-400">
                  Umur
                </th>
                <th className="px-5 py-3 font-medium text-[11px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Alamat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {filteredResidents.map((resident) => {
                const umur = calculateAge(resident.tanggal_lahir);
                const alamat =
                  resident.alamat_saat_ini ||
                  resident.alamat_rt ||
                  resident.dusun ||
                  "-";
                
                return (
                  <tr
                    key={resident.nik}
                    className="hover:bg-zinc-50/80 cursor-pointer transition-colors group dark:hover:bg-zinc-800/50"
                    onClick={() => onSelect(resident)}
                  >
                    <td className="px-5 py-3 text-xs font-medium text-zinc-500 font-mono group-hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:group-hover:text-zinc-200">
                      {resident.nik}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{resident.nama}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                           {resident.tempat_lahir}, {resident.tanggal_lahir}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {umur} Th
                        </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500 truncate max-w-[150px] dark:text-zinc-400" title={alamat}>
                        {alamat}
                    </td>
                  </tr>
                );
              })}
              
              {filteredResidents.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                            <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Tidak ditemukan</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Coba kata kunci lain atau tambah data baru.</p>
                    </div>
                  </td>
                </tr>
              )}

              {loading && filteredResidents.length === 0 && (
                 <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-300 dark:text-zinc-600" />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Sedang mencari data...</p>
                        </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center text-[10px] text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500">
          <span>Menampilkan {filteredResidents.length} hasil</span>
          <span>Tekan <kbd className="font-sans px-1 py-0.5 bg-white border border-zinc-200 rounded text-xs text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">Esc</kbd> untuk menutup</span>
        </div>
      </div>
    </div>
  );
}
