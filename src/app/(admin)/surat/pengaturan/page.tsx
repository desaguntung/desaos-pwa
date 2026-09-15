"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Search, 
  Check,
  Pencil,
  Plus, 
  X, 
  FileText, 
  Tag 
} from "lucide-react";
import { 
  getKlasifikasiSurat, 
  getFormatSurat, 
  KlasifikasiSurat, 
  FormatSurat 
} from "@/lib/services/surat";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";

function PengaturanSuratContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState("klasifikasi");
  const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>([]);
  const [formatList, setFormatList] = useState<FormatSurat[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "format" || tab === "klasifikasi") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [klasifikasi, format] = await Promise.all([
        getKlasifikasiSurat(),
        getFormatSurat()
      ]);
      setKlasifikasiList(klasifikasi || []);
      setFormatList(format || []);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Pagination Logic
  const filteredData = useMemo(() => {
    if (activeTab === "klasifikasi") {
      let data = klasifikasiList;
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        data = data.filter(item => 
          (item.kode || "").toLowerCase().includes(lower) || 
          (item.nama || "").toLowerCase().includes(lower) ||
          (item.uraian || "").toLowerCase().includes(lower)
        );
      }
      return data;
    } else {
      let data = formatList;
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        data = data.filter(item => 
          (item.kode_surat || "").toLowerCase().includes(lower) || 
          (item.nama || "").toLowerCase().includes(lower)
        );
      }
      return data;
    }
  }, [activeTab, klasifikasiList, formatList, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const klasifikasiColumns: Column<KlasifikasiSurat>[] = [
    {
      header: "Kode",
      accessorKey: "kode",
      className: "text-center w-24 font-mono text-xs font-semibold",
    },
    {
      header: "Nama Klasifikasi",
      accessorKey: "nama",
      cell: (row) => <span className="capitalize font-medium text-primary-text">{(row.nama || "-").toLowerCase()}</span>,
    },
    {
      header: "Uraian",
      accessorKey: "uraian",
      className: "max-w-xs truncate text-secondary-text",
      cell: (row) => row.uraian || "-"
    },
    {
      header: "Status",
      accessorKey: "enabled",
      className: "text-center w-24",
      cell: (row) => (
        <div className="flex justify-center">
          {row.enabled ? (
            <Badge variant="success" size="icon" icon={<Check className="w-3.5 h-3.5" />} />
          ) : (
            <Badge variant="secondary" size="icon" icon={<X className="w-3.5 h-3.5" />} />
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center w-16",
      cell: (row) => (
        <div className="flex justify-center">
          <Button
            asChild
            variant="ghost-secondary"
            size="icon-sm"
            title="Edit Klasifikasi"
          >
            <Link href={`/surat/pengaturan/klasifikasi/edit/${row.id}`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const formatColumns: Column<FormatSurat>[] = [
    {
      header: "Kode",
      accessorKey: "kode_surat",
      className: "text-center w-24 font-mono text-xs font-semibold",
      cell: (row) => row.kode_surat || "-",
    },
    {
      header: "Nama Format",
      accessorKey: "nama",
      cell: (row) => <span className="capitalize font-medium text-primary-text">{(row.nama || "-").toLowerCase()}</span>,
    },
    {
      header: "URL / Kode Unik",
      accessorKey: "url_surat",
      className: "font-mono text-xs text-secondary-text",
      cell: (row) => row.url_surat || "-"
    },
    {
      header: "Kunci",
      accessorKey: "kunci",
      className: "text-center w-24",
      cell: (row) => (
        <div className="flex justify-center">
          {row.kunci ? (
            <Badge variant="outline">Locked</Badge>
          ) : (
            <Badge variant="success">Open</Badge>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center w-16",
      cell: (row) => (
        <div className="flex justify-center">
          <Button
            asChild
            variant="ghost-secondary"
            size="icon-sm"
            title="Edit Format"
          >
            <Link href={`/surat/pengaturan/format/edit/${row.id}`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Pengaturan Surat" 
        subtitle="Kelola klasifikasi nomor surat dan template format cetak" 
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="klasifikasi" className="gap-2">
            <Tag className="w-4 h-4" />
            Klasifikasi Surat
          </TabsTrigger>
          <TabsTrigger value="format" className="gap-2">
            <FileText className="w-4 h-4" />
            Format Surat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="klasifikasi" className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-auto flex-1 max-w-sm relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  className="pl-9"
                  placeholder="Cari Klasifikasi..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button className="w-full md:w-auto gap-2">
                <Plus className="w-4 h-4" />
                <span>Tambah Klasifikasi</span>
              </Button>
            </div>
          </Card>

          <DataTable
            columns={klasifikasiColumns}
            data={paginatedData as KlasifikasiSurat[]}
            loading={loading}
            emptyMessage={
              <EmptyState 
                icon={<Tag />}
                title={searchQuery ? "Tidak ditemukan klasifikasi yang cocok" : "Belum ada data klasifikasi"}
                description={searchQuery ? "Coba kata kunci lain" : "Silakan tambah klasifikasi baru"}
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

        <TabsContent value="format" className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-auto flex-1 max-w-sm relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  className="pl-9"
                  placeholder="Cari Format Surat..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button asChild className="w-full md:w-auto gap-2">
                <Link href="/surat/pengaturan/format/buat">
                  <Plus className="w-4 h-4" />
                  <span>Tambah Format</span>
                </Link>
              </Button>
            </div>
          </Card>

          <DataTable
            columns={formatColumns}
            data={paginatedData as FormatSurat[]}
            loading={loading}
            emptyMessage={
              <EmptyState 
                icon={<FileText />}
                title={searchQuery ? "Tidak ditemukan format surat yang cocok" : "Belum ada data format surat"}
                description={searchQuery ? "Coba kata kunci lain" : "Silakan tambah format surat baru"}
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

export default function PengaturanSuratPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-body-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-text"></div>
      </div>
    }>
      <PengaturanSuratContent />
    </Suspense>
  );
}
