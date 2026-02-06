"use client";

import {
  Plus,
  Search,
  Info,
  Download,
  Star,
  ToggleRight,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  Edit2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function PengaturanSuratPage() {
  const dummyDataSurat = useMemo(() => [
    {
      name: 'Surat Keterangan Domisili', code: 'SKD-001', abbr: 'SKD', lastNumber: 125, 
      signer: 'Kepala Desa', status: 'Aktif', isFavorite: true, hasTemplate: true
    },
    {
      name: 'Surat Keterangan Usaha', code: 'SKU-002', abbr: 'SKU', lastNumber: 80, 
      signer: 'Sekretaris Desa', status: 'Aktif', isFavorite: false, hasTemplate: true
    },
    {
      name: 'Surat Keterangan Tidak Mampu', code: 'SKTM-003', abbr: 'SKTM', lastNumber: 150, 
      signer: 'Kepala Desa', status: 'Aktif', isFavorite: true, hasTemplate: true
    },
    {
      name: 'Surat Izin Keramaian', code: 'SIK-004', abbr: 'SIK', lastNumber: 25, 
      signer: 'Sekretaris Desa', status: 'Tidak Aktif', isFavorite: false, hasTemplate: false
    },
  ], []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Semua" | "Aktif" | "Favorit"
  >("Semua");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showInfo, setShowInfo] = useState(false);

  const filteredSurat = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = dummyDataSurat;

    if (statusFilter === "Aktif") {
      data = data.filter((item) => item.status === "Aktif");
    } else if (statusFilter === "Favorit") {
      data = data.filter((item) => item.isFavorite);
    }

    if (term) {
      data = data.filter((item) => {
        const name = item.name.toLowerCase();
        const code = item.code.toLowerCase();
        const abbr = item.abbr.toLowerCase();
        return (
          name.includes(term) || code.includes(term) || abbr.includes(term)
        );
      });
    }

    const sorted = [...data].sort((a, b) => {
      const left = a.name;
      const right = b.name;
      const compare = left.localeCompare(right);
      return sortDirection === "asc" ? compare : -compare;
    });

    return sorted;
  }, [dummyDataSurat, searchTerm, statusFilter, sortDirection]);

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      {/* Header */}
      <PageHeader
        title="Pengaturan Surat"
        subtitle="Layanan Surat / Pengaturan Surat"
        actions={
          <Link href="/surat/pengaturan/format/buat">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Tambah Jenis Surat</span>
            </Button>
          </Link>
        }
      />

      <div className="p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-secondary-text hover:text-primary-text transition-colors"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Manajemen Format & Template Surat</span>
          </button>
          <span className="text-xs text-secondary-text">
            {filteredSurat.length} jenis surat ditampilkan
          </span>
        </div>

        {showInfo && (
          <div className="bg-body-bg border border-border-color rounded-lg p-3 text-xs text-secondary-text leading-relaxed">
            Halaman ini digunakan untuk mengelola berbagai jenis format surat layanan publik,
            mengatur penomoran otomatis, persyaratan dokumen, hingga template dokumen siap cetak.
            Pastikan data penduduk sudah lengkap untuk sinkronisasi optimal.
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {(
              ["Semua", "Aktif", "Favorit"] as const
            ).map((status) => {
              const isActive = statusFilter === status;
              const totalForStatus =
                status === "Semua"
                  ? dummyDataSurat.length
                  : dummyDataSurat.filter((item) =>
                      status === "Aktif"
                        ? item.status === "Aktif"
                        : item.isFavorite,
                    ).length;

              const icon =
                status === "Aktif" ? ToggleRight : status === "Favorit" ? Star : null;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-2 transition-colors",
                    isActive
                      ? "bg-primary-text text-card-bg border-primary-text"
                      : "bg-body-bg text-primary-text border-border-color hover:bg-secondary-text/5"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {icon && (() => {
                      const IconComponent = icon;
                      return (
                        <IconComponent
                          className={cn(
                            "w-3.5 h-3.5",
                            status === "Aktif"
                              ? "text-success-text"
                              : "text-warning-text"
                          )}
                        />
                      );
                    })()}
                    <span>
                      {status === "Semua"
                        ? "Semua Surat"
                        : status === "Aktif"
                        ? "Aktif"
                        : "Favorit"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs",
                      isActive
                      ? "bg-card-bg/20 text-card-bg"
                      : "bg-secondary-text/10 text-secondary-text"
                    )}
                  >
                    {totalForStatus}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text group-focus-within:text-blue-500 transition-colors" />
              <InputField
                placeholder="Cari Nama atau Kode Surat..."
                className="pl-9 h-9 text-xs"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="p-2 bg-card-bg border border-border-color rounded-md hover:bg-secondary-text/5 transition-colors h-9 w-9 flex items-center justify-center"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("Semua");
              }}
            >
              <Filter className="w-3.5 h-3.5 text-secondary-text" />
            </button>
            <button
              type="button"
              className="p-2 bg-card-bg border border-border-color rounded-md hover:bg-secondary-text/5 transition-colors h-9 w-9 flex items-center justify-center"
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              <ArrowUpDown
                className={cn(
                  "w-3.5 h-3.5 text-secondary-text transition-transform",
                  sortDirection === "desc" ? "rotate-180" : ""
                )}
              />
            </button>
          </div>
        </div>

        {/* Surat List Table */}
        <div className="bg-card-bg border border-border-color rounded-lg overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-body-bg border-b border-border-color">
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[180px] sticky left-0 bg-card-bg z-[3]">Nama Surat</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[100px]">Kode/Singkatan</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[120px]">Penomoran Terakhir</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[150px]">Pejabat Penandatangan</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[80px] text-center">Template</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[80px] text-center">Aktif</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[80px] text-center">Favorit</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 text-right min-w-[100px] sticky right-0 bg-card-bg z-[3]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color text-sm">
                {filteredSurat.map((surat, i) => (
                  <tr key={i} className="hover:bg-secondary-text/5 transition-colors group">
                    <td className="px-4 py-3 text-xs font-medium text-primary-text sticky left-0 bg-card-bg z-[2] group-hover:bg-body-bg transition-colors">{surat.name.toUpperCase()}</td>
                    <td className="px-4 py-3 text-xs text-secondary-text">
                      <p className="">{surat.code}</p>
                      <p className="text-xs text-secondary-text/70">({surat.abbr})</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-text">#{surat.lastNumber}</td>
                    <td className="px-4 py-3 text-xs text-secondary-text">{surat.signer}</td>
                    <td className="px-4 py-3 text-center">
                      {surat.hasTemplate ? <CheckCircle2 className="w-4 h-4 text-success-text mx-auto" /> : <XCircle className="w-4 h-4 text-error-text mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {surat.status === 'Aktif' ? <CheckCircle2 className="w-4 h-4 text-success-text mx-auto" /> : <XCircle className="w-4 h-4 text-secondary-text/50 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {surat.isFavorite ? <Star className="w-4 h-4 text-warning-text mx-auto" /> : <Star className="w-4 h-4 text-secondary-text/30 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-right sticky right-0 bg-card-bg z-[2] group-hover:bg-body-bg transition-colors">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-card-bg rounded-md border border-transparent hover:border-border-color text-secondary-text hover:text-accent transition-all title='Detail'">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link href="/surat/pengaturan/format/buat" className="p-1.5 hover:bg-card-bg rounded-md border border-transparent hover:border-border-color text-secondary-text hover:text-success-text transition-all title='Edit Template'">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button className="p-1.5 hover:bg-card-bg rounded-md border border-transparent hover:border-border-color text-secondary-text transition-all title='Upload Template'">
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-border-color bg-body-bg flex justify-between items-center">
            <p className="text-xs text-secondary-text font-medium uppercase tracking-widest">Menampilkan 1 - 4 dari 4 Jenis Surat</p>
            <div className="flex gap-2 text-xs">
               <button disabled className="px-2 py-1 text-secondary-text opacity-50">Previous</button>
               <button className="px-2 py-1 bg-card-bg border border-border-color rounded font-medium text-primary-text">1</button>
               <button className="px-2 py-1 text-secondary-text">2</button>
               <button className="px-2 py-1 text-secondary-text">3</button>
               <button className="px-2 py-1 text-secondary-text">...</button>
               <button className="px-2 py-1 text-secondary-text">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
