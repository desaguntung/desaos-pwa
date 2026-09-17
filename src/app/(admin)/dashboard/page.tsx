"use client";

import { 
  Users, 
  FileText, 
  Landmark, 
  Mail,
  Printer,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getDashboardStats, DashboardStats, getVillageLocation } from '@/lib/services/dashboard';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import UniversalServiceDesk from '@/components/layanan/UniversalServiceDesk';
import VisualAuditTrailModal from '@/components/audit/VisualAuditTrailModal';
import { formatChunkedNIK, getHumanStatusLabel, formatBureaucraticDateTime } from '@/lib/utils/formatters';

interface UrgentSuratTask {
  id: number;
  no_surat?: string;
  nama_surat: string;
  pemohon_nama: string;
  pemohon_nik: string;
  tanggal: string;
  status: number;
  keterangan?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"meja_kerja" | "laporan">("meja_kerja");
  
  // Urgent letter tasks for today
  const [urgentTasks, setUrgentTasks] = useState<UrgentSuratTask[]>([]);
  const [readyToPrintCount, setReadyToPrintCount] = useState(0);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  // Audit Modal State
  const [auditTarget, setAuditTarget] = useState<{
    id: number | string;
    identifier: string;
    title: string;
  } | null>(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getDashboardStats();
      setStats(data);

      // Fetch pending & ready-to-print letters for Meja Kerja
      const supabase = createSupabaseBrowserClient();
      const { data: rawSurat } = await supabase
        .from("log_surat")
        .select(`
          id,
          no_surat,
          tanggal,
          nama_surat,
          keterangan,
          status,
          penduduk:id_pend(nama, nik),
          surat_formats:id_format_surat(nama)
        `)
        .order("id", { ascending: false })
        .limit(10);

      if (rawSurat) {
        const formatted: UrgentSuratTask[] = rawSurat.map((item: any) => ({
          id: item.id,
          no_surat: item.no_surat,
          nama_surat: item.surat_formats?.nama || item.nama_surat || "Surat Layanan",
          pemohon_nama: item.penduduk?.nama || "Warga",
          pemohon_nik: item.penduduk?.nik || "-",
          tanggal: item.tanggal,
          status: typeof item.status === "number" ? item.status : 4,
          keterangan: item.keterangan
        }));

        setUrgentTasks(formatted);
        setReadyToPrintCount(formatted.filter(t => t.status === 3 || t.status === 4).length);
        setPendingReviewCount(formatted.filter(t => t.status === 1 || t.status === 2).length);
      }

      if (isRefresh) toast.success("Meja Kerja diperbarui");
    } catch (error) {
      console.error("Gagal mengambil data meja kerja", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const currentDate = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        <p className="text-xs font-mono tracking-wider text-secondary-text uppercase">Menyiapkan Meja Kerja Harian...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-primary-text">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-text">
            Meja Kerja Pelayanan Kantor Desa
          </h1>
          <p className="text-xs text-secondary-text font-medium mt-0.5">
            {currentDate} • Pusat operasional harian terpadu pelayanan warga
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            <span>Segarkan</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => router.push("/surat/cetak")}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>+ Terbitkan Surat</span>
          </Button>
        </div>
      </div>

      {/* 1 Warga 1 Layar Selesai - Universal Omni-Search Service Hub */}
      <UniversalServiceDesk />

      {/* Tabs View: Meja Kerja Harian vs Laporan Statistik */}
      <Tabs defaultValue="meja_kerja" onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-border-color pb-2">
          <TabsList className="bg-hover-bg/80 p-1 border border-border-color rounded-xl">
            <TabsTrigger value="meja_kerja" className="text-xs font-medium px-4 py-1.5">
              Meja Kerja Hari Ini
            </TabsTrigger>
            <TabsTrigger value="laporan" className="text-xs font-medium px-4 py-1.5">
              Laporan & Analisis Statistik
            </TabsTrigger>
          </TabsList>

          <span className="text-[11px] font-mono text-secondary-text hidden md:inline">
            DesaOS v2.4 • Mode Kerja Tenang (Calm UI)
          </span>
        </div>

        {/* TAB 1: MEJA KERJA HARI INI (CALM OPERATIONAL WORKBENCH) */}
        <TabsContent value="meja_kerja" className="space-y-6">
          {/* 4 Priority Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Siap Dicetak */}
            <div 
              onClick={() => router.push("/surat/keluar")}
              className="bg-card-bg border border-border-color hover:border-emerald-500/50 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary-text">Siap Dicetak</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-primary-text">
                  {readyToPrintCount}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                  Buka Antrean Cetak <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[11px] text-secondary-text">
                Surat yang telah disahkan dan siap dicetak/diserahkan ke warga.
              </p>
            </div>

            {/* Card 2: Menunggu Tindakan / TTD */}
            <div 
              onClick={() => router.push("/surat/verifikasi")}
              className="bg-card-bg border border-border-color hover:border-amber-500/50 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary-text">Menunggu Persetujuan</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-primary-text">
                  {pendingReviewCount}
                </span>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
                  Periksa Berkas <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[11px] text-secondary-text">
                Permohonan dalam proses verifikasi Sekdes / TTD Kades.
              </p>
            </div>

            {/* Card 3: Total Warga Aktif */}
            <div 
              onClick={() => router.push("/penduduk")}
              className="bg-card-bg border border-border-color hover:border-neutral-400 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary-text">Penduduk Terdata</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-primary-text">
                  {stats?.totalPenduduk || 0}
                </span>
                <span className="text-[11px] font-mono text-secondary-text flex items-center gap-1 group-hover:underline">
                  Kelola Warga <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[11px] text-secondary-text">
                Total jiwa aktif dalam database kependudukan desa.
              </p>
            </div>

            {/* Card 4: Total Kepala Keluarga */}
            <div 
              onClick={() => router.push("/keluarga")}
              className="bg-card-bg border border-border-color hover:border-neutral-400 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary-text">Kepala Keluarga (KK)</span>
                <div className="w-8 h-8 rounded-lg bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-primary-text">
                  {stats?.totalKeluarga || 0}
                </span>
                <span className="text-[11px] font-mono text-secondary-text flex items-center gap-1 group-hover:underline">
                  Lihat Buku KK <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[11px] text-secondary-text">
                Kartu Keluarga terdaftar dan mutasi hubungan keluarga.
              </p>
            </div>
          </div>

          {/* Actionable Table: Tugas & Permohonan Surat Terkini */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-primary-text tracking-tight">
                  Tugas & Permohonan Layanan Surat Terkini
                </h3>
                <p className="text-xs text-secondary-text">
                  Daftar surat yang baru diterbitkan atau membutuhkan tindakan langsung
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/surat/keluar")}
                  className="text-xs font-medium"
                >
                  Lihat Semua Surat
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border-color rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-hover-bg/60 border-b border-border-color text-secondary-text font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3">No. Register / Tanggal</th>
                    <th className="p-3">Jenis Surat</th>
                    <th className="p-3">Pemohon & NIK</th>
                    <th className="p-3">Status Operasional</th>
                    <th className="p-3 text-right">Tindakan Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/60 font-medium">
                  {urgentTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-secondary-text">
                        Belum ada antrean permohonan surat hari ini. Meja kerja bersih!
                      </td>
                    </tr>
                  ) : (
                    urgentTasks.map((task) => {
                      const humanStatus = getHumanStatusLabel(task.status);
                      return (
                        <tr key={task.id} className="hover:bg-hover-bg/30 transition-colors">
                          {/* No Surat & Date */}
                          <td className="p-3">
                            <div className="font-mono font-bold text-primary-text">
                              {task.no_surat || "DRAF-BELUM-NOMOR"}
                            </div>
                            <div className="text-[11px] text-secondary-text font-mono">
                              {task.tanggal || "-"}
                            </div>
                          </td>

                          {/* Nama Surat */}
                          <td className="p-3">
                            <span className="font-semibold text-primary-text block">
                              {task.nama_surat}
                            </span>
                            {task.keterangan && (
                              <span className="text-[11px] text-secondary-text truncate block max-w-xs">
                                {task.keterangan}
                              </span>
                            )}
                          </td>

                          {/* Pemohon */}
                          <td className="p-3">
                            <span className="font-semibold text-primary-text block">
                              {task.pemohon_nama}
                            </span>
                            <span className="text-[11px] font-mono text-secondary-text">
                              {formatChunkedNIK(task.pemohon_nik)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <Badge variant="default" className={cn(
                              "text-[10px] font-mono",
                              humanStatus.variant === "success" && "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
                              humanStatus.variant === "warning" && "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900",
                              humanStatus.variant === "info" && "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                            )}>
                              {humanStatus.label}
                            </Badge>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/surat/view/${task.id}`)}
                                className="h-7 px-2.5 text-[11px]"
                                title="Lihat & Cetak Surat"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-secondary-text" />
                                <span>Lihat</span>
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setAuditTarget({
                                  id: task.id,
                                  identifier: task.no_surat || String(task.id),
                                  title: task.nama_surat
                                })}
                                className="h-7 px-2 text-[11px] text-secondary-text hover:text-primary-text"
                                title="Jejak Audit & Histori"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LAPORAN & STATISTIK AGREGAT */}
        <TabsContent value="laporan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-8 bg-card-bg border border-border-color rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-primary-text tracking-tight">
                    Tren Aktivitas Pelayanan & Surat Bulanan
                  </h3>
                  <p className="text-xs text-secondary-text">
                    Grafik volume surat masuk dan surat keluar sepanjang tahun
                  </p>
                </div>
                <Badge variant="default" className="text-[11px] font-mono">Tahun 2026</Badge>
              </div>

              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.suratChartData || []}>
                    <defs>
                      <linearGradient id="colorSuratKeluar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSuratMasuk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="keluar" name="Surat Keluar" stroke="#10b981" fillOpacity={1} fill="url(#colorSuratKeluar)" />
                    <Area type="monotone" dataKey="masuk" name="Surat Masuk" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSuratMasuk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographic Aggregate Quick Summary */}
            <div className="lg:col-span-4 bg-card-bg border border-border-color rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary-text tracking-tight">
                  Ringkasan Kependudukan
                </h3>
                <p className="text-xs text-secondary-text">
                  Statistik agregat warga desa
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-body-bg border border-border-color/60 text-xs">
                  <span className="text-secondary-text">Laki-laki</span>
                  <span className="font-bold text-primary-text font-mono">
                    {stats?.pendudukByGender?.find(g => g.name.toLowerCase().includes("laki"))?.value || Math.floor((stats?.totalPenduduk || 0) * 0.51)} Jiwa
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-body-bg border border-border-color/60 text-xs">
                  <span className="text-secondary-text">Perempuan</span>
                  <span className="font-bold text-primary-text font-mono">
                    {stats?.pendudukByGender?.find(g => g.name.toLowerCase().includes("perempuan"))?.value || Math.floor((stats?.totalPenduduk || 0) * 0.49)} Jiwa
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-body-bg border border-border-color/60 text-xs">
                  <span className="text-secondary-text">Kepala Keluarga</span>
                  <span className="font-bold text-primary-text font-mono">
                    {stats?.totalKeluarga || 0} KK
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/statistik/kependudukan")}
                className="w-full text-xs font-semibold"
              >
                Lihat Piramida & Detail Statistik
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Visual Audit Trail Modal */}
      {auditTarget && (
        <VisualAuditTrailModal
          isOpen={true}
          onClose={() => setAuditTarget(null)}
          entityType="SURAT"
          entityId={auditTarget.id}
          entityIdentifier={auditTarget.identifier}
          title={auditTarget.title}
        />
      )}
    </div>
  );
}
