"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLogSuratDetail, getIdentitasDesa, buildSuratPreviewData } from "@/lib/services/surat";
import { Button } from "@/components/ui/Button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

export default function ViewSuratPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadSurat(parseInt(id));
    }
  }, [id]);

  const loadSurat = async (suratId: number) => {
    try {
      setLoading(true);
      const [log, identitas] = await Promise.all([
        getLogSuratDetail(suratId),
        getIdentitasDesa()
      ]);

      if (!log) throw new Error("Surat tidak ditemukan");
      
      setData(log);

      const pData = buildSuratPreviewData({
        surat: {
          nomor: log.no_surat,
          no_surat: log.no_surat,
          tanggal: log.tanggal,
          tanggal_surat: log.tanggal,
          nama_surat: log.nama_surat || log.surat_formats?.nama,
          keterangan: log.keterangan,
          kode: log.kode_surat || log.surat_formats?.kode_surat
        },
        resident: log.penduduk,
        pamong: log.pamong,
        identitasDesa: identitas,
        formData: log.form_data || {},
        signature: log.form_data?.signature
      });

      setPreviewData(pData);
    } catch (error) {
      console.error("Error loading surat:", error);
      toast.error("Gagal memuat data surat");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-secondary-text gap-3 bg-body-bg">
        <div className="w-8 h-8 border-2 border-border-color border-t-primary-text rounded-full animate-spin" />
        <p className="text-sm font-medium">Memuat dokumen surat...</p>
      </div>
    );
  }

  if (!data || !data.surat_formats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-error-text gap-2 bg-body-bg">
        <p className="font-semibold">Data tidak ditemukan atau format surat hilang.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-hidden">
      <div className="print:hidden">
        <PageHeader 
          title={`Lihat Surat: ${data.surat_formats.nama}`}
          subtitle={`Nomor: ${data.no_surat}`}
          showBackButton={true}
          backButtonHref="/surat/arsip"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </Button>
          }
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          initialJson={data.surat_formats.template}
          letterType={data.surat_formats.url_surat || data.surat_formats.kode_surat || data.surat_formats.nama}
          letterName={data.surat_formats.nama}
          id={data.surat_formats.id.toString()}
          previewData={previewData}
          readOnly={true}
          hideHeaderNavigation={true}
        />
      </div>
    </div>
  );
}
