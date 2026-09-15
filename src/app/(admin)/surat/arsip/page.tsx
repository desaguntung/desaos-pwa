"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search,
  Archive, 
  ArrowDownToLine, 
  FileText, 
  Mail, 
  Calendar,
} from "lucide-react";
import { 
  getSuratMasuk, 
  getLogSurat, 
  SuratMasuk, 
  LogSurat 
} from "@/lib/services/surat";
import { formatDate } from "@/lib/utils";

import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default function ArsipLayananPage() {
  const [activeTab, setActiveTab] = useState("masuk");
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<(LogSurat & { surat_formats?: { nama: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

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

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (activeTab === "masuk") {
      return suratMasuk.filter(item => 
        (item.nomor_surat || "").toLowerCase().includes(query) ||
        (item.pengirim || "").toLowerCase().includes(query) ||
        (item.isi_singkat || "").toLowerCase().includes(query)
      );
    } else {
      return suratKeluar.filter(item => 
        (item.no_surat || "").toLowerCase().includes(query) ||
        (item.surat_formats?.nama || item.nama_surat || "").toLowerCase().includes(query) ||
        (item.nama_non_warga || "").toLowerCase().includes(query)
      );
    }
  }, [activeTab, suratMasuk, suratKeluar, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const masukColumns: Column<SuratMasuk>[] = [
    {
      header: "No. Surat",
      accessorKey: "nomor_surat",
      className: "font-mono text-xs font-semibold",
    },
    {
      header: "Tanggal Terima",
      accessorKey: "tanggal_penerimaan",
      cell: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-secondary-text">
              <Calendar className="w-3.5 h-3.5 text-secondary-text/70" />
              <span>{formatDate(row.tanggal_penerimaan)}</span>
          </div>
      )
    },
    {
      header: "Pengirim",
      accessorKey: "pengirim",
      cell: (row) => <span className="capitalize text-primary-text font-medium">{(row.pengirim || "-").toLowerCase()}</span>
    },
    {
      header: "Perihal",
      accessorKey: "isi_singkat",
      className: "max-w-xs truncate",
      cell: (row) => <span className="capitalize text-secondary-text">{(row.isi_singkat || "-").toLowerCase()}</span>
    },
    {
      header: "Berkas",
      accessorKey: "berkas_scan",
      className: "text-center w-20",
      cell: (row) => row.berkas_scan ? (
          <div className="flex justify-center">
              <a 
                  href={`/storage/${row.berkas_scan}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-hover-bg text-secondary-text hover:text-primary-text transition-colors border border-border-color"
                  title="Download Berkas"
              >
                  <ArrowDownToLine className="w-4 h-4" />
              </a>
          </div>
      ) : <span className="text-xs text-secondary-text/50">-</span>
    }
  ];

  const keluarColumns: Column<LogSurat & { surat_formats?: { nama: string } }>[] = [
    {
      header: "No. Surat",
      accessorKey: "no_surat",
      className: "font-mono text-xs font-semibold",
      cell: (row) => row.no_surat || "-"
    },
    {
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-secondary-text">
              <Calendar className="w-3.5 h-3.5 text-secondary-text/70" />
              <span>{formatDate(row.tanggal)}</span>
          </div>
      )
    },
    {
      header: "Jenis Surat",
      accessorKey: "nama_surat",
      cell: (row) => <span className="capitalize font-medium text-primary-text">{(row.surat_formats?.nama || row.nama_surat || "Unknown").toLowerCase()}</span>
    },
    {
      header: "Penerima (Warga)",
      accessorKey: "nama_non_warga",
      cell: (row) => <span className="capitalize text-secondary-text">{(row.nama_non_warga ? row.nama_non_warga : (row.id_pend ? `Penduduk #${row.id_pend}` : "-")).toLowerCase()}</span>
    },
    {
      header: "Dokumen",
      accessorKey: "url_surat",
      className: "text-center w-20",
      cell: (row) => row.url_surat ? (
          <div className="flex justify-center">
              <a 
                  href={row.url_surat} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-hover-bg text-secondary-text hover:text-primary-text transition-colors border border-border-color"
                  title="Download Surat"
              >
                  <ArrowDownToLine className="w-4 h-4" />
              </a>
          </div>
      ) : <span className="text-xs text-secondary-text/50">-</span>
    }
  ];

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Arsip Layanan" 
        subtitle="Kelola arsip surat masuk dan riwayat surat keluar desa" 
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList>
            <TabsTrigger value="masuk" className="gap-2">
                <Mail className="w-4 h-4" />
                Arsip Surat Masuk
            </TabsTrigger>
            <TabsTrigger value="keluar" className="gap-2">
                <FileText className="w-4 h-4" />
                Arsip Surat Keluar
            </TabsTrigger>
        </TabsList>

        <Card className="p-4">
            <div className="w-full md:w-auto flex-1 max-w-sm">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-secondary-text" />
                  </div>
                  <Input
                      placeholder="Cari arsip..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9"
                  />
                </div>
            </div>
        </Card>

        <TabsContent value="masuk" className="space-y-6 mt-0">
            <DataTable
                columns={masukColumns}
                data={paginatedData as SuratMasuk[]}
                loading={loading}
                emptyMessage={
                    <EmptyState 
                        icon={<Archive />}
                        title={searchQuery ? "Tidak ditemukan arsip yang cocok" : "Belum ada arsip surat masuk"}
                        description={searchQuery ? "Coba kata kunci lain" : "Arsip surat masuk akan muncul di sini"}
                    />
                }
            />
             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={rowsPerPage}
                onItemsPerPageChange={setRowsPerPage}
                totalItems={filteredData.length}
                sticky={true}
            />
        </TabsContent>

        <TabsContent value="keluar" className="space-y-6 mt-0">
            <DataTable
                columns={keluarColumns}
                data={paginatedData as (LogSurat & { surat_formats?: { nama: string } })[]}
                loading={loading}
                emptyMessage={
                    <EmptyState 
                        icon={<Archive />}
                        title={searchQuery ? "Tidak ditemukan arsip yang cocok" : "Belum ada arsip surat keluar"}
                        description={searchQuery ? "Coba kata kunci lain" : "Arsip surat keluar akan muncul di sini"}
                    />
                }
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={rowsPerPage}
                onItemsPerPageChange={setRowsPerPage}
                totalItems={filteredData.length}
                sticky={true}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
