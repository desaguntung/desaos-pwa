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
      <header className="sticky top-0 bg-body-bg/80 backdrop-blur-md border-b border-zinc-200 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-primary-text">Pengaturan Surat</h2>
            <div className="h-4 w-px bg-zinc-200"></div>
            <div className="flex items-center gap-1 text-xs text-secondary-text">
              <span>Layanan Surat</span>
              <span className="text-zinc-300">/</span>
              <span className="text-primary-text font-medium">Pengaturan Surat</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pengaturan-surat/tambah" className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-3.5 h-3.5"/>
              <span>Tambah Jenis Surat</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-secondary-text"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <Info className="w-3.5 h-3.5 text-secondary-text" />
            <span>Manajemen Format & Template Surat</span>
          </button>
          <span className="text-xs text-secondary-text">
            {filteredSurat.length} jenis surat ditampilkan
          </span>
        </div>

        {showInfo && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-secondary-text leading-relaxed">
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
                  className={[
                    "px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-2",
                    isActive
                      ? "bg-primary-text text-white border-primary-text"
                      : "bg-zinc-50 text-primary-text border-zinc-200",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-1.5">
                    {icon && (() => {
                      const IconComponent = icon;
                      return (
                        <IconComponent
                          className={[
                            "w-3.5 h-3.5",
                            status === "Aktif"
                              ? "text-emerald-500"
                              : "text-yellow-500",
                          ].join(" ")}
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
                    className={[
                      "px-1.5 py-0.5 rounded-full text-xs",
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-gray-200 text-gray-700",
                    ].join(" ")}
                  >
                    {totalForStatus}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -tranzinc-y-1/2 w-3.5 h-3.5 text-secondary-text" />
              <input
                type="text"
                placeholder="Cari Nama atau Kode Surat..."
                className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary-text/20 transition-all"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="p-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("Semua");
              }}
            >
              <Filter className="w-3.5 h-3.5 text-secondary-text" />
            </button>
            <button
              type="button"
              className="p-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              <ArrowUpDown
                className={[
                  "w-3.5 h-3.5 text-secondary-text transition-transform",
                  sortDirection === "desc" ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        {/* Surat List Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[180px] sticky left-0 bg-white z-[3]">Nama Surat</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[100px]">Kode/Singkatan</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[120px]">Penomoran Terakhir</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[150px]">Pejabat Penandatangan</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[80px] text-center">Template</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[80px] text-center">Aktif</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 min-w-[80px] text-center">Favorit</th>
                  <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 text-right min-w-[100px] sticky right-0 bg-white z-[3]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm">
                {filteredSurat.map((surat, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-4 py-3 text-xs font-medium text-primary-text sticky left-0 bg-white z-[2]">{surat.name.toUpperCase()}</td>
                    <td className="px-4 py-3 text-xs text-secondary-text">
                      <p className="">{surat.code}</p>
                      <p className="text-xs text-gray-500">({surat.abbr})</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-text">#{surat.lastNumber}</td>
                    <td className="px-4 py-3 text-xs text-secondary-text">{surat.signer}</td>
                    <td className="px-4 py-3 text-center">
                      {surat.hasTemplate ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-rose-500 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {surat.status === 'Aktif' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-400 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {surat.isFavorite ? <Star className="w-4 h-4 text-yellow-500 mx-auto" /> : <Star className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-right sticky right-0 bg-white z-[2]">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-zinc-200 text-secondary-text hover:text-blue-600 transition-all title='Detail'">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link href="/surat/pengaturan/format/buat" className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-zinc-200 text-secondary-text hover:text-emerald-600 transition-all title='Edit Template'">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-zinc-200 text-secondary-text transition-all title='Upload Template'">
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-between items-center">
            <p className="text-xs text-secondary-text font-medium uppercase tracking-widest">Menampilkan 1 - 4 dari 4 Jenis Surat</p>
            <div className="flex gap-2 text-xs">
               <button disabled className="px-2 py-1 text-secondary-text opacity-50">Previous</button>
               <button className="px-2 py-1 bg-white border border-zinc-200 rounded font-medium">1</button>
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


