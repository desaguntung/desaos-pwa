"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Save, Building2, FileText, Info } from "lucide-react";
import { 
  getIdentitasDesa, 
  updateIdentitasDesa, 
  getPengaturanAplikasi, 
  savePengaturanAplikasi, 
  type IdentitasDesa 
} from "@/lib/services/surat";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PengaturanAplikasiPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identitas, setIdentitas] = useState<IdentitasDesa | null>(null);
  const [penomoranOption, setPenomoranOption] = useState<string>("1");

  // Options for numbering
  const numberingOptions = [
    {
      id: "1",
      label: "Nomor berurutan untuk masing-masing surat masuk dan keluar; dan untuk semua surat layanan",
      description: "Counter terpisah untuk masuk/keluar. Surat layanan berbagi counter yang sama."
    },
    {
      id: "2",
      label: "Nomor berurutan untuk masing-masing surat masuk dan keluar; dan untuk setiap surat layanan dengan jenis yang sama",
      description: "Setiap jenis surat layanan (misal: Keterangan Usaha) punya counter sendiri."
    },
    {
      id: "3",
      label: "Nomor berurutan untuk keseluruhan surat layanan, masuk dan keluar",
      description: "Satu counter global untuk semua jenis surat."
    },
    {
      id: "4",
      label: "Nomor berurutan untuk masing-masing klasifikasi surat yang sama",
      description: "Counter berdasarkan kode klasifikasi surat."
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load Identitas Desa (for naming conventions)
      const dataIdentitas = await getIdentitasDesa();
      setIdentitas(dataIdentitas);

      // Load Application Settings (for numbering option)
      const dataPenomoran = await getPengaturanAplikasi("penomoran_surat_opsi");
      if (dataPenomoran) {
        setPenomoranOption(dataPenomoran.value);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!identitas) return;
    
    setSaving(true);
    try {
      // Save Identitas Desa updates
      await updateIdentitasDesa({
        sebutan_desa: identitas.sebutan_desa,
        singkatan_desa: identitas.singkatan_desa,
        sebutan_kabupaten: identitas.sebutan_kabupaten,
        sebutan_kabupaten_singkat: identitas.sebutan_kabupaten_singkat,
        sebutan_kecamatan: identitas.sebutan_kecamatan,
        sebutan_kecamatan_singkat: identitas.sebutan_kecamatan_singkat,
        sebutan_dusun: identitas.sebutan_dusun,
      });

      // Save Numbering Option
      await savePengaturanAplikasi({
        key: "penomoran_surat_opsi",
        value: penomoranOption,
        keterangan: "Opsi penomoran surat (1-4)"
      });

      toast.success("Pengaturan berhasil disimpan");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Pengaturan Aplikasi" 
        subtitle="Konfigurasi sebutan wilayah dan format penomoran surat"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs bg-zinc-900 text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Naming Conventions */}
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm h-fit">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Sebutan Wilayah</h2>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Sebutan Desa</label>
                <input
                  type="text"
                  value={identitas?.sebutan_desa || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_desa: e.target.value }) : null)}
                  placeholder="Contoh: Desa / Gampong"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Singkatan Desa</label>
                <input
                  type="text"
                  value={identitas?.singkatan_desa || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, singkatan_desa: e.target.value }) : null)}
                  placeholder="Contoh: DS / GP"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Sebutan Kecamatan</label>
                <input
                  type="text"
                  value={identitas?.sebutan_kecamatan || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kecamatan: e.target.value }) : null)}
                  placeholder="Contoh: Kecamatan"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Singkatan Kecamatan</label>
                <input
                  type="text"
                  value={identitas?.sebutan_kecamatan_singkat || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kecamatan_singkat: e.target.value }) : null)}
                  placeholder="Contoh: KEC"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Sebutan Kabupaten</label>
                <input
                  type="text"
                  value={identitas?.sebutan_kabupaten || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kabupaten: e.target.value }) : null)}
                  placeholder="Contoh: Kabupaten"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Singkatan Kabupaten</label>
                <input
                  type="text"
                  value={identitas?.sebutan_kabupaten_singkat || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kabupaten_singkat: e.target.value }) : null)}
                  placeholder="Contoh: KAB"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Sebutan Dusun</label>
                <input
                  type="text"
                  value={identitas?.sebutan_dusun || ""}
                  onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_dusun: e.target.value }) : null)}
                  placeholder="Contoh: Dusun / Banjar"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 leading-relaxed">
                Pengaturan sebutan ini akan mempengaruhi tampilan pada surat cetak dan antarmuka aplikasi. Gunakan singkatan yang baku (3-4 huruf).
              </div>
            </div>
          </div>
        </div>

        {/* Letter Numbering */}
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm h-fit">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Penomoran Surat</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {numberingOptions.map((option) => (
                <label 
                  key={option.id}
                  className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${
                    penomoranOption === option.id 
                      ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" 
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="penomoran"
                      value={option.id}
                      checked={penomoranOption === option.id}
                      onChange={(e) => setPenomoranOption(e.target.value)}
                      className="h-4 w-4 text-zinc-900 border-zinc-300 focus:ring-zinc-900"
                    />
                  </div>
                  <div className="ml-3">
                    <span className={`block text-sm font-medium ${
                      penomoranOption === option.id ? "text-zinc-900" : "text-zinc-700"
                    }`}>
                      {option.label}
                    </span>
                    <span className="block text-xs text-zinc-500 mt-1">
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h3 className="text-sm font-medium text-zinc-900 mb-2">Format Nomor Surat Otomatis</h3>
              <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-sm text-zinc-700 flex items-center justify-center">
                140/001/{identitas?.singkatan_desa || "GT"}/VII/{new Date().getFullYear()}
              </div>
              <div className="mt-3 space-y-1 text-xs text-zinc-500">
                <p>• <strong>140</strong>: Kode Klasifikasi / Index Nasional</p>
                <p>• <strong>001</strong>: Nomor Urut (Reset tiap tahun)</p>
                <p>• <strong>{identitas?.singkatan_desa || "GT"}</strong>: Singkatan Desa</p>
                <p>• <strong>VII</strong>: Bulan Romawi (Otomatis)</p>
                <p>• <strong>{new Date().getFullYear()}</strong>: Tahun Berjalan</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
