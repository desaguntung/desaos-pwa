"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLogSuratDetail } from "@/lib/services/surat";

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
      const log = await getLogSuratDetail(suratId);
      setData(log);

      // Construct Preview Data
      const pData = {
        surat: {
            no_surat: log.no_surat,
            nomor: log.no_surat, // Alias for Variable
            tanggal: new Date(log.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            }),
            tanggal_surat: new Date(log.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            }),
            nama_surat: log.nama_surat,
            keterangan: log.keterangan,
            kode: log.kode_surat || log.surat_formats?.kode_surat
        },
        desa: {
            // TODO: Fetch real desa config
            nama: "Desa Digital", // Alias for Variable
            nama_desa: "Desa Digital",
            alamat: "Jl. Merdeka No. 45",
            alamat_kantor: "Jl. Merdeka No. 45", // Alias
            kecamatan: "Kecamatan Maju",
            kabupaten: "Kabupaten Sejahtera",
            provinsi: "Provinsi Makmur",
            kode_pos: "55555",
            // For KopSurat
            sebutan_desa: "DESA",
            sebutan_kabupaten: "KABUPATEN",
            nama_kabupaten: "SEJAHTERA",
            nama_kecamatan: "MAJU"
        },
        penduduk: log.penduduk ? {
            ...log.penduduk,
            tanggal_lahir: log.penduduk.tanggal_lahir ? new Date(log.penduduk.tanggal_lahir).toLocaleDateString("id-ID") : "-",
            sex: log.penduduk.sex || log.penduduk.jenis_kelamin, // Handle both keys
            status_kawin: log.penduduk.status_kawin || log.penduduk.status_perkawinan, // Handle both keys
            warga_negara: log.penduduk.warganegara || log.penduduk.kewarganegaraan // Handle both keys
        } : {},
        form_data: log.form_data || {}
      };
      setPreviewData(pData);
    } catch (error) {
      console.error("Error loading surat:", error);
      alert("Gagal memuat data surat");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-zinc-500">Loading...</div>;
  }

  if (!data || !data.surat_formats) {
    return <div className="flex items-center justify-center h-screen text-red-500">Data tidak ditemukan atau format surat hilang.</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-hidden">
      <PageHeader 
        title={`Lihat Surat: ${data.surat_formats.nama}`}
        subtitle={`Nomor: ${data.no_surat}`}
        showBackButton={true}
        backButtonHref="/surat/arsip"
      />
      <div className="flex-1 overflow-hidden">
        <Editor
          initialJson={data.surat_formats.template}
          letterType={data.surat_formats.kode_surat} // Fallback
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
