"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Settings, 
  FileText, 
  Tag, 
  Plus, 
  Pencil, 
  Trash2,
  Check,
  X
} from "lucide-react";
import { 
  getKlasifikasiSurat, 
  getFormatSurat, 
  KlasifikasiSurat, 
  FormatSurat 
} from "@/lib/services/surat";

import { PageHeader } from "@/components/layout/PageHeader";

function PengaturanSuratContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"klasifikasi" | "format">("klasifikasi");
  const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>([]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "format" || tab === "klasifikasi") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [formatList, setFormatList] = useState<FormatSurat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [klasifikasi, format] = await Promise.all([
        getKlasifikasiSurat(),
        getFormatSurat()
      ]);
      setKlasifikasiList(klasifikasi || []);
      setFormatList(format || []);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Pengaturan Surat" 
        subtitle="Layanan Surat / Pengaturan" 
      />

      <div className="p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("klasifikasi")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "klasifikasi"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-secondary-text hover:text-primary-text"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Klasifikasi Surat
          </button>
          <button
            onClick={() => setActiveTab("format")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "format"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-secondary-text hover:text-primary-text"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Format Surat
          </button>
        </div>

        {/* Content */}
        {activeTab === "klasifikasi" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-primary-text">Daftar Kode Klasifikasi</h3>
              <button className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Klasifikasi</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-24">Kode</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Nama Klasifikasi</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Uraian</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-20 text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {klasifikasiList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-xs font-medium text-primary-text">{item.kode}</td>
                      <td className="px-4 py-3 text-xs text-primary-text">{item.nama}</td>
                      <td className="px-4 py-3 text-xs text-secondary-text truncate max-w-xs">{item.uraian}</td>
                      <td className="px-4 py-3 text-center">
                        {item.enabled ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-zinc-400">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/surat/pengaturan/format/buat" className="text-zinc-400 hover:text-blue-500 transition-colors inline-block">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {klasifikasiList.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-secondary-text">
                        Tidak ada data klasifikasi.
                      </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "format" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-primary-text">Daftar Format Surat</h3>
              <Link href="/surat/pengaturan/format/buat" className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Format</span>
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-24">Kode</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Nama Format</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">URL / Kode Unik</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-20 text-center">Kunci</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {formatList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-xs font-medium text-primary-text">{item.kode_surat || "-"}</td>
                      <td className="px-4 py-3 text-xs text-primary-text">{item.nama}</td>
                      <td className="px-4 py-3 text-xs text-secondary-text font-mono">{item.url_surat}</td>
                      <td className="px-4 py-3 text-center">
                         {item.kunci ? (
                          <span className="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-sm border border-zinc-200">Locked</span>
                         ) : (
                          <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-sm border border-emerald-100">Open</span>
                         )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/surat/pengaturan/format/edit/${item.id}`} className="text-zinc-400 hover:text-blue-500 transition-colors inline-block">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                   {formatList.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-secondary-text">
                        Tidak ada data format surat.
                      </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PengaturanSuratPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    }>
      <PengaturanSuratContent />
    </Suspense>
  );
}
