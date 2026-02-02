"use client";

import { useEffect, useState } from "react";
import { 
  Archive, 
  ArrowDownToLine, 
  FileText, 
  Mail, 
  Calendar 
} from "lucide-react";
import { 
  getSuratMasuk, 
  getLogSurat, 
  SuratMasuk, 
  LogSurat 
} from "@/lib/services/surat";
import { formatDate } from "@/lib/utils";

import { PageHeader } from "@/components/layout/PageHeader";

export default function ArsipLayananPage() {
  const [activeTab, setActiveTab] = useState<"masuk" | "keluar">("masuk");
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<(LogSurat & { surat_formats?: { nama: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [masuk, keluar] = await Promise.all([
        getSuratMasuk(),
        getLogSurat()
      ]);
      setSuratMasuk(masuk || []);
      setSuratKeluar(keluar || []);
    } catch (error) {
      console.error("Error loading archives:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <PageHeader 
        title="Arsip Layanan" 
        subtitle="Layanan Surat / Arsip" 
        className="mb-6"
      />

      <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
        {/* Card Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden p-6">
          
          {/* Tabs */}
          <div className="border-b border-gray-100 mb-6 flex space-x-6">
            <button
              onClick={() => setActiveTab("masuk")}
              className={`pb-3 text-sm transition-colors flex items-center gap-2 ${
                activeTab === "masuk"
                  ? "border-b-2 border-gray-900 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            >
              <Mail className="w-4 h-4" />
              Arsip Surat Masuk
            </button>
            <button
              onClick={() => setActiveTab("keluar")}
              className={`pb-3 text-sm transition-colors flex items-center gap-2 ${
                activeTab === "keluar"
                  ? "border-b-2 border-gray-900 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            >
              <FileText className="w-4 h-4" />
              Arsip Surat Keluar
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
            {activeTab === "masuk" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200 w-32">No. Surat</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Tanggal Terima</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Pengirim</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Perihal</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-20 border-b border-gray-200">Berkas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suratMasuk.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 align-middle font-mono text-xs text-gray-600">{item.nomor_surat}</td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(item.tanggal_penerimaan)}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm font-medium text-gray-900 capitalize">{item.pengirim.toLowerCase()}</td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-600 line-clamp-2 capitalize">{item.isi_singkat.toLowerCase()}</td>
                      <td className="px-4 py-4 align-middle text-center">
                        {item.berkas_scan ? (
                          <a 
                            href={`/storage/${item.berkas_scan}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                            title="Download Berkas"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                   {suratMasuk.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="h-64 text-center align-middle">
                        <div className="flex flex-col items-center justify-center py-12">
                           <Archive className="w-12 h-12 text-gray-300 mb-4" />
                           <p className="text-gray-500 font-medium text-base">Belum ada arsip surat masuk.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "keluar" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200 w-32">No. Surat</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Tanggal</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Jenis Surat</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left border-b border-gray-200">Penerima (Warga)</th>
                    <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-20 border-b border-gray-200">Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suratKeluar.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 align-middle font-mono text-xs text-gray-600">{item.no_surat || "-"}</td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                           <Calendar className="w-3.5 h-3.5 text-gray-400" />
                           {formatDate(item.tanggal)}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm font-medium text-gray-900 capitalize">
                        {(item.surat_formats?.nama || item.nama_surat || "Unknown").toLowerCase()}
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-600 capitalize">
                        {(item.nama_non_warga ? item.nama_non_warga : (item.id_pend ? `Penduduk #${item.id_pend}` : "-")).toLowerCase()}
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        {item.url_surat ? (
                           <a 
                           href={item.url_surat} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                           title="Download Surat"
                         >
                           <ArrowDownToLine className="w-4 h-4" />
                         </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {suratKeluar.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="h-64 text-center align-middle">
                        <div className="flex flex-col items-center justify-center py-12">
                           <Archive className="w-12 h-12 text-gray-300 mb-4" />
                           <p className="text-gray-500 font-medium text-base">Belum ada arsip surat keluar.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
