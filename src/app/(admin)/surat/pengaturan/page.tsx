"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  FileText, 
  Tag, 
  Plus, 
  Pencil, 
  Check,
  X,
  Search
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
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <PageHeader 
        title="Pengaturan Surat" 
        subtitle="Layanan Surat / Pengaturan" 
        className="mb-6"
      />

      <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
        {/* Card Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden p-6">
          
          {/* Tabs */}
          <div className="border-b border-gray-100 mb-6 flex space-x-6">
            <button
              onClick={() => setActiveTab("klasifikasi")}
              className={`pb-3 text-sm transition-colors flex items-center gap-2 ${
                activeTab === "klasifikasi"
                  ? "border-b-2 border-gray-900 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            >
              <Tag className="w-4 h-4" />
              Klasifikasi Surat
            </button>
            <button
              onClick={() => setActiveTab("format")}
              className={`pb-3 text-sm transition-colors flex items-center gap-2 ${
                activeTab === "format"
                  ? "border-b-2 border-gray-900 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            >
              <FileText className="w-4 h-4" />
              Format Surat
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "klasifikasi" && (
              <div className="flex flex-col h-full">
                {/* Action Bar */}
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                      placeholder="Cari Klasifikasi..."
                    />
                  </div>
                  <button className="flex items-center gap-1.5 text-xs bg-slate-900 text-white rounded-md px-3 py-2 hover:bg-slate-800 transition-colors font-medium shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Tambah Klasifikasi</span>
                  </button>
                </div>
                
                {/* Table */}
                <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-24 border-b border-gray-200">Kode</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Nama Klasifikasi</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Uraian</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-24 border-b border-gray-200">Status</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-16 border-b border-gray-200">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {klasifikasiList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-middle text-center font-mono text-xs text-gray-600 font-medium">{item.kode}</td>
                          <td className="px-4 py-4 align-middle text-sm font-medium text-gray-900 capitalize">{item.nama.toLowerCase()}</td>
                          <td className="px-4 py-4 align-middle text-xs text-gray-500 truncate max-w-xs">{item.uraian}</td>
                          <td className="px-4 py-4 align-middle text-center">
                            <div className="flex justify-center">
                              {item.enabled ? (
                                <span className="w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="w-6 h-6 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                                  <X className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-middle text-center">
                            <Link 
                              href="/surat/pengaturan/format/buat" 
                              className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {klasifikasiList.length === 0 && !loading && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-gray-500 text-sm">
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
              <div className="flex flex-col h-full">
                {/* Action Bar */}
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all text-sm"
                      placeholder="Cari Format Surat..."
                    />
                  </div>
                  <Link 
                    href="/surat/pengaturan/format/buat" 
                    className="flex items-center gap-1.5 text-xs bg-slate-900 text-white rounded-md px-3 py-2 hover:bg-slate-800 transition-colors font-medium shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Format</span>
                  </Link>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-24 border-b border-gray-200">Kode</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Nama Format</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">URL / Kode Unik</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-24 border-b border-gray-200">Kunci</th>
                        <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-16 border-b border-gray-200">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formatList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-middle text-center font-mono text-xs text-gray-600 font-medium">{item.kode_surat || "-"}</td>
                          <td className="px-4 py-4 align-middle text-sm font-medium text-gray-900 capitalize">{item.nama.toLowerCase()}</td>
                          <td className="px-4 py-4 align-middle text-xs text-gray-500 font-mono">{item.url_surat}</td>
                          <td className="px-4 py-4 align-middle text-center">
                             {item.kunci ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                                Locked
                              </span>
                             ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                Open
                              </span>
                             )}
                          </td>
                          <td className="px-4 py-4 align-middle text-center">
                            <Link 
                              href={`/surat/pengaturan/format/edit/${item.id}`} 
                              className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                       {formatList.length === 0 && !loading && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-gray-500 text-sm">
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
      </div>
    </div>
  );
}

export default function PengaturanSuratPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PengaturanSuratContent />
    </Suspense>
  );
}
