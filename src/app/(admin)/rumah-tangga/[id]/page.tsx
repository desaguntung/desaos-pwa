"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  User,
  Users,
  Printer,
  Pencil,
  MapPin,
  Calendar,
  FileText,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { getRumahTanggaById, RumahTangga, sortRtmMembers } from "@/lib/services/rumah_tangga";
import { Resident } from "@/lib/services/penduduk";
import { getIdentitasDesa, IdentitasDesa, getPamong, Pamong } from "@/lib/services/surat";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";

function DetailRumahTanggaPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const resource: PermissionResource = "rumah_tangga";
  const { canRead, canUpdate } = useRbac(resource);

  const [data, setData] = useState<RumahTangga | null>(null);
  const [loading, setLoading] = useState(true);
  const [identitasDesa, setIdentitasDesa] = useState<IdentitasDesa | null>(null);
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const id = params.id;
        const [detail, idDesa, pamongs] = await Promise.all([
          getRumahTanggaById(String(id)),
          getIdentitasDesa(),
          getPamong()
        ]);

        if (idDesa) setIdentitasDesa(idDesa);
        if (pamongs) setPamongList(pamongs);

        if (!detail) {
          setErrorMessage("Data rumah tangga tidak ditemukan.");
          return;
        }
        setData(detail);
      } catch (error) {
        console.error("Error memuat detail rumah tangga:", error);
        setErrorMessage("Gagal memuat detail rumah tangga.");
      } finally {
        setLoading(false);
      }
    };

    if (canRead) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [params.id, canRead]);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(`${text} disalin ke clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Standalone Hidden Iframe Printing for A4 Landscape
  const handlePrintRTM = () => {
    if (!data) return;

    const headRes = data.kepala_rtm || (data.anggota && data.anggota[0]);
    const membersList = data.anggota && data.anggota.length > 0 
      ? data.anggota 
      : (headRes ? [headRes] : []);

    const rtVal = (data.rt || headRes?.rt || "").toString().trim();
    const rwVal = (data.rw || headRes?.rw || "").toString().trim();
    const rtFormatted = rtVal ? (rtVal.length === 1 ? `0${rtVal}` : rtVal) : "00";
    const rwFormatted = rwVal ? (rwVal.length === 1 ? `0${rwVal}` : rwVal) : "00";
    const rtRwDisplay = `${rtFormatted}/${rwFormatted}`;

    const kadesPamong = pamongList.find((p) => {
      const jab = (p.jabatan || "").toUpperCase();
      return (
        jab.includes("KEPALA DESA") ||
        jab.includes("KADES") ||
        p.jabatan_id === 1 ||
        p.jabatan_id === 13 ||
        p.pamong_ttd === 1
      );
    });
    const namaKades = kadesPamong?.pamong_nama || identitasDesa?.nama_kepala_desa || "";
    const namaDesa = identitasDesa?.nama_desa || headRes?.nama_desa || "GUNTUNG";
    const namaKecamatan = identitasDesa?.nama_kecamatan || headRes?.nama_kecamatan || "-";
    const namaKabupaten = identitasDesa?.nama_kabupaten || headRes?.nama_kabupaten || "-";
    const kodePos = identitasDesa?.kode_pos || headRes?.kode_pos || "-";
    const namaProvinsi = identitasDesa?.nama_provinsi || headRes?.nama_provinsi || "-";
    const alamatRtm = data.alamat || headRes?.alamat_saat_ini || data.dusun || "-";
    const bdtDisplay = data.bdt && data.bdt.trim().length > 0 ? data.bdt : "-";
    const kelasSosialDisplay = data.kelas_sosial ? `Kelas ${data.kelas_sosial}` : "-";

    const memberRows = membersList.map((m, idx) => {
      const isKepala = m.id === data.kepala_rtm_id || m.rtm_level_id === 1 || idx === 0;
      const statusRtm = isKepala ? "KEPALA RUMAH TANGGA" : (m.status_dalam_rumah_tangga || "ANGGOTA");
      const hubKeluarga = m.hubungan_keluarga || (isKepala ? "KEPALA KELUARGA" : "-");

      return `
        <tr>
          <td style="text-align:center; padding: 4px 2px;">${idx + 1}</td>
          <td style="font-weight:bold; text-transform:uppercase; padding: 4px 6px;">${m.nama || "-"}</td>
          <td style="font-family:monospace; text-align:center; padding: 4px 4px;">${m.nik || "-"}</td>
          <td style="font-family:monospace; text-align:center; padding: 4px 4px;">${m.no_kk || "-"}</td>
          <td style="text-align:center; font-weight:600; text-transform:uppercase; padding: 4px 4px;">${statusRtm}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 4px;">${hubKeluarga}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 2px;">${m.jenis_kelamin || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 4px;">${m.tempat_lahir || "-"}</td>
          <td style="text-align:center; font-family:monospace; padding: 4px 4px;">${formatDateIndo(m.tanggal_lahir)}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 4px;">${m.agama || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 4px;">${m.pendidikan_kk || m.pendidikan_saat_ini || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 4px;">${m.pekerjaan || "-"}</td>
        </tr>
      `;
    }).join("");

    const printHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Salinan Kartu Rumah Tangga - ${data.no_rtm}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm 10mm 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
            line-height: 1.25;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .header h1 {
            font-family: "Times New Roman", Times, serif;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
          }
          .header p {
            font-family: monospace;
            font-size: 13px;
            font-weight: bold;
            margin: 2px 0 0 0;
            letter-spacing: 1px;
          }
          .meta-table {
            width: 100%;
            margin-bottom: 12px;
            font-size: 11px;
          }
          .meta-table td {
            vertical-align: top;
            padding: 1.5px 0;
          }
          .meta-label {
            font-weight: 600;
            text-transform: uppercase;
            width: 155px;
          }
          .meta-sep {
            width: 12px;
          }
          .meta-val {
            text-transform: uppercase;
          }
          .meta-val.bold {
            font-weight: bold;
          }
          .meta-val.mono {
            font-family: monospace;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 12px;
            font-size: 9.5px;
          }
          table.data-table th, table.data-table td {
            border: 1px solid #000;
            padding: 3px 4px;
            vertical-align: middle;
          }
          table.data-table th {
            background-color: #f4f4f5 !important;
            font-weight: bold;
            text-align: center;
          }
          table.data-table th.subnum {
            background-color: #fafafa !important;
            font-size: 8px;
            color: #555;
            padding: 1px 2px;
          }
          .footer-table {
            width: 100%;
            margin-top: 8px;
            text-align: center;
            font-size: 11px;
          }
          .footer-table td {
            vertical-align: top;
            width: 50%;
            padding: 4px;
          }
          .sign-title {
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 52px;
          }
          .sign-name {
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.5px;
          }
          .disclaimer {
            margin-top: 12px;
            padding-top: 6px;
            border-top: 1px dashed #777;
            text-align: center;
            font-size: 9px;
            color: #555;
            line-height: 1.3;
          }
          .disclaimer-title {
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .disclaimer-body {
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KARTU RUMAH TANGGA (RTM)</h1>
          <p>No. RTM: ${data.no_rtm}</p>
        </div>

        <table class="meta-table">
          <tr>
            <td style="width: 50%; padding-right: 15px;">
              <table style="width: 100%;">
                <tr>
                  <td class="meta-label">Kepala Rumah Tangga</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val bold">${headRes?.nama || "-"}</td>
                </tr>
                <tr>
                  <td class="meta-label">NIK Kepala RTM</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val mono">${headRes?.nik || "-"}</td>
                </tr>
                <tr>
                  <td class="meta-label">Alamat</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${alamatRtm}</td>
                </tr>
                <tr>
                  <td class="meta-label">RT / RW</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val mono">${rtRwDisplay}</td>
                </tr>
                <tr>
                  <td class="meta-label">Dusun</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${data.dusun || headRes?.dusun || "-"}</td>
                </tr>
                <tr>
                  <td class="meta-label">Desa / Kelurahan</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${namaDesa}</td>
                </tr>
              </table>
            </td>
            <td style="width: 50%; padding-left: 15px;">
              <table style="width: 100%;">
                <tr>
                  <td class="meta-label">Kecamatan</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${namaKecamatan}</td>
                </tr>
                <tr>
                  <td class="meta-label">Kabupaten / Kota</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${namaKabupaten}</td>
                </tr>
                <tr>
                  <td class="meta-label">Kode Pos</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val mono">${kodePos}</td>
                </tr>
                <tr>
                  <td class="meta-label">Provinsi</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${namaProvinsi}</td>
                </tr>
                <tr>
                  <td class="meta-label">No. BDT / DTKS</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val mono bold">${bdtDisplay}</td>
                </tr>
                <tr>
                  <td class="meta-label">Klasifikasi / Sosial</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${kelasSosialDisplay}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- TABEL ANGGOTA RTM -->
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25px;">No</th>
              <th style="min-width: 130px;">Nama Lengkap</th>
              <th style="min-width: 110px;">NIK</th>
              <th style="min-width: 110px;">Nomor KK</th>
              <th style="min-width: 100px;">Hubungan RTM</th>
              <th style="min-width: 90px;">Hubungan KK</th>
              <th style="width: 65px;">JK</th>
              <th style="min-width: 80px;">Tempat Lahir</th>
              <th style="width: 70px;">Tgl Lahir</th>
              <th style="width: 60px;">Agama</th>
              <th style="min-width: 95px;">Pendidikan</th>
              <th style="min-width: 100px;">Pekerjaan</th>
            </tr>
            <tr>
              <th class="subnum">(1)</th>
              <th class="subnum">(2)</th>
              <th class="subnum">(3)</th>
              <th class="subnum">(4)</th>
              <th class="subnum">(5)</th>
              <th class="subnum">(6)</th>
              <th class="subnum">(7)</th>
              <th class="subnum">(8)</th>
              <th class="subnum">(9)</th>
              <th class="subnum">(10)</th>
              <th class="subnum">(11)</th>
              <th class="subnum">(12)</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows}
          </tbody>
        </table>

        <!-- TANDA TANGAN -->
        <table class="footer-table">
          <tr>
            <td>
              <div class="sign-title">KEPALA RUMAH TANGGA</div>
              <div class="sign-name">${headRes?.nama || "-"}</div>
            </td>
            <td>
              <div style="margin-bottom: 2px; font-size: 10.5px;">Dikeluarkan Tanggal: ${formatDateIndo(new Date().toISOString())}</div>
              <div class="sign-title">KEPALA DESA ${namaDesa}</div>
              <div class="sign-name">${namaKades || "( .................................... )"}</div>
            </td>
          </tr>
        </table>

        <!-- DISCLAIMER -->
        <div class="disclaimer">
          <div class="disclaimer-title">PEMBERITAHUAN / CATATAN SISTEM</div>
          <div class="disclaimer-body">
            Dokumen Salinan Kartu Rumah Tangga ini bukan merupakan dokumen resmi yang diterbitkan oleh Dinas Sosial / Kementerian Sosial / Disdukcapil, melainkan data salinan kependudukan internal yang dikeluarkan oleh sistem informasi desa untuk keperluan administrasi dan verifikasi program kesejahteraan sosial.
          </div>
        </div>
      </body>
      </html>
    `;

    // Remove previous iframe
    const existingIframe = document.getElementById("print-rtm-detail-iframe");
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "print-rtm-detail-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(printHtml);
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }
    }, 300);
  };

  if (!canRead) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto p-6">
        <p className="text-sm text-secondary-text">
          Anda tidak memiliki hak untuk melihat data rumah tangga.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg items-center justify-center p-6 gap-3">
        <div className="w-8 h-8 border-2 border-border-color border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-secondary-text font-medium">
          Memuat detail data rumah tangga...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg p-6 space-y-4">
        <div className="bg-error-bg border border-error-border text-error-text text-sm rounded-xl p-4">
          {errorMessage || "Data rumah tangga tidak ditemukan."}
        </div>
        <Link href="/rumah-tangga">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Rumah Tangga</span>
          </Button>
        </Link>
      </div>
    );
  }

  const kepala = data.kepala_rtm || (data.anggota && data.anggota[0]);
  const anggota = data.anggota && data.anggota.length > 0 
    ? data.anggota 
    : (kepala ? [kepala] : []);

  const totalLaki = anggota.filter(m => (m.jenis_kelamin || "").toUpperCase().startsWith("L")).length;
  const totalPerempuan = anggota.filter(m => (m.jenis_kelamin || "").toUpperCase().startsWith("P")).length;

  const rtVal = (data.rt || kepala?.rt || "").toString().trim();
  const rwVal = (data.rw || kepala?.rw || "").toString().trim();
  const rtFormatted = rtVal ? (rtVal.length === 1 ? `0${rtVal}` : rtVal) : "00";
  const rwFormatted = rwVal ? (rwVal.length === 1 ? `0${rwVal}` : rwVal) : "00";
  const rtRwDisplay = `RT ${rtFormatted} / RW ${rwFormatted}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader
        title={`Rumah Tangga: ${kepala?.nama || data.no_rtm}`}
        subtitle={`No. RTM: ${data.no_rtm} • Wilayah: ${data.dusun || kepala?.dusun || "Desa Guntung"}`}
        showBackButton={true}
        backButtonHref="/rumah-tangga"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintRTM}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Salinan RTM</span>
            </Button>
            {canUpdate && (
              <Link href={`/rumah-tangga/edit/${data.id}`}>
                <Button
                  size="sm"
                  className="gap-1.5 h-8 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full pb-16">
        {/* Top Summary Card */}
        <Card className="p-6 border-border-color shadow-xs bg-card-bg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar
                alt={kepala?.nama || "RTM"}
                fallback={kepala?.nama || "RTM"}
                size="xl"
                className="w-16 h-16 text-lg font-bold ring-2 ring-border-color shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-primary-text capitalize truncate">
                    {(kepala?.nama || "Kepala Belum Diatur").toLowerCase()}
                  </h2>
                  {data.bdt && data.bdt.trim().length > 0 ? (
                    <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                      BDT: {data.bdt}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      Non-Bansos
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-text mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <span>No. RTM:</span>
                    <strong className="text-primary-text">{data.no_rtm}</strong>
                    <button 
                      onClick={() => copyToClipboard(data.no_rtm, "rtm")}
                      className="text-secondary-text hover:text-primary-text p-0.5"
                      title="Salin No RTM"
                    >
                      {copiedField === "rtm" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                  {kepala?.nik && (
                    <span className="flex items-center gap-1">
                      <span>NIK Kepala:</span>
                      <strong className="text-primary-text">{kepala.nik}</strong>
                      <button 
                        onClick={() => copyToClipboard(kepala.nik, "nik")}
                        className="text-secondary-text hover:text-primary-text p-0.5"
                        title="Salin NIK Kepala"
                      >
                        {copiedField === "nik" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border-color">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs font-semibold">
                <Users className="w-4 h-4 text-primary" />
                <span>{anggota.length} Jiwa Terdaftar</span>
              </Badge>
            </div>
          </div>
        </Card>

        {/* 2-Column Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Detail Card */}
          <Card className="lg:col-span-2 p-5 border-border-color shadow-xs bg-card-bg space-y-4">
            <div className="flex items-center gap-2 border-b border-border-color pb-3">
              <Home className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-primary-text">
                Informasi Rumah Tangga & Wilayah
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
              <div>
                <p className="text-secondary-text font-medium mb-0.5">Alamat Domisili</p>
                <p className="font-semibold text-primary-text">
                  {data.alamat || kepala?.alamat_saat_ini || data.dusun || "-"}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Wilayah Dusun / RT / RW</p>
                <p className="font-semibold text-primary-text">
                  {data.dusun || kepala?.dusun || "-"} • {rtRwDisplay}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Desa & Kecamatan</p>
                <p className="font-semibold text-primary-text">
                  {identitasDesa?.nama_desa || "Desa Guntung"}, Kec. {identitasDesa?.nama_kecamatan || "-"}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Kabupaten & Provinsi</p>
                <p className="font-semibold text-primary-text">
                  {identitasDesa?.nama_kabupaten || "-"}, {identitasDesa?.nama_provinsi || "-"}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Nomor BDT / DTKS</p>
                <p className="font-mono font-semibold text-primary-text">
                  {data.bdt && data.bdt.trim().length > 0 ? data.bdt : "-"}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Klasifikasi / Kelas Sosial</p>
                <p className="font-semibold text-primary-text">
                  {data.kelas_sosial ? `Kelas ${data.kelas_sosial}` : "-"}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Tanggal Terdaftar</p>
                <p className="font-semibold text-primary-text">
                  {formatDateIndo(data.tgl_daftar || data.created_at)}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-medium mb-0.5">Keterangan Tambahan</p>
                <p className="font-medium text-primary-text">
                  {data.keterangan || "-"}
                </p>
              </div>
            </div>
          </Card>

          {/* Demographic Breakdown Card */}
          <Card className="p-5 border-border-color shadow-xs bg-card-bg space-y-4">
            <div className="flex items-center gap-2 border-b border-border-color pb-3">
              <Users className="w-4 h-4 text-secondary-text" />
              <h3 className="text-sm font-bold text-primary-text">
                Komposisi Rumah Tangga
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-body-bg border border-border-color">
                <span className="text-secondary-text">Total Anggota:</span>
                <span className="font-bold text-primary-text font-mono text-sm">{anggota.length} Jiwa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-body-bg border border-border-color">
                <span className="text-secondary-text">Laki-laki:</span>
                <span className="font-semibold text-primary-text font-mono">{totalLaki} Jiwa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-body-bg border border-border-color">
                <span className="text-secondary-text">Perempuan:</span>
                <span className="font-semibold text-primary-text font-mono">{totalPerempuan} Jiwa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-body-bg border border-border-color">
                <span className="text-secondary-text">Status Bantuan:</span>
                <span className="font-semibold text-primary-text">
                  {data.bdt ? "Penerima BDT" : "Non-Bansos"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Member Table Card */}
        <Card className="border-border-color shadow-xs bg-card-bg overflow-hidden">
          <div className="p-4 border-b border-border-color flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-primary-text">
                Daftar Anggota Rumah Tangga ({anggota.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-body-bg border-b border-border-color text-secondary-text font-semibold">
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3 min-w-[160px]">Nama Lengkap</th>
                  <th className="px-4 py-3 min-w-[130px]">NIK</th>
                  <th className="px-4 py-3 min-w-[130px]">No. KK</th>
                  <th className="px-4 py-3 min-w-[120px]">Hubungan RTM</th>
                  <th className="px-4 py-3 min-w-[110px]">Hubungan KK</th>
                  <th className="px-4 py-3 w-24">JK</th>
                  <th className="px-4 py-3 min-w-[120px]">Tempat / Tgl Lahir</th>
                  <th className="px-4 py-3 min-w-[110px]">Pendidikan</th>
                  <th className="px-4 py-3 min-w-[110px]">Pekerjaan</th>
                  <th className="px-4 py-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {anggota.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-secondary-text text-xs">
                      Belum ada data anggota untuk rumah tangga ini.
                    </td>
                  </tr>
                ) : (
                  anggota.map((item, idx) => {
                    const isKepala = item.id === data.kepala_rtm_id || item.rtm_level_id === 1 || idx === 0;
                    const statusRtm = isKepala ? "KEPALA RTM" : (item.status_dalam_rumah_tangga || "ANGGOTA");
                    const hubKeluarga = item.hubungan_keluarga || (isKepala ? "KEPALA KELUARGA" : "-");

                    return (
                      <tr key={item.id || idx} className="hover:bg-card-hover/50 transition-colors">
                        <td className="px-4 py-3 text-center font-mono text-secondary-text">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary-text uppercase">
                          <div className="flex items-center gap-2">
                            <span>{item.nama}</span>
                            {isKepala && (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 font-semibold bg-primary/10 text-primary border-primary/20">
                                Kepala
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-secondary-text">
                          {item.nik || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-secondary-text">
                          {item.no_kk || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={isKepala ? "default" : "outline"} className={isKepala ? "text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20 font-semibold" : "text-[10px] px-2 py-0.5"}>
                            {statusRtm}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-secondary-text capitalize">
                          {hubKeluarga.toLowerCase()}
                        </td>
                        <td className="px-4 py-3 text-secondary-text">
                          {item.jenis_kelamin || "-"}
                        </td>
                        <td className="px-4 py-3 text-secondary-text">
                          {item.tempat_lahir ? `${item.tempat_lahir}, ` : ""}
                          <span className="font-mono">{formatDateIndo(item.tanggal_lahir)}</span>
                        </td>
                        <td className="px-4 py-3 text-secondary-text uppercase text-[11px]">
                          {item.pendidikan_kk || item.pendidikan_saat_ini || "-"}
                        </td>
                        <td className="px-4 py-3 text-secondary-text uppercase text-[11px]">
                          {item.pekerjaan || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.nik && (
                            <Link 
                              href={`/penduduk/${item.nik}`} 
                              className="text-primary hover:underline text-xs inline-flex items-center gap-1 font-medium"
                              title="Lihat profil penduduk"
                            >
                              <span>Detail</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DetailRumahTanggaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col h-full bg-body-bg items-center justify-center p-6 gap-3">
          <div className="w-8 h-8 border-2 border-border-color border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-secondary-text font-medium">Memuat detail rumah tangga...</p>
        </div>
      }
    >
      <DetailRumahTanggaPageInner />
    </Suspense>
  );
}
