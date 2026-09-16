"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Pencil, 
  Eye, 
  Filter as FilterIcon,
  Users,
  Check,
  Plus,
  Printer,
  FileText
} from "lucide-react";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { getKeluargaList, deleteKeluarga, Keluarga } from "@/lib/services/keluarga";
import { useReferenceData } from "@/lib/services/referensi";
import { getIdentitasDesa, IdentitasDesa, getPamong, Pamong } from "@/lib/services/surat";

// UI Components
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function KeluargaPage() {
  const router = useRouter();
  const resource: PermissionResource = "keluarga";
  const { canCreate, canUpdate, canDelete } = useRbac(resource);
  const { dusun: dusunList } = useReferenceData();

  // Data States
  const [data, setData] = useState<Keluarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [identitasDesa, setIdentitasDesa] = useState<IdentitasDesa | null>(null);
  const [pamongList, setPamongList] = useState<Pamong[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [dusunFilter, setDusunFilter] = useState<string>("Semua");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedKeluarga, setSelectedKeluarga] = useState<Keluarga | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchData();
    fetchIdentitasAndPamong();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getKeluargaList();
      setData(result || []);
    } catch (error) {
      console.error("Error fetching keluarga:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIdentitasAndPamong = async () => {
    try {
      const [idDesa, pamongs] = await Promise.all([
        getIdentitasDesa(),
        getPamong()
      ]);
      if (idDesa) setIdentitasDesa(idDesa);
      if (pamongs) setPamongList(pamongs);
    } catch (e) {
      console.error("Error fetching identitas/pamong:", e);
    }
  };

  // Derived Data: Dusun Options
  const dusunOptions = useMemo(() => {
    if (dusunList && dusunList.length > 0) {
      return dusunList.map((d: any) => d.nama || d.nama_dusun || `DUSUN ${d.id}`);
    }
    const dusuns = new Set<string>();
    data.forEach((item) => {
      if (item.dusun) dusuns.add(item.dusun);
    });
    return Array.from(dusuns).sort();
  }, [dusunList, data]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = 
        item.nomorKK.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.headNik.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "Semua" || item.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDusun = dusunFilter === "Semua" || (item.dusun && item.dusun.toLowerCase().includes(dusunFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesDusun;
    });
  }, [data, searchTerm, statusFilter, dusunFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Actions
  const handleDelete = async (keluarga: Keluarga) => {
    if (!canDelete) return;
    
    if (confirm(`Yakin ingin menghapus KK ${keluarga.nomorKK}? Semua anggota akan dihapus nomor KK-nya.`)) {
      try {
        await deleteKeluarga(keluarga.nomorKK, keluarga.members);
        toast.success(`Data KK ${keluarga.nomorKK} berhasil dihapus`);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete keluarga", error);
        toast.error("Gagal menghapus data keluarga.");
      }
    }
  };

  const handleViewDetail = (keluarga: Keluarga) => {
    setSelectedKeluarga(keluarga);
    setDetailOpen(true);
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

  const handlePrintKK = () => {
    if (!selectedKeluarga) return;

    const headRes = selectedKeluarga.members.find(
      (m) => (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA"
    ) || selectedKeluarga.members[0];

    const rtVal = (headRes?.rt || "").toString().trim();
    const rwVal = (headRes?.rw || "").toString().trim();
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
    const alamatKeluarga = selectedKeluarga.addressLine || headRes?.alamat_saat_ini || selectedKeluarga.dusun || "-";

    const membersTable1Rows = selectedKeluarga.members
      .map(
        (m, idx) => `
        <tr>
          <td style="text-align:center; padding: 4px 2px;">${idx + 1}</td>
          <td style="font-weight:bold; text-transform:uppercase; padding: 4px 6px;">${m.nama || "-"}</td>
          <td style="font-family:monospace; text-align:center; padding: 4px 4px;">${m.nik || "-"}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 2px;">${m.jenis_kelamin || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 4px;">${m.tempat_lahir || "-"}</td>
          <td style="text-align:center; font-family:monospace; padding: 4px 4px;">${formatDateIndo(m.tanggal_lahir)}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 4px;">${m.agama || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 4px;">${m.pendidikan_kk || m.pendidikan_saat_ini || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 4px;">${m.pekerjaan || "-"}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 2px;">${m.golongan_darah || "-"}</td>
        </tr>
      `
      )
      .join("");

    const membersTable2Rows = selectedKeluarga.members
      .map(
        (m, idx) => `
        <tr>
          <td style="text-align:center; padding: 4px 2px;">${idx + 1}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 4px;">${m.status_kawin || "-"}</td>
          <td style="text-align:center; font-family:monospace; padding: 4px 4px;">${formatDateIndo(m.tanggal_perkawinan)}</td>
          <td style="font-weight:600; text-align:center; text-transform:uppercase; padding: 4px 4px;">${m.hubungan_keluarga || (idx === 0 ? "KEPALA KELUARGA" : "ANGGOTA")}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 2px;">${m.kewarganegaraan || "WNI"}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 4px;">${m.no_paspor || "-"}</td>
          <td style="text-align:center; text-transform:uppercase; padding: 4px 4px;">${m.no_kitas || m.no_kitap || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 6px;">${m.nama_ayah || "-"}</td>
          <td style="text-transform:uppercase; padding: 4px 6px;">${m.nama_ibu || "-"}</td>
        </tr>
      `
      )
      .join("");

    const printHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Salinan Kartu Keluarga - ${selectedKeluarga.nomorKK}</title>
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
            letter-spacing: 3px;
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
            width: 140px;
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
            font-size: 10px;
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
            font-size: 8.5px;
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
          <h1>KARTU KELUARGA</h1>
          <p>No. ${selectedKeluarga.nomorKK}</p>
        </div>

        <table class="meta-table">
          <tr>
            <td style="width: 50%; padding-right: 15px;">
              <table style="width: 100%;">
                <tr>
                  <td class="meta-label">Nama Kepala Keluarga</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val bold">${selectedKeluarga.headName || "-"}</td>
                </tr>
                <tr>
                  <td class="meta-label">Alamat</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val">${alamatKeluarga}</td>
                </tr>
                <tr>
                  <td class="meta-label">RT / RW</td>
                  <td class="meta-sep">:</td>
                  <td class="meta-val mono">${rtRwDisplay}</td>
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
              </table>
            </td>
          </tr>
        </table>

        <!-- TABEL I -->
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25px;">No</th>
              <th style="min-width: 140px;">Nama Lengkap</th>
              <th style="min-width: 120px;">NIK</th>
              <th style="width: 75px;">Jenis Kelamin</th>
              <th style="min-width: 90px;">Tempat Lahir</th>
              <th style="width: 75px;">Tgl Lahir</th>
              <th style="width: 65px;">Agama</th>
              <th style="min-width: 100px;">Pendidikan</th>
              <th style="min-width: 110px;">Jenis Pekerjaan</th>
              <th style="width: 40px;">Gol. Darah</th>
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
            </tr>
          </thead>
          <tbody>
            ${membersTable1Rows}
          </tbody>
        </table>

        <!-- TABEL II -->
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25px;" rowspan="2">No</th>
              <th style="min-width: 95px;" rowspan="2">Status Perkawinan</th>
              <th style="width: 75px;" rowspan="2">Tgl Perkawinan</th>
              <th style="min-width: 120px;" rowspan="2">Status Hubungan Dalam Keluarga</th>
              <th style="width: 75px;" rowspan="2">Kewarganegaraan</th>
              <th colspan="2">Dokumen Imigrasi</th>
              <th colspan="2">Nama Orang Tua</th>
            </tr>
            <tr>
              <th style="min-width: 80px;">No. Paspor</th>
              <th style="min-width: 80px;">No. KITAS/KITAP</th>
              <th style="min-width: 110px;">Ayah</th>
              <th style="min-width: 110px;">Ibu</th>
            </tr>
            <tr>
              <th class="subnum">(1)</th>
              <th class="subnum">(11)</th>
              <th class="subnum">(12)</th>
              <th class="subnum">(13)</th>
              <th class="subnum">(14)</th>
              <th class="subnum">(15)</th>
              <th class="subnum">(16)</th>
              <th class="subnum">(17)</th>
              <th class="subnum">(18)</th>
            </tr>
          </thead>
          <tbody>
            ${membersTable2Rows}
          </tbody>
        </table>

        <!-- TANDA TANGAN -->
        <table class="footer-table">
          <tr>
            <td>
              <div class="sign-title">KEPALA KELUARGA</div>
              <div class="sign-name">${selectedKeluarga.headName || "-"}</div>
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
            Dokumen Salinan Kartu Keluarga ini bukan merupakan dokumen resmi yang diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil), melainkan data salinan kependudukan yang dikeluarkan oleh sistem informasi desa untuk keperluan administrasi internal.
          </div>
        </div>
      </body>
      </html>
    `;

    // Remove any previous print iframe
    const existingIframe = document.getElementById("print-kk-iframe");
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "print-kk-iframe";
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

  // Columns Configuration
  const columns: Column<Keluarga>[] = [
    {
      header: "Kepala Keluarga",
      accessorKey: "headName",
      cell: (row) => (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(row);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Klik untuk melihat Salinan Kartu Keluarga"
        >
          <Avatar 
            alt={row.headName} 
            fallback={row.headName.substring(0, 2).toUpperCase()}
            size="md"
            shape="circle"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-primary-text group-hover:text-primary transition-colors capitalize">
              {(row.headName || "").toLowerCase()}
            </span>
            <span className="text-xs font-mono text-secondary-text">NIK: {row.headNik}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Nomor KK",
      accessorKey: "nomorKK",
      className: "font-medium font-mono text-xs",
    },
    {
      header: "Alamat & Wilayah",
      accessorKey: "addressLine",
      cell: (row) => (
        <div className="flex flex-col max-w-[240px]">
          <span className="truncate text-sm text-primary-text" title={row.addressLine}>{row.addressLine || "-"}</span>
          <span className="text-xs text-secondary-text truncate">{row.dusunRwRt || "-"}</span>
        </div>
      ),
    },
    {
      header: "Anggota",
      accessorKey: "totalMembers",
      cell: (row) => (
        <Badge variant="outline" className="gap-1 px-2.5 py-0.5">
          <Users className="w-3 h-3 text-secondary-text" />
          <span>{row.totalMembers} Jiwa</span>
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <Badge variant={row.statusVariant}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id",
      cell: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-text hover:text-primary-text">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetail(row)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4 text-secondary-text" />
                Lihat Kartu Keluarga
              </DropdownMenuItem>
              {canUpdate && (
                <DropdownMenuItem onClick={() => router.push(`/keluarga/${row.nomorKK}/edit`)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4 text-secondary-text" />
                  Ubah Data KK
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem 
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const mobileConfig: MobileConfig<Keluarga> = {
    titleKey: (row) => (
      <span 
        onClick={() => handleViewDetail(row)}
        className="capitalize font-semibold cursor-pointer text-primary"
      >
        {(row.headName || "").toLowerCase()}
      </span>
    ),
    subtitleKey: (row) => `No. KK: ${row.nomorKK}`,
    statusKey: (row) => (
      <Badge variant={row.statusVariant} className="text-[10px] px-1.5 h-5">
        {row.status}
      </Badge>
    ),
    action: (row) => (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-text hover:text-primary-text">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetail(row)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4 text-secondary-text" />
              Lihat Kartu Keluarga
            </DropdownMenuItem>
            {canUpdate && (
              <DropdownMenuItem onClick={() => router.push(`/keluarga/${row.nomorKK}/edit`)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4 text-secondary-text" />
                Ubah Data KK
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem 
                variant="destructive"
                className="cursor-pointer"
                onClick={() => handleDelete(row)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };

  return (
    <div className="flex flex-col h-full bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Data Keluarga"
        subtitle="Kelola kartu keluarga dan susunan anggota rumah tangga"
      />

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-text" />
              </div>
              <Input
                placeholder="Cari KK, Nama Kepala, NIK..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-card-bg border-border-color text-primary-text"
              />
            </div>

            {/* Filter Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-secondary-text bg-card-bg border-border-color gap-2 h-9 border-dashed">
                  <FilterIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Status</span>
                  {statusFilter !== "Semua" && (
                    <Badge variant="default" className="ml-1 h-5 px-1">
                      {statusFilter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["Semua", "Aktif", "Pindah", "Meninggal"].map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className="justify-between cursor-pointer"
                  >
                    {status}
                    {statusFilter === status && <Check className="h-3.5 w-3.5 opacity-50" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dusun */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-secondary-text bg-card-bg border-border-color gap-2 h-9 border-dashed">
                  <FilterIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Dusun</span>
                  {dusunFilter !== "Semua" && (
                    <Badge variant="default" className="ml-1 h-5 px-1">
                      {dusunFilter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <DropdownMenuLabel>Filter Dusun</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setDusunFilter("Semua"); setCurrentPage(1); }} className="justify-between cursor-pointer">
                  Semua
                  {dusunFilter === "Semua" && <Check className="h-3.5 w-3.5 opacity-50" />}
                </DropdownMenuItem>
                {dusunOptions.map((dusun) => (
                  <DropdownMenuItem 
                    key={dusun} 
                    onClick={() => {
                      setDusunFilter(dusun);
                      setCurrentPage(1);
                    }}
                    className="justify-between cursor-pointer"
                  >
                    {dusun}
                    {dusunFilter === dusun && <Check className="h-3.5 w-3.5 opacity-50" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {canCreate && (
              <Link href="/keluarga/tambah">
                <Button className="gap-2 h-9">
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Tambah Keluarga</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* DataTable with onRowClick */}
      <DataTable
        columns={columns}
        data={currentData}
        mobileConfig={mobileConfig}
        loading={loading}
        onRowClick={handleViewDetail}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredData.length}
        itemsPerPage={pageSize}
        onItemsPerPageChange={setPageSize}
        sticky={true}
      />

      {/* Official Indonesian Kartu Keluarga Preview Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[96vw] xl:max-w-7xl w-full max-h-[94vh] overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border-color pb-3">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Salinan Kartu Keluarga Resmi
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintKK}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Salinan KK</span>
              </Button>
              {canUpdate && selectedKeluarga && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/keluarga/${selectedKeluarga.nomorKK}/edit`)}
                  className="gap-1.5 h-8 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {selectedKeluarga && (
            <div id="kk-official-print" className="bg-white text-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-200 shadow-sm print:border-none print:shadow-none print:p-0">
              {/* KK Header */}
              <div className="text-center pb-4 border-b-2 border-zinc-900 mb-5">
                <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase font-serif text-zinc-950">
                  KARTU KELUARGA
                </h1>
                <p className="text-sm md:text-base font-bold tracking-wider font-mono text-zinc-800 mt-0.5">
                  No. {selectedKeluarga.nomorKK}
                </p>
              </div>

              {/* KK Metadata (2 Columns) */}
              {(() => {
                const headRes = selectedKeluarga.members.find(m => (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA") || selectedKeluarga.members[0];
                const rtVal = (headRes?.rt || "").toString().trim();
                const rwVal = (headRes?.rw || "").toString().trim();
                const rtFormatted = rtVal ? (rtVal.length === 1 ? `0${rtVal}` : rtVal) : "00";
                const rwFormatted = rwVal ? (rwVal.length === 1 ? `0${rwVal}` : rwVal) : "00";
                const rtRwDisplay = `${rtFormatted}/${rwFormatted}`;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs mb-6 text-zinc-800">
                    {/* Left Column */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Nama Kepala Keluarga</span>
                        <span>:</span>
                        <span className="font-bold uppercase">{selectedKeluarga.headName || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Alamat</span>
                        <span>:</span>
                        <span className="uppercase">{selectedKeluarga.addressLine || headRes?.alamat_saat_ini || selectedKeluarga.dusun || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">RT / RW</span>
                        <span>:</span>
                        <span className="uppercase font-mono">{rtRwDisplay}</span>
                      </div>
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Desa / Kelurahan</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_desa || headRes?.nama_desa || "-"}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Kecamatan</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_kecamatan || headRes?.nama_kecamatan || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Kabupaten / Kota</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_kabupaten || headRes?.nama_kabupaten || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Kode Pos</span>
                        <span>:</span>
                        <span className="font-mono">{identitasDesa?.kode_pos || headRes?.kode_pos || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[140px_12px_1fr]">
                        <span className="font-semibold uppercase">Provinsi</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_provinsi || headRes?.nama_provinsi || "-"}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TABEL I: Data Anggota Keluarga (Identitas Pribadi & Kelahiran) */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-zinc-900 text-left">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-900 text-center font-bold">
                      <th className="border border-zinc-900 p-1.5 w-7">No</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[150px]">Nama Lengkap</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[130px]">NIK</th>
                      <th className="border border-zinc-900 p-1.5 w-24">Jenis Kelamin</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[100px]">Tempat Lahir</th>
                      <th className="border border-zinc-900 p-1.5 w-24">Tgl Lahir</th>
                      <th className="border border-zinc-900 p-1.5 w-20">Agama</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[120px]">Pendidikan</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[120px]">Jenis Pekerjaan</th>
                      <th className="border border-zinc-900 p-1.5 w-12">Gol. Darah</th>
                    </tr>
                    <tr className="bg-zinc-50 text-[9px] text-zinc-500 text-center">
                      <th className="border border-zinc-900 p-0.5">(1)</th>
                      <th className="border border-zinc-900 p-0.5">(2)</th>
                      <th className="border border-zinc-900 p-0.5">(3)</th>
                      <th className="border border-zinc-900 p-0.5">(4)</th>
                      <th className="border border-zinc-900 p-0.5">(5)</th>
                      <th className="border border-zinc-900 p-0.5">(6)</th>
                      <th className="border border-zinc-900 p-0.5">(7)</th>
                      <th className="border border-zinc-900 p-0.5">(8)</th>
                      <th className="border border-zinc-900 p-0.5">(9)</th>
                      <th className="border border-zinc-900 p-0.5">(10)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedKeluarga.members.map((member, idx) => (
                      <tr key={member.nik || idx} className="hover:bg-zinc-50">
                        <td className="border border-zinc-900 p-1.5 text-center font-medium">{idx + 1}</td>
                        <td className="border border-zinc-900 p-1.5 font-bold uppercase">{member.nama || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 font-mono text-center">{member.nik || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.jenis_kelamin || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 uppercase">{member.tempat_lahir || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 text-center font-mono">{formatDateIndo(member.tanggal_lahir)}</td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.agama || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 uppercase">{member.pendidikan_kk || member.pendidikan_saat_ini || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 uppercase">{member.pekerjaan || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.golongan_darah || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TABEL II: Data Status Perkawinan, Hubungan Keluarga & Orang Tua */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-zinc-900 text-left">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-900 text-center font-bold">
                      <th className="border border-zinc-900 p-1.5 w-7" rowSpan={2}>No</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[110px]" rowSpan={2}>Status Perkawinan</th>
                      <th className="border border-zinc-900 p-1.5 w-24" rowSpan={2}>Tgl Perkawinan</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[130px]" rowSpan={2}>Status Hubungan Dalam Keluarga</th>
                      <th className="border border-zinc-900 p-1.5 w-24" rowSpan={2}>Kewarganegaraan</th>
                      <th className="border border-zinc-900 p-1.5" colSpan={2}>Dokumen Imigrasi</th>
                      <th className="border border-zinc-900 p-1.5" colSpan={2}>Nama Orang Tua</th>
                    </tr>
                    <tr className="bg-zinc-100 text-zinc-900 text-center font-bold">
                      <th className="border border-zinc-900 p-1.5 min-w-[90px]">No. Paspor</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[90px]">No. KITAS/KITAP</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[120px]">Ayah</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[120px]">Ibu</th>
                    </tr>
                    <tr className="bg-zinc-50 text-[9px] text-zinc-500 text-center">
                      <th className="border border-zinc-900 p-0.5">(1)</th>
                      <th className="border border-zinc-900 p-0.5">(11)</th>
                      <th className="border border-zinc-900 p-0.5">(12)</th>
                      <th className="border border-zinc-900 p-0.5">(13)</th>
                      <th className="border border-zinc-900 p-0.5">(14)</th>
                      <th className="border border-zinc-900 p-0.5">(15)</th>
                      <th className="border border-zinc-900 p-0.5">(16)</th>
                      <th className="border border-zinc-900 p-0.5">(17)</th>
                      <th className="border border-zinc-900 p-0.5">(18)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedKeluarga.members.map((member, idx) => (
                      <tr key={member.nik || idx} className="hover:bg-zinc-50">
                        <td className="border border-zinc-900 p-1.5 text-center font-medium">{idx + 1}</td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.status_kawin || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 text-center font-mono">{formatDateIndo(member.tanggal_perkawinan)}</td>
                        <td className="border border-zinc-900 p-1.5 font-semibold text-center uppercase">
                          {member.hubungan_keluarga || (idx === 0 ? "KEPALA KELUARGA" : "ANGGOTA")}
                        </td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.kewarganegaraan || "WNI"}</td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.no_paspor || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.no_kitas || member.no_kitap || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 uppercase">{member.nama_ayah || "-"}</td>
                        <td className="border border-zinc-900 p-1.5 uppercase">{member.nama_ibu || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* KK Footer / Tanda Tangan */}
              {(() => {
                const kadesPamong = pamongList.find(p => {
                  const jab = (p.jabatan || "").toUpperCase();
                  return jab.includes("KEPALA DESA") || jab.includes("KADES") || p.jabatan_id === 1 || p.jabatan_id === 13 || p.pamong_ttd === 1;
                });
                const namaKades = kadesPamong?.pamong_nama || identitasDesa?.nama_kepala_desa || "";

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-center">
                      <div>
                        <p className="font-semibold uppercase mb-16">KEPALA KELUARGA</p>
                        <p className="font-bold uppercase underline tracking-wider">{selectedKeluarga.headName}</p>
                      </div>
                      <div>
                        <p className="mb-0.5">Dikeluarkan Tanggal: {formatDateIndo(new Date().toISOString())}</p>
                        <p className="font-semibold uppercase mb-16">KEPALA DESA {identitasDesa?.nama_desa || "GUNTUNG"}</p>
                        <p className="font-bold uppercase underline tracking-wider">
                          {namaKades || "( .................................... )"}
                        </p>
                      </div>
                    </div>

                    {/* Disclaimer / Catatan Sistem */}
                    <div className="mt-8 pt-3 border-t border-dashed border-zinc-300 text-[10px] text-zinc-500 text-center leading-relaxed">
                      <p className="font-bold text-zinc-600 uppercase tracking-wider mb-0.5">PEMBERITAHUAN / CATATAN SISTEM</p>
                      <p className="italic">
                        Dokumen Salinan Kartu Keluarga ini bukan merupakan dokumen resmi yang diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil), melainkan data salinan kependudukan yang dikeluarkan oleh sistem informasi desa untuk keperluan administrasi internal.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <DialogFooter className="border-t border-border-color pt-3 print:hidden">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

