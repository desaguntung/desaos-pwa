"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Save, Building2, FileText, Info } from "lucide-react";
import { InputField } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-text"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Pengaturan Aplikasi" 
        subtitle="Konfigurasi sebutan wilayah dan format penomoran surat"
        actions={
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-1.5"
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
          </Button>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Naming Conventions */}
        <Card className="rounded-xl h-fit">
          <div className="px-6 py-4 border-b border-border-color bg-card-bg/95 flex items-center gap-2 rounded-t-xl">
            <Building2 className="w-4 h-4 text-secondary-text" />
            <h2 className="font-semibold text-primary-text">Sebutan Wilayah</h2>
          </div>
          
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Sebutan Desa"
                value={identitas?.sebutan_desa || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_desa: e.target.value }) : null)}
                placeholder="Contoh: Desa / Gampong"
              />
              <InputField
                label="Singkatan Desa"
                value={identitas?.singkatan_desa || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, singkatan_desa: e.target.value }) : null)}
                placeholder="Contoh: DS / GP"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Sebutan Kecamatan"
                value={identitas?.sebutan_kecamatan || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kecamatan: e.target.value }) : null)}
                placeholder="Contoh: Kecamatan"
              />
              <InputField
                label="Singkatan Kecamatan"
                value={identitas?.sebutan_kecamatan_singkat || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kecamatan_singkat: e.target.value }) : null)}
                placeholder="Contoh: KEC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Sebutan Kabupaten"
                value={identitas?.sebutan_kabupaten || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kabupaten: e.target.value }) : null)}
                placeholder="Contoh: Kabupaten"
              />
              <InputField
                label="Singkatan Kabupaten"
                value={identitas?.sebutan_kabupaten_singkat || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_kabupaten_singkat: e.target.value }) : null)}
                placeholder="Contoh: KAB"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Sebutan Dusun"
                value={identitas?.sebutan_dusun || ""}
                onChange={(e) => setIdentitas(prev => prev ? ({ ...prev, sebutan_dusun: e.target.value }) : null)}
                placeholder="Contoh: Dusun / Banjar"
              />
            </div>
            
            <div className="p-3 bg-info-bg border border-info-border rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-info-text flex-shrink-0 mt-0.5" />
              <div className="text-xs text-info-text leading-relaxed">
                Pengaturan sebutan ini akan mempengaruhi tampilan pada surat cetak dan antarmuka aplikasi. Gunakan singkatan yang baku (3-4 huruf).
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Letter Numbering */}
        <Card className="rounded-xl h-fit">
          <div className="px-6 py-4 border-b border-border-color bg-card-bg/95 flex items-center gap-2 rounded-t-xl">
            <FileText className="w-4 h-4 text-secondary-text" />
            <h2 className="font-semibold text-primary-text">Penomoran Surat</h2>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <RadioGroup value={penomoranOption} onValueChange={setPenomoranOption} className="space-y-4">
              {numberingOptions.map((option) => (
                <Label 
                  key={option.id}
                  className={`relative flex items-start p-4 cursor-pointer rounded-lg border transition-all ${
                    penomoranOption === option.id 
                      ? "border-primary-text bg-body-bg ring-1 ring-primary-text" 
                      : "border-border-color hover:border-secondary-text hover:bg-body-bg/50"
                  }`}
                >
                  <div className="flex items-center h-5">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                  </div>
                  <div className="ml-3">
                    <span className={`block text-sm font-medium ${
                      penomoranOption === option.id ? "text-primary-text" : "text-secondary-text"
                    }`}>
                      {option.label}
                    </span>
                    <span className="block text-xs text-secondary-text/70 mt-1">
                      {option.description}
                    </span>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            <div className="pt-4 border-t border-border-color">
              <h3 className="text-sm font-medium text-primary-text mb-2">Format Nomor Surat Otomatis</h3>
              <div className="p-4 bg-body-bg rounded-lg border border-border-color font-mono text-sm text-secondary-text flex items-center justify-center">
                140/001/{identitas?.singkatan_desa || "GT"}/VII/{new Date().getFullYear()}
              </div>
              <div className="mt-3 space-y-1 text-xs text-secondary-text/70">
                <p>• <strong>140</strong>: Kode Klasifikasi / Index Nasional</p>
                <p>• <strong>001</strong>: Nomor Urut (Reset tiap tahun)</p>
                <p>• <strong>{identitas?.singkatan_desa || "GT"}</strong>: Singkatan Desa</p>
                <p>• <strong>VII</strong>: Bulan Romawi (Otomatis)</p>
                <p>• <strong>{new Date().getFullYear()}</strong>: Tahun Berjalan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
