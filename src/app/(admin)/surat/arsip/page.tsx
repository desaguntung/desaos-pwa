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
  const [suratKeluar, setSuratKeluar] = useState<(LogSurat & { tweb_surat_format?: { nama: string } })[]>([]);
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
    <div className="flex-1 flex flex-col h-full bg-body-bg">
      <PageHeader 
        title="Arsip Layanan" 
        subtitle="Layanan Surat / Arsip" 
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("masuk")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "masuk"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-secondary-text hover:text-primary-text"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Arsip Surat Masuk
          </button>
          <button
            onClick={() => setActiveTab("keluar")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "keluar"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-secondary-text hover:text-primary-text"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Arsip Surat Keluar
          </button>
        </div>

        {/* Content */}
        {activeTab === "masuk" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-32">No. Surat</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Tanggal Terima</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Pengirim</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Perihal</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-20 text-center">Berkas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {suratMasuk.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-xs font-medium text-primary-text">{item.nomor_surat}</td>
                      <td className="px-4 py-3 text-xs text-secondary-text flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.tanggal_penerimaan)}
                      </td>
                      <td className="px-4 py-3 text-xs text-primary-text">{item.pengirim}</td>
                      <td className="px-4 py-3 text-xs text-secondary-text truncate max-w-xs">{item.isi_singkat}</td>
                      <td className="px-4 py-3 text-center">
                        {item.berkas_scan ? (
                          <a 
                            href={`/storage/${item.berkas_scan}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Download Berkas"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                   {suratMasuk.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-secondary-text">
                        Tidak ada arsip surat masuk.
                      </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "keluar" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-32">No. Surat</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Tanggal</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Jenis Surat</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase">Penerima (Warga)</th>
                    <th className="px-4 py-3 font-semibold text-xs text-secondary-text uppercase w-20 text-center">Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {suratKeluar.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-xs font-medium text-primary-text">{item.no_surat || "-"}</td>
                      <td className="px-4 py-3 text-xs text-secondary-text flex items-center gap-1.5">
                         <Calendar className="w-3 h-3" />
                         {formatDate(item.tanggal)}
                      </td>
                      <td className="px-4 py-3 text-xs text-primary-text">{item.tweb_surat_format?.nama || item.nama_surat}</td>
                      <td className="px-4 py-3 text-xs text-secondary-text">
                        {item.nama_non_warga ? item.nama_non_warga : (item.id_pend ? `Penduduk #${item.id_pend}` : "-")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.url_surat ? (
                           <a 
                           href={item.url_surat} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                           title="Download Surat"
                         >
                           <ArrowDownToLine className="w-4 h-4" />
                         </a>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {suratKeluar.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-secondary-text">
                        Tidak ada arsip surat keluar.
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
