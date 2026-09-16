"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MoreHorizontal,
  Home,
  Eye,
  Pencil,
  Trash2,
  Check,
  Filter as FilterIcon,
  Plus,
  Printer,
  FileText,
  Users,
  RotateCcw,
  ExternalLink,
  MapPin
} from "lucide-react";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { RumahTangga, getRumahTanggaList, deleteRumahTangga, sortRtmMembers } from "@/lib/services/rumah_tangga";
import { useReferenceData } from "@/lib/services/referensi";
import { getIdentitasDesa, IdentitasDesa, getPamong, Pamong } from "@/lib/services/surat";

// UI Components
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
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

export default function RumahTanggaPage() {
  const router = useRouter();
  const resource: PermissionResource = "rumah_tangga";
  const { canCreate, canUpdate, canDelete } = useRbac(resource);
  const { dusun: dusunList } = useReferenceData();

  // Data States
  const [dataRumahTangga, setDataRumahTangga] = useState<RumahTangga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [identitasDesa, setIdentitasDesa] = useState<IdentitasDesa | null>(null);
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Penerima" | "Non-Bansos">("Semua");
  const [dusunFilter, setDusunFilter] = useState("Semua");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal Detail State
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRtm, setSelectedRtm] = useState<RumahTangga | null>(null);

  useEffect(() => {
    fetchData();
    fetchIdentitasAndPamong();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getRumahTanggaList();
      setDataRumahTangga(data || []);
    } catch (error) {
      console.error("Error fetching data rumah tangga:", error);
      toast.error("Gagal memuat data rumah tangga");
      setDataRumahTangga([]);
    } finally {
      setIsLoading(false);
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

  const handleDelete = async (id: string, noRtm: string) => {
    if (!canDelete) return;
    if (confirm(`Yakin ingin menghapus Rumah Tangga No. ${noRtm}? Anggota akan dilepaskan status rumah tangganya.`)) {
      try {
        await deleteRumahTangga(id);
        toast.success(`Data Rumah Tangga ${noRtm} berhasil dihapus`);
        fetchData();
        if (selectedRtm?.id === id) {
          setDetailOpen(false);
          setSelectedRtm(null);
        }
      } catch (error) {
        console.error("Error deleting rumah tangga:", error);
        toast.error("Gagal menghapus data rumah tangga");
      }
    }
  };

  const handleOpenDetail = (rtm: RumahTangga) => {
    setSelectedRtm(rtm);
    setDetailOpen(true);
  };

  // Helper date formatter
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

  // Statistics KPI
  const stats = useMemo(() => {
    const totalRtm = dataRumahTangga.length;
    let totalJiwa = 0;
    let totalBansos = 0;

    dataRumahTangga.forEach(rtm => {
      totalJiwa += rtm.jumlah_anggota || (rtm.anggota?.length || 1);
      if (rtm.bdt && rtm.bdt.trim().length > 0) {
        totalBansos += 1;
      }
    });

    const totalNonBansos = totalRtm - totalBansos;
    const avgJiwa = totalRtm > 0 ? (totalJiwa / totalRtm).toFixed(1) : "0";

    return { totalRtm, totalJiwa, totalBansos, totalNonBansos, avgJiwa };
  }, [dataRumahTangga]);

  // Extract Dusun Options
  const dusunOptions = useMemo(() => {
    if (dusunList && dusunList.length > 0) {
      return dusunList.map((d: any) => d.nama || d.nama_dusun || `DUSUN ${d.id}`);
    }
    const dusuns = new Set<string>();
    dataRumahTangga.forEach(item => {
      if (item.dusun) dusuns.add(item.dusun);
    });
    return Array.from(dusuns).sort();
  }, [dusunList, dataRumahTangga]);

  // Filter Logic
  const filteredRumahTangga = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = dataRumahTangga;

    // Filter Status
    if (statusFilter === "Penerima") {
      result = result.filter((item) => item.bdt && item.bdt.trim().length > 0);
    } else if (statusFilter === "Non-Bansos") {
      result = result.filter((item) => !item.bdt || item.bdt.trim().length === 0);
    }

    // Filter Dusun
    if (dusunFilter !== "Semua") {
      result = result.filter(item => item.dusun && item.dusun.toLowerCase().includes(dusunFilter.toLowerCase()));
    }

    // Filter Search
    if (term) {
      result = result.filter((item) => {
        const nomor = (item.no_rtm || "").toLowerCase();
        const nama = (item.kepala_rtm?.nama || "").toLowerCase();
        const nik = (item.kepala_rtm?.nik || "").toLowerCase();
        const bdt = (item.bdt || "").toLowerCase();
        return nomor.includes(term) || nama.includes(term) || nik.includes(term) || bdt.includes(term);
      });
    }

    // Sort
    const sorted = [...result].sort((a, b) => {
      const left = a.no_rtm || "";
      const right = b.no_rtm || "";
      const compare = left.localeCompare(right);
      return sortDirection === "asc" ? compare : -compare;
    });

    return sorted;
  }, [dataRumahTangga, searchTerm, statusFilter, dusunFilter, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRumahTangga.length / rowsPerPage));

  const paginatedRumahTangga = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRumahTangga.slice(start, start + rowsPerPage);
  }, [filteredRumahTangga, currentPage, rowsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("Semua");
    setDusunFilter("Semua");
    setCurrentPage(1);
  };

  const isFilterActive = searchTerm !== "" || statusFilter !== "Semua" || dusunFilter !== "Semua";

  // Standalone Hidden Iframe Printing for A4 Landscape
  const handlePrintRTM = () => {
    if (!selectedRtm) return;

    const headRes = selectedRtm.kepala_rtm || (selectedRtm.anggota && selectedRtm.anggota[0]);
    const membersList = selectedRtm.anggota && selectedRtm.anggota.length > 0 
      ? selectedRtm.anggota 
      : (headRes ? [headRes] : []);

    const rtVal = (selectedRtm.rt || headRes?.rt || "").toString().trim();
    const rwVal = (selectedRtm.rw || headRes?.rw || "").toString().trim();
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
    const alamatRtm = selectedRtm.alamat || headRes?.alamat_saat_ini || selectedRtm.dusun || "-";
    const bdtDisplay = selectedRtm.bdt && selectedRtm.bdt.trim().length > 0 ? selectedRtm.bdt : "-";
    const kelasSosialDisplay = selectedRtm.kelas_sosial ? `Kelas ${selectedRtm.kelas_sosial}` : "-";

    const memberRows = membersList.map((m, idx) => {
      const isKepala = m.id === selectedRtm.kepala_rtm_id || m.rtm_level_id === 1 || idx === 0;
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
        <title>Salinan Kartu Rumah Tangga - ${selectedRtm.no_rtm}</title>
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
          <p>No. RTM: ${selectedRtm.no_rtm}</p>
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
                  <td class="meta-val">${selectedRtm.dusun || headRes?.dusun || "-"}</td>
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

    // Remove any previous print iframe
    const existingIframe = document.getElementById("print-rtm-iframe");
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "print-rtm-iframe";
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

  // DataTable Columns Configuration
  const columns: Column<RumahTangga>[] = [
    {
      header: "No",
      accessorKey: "id",
      className: "w-12 text-center text-xs text-secondary-text font-mono",
      cell: (row) => {
        const index = paginatedRumahTangga.findIndex(item => item.id === row.id);
        return (currentPage - 1) * rowsPerPage + (index >= 0 ? index + 1 : 1);
      }
    },
    {
      header: "Kepala Rumah Tangga",
      accessorKey: "kepala_rtm",
      cell: (row) => {
        const nama = row.kepala_rtm?.nama || "-";
        const nik = row.kepala_rtm?.nik || "-";
        return (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail(row);
            }}
            className="flex items-center gap-3 cursor-pointer group"
            title="Klik untuk melihat Salinan Kartu Rumah Tangga"
          >
            <Avatar 
              alt={nama}
              fallback={nama} 
              className="h-9 w-9 text-xs font-bold ring-1 ring-border-color shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-primary-text group-hover:text-primary transition-colors capitalize truncate text-sm">
                {nama.toLowerCase()}
              </span>
              <span className="text-xs font-mono text-secondary-text">NIK: {nik}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: "Nomor RTM & Status",
      accessorKey: "no_rtm",
      cell: (row) => {
        const hasBansos = row.bdt && row.bdt.trim().length > 0;
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="font-mono text-xs font-semibold text-primary-text">
              {row.no_rtm}
            </span>
            {hasBansos ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-mono">
                BDT: {row.bdt}
              </Badge>
            ) : (
              <span className="text-[11px] text-secondary-text">Non-Bansos</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Alamat & Wilayah",
      accessorKey: "alamat",
      cell: (row) => {
        const rtVal = (row.rt || "").toString().trim();
        const rwVal = (row.rw || "").toString().trim();
        const rtRw = `RT ${rtVal ? (rtVal.length === 1 ? `0${rtVal}` : rtVal) : "00"} / RW ${rwVal ? (rwVal.length === 1 ? `0${rwVal}` : rwVal) : "00"}`;
        const dusunName = row.dusun ? (row.dusun.toUpperCase().startsWith("DUSUN") ? row.dusun : `Dusun ${row.dusun}`) : "-";

        return (
          <div className="flex flex-col max-w-[240px]">
            <span className="truncate text-sm text-primary-text" title={row.alamat || dusunName}>
              {row.alamat || dusunName}
            </span>
            <span className="text-xs text-secondary-text truncate">
              {dusunName} • {rtRw}
            </span>
          </div>
        );
      }
    },
    {
      header: "Anggota",
      accessorKey: "jumlah_anggota",
      className: "text-center",
      cell: (row) => (
        <div className="flex justify-center">
          <Badge variant="outline" className="gap-1 px-2.5 py-0.5 font-medium">
            <Users className="w-3 h-3 text-secondary-text" />
            <span>{row.jumlah_anggota || (row.anggota?.length || 1)} Jiwa</span>
          </Badge>
        </div>
      )
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center w-28",
      cell: (row) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-secondary-text hover:text-primary-text"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => handleOpenDetail(row)}
                className="cursor-pointer font-medium"
              >
                <FileText className="w-3.5 h-3.5 mr-2 text-primary" />
                Salinan Kartu RTM
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/rumah-tangga/${row.id}`} className="cursor-pointer">
                  <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                  Lihat Detail Penuh
                </Link>
              </DropdownMenuItem>
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/rumah-tangga/edit/${row.id}`} className="cursor-pointer">
                    <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                    Ubah Data
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(row.id, row.no_rtm)}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Hapus Data
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  // Mobile Configuration for DataTable
  const mobileConfig: MobileConfig<RumahTangga> = {
    titleKey: (row) => (
      <span className="capitalize font-semibold text-primary-text">
        {(row.kepala_rtm?.nama || "-").toLowerCase()}
      </span>
    ),
    subtitleKey: (row) => `No. RTM: ${row.no_rtm} • ${row.dusun || "-"}`,
    statusKey: (row) => (
      <div className="flex flex-col gap-1 items-end">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
          {row.jumlah_anggota || 1} Jiwa
        </Badge>
        {row.bdt && row.bdt.trim().length > 0 && (
          <Badge variant="success" className="text-[10px] px-1.5 py-0.2">
            BDT
          </Badge>
        )}
      </div>
    ),
    action: (row) => (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-secondary-text hover:text-primary-text"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => handleOpenDetail(row)}>
              <FileText className="w-3.5 h-3.5 mr-2 text-primary" />
              Salinan Kartu RTM
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/rumah-tangga/${row.id}`}>
                <Eye className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                Lihat Detail
              </Link>
            </DropdownMenuItem>
            {canUpdate && (
              <DropdownMenuItem asChild>
                <Link href={`/rumah-tangga/edit/${row.id}`}>
                  <Pencil className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                  Ubah Data
                </Link>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem 
                onClick={() => handleDelete(row.id, row.no_rtm)}
                variant="destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Hapus Data
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  };

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <PageHeader 
        title="Data Rumah Tangga (RTM)"
        subtitle="Kelola data rumah tangga, klasifikasi sosial, dan basis data terpadu (BDT/DTKS) desa"
        actions={
          canCreate && (
            <Link href="/rumah-tangga/tambah">
              <Button variant="primary" className="gap-1.5 h-9">
                <Plus className="w-4 h-4" />
                <span>Tambah Rumah Tangga</span>
              </Button>
            </Link>
          )
        }
      />

      {/* Toolbar / Filters */}
      <Card className="p-4 border-border-color">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text pointer-events-none" />
            <Input
              placeholder="Cari nomor RTM, NIK, nama kepala, atau nomor BDT..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 bg-card-bg border-border-color text-primary-text h-9 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Bansos Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-secondary-text border-border-color gap-1.5 h-9 text-xs">
                  <FilterIcon className="w-3.5 h-3.5" />
                  <span>Status:</span>
                  <span className="font-semibold text-primary-text">{statusFilter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Filter Status Bansos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["Semua", "Penerima", "Non-Bansos"] as const).map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className="justify-between cursor-pointer text-xs"
                  >
                    <span>{status === "Penerima" ? "Penerima BDT/Bansos" : status}</span>
                    {statusFilter === status && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dusun Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-secondary-text border-border-color gap-1.5 h-9 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Dusun:</span>
                  <span className="font-semibold text-primary-text truncate max-w-[100px]">{dusunFilter}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto custom-scrollbar w-48">
                <DropdownMenuLabel className="text-xs">Pilih Dusun</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => { setDusunFilter("Semua"); setCurrentPage(1); }} 
                  className="justify-between cursor-pointer text-xs"
                >
                  <span>Semua Dusun</span>
                  {dusunFilter === "Semua" && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
                {dusunOptions.map((dusun) => (
                  <DropdownMenuItem 
                    key={dusun} 
                    onClick={() => {
                      setDusunFilter(dusun);
                      setCurrentPage(1);
                    }}
                    className="justify-between cursor-pointer text-xs"
                  >
                    <span>{dusun}</span>
                    {dusunFilter === dusun && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Button */}
            {isFilterActive && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="gap-1 h-9 text-xs text-secondary-text hover:text-primary-text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* DataTable with onRowClick to open official preview modal */}
      <DataTable
        columns={columns}
        data={paginatedRumahTangga}
        mobileConfig={mobileConfig}
        loading={isLoading}
        onRowClick={handleOpenDetail}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredRumahTangga.length}
        itemsPerPage={rowsPerPage}
        onItemsPerPageChange={setRowsPerPage}
        sticky={true}
      />

      {/* Official Indonesian Salinan Kartu Rumah Tangga Preview Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[96vw] xl:max-w-7xl w-full max-h-[94vh] overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border-color pb-3">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Salinan Kartu Rumah Tangga (RTM)
              </DialogTitle>
            </div>
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
              {selectedRtm && (
                <Link href={`/rumah-tangga/${selectedRtm.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Halaman Detail</span>
                  </Button>
                </Link>
              )}
              {canUpdate && selectedRtm && (
                <Link href={`/rumah-tangga/edit/${selectedRtm.id}`}>
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
          </DialogHeader>

          {selectedRtm && (
            <div id="rtm-official-print" className="bg-white text-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-200 shadow-sm mt-3">
              {/* Document Header */}
              <div className="text-center pb-4 border-b-2 border-zinc-900 mb-5">
                <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase font-serif text-zinc-950">
                  KARTU RUMAH TANGGA (RTM)
                </h1>
                <p className="text-sm md:text-base font-bold tracking-wider font-mono text-zinc-800 mt-0.5">
                  No. RTM: {selectedRtm.no_rtm}
                </p>
              </div>

              {/* Document Metadata (2 Columns) */}
              {(() => {
                const headRes = selectedRtm.kepala_rtm || (selectedRtm.anggota && selectedRtm.anggota[0]);
                const rtVal = (selectedRtm.rt || headRes?.rt || "").toString().trim();
                const rwVal = (selectedRtm.rw || headRes?.rw || "").toString().trim();
                const rtFormatted = rtVal ? (rtVal.length === 1 ? `0${rtVal}` : rtVal) : "00";
                const rwFormatted = rwVal ? (rwVal.length === 1 ? `0${rwVal}` : rwVal) : "00";
                const rtRwDisplay = `${rtFormatted}/${rwFormatted}`;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs mb-6 text-zinc-800">
                    {/* Left Column */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Kepala Rumah Tangga</span>
                        <span>:</span>
                        <span className="font-bold uppercase">{headRes?.nama || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">NIK Kepala RTM</span>
                        <span>:</span>
                        <span className="font-mono">{headRes?.nik || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Alamat</span>
                        <span>:</span>
                        <span className="uppercase">{selectedRtm.alamat || headRes?.alamat_saat_ini || selectedRtm.dusun || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">RT / RW</span>
                        <span>:</span>
                        <span className="uppercase font-mono">{rtRwDisplay}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Dusun</span>
                        <span>:</span>
                        <span className="uppercase">{selectedRtm.dusun || headRes?.dusun || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Desa / Kelurahan</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_desa || headRes?.nama_desa || "GUNTUNG"}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Kecamatan</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_kecamatan || headRes?.nama_kecamatan || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Kabupaten / Kota</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_kabupaten || headRes?.nama_kabupaten || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Kode Pos</span>
                        <span>:</span>
                        <span className="font-mono">{identitasDesa?.kode_pos || headRes?.kode_pos || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Provinsi</span>
                        <span>:</span>
                        <span className="uppercase">{identitasDesa?.nama_provinsi || headRes?.nama_provinsi || "-"}</span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">No. BDT / DTKS</span>
                        <span>:</span>
                        <span className="font-mono font-bold text-zinc-950">
                          {selectedRtm.bdt && selectedRtm.bdt.trim().length > 0 ? selectedRtm.bdt : "-"}
                        </span>
                      </div>
                      <div className="grid grid-cols-[150px_12px_1fr]">
                        <span className="font-semibold uppercase">Klasifikasi Sosial</span>
                        <span>:</span>
                        <span>{selectedRtm.kelas_sosial ? `Kelas ${selectedRtm.kelas_sosial}` : "-"}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TABLE: Daftar Anggota Rumah Tangga */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-zinc-900 text-left">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-900 text-center font-bold">
                      <th className="border border-zinc-900 p-1.5 w-7">No</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[140px]">Nama Lengkap</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[120px]">NIK</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[120px]">Nomor KK</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[110px]">Hubungan RTM</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[100px]">Hubungan KK</th>
                      <th className="border border-zinc-900 p-1.5 w-20">Jenis Kelamin</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[90px]">Tempat Lahir</th>
                      <th className="border border-zinc-900 p-1.5 w-24">Tgl Lahir</th>
                      <th className="border border-zinc-900 p-1.5 w-16">Agama</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[100px]">Pendidikan</th>
                      <th className="border border-zinc-900 p-1.5 min-w-[110px]">Pekerjaan</th>
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
                      <th className="border border-zinc-900 p-0.5">(11)</th>
                      <th className="border border-zinc-900 p-0.5">(12)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRtm.anggota && selectedRtm.anggota.length > 0 
                      ? selectedRtm.anggota 
                      : (selectedRtm.kepala_rtm ? [selectedRtm.kepala_rtm] : [])
                    ).map((member, idx) => {
                      const isKepala = member.id === selectedRtm.kepala_rtm_id || member.rtm_level_id === 1 || idx === 0;
                      const statusRtm = isKepala ? "KEPALA RUMAH TANGGA" : (member.status_dalam_rumah_tangga || "ANGGOTA");
                      const hubKeluarga = member.hubungan_keluarga || (isKepala ? "KEPALA KELUARGA" : "-");

                      return (
                        <tr key={member.nik || idx} className="hover:bg-zinc-50">
                          <td className="border border-zinc-900 p-1.5 text-center font-medium">{idx + 1}</td>
                          <td className="border border-zinc-900 p-1.5 font-bold uppercase">{member.nama || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 font-mono text-center">{member.nik || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 font-mono text-center">{member.no_kk || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 font-semibold text-center uppercase">{statusRtm}</td>
                          <td className="border border-zinc-900 p-1.5 text-center uppercase">{hubKeluarga}</td>
                          <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.jenis_kelamin || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 uppercase">{member.tempat_lahir || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 text-center font-mono">{formatDateIndo(member.tanggal_lahir)}</td>
                          <td className="border border-zinc-900 p-1.5 text-center uppercase">{member.agama || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 uppercase">{member.pendidikan_kk || member.pendidikan_saat_ini || "-"}</td>
                          <td className="border border-zinc-900 p-1.5 uppercase">{member.pekerjaan || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* RTM Footer / Signatures */}
              {(() => {
                const headRes = selectedRtm.kepala_rtm || (selectedRtm.anggota && selectedRtm.anggota[0]);
                const kadesPamong = pamongList.find(p => {
                  const jab = (p.jabatan || "").toUpperCase();
                  return jab.includes("KEPALA DESA") || jab.includes("KADES") || p.jabatan_id === 1 || p.jabatan_id === 13 || p.pamong_ttd === 1;
                });
                const namaKades = kadesPamong?.pamong_nama || identitasDesa?.nama_kepala_desa || "";

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-center">
                      <div>
                        <p className="font-semibold uppercase mb-16">KEPALA RUMAH TANGGA</p>
                        <p className="font-bold uppercase underline tracking-wider">{headRes?.nama || "-"}</p>
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
                        Dokumen Salinan Kartu Rumah Tangga ini bukan merupakan dokumen resmi yang diterbitkan oleh Dinas Sosial / Kementerian Sosial / Disdukcapil, melainkan data salinan kependudukan internal yang dikeluarkan oleh sistem informasi desa untuk keperluan administrasi dan verifikasi program kesejahteraan sosial.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <DialogFooter className="border-t border-border-color pt-3">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}