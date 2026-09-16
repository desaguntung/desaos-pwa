"use client";

import { useEffect, useState, useMemo } from "react";
import { Resident, getPekerjaanList, getAgamaList, getPendidikanList, getResidents, getDusunList, formatDusunName, normalizeDusunKey } from "@/lib/services/penduduk";
import { Check, ChevronRight, Menu, X, Search, MapPin, User, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";


import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/Sheet";

import { ModernChartContainer } from "@/components/charts/ModernChartContainer";

// --- Types & Constants ---

type StatCategory =
  | "Statistik Penduduk"
  | "Rentang Umur"
  | "Kategori Umur"
  | "Pendidikan Dalam KK"
  | "Pendidikan Sedang Ditempuh"
  | "Pekerjaan"
  | "Status Perkawinan"
  | "Agama"
  | "Jenis Kelamin"
  | "Hubungan Dalam KK"
  | "Warga Negara"
  | "Status Penduduk"
  | "Golongan Darah"
  | "Penyandang Cacat"
  | "Penyakit Menahun"
  | "Akseptor KB"
  | "Akta Kelahiran"
  | "Kepemilikan KTP"
  | "Asuransi Kesehatan"
  | "Suku / Etnis"
  | "BPJS Ketenagakerjaan"
  | "Status Kehamilan"
  | "Kepemilikan KIA"
  | "Kepemilikan Akta Kematian";

const STAT_CATEGORIES: StatCategory[] = [
  "Statistik Penduduk",
  "Rentang Umur",
  "Kategori Umur",
  "Pendidikan Dalam KK",
  "Pendidikan Sedang Ditempuh",
  "Pekerjaan",
  "Status Perkawinan",
  "Agama",
  "Jenis Kelamin",
  "Hubungan Dalam KK",
  "Warga Negara",
  "Status Penduduk",
  "Golongan Darah",
  "Penyandang Cacat",
  "Penyakit Menahun",
  "Akseptor KB",
  "Akta Kelahiran",
  "Kepemilikan KTP",
  "Asuransi Kesehatan",
  "Suku / Etnis",
  "BPJS Ketenagakerjaan",
  "Status Kehamilan",
  "Kepemilikan KIA",
  "Kepemilikan Akta Kematian",
];

interface StatRow {
  id: string | number;
  label: string;
  key: string; // Added key for filtering
  total: number;
  totalPercent: number;
  male: number;
  malePercent: number;
  female: number;
  femalePercent: number;
}

// --- Helper Functions ---

const calculateAge = (birthDateStr?: string) => {
  if (!birthDateStr) return -1;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const normalizeGender = (gender?: string): "L" | "P" | "UNKNOWN" => {
    if (!gender) return "UNKNOWN";
    const g = gender.trim().toUpperCase();
    if (g === "L" || g.startsWith("LAKI")) return "L";
    if (g === "P" || g.startsWith("PEREM")) return "P";
    return "UNKNOWN";
};

const getResidentCategoryData = (r: Resident, category: StatCategory): { key: string; label: string } | null => {
    const gender = normalizeGender(r.jenis_kelamin);
    const age = calculateAge(r.tanggal_lahir);

    switch (category) {
        case "Statistik Penduduk": 
            return { key: normalizeDusunKey(r.dusun), label: formatDusunName(r.dusun) };
        case "Status Penduduk":
            return { key: r.status_penduduk || "Tidak Diketahui", label: r.status_penduduk || "Tidak Diketahui" };
        case "Rentang Umur":
            if (age === -1) return { key: "unknown", label: "Tidak Diketahui" };
            if (age <= 1) return { key: "0-1", label: "0 s/d 1 Tahun" };
            if (age <= 4) return { key: "2-4", label: "2 s/d 4 Tahun" };
            if (age <= 9) return { key: "5-9", label: "5 s/d 9 Tahun" };
            if (age <= 14) return { key: "10-14", label: "10 s/d 14 Tahun" };
            if (age <= 19) return { key: "15-19", label: "15 s/d 19 Tahun" };
            if (age <= 24) return { key: "20-24", label: "20 s/d 24 Tahun" };
            if (age <= 29) return { key: "25-29", label: "25 s/d 29 Tahun" };
            if (age <= 34) return { key: "30-34", label: "30 s/d 34 Tahun" };
            if (age <= 39) return { key: "35-39", label: "35 s/d 39 Tahun" };
            if (age <= 44) return { key: "40-44", label: "40 s/d 44 Tahun" };
            if (age <= 49) return { key: "45-49", label: "45 s/d 49 Tahun" };
            if (age <= 54) return { key: "50-54", label: "50 s/d 54 Tahun" };
            if (age <= 59) return { key: "55-59", label: "55 s/d 59 Tahun" };
            if (age <= 64) return { key: "60-64", label: "60 s/d 64 Tahun" };
            if (age <= 69) return { key: "65-69", label: "65 s/d 69 Tahun" };
            if (age <= 74) return { key: "70-74", label: "70 s/d 74 Tahun" };
            return { key: "75+", label: "75 Tahun Ke Atas" };
        case "Kategori Umur":
            if (age === -1) return { key: "unknown", label: "Tidak Diketahui" };
            if (age < 5) return { key: "balita", label: "Balita (0-4 Tahun)" };
            if (age < 12) return { key: "anak", label: "Anak-anak (5-11 Tahun)" };
            if (age < 17) return { key: "remaja_awal", label: "Remaja Awal (12-16 Tahun)" };
            if (age < 26) return { key: "remaja_akhir", label: "Remaja Akhir (17-25 Tahun)" };
            if (age < 46) return { key: "dewasa_awal", label: "Dewasa Awal (26-45 Tahun)" };
            if (age < 66) return { key: "dewasa_akhir", label: "Dewasa Akhir (46-65 Tahun)" };
            return { key: "lansia", label: "Lansia (65+ Tahun)" };
        case "Pendidikan Dalam KK":
            return { key: r.pendidikan_kk || "TIDAK DIKETAHUI", label: r.pendidikan_kk || "TIDAK DIKETAHUI" };
        case "Pendidikan Sedang Ditempuh":
            return { key: r.pendidikan_saat_ini || "TIDAK / BELUM SEKOLAH", label: r.pendidikan_saat_ini || "TIDAK / BELUM SEKOLAH" };
        case "Pekerjaan":
            const jobRaw = r.pekerjaan?.trim().toUpperCase();
            if (!jobRaw || jobRaw === "" || jobRaw === "-") {
                 return { key: "TIDAK DIKETAHUI", label: "TIDAK DIKETAHUI" };
            }
            return { key: jobRaw, label: jobRaw };
        case "Status Perkawinan":
            return { key: r.status_kawin || "TIDAK DIKETAHUI", label: r.status_kawin || "TIDAK DIKETAHUI" };
        case "Agama":
            return { key: r.agama || "TIDAK DIKETAHUI", label: r.agama || "TIDAK DIKETAHUI" };
        case "Jenis Kelamin":
            return { key: gender, label: gender === "L" ? "LAKI-LAKI" : gender === "P" ? "PEREMPUAN" : "TIDAK DIKETAHUI" };
        case "Hubungan Dalam KK":
            return { key: r.hubungan_keluarga || "TIDAK DIKETAHUI", label: r.hubungan_keluarga || "TIDAK DIKETAHUI" };
        case "Warga Negara":
            return { key: r.kewarganegaraan || "WNI", label: r.kewarganegaraan || "WNI" };
        case "Golongan Darah":
            return { key: r.golongan_darah || "TIDAK TAHU", label: r.golongan_darah || "TIDAK TAHU" };
        case "Penyandang Cacat":
            if (r.cacat_fisik_mental && r.cacat_fisik_mental !== "TIDAK CACAT") {
                return { key: r.cacat_fisik_mental, label: r.cacat_fisik_mental };
            }
            return { key: "TIDAK CACAT", label: "TIDAK CACAT" };
        case "Penyakit Menahun":
            if (r.sakit_menahun && r.sakit_menahun !== "TIDAK ADA") {
                return { key: r.sakit_menahun, label: r.sakit_menahun };
            }
            return { key: "TIDAK SAKIT", label: "TIDAK SAKIT" };
        case "Akseptor KB":
            if (r.akseptor_kb && r.akseptor_kb !== "TIDAK MENGGUNAKAN") {
                return { key: r.akseptor_kb, label: r.akseptor_kb };
            }
            return { key: "TIDAK MENGGUNAKAN", label: "TIDAK MENGGUNAKAN KB" };
        case "Akta Kelahiran":
            const punyaAkta = r.akta_kelahiran_nomor || r.scan_akta_lahir_url ? "MEMILIKI" : "TIDAK MEMILIKI";
            return { key: punyaAkta, label: punyaAkta };
        case "Kepemilikan KTP":
            const ktpStatus = r.identitas_elektronik === "KTP-EL" || r.status_rekam === "SUDAH REKAM" ? "SUDAH REKAM/MEMILIKI" : "BELUM REKAM";
            return { key: ktpStatus, label: ktpStatus };
        case "Asuransi Kesehatan":
            const asuransi = r.kepesertaan_asuransi && r.kepesertaan_asuransi !== "TIDAK MEMILIKI" ? r.kepesertaan_asuransi : "TIDAK MEMILIKI";
            return { key: asuransi, label: asuransi };
        case "Suku / Etnis":
            return { key: r.suku_etnis || "TIDAK DIKETAHUI", label: r.suku_etnis || "TIDAK DIKETAHUI" };
        case "BPJS Ketenagakerjaan":
            const bpjsTk = r.nomor_bpjs_ketenagakerjaan ? "MEMILIKI" : "TIDAK MEMILIKI";
            return { key: bpjsTk, label: bpjsTk };
        case "Status Kehamilan":
            if (gender === "P") {
                const hamil = r.status_kehamilan === "HAMIL" ? "HAMIL" : "TIDAK HAMIL";
                return { key: hamil, label: hamil };
            }
            return null; // Skip for male
        case "Kepemilikan KIA":
            if (age < 17) {
                const kia = r.identitas_elektronik === "KIA" ? "MEMILIKI KIA" : "TIDAK MEMILIKI KIA";
                return { key: kia, label: kia };
            }
            return null; // Skip for adults
        case "Kepemilikan Akta Kematian":
            if (r.status_penduduk === "Meninggal") {
                return { key: "MENINGGAL", label: "Penduduk Meninggal" };
            }
            return null;
    }
    return { key: "unknown", label: "Lainnya" };
};

const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

// --- Components ---

const SectionContainer = ({ 
  id, 
  title, 
  description, 
  children, 
  sectionRef 
}: { 
  id: string; 
  title: string; 
  description?: string; 
  children: React.ReactNode;
  sectionRef: (el: HTMLDivElement | null) => void;
}) => (
  <div 
    id={id} 
    ref={sectionRef} 
    className="scroll-mt-6 bg-card-bg border border-border-color rounded-lg p-4 md:p-6 mb-6 shadow-sm"
  >
    <div className="mb-4 md:mb-6 border-b border-border-color pb-4 flex justify-between items-center">
      <div>
          <h3 className="text-lg font-semibold text-primary-text">{title}</h3>
          {description && <p className="text-sm text-secondary-text mt-1">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const COLORS = ['var(--info-text)', '--error-text', '--success-text', '--warning-text', '--secondary-text', '--primary-text', '--info-text', '--error-text'];

function StatContent({ 
    category, 
    residents, 
    pekerjaanOptions,
    dusunOptions
}: { 
    category: StatCategory; 
    residents: Resident[]; 
    pekerjaanOptions: string[];
    dusunOptions: string[];
}) {
    const [selectedDetail, setSelectedDetail] = useState<{ title: string; residents: Resident[] } | null>(null);
    const [detailSearch, setDetailSearch] = useState("");

    // Filter detail residents based on search
    const filteredDetailResidents = useMemo(() => {
        if (!selectedDetail) return [];
        if (!detailSearch.trim()) return selectedDetail.residents;
        
        const search = detailSearch.toLowerCase();
        return selectedDetail.residents.filter(r => 
            r.nama.toLowerCase().includes(search) || 
            r.nik.includes(search) ||
            (r.alamat_saat_ini || r.alamat_rt || "").toLowerCase().includes(search)
        );
    }, [selectedDetail, detailSearch]);

    // Reset search when detail opens/closes
    useEffect(() => {
        if (!selectedDetail) setDetailSearch("");
    }, [selectedDetail]);

    const data: StatRow[] = useMemo(() => {
        if (!residents.length) return [];
        
        const rows: Record<string, { label: string; male: number; female: number; key: string }> = {};

        const add = (key: string, label: string, gender: "L" | "P" | "UNKNOWN") => {
            if (!rows[key]) rows[key] = { label, male: 0, female: 0, key };
            if (gender === "L") rows[key].male++;
            else if (gender === "P") rows[key].female++;
        };

        const livingResidents = residents.filter(r => 
            !["Meninggal", "Pindah", "MENINGGAL", "PINDAH"].includes(r.status_penduduk?.toUpperCase() || "")
        );

        const targetResidents = 
            category === "Kepemilikan Akta Kematian" 
                ? residents.filter(r => ["Meninggal", "MENINGGAL"].includes(r.status_penduduk?.toUpperCase() || ""))
                : category === "Status Penduduk"
                ? residents
                : livingResidents;

        const totalCount = targetResidents.length;
        const totalMaleCount = targetResidents.filter(r => normalizeGender(r.jenis_kelamin) === "L").length;
        const totalFemaleCount = targetResidents.filter(r => normalizeGender(r.jenis_kelamin) === "P").length;

        // If Category is Pekerjaan, we ignore the standard list and discover from data
        // This follows user instruction: "berpedoman pada data kependudukan"
        // const isPekerjaan = category === "Pekerjaan";
        
        targetResidents.forEach((r) => {
            const gender = normalizeGender(r.jenis_kelamin);
            
            const catData = getResidentCategoryData(r, category);

            if (catData) {
                add(catData.key, catData.label, gender);
            }
        });

        // Add pre-filled 0 counts for certain categories like Pekerjaan if needed
        // SKIPPED for Pekerjaan to avoid cluttering with unused standard options
        
        // Add pre-filled 0 counts for Dusun if needed
        if (category === "Statistik Penduduk" && dusunOptions.length > 0) {
            dusunOptions.forEach(dusun => {
                 const key = normalizeDusunKey(dusun);
                 const label = formatDusunName(dusun);
                 if (!rows[key]) rows[key] = { label, male: 0, female: 0, key };
            });
        }

        const result = Object.entries(rows).map(([key, val], index) => {
            const total = val.male + val.female;
            return {
                id: index + 1,
                label: val.label,
                key: val.key,
                total,
                totalPercent: totalCount > 0 ? (total / totalCount) * 100 : 0,
                male: val.male,
                malePercent: totalMaleCount > 0 ? (val.male / totalMaleCount) * 100 : 0,
                female: val.female,
                femalePercent: totalFemaleCount > 0 ? (val.female / totalFemaleCount) * 100 : 0,
            };
        });

        if (category === "Rentang Umur") {
            const order = ["0-1", "2-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75+"];
            return result.sort((a, b) => {
                 const indexA = order.indexOf(a.key); 
                 const indexB = order.indexOf(b.key);
                 if (indexA === -1) return 1;
                 if (indexB === -1) return -1;
                 return indexA - indexB;
            });
        }
        
        // Sort by DB Order for Dusun
        if (category === "Statistik Penduduk" && dusunOptions.length > 0) {
             const orderMap = new Map<string, number>();
             dusunOptions.forEach((d, idx) => {
                 orderMap.set(normalizeDusunKey(d), idx);
             });
             return result.sort((a, b) => {
                 const idxA = orderMap.has(a.key) ? orderMap.get(a.key)! : 999;
                 const idxB = orderMap.has(b.key) ? orderMap.get(b.key)! : 999;
                 if (idxA !== idxB) return idxA - idxB;
                 return a.label.localeCompare(b.label, undefined, { numeric: true });
             });
        }

        // Sort by DB Order for Pekerjaan
        if (category === "Pekerjaan" && pekerjaanOptions.length > 0) {
             return result.sort((a, b) => {
                 const idxA = pekerjaanOptions.indexOf(a.key);
                 const idxB = pekerjaanOptions.indexOf(b.key);
                 if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                 if (idxA === -1) return 1;
                 if (idxB === -1) return -1;
                 return 0;
             });
        }

        return result.sort((a, b) => b.total - a.total);
    }, [residents, category, pekerjaanOptions, dusunOptions]);

    const handleRowClick = (rowKey: string, rowLabel: string, genderFilter?: "L" | "P") => {
         const livingResidents = residents.filter(r => 
            !["Meninggal", "Pindah", "MENINGGAL", "PINDAH"].includes(r.status_penduduk?.toUpperCase() || "")
        );
        const targetResidents = 
            category === "Kepemilikan Akta Kematian" 
                ? residents.filter(r => ["Meninggal", "MENINGGAL"].includes(r.status_penduduk?.toUpperCase() || ""))
                : category === "Status Penduduk"
                ? residents
                : livingResidents;
        
        const filtered = targetResidents.filter(r => {
            const catData = getResidentCategoryData(r, category);
            if (!catData) return false;
            if (catData.key !== rowKey) return false;
            
            if (genderFilter) {
                const g = r.jenis_kelamin?.toUpperCase() || "";
                if (genderFilter === "L" && !g.startsWith("L")) return false;
                if (genderFilter === "P" && !g.startsWith("P")) return false;
            }
            return true;
        });

        const genderTitle = genderFilter ? (genderFilter === "L" ? "Laki-laki" : "Perempuan") : "Total";
        setSelectedDetail({
            title: `${category} - ${rowLabel} (${genderTitle})`,
            residents: filtered
        });
    };

    return (
        <div className="space-y-6">
            <ModernChartContainer data={data} category={category} />

            <div className="overflow-x-auto rounded-xl border border-border-color shadow-sm bg-card-bg">
                <table className="w-full text-xs text-left">
                    <thead className="bg-body-bg/50 text-secondary-text font-medium border-b border-border-color">
                        <tr>
                            <th className="px-2 py-2 md:px-4 md:py-3 w-8 md:w-12 font-normal">No</th>
                            <th className="px-2 py-2 md:px-4 md:py-3 font-normal">Kategori</th>
                            <th className="px-2 py-2 md:px-4 md:py-3 text-right w-14 md:w-32 font-normal">
                                <span className="hidden md:inline">Laki-laki</span>
                                <span className="md:hidden">L</span>
                            </th>
                            <th className="px-2 py-2 md:px-4 md:py-3 text-right w-14 md:w-32 font-normal">
                                <span className="hidden md:inline">Perempuan</span>
                                <span className="md:hidden">P</span>
                            </th>
                            <th className="px-2 py-2 md:px-4 md:py-3 text-right w-14 md:w-32 font-normal">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {data.map((row, idx) => (
                            <tr key={row.key} className="hover:bg-body-bg/80 transition-colors">
                                <td className="px-2 py-2 md:px-4 md:py-2.5 text-secondary-text text-[10px] md:text-xs">{idx + 1}</td>
                                <td className="px-2 py-2 md:px-4 md:py-2.5 text-primary-text text-[10px] md:text-xs">{row.label}</td>
                                <td 
                                    className="px-2 py-2 md:px-4 md:py-2.5 text-right cursor-pointer group"
                                    onClick={() => handleRowClick(row.key, row.label, "L")}
                                >
                                    <div className="flex flex-col items-end md:flex-row md:items-center md:justify-end md:gap-3">
                                        <span className="text-info-text transition-colors font-medium">{row.male}</span>
                                        <span className="text-[9px] md:text-[10px] text-secondary-text md:w-10 text-right">({row.malePercent.toFixed(1)}%)</span>
                                    </div>
                                </td>
                                <td 
                                    className="px-2 py-2 md:px-4 md:py-2.5 text-right cursor-pointer group"
                                    onClick={() => handleRowClick(row.key, row.label, "P")}
                                >
                                    <div className="flex flex-col items-end md:flex-row md:items-center md:justify-end md:gap-3">
                                        <span className="text-error-text group-hover:text-error-text transition-colors font-medium">{row.female}</span>
                                        <span className="text-[9px] md:text-[10px] text-secondary-text md:w-10 text-right">({row.femalePercent.toFixed(1)}%)</span>
                                    </div>
                                </td>
                                <td 
                                    className="px-2 py-2 md:px-4 md:py-2.5 text-right cursor-pointer group"
                                    onClick={() => handleRowClick(row.key, row.label)}
                                >
                                    <div className="flex flex-col items-end md:flex-row md:items-center md:justify-end md:gap-3">
                                        <span className="text-primary-text font-medium group-hover:text-primary-text transition-colors">{row.total}</span>
                                        <span className="text-[9px] md:text-[10px] text-secondary-text md:w-10 text-right">({row.totalPercent.toFixed(1)}%)</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Sheet open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
                <SheetContent className="w-full sm:max-w-xl flex flex-col h-full p-0 gap-0 border-l border-border-color shadow-2xl bg-card-bg">
                    <SheetHeader className="px-4 py-4 md:p-6 border-b border-border-color bg-card-bg sticky top-0 z-10 space-y-4">
                        {/* Mobile Navigation Bar */}
                        <div className="flex items-center gap-2 md:hidden mb-1">
                            <SheetClose className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors px-2 py-1.5 -ml-2 rounded-md hover:bg-secondary-text/10 focus:outline-none focus:ring-2 focus:ring-border-color">
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium text-sm">Kembali</span>
                            </SheetClose>
                        </div>

                        <div className="space-y-1">
                            <SheetTitle className="text-lg md:text-xl font-bold text-primary-text leading-snug">{selectedDetail?.title}</SheetTitle>
                            <SheetDescription className="text-secondary-text text-sm">
                                Menampilkan daftar <span className="font-medium text-primary-text">{selectedDetail?.residents.length}</span> penduduk dalam kategori ini.
                            </SheetDescription>
                        </div>
                        
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-secondary-text" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama, NIK, atau alamat..."
                                value={detailSearch}
                                onChange={(e) => setDetailSearch(e.target.value)}
                                className="pl-9 pr-4 py-2.5 w-full bg-body-bg border border-border-color rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-text/10 focus:border-primary-text transition-all placeholder:text-secondary-text text-primary-text"
                            />
                        </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-body-bg">
                        <div className="space-y-3">
                            {filteredDetailResidents.map((r, i) => {
                                const initials = r.nama.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                                const isMale = normalizeGender(r.jenis_kelamin) === "L";
                                
                                return (
                                    <div key={r.id || i} className="group bg-card-bg border border-border-color rounded-xl p-4 hover:shadow-md hover:border-border-color/80 transition-all duration-200">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm border",
                                                isMale ? "bg-gender-male-bg text-gender-male-text border-gender-male-border" : "bg-gender-female-bg text-gender-female-text border-gender-female-border"
                                            )}>
                                                {initials}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div>
                                                    <h4 className="font-semibold text-primary-text truncate pr-2">{r.nama}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="font-mono text-xs text-secondary-text bg-secondary-text/5 px-1.5 py-0.5 rounded border border-border-color">
                                                            {r.nik}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start gap-2 text-xs text-secondary-text">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-secondary-text" />
                                                    <span className="leading-snug line-clamp-2">
                                                        {r.alamat_saat_ini || r.alamat_rt || "Alamat tidak tersedia"}
                                                        {(r.dusun || r.rt || r.rw) && (
                                                            <span className="block text-secondary-text mt-0.5">
                                                                {[r.dusun, r.rt && `RT ${r.rt}`, r.rw && `RW ${r.rw}`].filter(Boolean).join(", ")}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border",
                                                        isMale ? "bg-gender-male-bg text-gender-male-text border-gender-male-border" : "bg-gender-female-bg text-gender-female-text border-gender-female-border"
                                                    )}>
                                                        <User className="w-3 h-3" />
                                                        {isMale ? "Laki-laki" : "Perempuan"}
                                                    </div>
                                                    
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-secondary-text/5 text-secondary-text border border-border-color">
                                                        <Calendar className="w-3 h-3" />
                                                        {calculateAge(r.tanggal_lahir)} Tahun
                                                    </div>

                                                    {r.status_kawin && (
                                                        <div className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-secondary-bg text-secondary-text border border-border-color">
                                                            {r.status_kawin}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {filteredDetailResidents.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                    <div className="w-16 h-16 bg-secondary-text/5 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-secondary-text/30" />
                                    </div>
                                    <h3 className="text-primary-text font-medium mb-1">Tidak ditemukan</h3>
                                    <p className="text-secondary-text text-sm max-w-[200px]">
                                        {detailSearch ? `Tidak ada hasil untuk "${detailSearch}"` : "Belum ada data penduduk dalam kategori ini."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default function StatistikKependudukanPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);
    const [pekerjaanOptions, setPekerjaanOptions] = useState<string[]>([]);
    const [dusunOptions, setDusunOptions] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState(slugify(STAT_CATEGORIES[0]));
    const [isVisible, setIsVisible] = useState(false);

    // Filter States
    const [selectedDusun, setSelectedDusun] = useState<string>("all");
    const [selectedRW, setSelectedRW] = useState<string>("all");
    const [selectedRT, setSelectedRT] = useState<string>("all");

    useEffect(() => {
        const init = async () => {
            try {
                const [resData, pekList, dusList] = await Promise.all([
                    getResidents(),
                    getPekerjaanList(),
                    getDusunList()
                ]);
                setResidents(resData || []);
                setPekerjaanOptions(pekList);
                setDusunOptions(dusList.map(d => d.nama));
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
                setTimeout(() => setIsVisible(true), 50);
            }
        };
        init();
    }, []);

    // Clean unique dusun filter options
    const cleanDusunOptions = useMemo(() => {
        const map = new Map<string, { key: string; label: string }>();
        dusunOptions.forEach(d => {
            const key = normalizeDusunKey(d);
            if (!map.has(key)) map.set(key, { key, label: formatDusunName(d) });
        });
        residents.forEach(r => {
            if (r.dusun) {
                const key = normalizeDusunKey(r.dusun);
                if (!map.has(key)) map.set(key, { key, label: formatDusunName(r.dusun) });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    }, [dusunOptions, residents]);

    // Memoized Filter Options
    const rwOptions = useMemo(() => {
        let relevantResidents = residents;
        if (selectedDusun !== "all") {
            relevantResidents = residents.filter(r => normalizeDusunKey(r.dusun) === selectedDusun);
        }
        const rws = new Set(relevantResidents.map(r => r.rw).filter(Boolean));
        return Array.from(rws).sort();
    }, [residents, selectedDusun]);

    const rtOptions = useMemo(() => {
        let relevantResidents = residents;
        if (selectedDusun !== "all") {
            relevantResidents = residents.filter(r => normalizeDusunKey(r.dusun) === selectedDusun);
        }
        if (selectedRW !== "all") {
            relevantResidents = relevantResidents.filter(r => r.rw === selectedRW);
        }
        const rts = new Set(relevantResidents.map(r => r.rt).filter(Boolean));
        return Array.from(rts).sort();
    }, [residents, selectedDusun, selectedRW]);

    // Filtered Residents
    const filteredResidents = useMemo(() => {
        return residents.filter(r => {
            if (selectedDusun !== "all" && normalizeDusunKey(r.dusun) !== selectedDusun) return false;
            if (selectedRW !== "all" && r.rw !== selectedRW) return false;
            if (selectedRT !== "all" && r.rt !== selectedRT) return false;
            return true;
        });
    }, [residents, selectedDusun, selectedRW, selectedRT]);

    // Scroll Spy Logic - REMOVED in favor of single-view selection
    const scrollToSection = (id: string) => {
        setActiveSection(id);
    };

    // Removed IntersectionObserver effect since we are no longer scrolling through a list


    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary-text" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-body-bg">
            <PageHeader
                title="Statistik Kependudukan"
                subtitle="Laporan statistik lengkap demografi penduduk desa."
            />
            
            <div className="flex-1 overflow-hidden p-4">
                <div 
                    className={cn(
                        "flex h-full w-full bg-card-bg flex-col md:flex-row overflow-hidden border border-border-color rounded-xl shadow-sm transition-all duration-500 ease-out transform",
                        isVisible 
                        ? "opacity-100 translate-x-0" 
                        : "opacity-0 -translate-x-8"
                    )}
                >
                    {/* Sidebar Navigation - Fixed Left Panel */}
                    <div className="hidden md:flex flex-col w-64 shrink-0 border-r border-border-color bg-sidebar-bg h-full">
                        <div className="p-4 sticky top-0 bg-sidebar-bg z-10 border-b border-border-color backdrop-blur-sm space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-primary-text">Filter Wilayah</h3>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-secondary-text">Dusun</label>
                                        <select 
                                            value={selectedDusun} 
                                            onChange={(e) => { setSelectedDusun(e.target.value); setSelectedRW("all"); setSelectedRT("all"); }}
                                            className="w-full text-xs bg-card-bg border border-border-color rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-text/10 text-primary-text"
                                        >
                                            <option value="all">Semua</option>
                                            {cleanDusunOptions.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-secondary-text">RW</label>
                                        <select 
                                            value={selectedRW} 
                                            onChange={(e) => { setSelectedRW(e.target.value); setSelectedRT("all"); }}
                                            className="w-full text-xs bg-card-bg border border-border-color rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-text/10 text-primary-text"
                                        >
                                            <option value="all">Semua</option>
                                            {rwOptions.map(rw => <option key={rw} value={rw}>{rw}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-secondary-text">RT</label>
                                        <select 
                                            value={selectedRT} 
                                            onChange={(e) => setSelectedRT(e.target.value)}
                                            className="w-full text-xs bg-card-bg border border-border-color rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-text/10 text-primary-text"
                                        >
                                            <option value="all">Semua</option>
                                            {rtOptions.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-primary-text">Kategori Statistik</h3>
                                <p className="text-xs text-secondary-text mt-0.5">
                                    Total Data: <span className="font-medium text-primary-text">{filteredResidents.length}</span>
                                </p>
                            </div>
                        </div>
                        <div className="p-3 space-y-0.5 flex-1 overflow-y-auto">
                            {STAT_CATEGORIES.map((category) => {
                                const id = slugify(category);
                                const isActive = activeSection === id;
                                
                                return (
                                    <button
                                        type="button"
                                        key={category}
                                        onClick={() => scrollToSection(id)}
                                        className={cn(
                                            "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-all relative group",
                                            isActive
                                                ? "bg-secondary-text/10 text-primary-text font-medium shadow-sm"
                                                : "text-secondary-text hover:bg-secondary-text/5 hover:text-primary-text"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-2 w-2 shrink-0 rounded-full transition-colors",
                                            isActive ? "bg-primary-text" : "bg-secondary-text/30 group-hover:bg-secondary-text/50"
                                        )} />

                                        <span className="text-[13px] truncate">
                                            {category}
                                        </span>
                                        
                                        {isActive && (
                                            <ChevronRight className="w-3.5 h-3.5 ml-auto text-secondary-text" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area - Scrollable */}
                    <div className="flex-1 h-full overflow-y-auto bg-card-bg" id="scroll-container">
                        <div className="max-w-5xl mx-auto py-6 px-4 md:px-8 pb-24">
                            
                            {/* Mobile Category Selector */}
                            <div className="md:hidden mb-6 space-y-4">
                                <div className="bg-card-bg p-4 rounded-lg border border-border-color space-y-3">
                                    <h3 className="text-sm font-medium text-primary-text">Filter Wilayah</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-secondary-text mb-1">Dusun</label>
                                            <select 
                                                value={selectedDusun} 
                                                onChange={(e) => { setSelectedDusun(e.target.value); setSelectedRW("all"); setSelectedRT("all"); }}
                                                className="w-full appearance-none bg-card-bg border border-border-color text-primary-text text-sm rounded-md focus:ring-primary-text focus:border-primary-text block p-2"
                                            >
                                                <option value="all">Semua Dusun</option>
                                                {dusunOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-secondary-text mb-1">RW</label>
                                            <select 
                                                value={selectedRW} 
                                                onChange={(e) => { setSelectedRW(e.target.value); setSelectedRT("all"); }}
                                                className="w-full appearance-none bg-card-bg border border-border-color text-primary-text text-sm rounded-md focus:ring-primary-text focus:border-primary-text block p-2"
                                            >
                                                <option value="all">Semua RW</option>
                                                {rwOptions.map(rw => <option key={rw} value={rw}>{rw}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-secondary-text mb-1">RT</label>
                                            <select 
                                                value={selectedRT} 
                                                onChange={(e) => setSelectedRT(e.target.value)}
                                                className="w-full appearance-none bg-card-bg border border-border-color text-primary-text text-sm rounded-md focus:ring-primary-text focus:border-primary-text block p-2"
                                            >
                                                <option value="all">Semua RT</option>
                                                {rtOptions.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-xs text-secondary-text pt-1 border-t border-border-color mt-2">
                                        Total Data: <span className="font-medium text-primary-text">{filteredResidents.length}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-text mb-2">Pilih Kategori Statistik</label>
                                    <div className="relative">
                                        <select 
                                            value={activeSection} 
                                            onChange={(e) => scrollToSection(e.target.value)}
                                            className="w-full appearance-none bg-card-bg border border-border-color text-primary-text text-sm rounded-lg focus:ring-primary-text focus:border-primary-text block p-2.5 pr-8"
                                        >
                                            {STAT_CATEGORIES.map((cat) => (
                                                <option key={cat} value={slugify(cat)}>{cat}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary-text">
                                            <ChevronRight className="h-4 w-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Category Content */}
                            {(() => {
                                const activeCategoryName = STAT_CATEGORIES.find(c => slugify(c) === activeSection) || STAT_CATEGORIES[0];
                                const id = slugify(activeCategoryName);
                                return (
                                    <SectionContainer
                                        key={activeCategoryName}
                                        id={id}
                                        title={activeCategoryName}
                                        sectionRef={() => {}}
                                    >
                                        <StatContent 
                                            category={activeCategoryName} 
                                            residents={filteredResidents} 
                                            pekerjaanOptions={pekerjaanOptions} 
                                            dusunOptions={dusunOptions}
                                        />
                                    </SectionContainer>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
