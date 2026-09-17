"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Clock, 
  User, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  PenTool, 
  X, 
  FileSignature, 
  History,
  QrCode,
  Download,
  ExternalLink,
  Shield,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { 
  AuditEntry, 
  AuditTarget, 
  getAuditTrail, 
  generateAuditCertificate, 
  AuditCertificate 
} from "@/lib/services/audit";
import { 
  formatBureaucraticDateTime, 
  getHumanStatusLabel, 
  formatChunkedNIK 
} from "@/lib/utils/formatters";

interface VisualAuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: AuditTarget;
  entityId: string | number;
  entityIdentifier: string;
  title: string;
  subtitle?: string;
}

export default function VisualAuditTrailModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityIdentifier,
  title,
  subtitle
}: VisualAuditTrailModalProps) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [certificate, setCertificate] = useState<AuditCertificate | null>(null);
  const [isPrintingBA, setIsPrintingBA] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadLogs = async () => {
      setLoading(true);
      try {
        const trail = await getAuditTrail(entityType, entityId, entityIdentifier);
        setLogs(trail);
        const cert = generateAuditCertificate(trail, title, entityIdentifier);
        setCertificate(cert);
      } catch (err) {
        console.error("Error loading audit trail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [isOpen, entityType, entityId, entityIdentifier, title]);

  if (!isOpen) return null;

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case "VERIFY":
        return <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case "SIGN":
        return <PenTool className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case "PRINT":
        return <Printer className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case "MUTASI":
        return <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case "REJECT":
        return <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge variant="default" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50">Dibuat di Sistem</Badge>;
      case "VERIFY":
        return <Badge variant="default" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50">Diverifikasi Sekdes</Badge>;
      case "SIGN":
        return <Badge variant="default" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50">Disahkan (TTD Kades)</Badge>;
      case "PRINT":
        return <Badge variant="default" className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50">Dicetak Fisik</Badge>;
      case "MUTASI":
        return <Badge variant="default" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50">Mutasi / Pecah Data</Badge>;
      case "REJECT":
        return <Badge variant="default" className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50">Dikembalikan</Badge>;
      default:
        return <Badge variant="default">Pembaruan</Badge>;
    }
  };

  const handlePrintBeritaAcara = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-card-bg rounded-xl border border-border-color shadow-2xl flex flex-col overflow-hidden text-primary-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color bg-hover-bg/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-primary-text">
                  Jejak Audit Visual & Perlindungan Hukum
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-secondary-text">
                Histori perubahan data & rekam jejak operator yang tidak dapat dimanipulasi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-hover-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Header Banner */}
        <div className="px-6 py-3 bg-body-bg border-b border-border-color/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="space-y-0.5">
            <div className="font-medium text-primary-text">{title}</div>
            <div className="font-mono text-secondary-text">
              ID/No: <span className="font-semibold text-primary-text">{entityIdentifier}</span>
            </div>
          </div>
          {certificate && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-secondary-text bg-card-bg px-2.5 py-1 rounded border border-border-color">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Integritas: {certificate.checksum.slice(0, 18)}...</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-secondary-text">
              <Loader2 className="w-7 h-7 animate-spin text-neutral-400" />
              <p className="text-xs font-mono uppercase tracking-wider">Memverifikasi Jejak Rekam Dokumen...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-secondary-text space-y-2">
              <History className="w-8 h-8 mx-auto text-neutral-400 opacity-60" />
              <p className="text-sm font-medium">Belum ada rekaman riwayat audit untuk entitas ini.</p>
              <p className="text-xs text-neutral-500">Semua aktivitas penerbitan surat dan mutasi akan tercatat secara otomatis.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-color">
              {logs.map((entry, index) => {
                const isLatest = index === 0;
                return (
                  <div key={entry.id} className="relative group">
                    {/* Node Circle */}
                    <div 
                      className={cn(
                        "absolute -left-6 top-1 w-6 h-6 rounded-full border-2 bg-card-bg flex items-center justify-center transition-transform group-hover:scale-110",
                        isLatest 
                          ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-sm" 
                          : "border-border-color"
                      )}
                    >
                      {getActionIcon(entry.action)}
                    </div>

                    {/* Content Card */}
                    <div className={cn(
                      "p-4 rounded-xl border transition-all space-y-2.5",
                      isLatest 
                        ? "bg-card-bg border-emerald-500/30 shadow-sm" 
                        : "bg-card-bg/60 border-border-color/80 hover:bg-hover-bg/20"
                    )}>
                      {/* Header Line */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getActionBadge(entry.action)}
                          <span className="text-xs font-semibold text-primary-text">
                            {entry.actor_name}
                          </span>
                          <span className="text-[11px] text-secondary-text font-normal">
                            ({entry.actor_role})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-secondary-text font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatBureaucraticDateTime(entry.timestamp)}</span>
                        </div>
                      </div>

                      {/* Comment / Remarks */}
                      {entry.comment && (
                        <p className="text-xs text-secondary-text leading-relaxed bg-body-bg/60 p-2.5 rounded-lg border border-border-color/40">
                          {entry.comment}
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-secondary-text/80 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="bg-hover-bg px-2 py-0.5 rounded text-[10px]">
                            ID: {entry.id.slice(0, 14)}
                          </span>
                          {entry.metadata?.checksum && (
                            <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-900/40">
                              Terverifikasi Valid
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-secondary-text truncate max-w-xs">
                          {entry.metadata?.device?.split("(")[0]?.trim() || "Perangkat Kantor Desa"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-border-color bg-hover-bg/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-secondary-text">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dokumen dilindungi catatan transaksi digital desa.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintBeritaAcara}
              disabled={loading || logs.length === 0}
              className="gap-2 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berita Acara Jejak Audit</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Berita Acara View (Print Media only) */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[9999]">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 space-y-1">
            <h1 className="text-lg font-bold tracking-wider uppercase">PEMERINTAH KABUPATEN / KOTA</h1>
            <h2 className="text-xl font-extrabold uppercase">KANTOR DESA GUNTUNG</h2>
            <p className="text-xs">BERITA ACARA AUDIT TRAIL & INTEGRITAS REKAM DATA ELEKTRONIK</p>
            <p className="text-[10px] font-mono">No. Sertifikat: {certificate?.certificateId || "BA-AUDIT-2026"}</p>
          </div>

          {/* Description */}
          <div className="text-xs space-y-2 leading-relaxed">
            <p>
              Pada hari ini, dicetak catatan jejak audit elektronik resmi atas dokumen/entitas dengan rincian sebagai berikut:
            </p>
            <table className="w-full text-xs border border-neutral-300">
              <tbody>
                <tr className="border-b border-neutral-300">
                  <td className="p-2 font-semibold bg-neutral-100 w-1/3">Jenis Dokumen / Entitas</td>
                  <td className="p-2">{title}</td>
                </tr>
                <tr className="border-b border-neutral-300">
                  <td className="p-2 font-semibold bg-neutral-100">Nomor / Identifier Unik</td>
                  <td className="p-2 font-mono font-bold">{entityIdentifier}</td>
                </tr>
                <tr className="border-b border-neutral-300">
                  <td className="p-2 font-semibold bg-neutral-100">Kode Hash Bukti Integritas</td>
                  <td className="p-2 font-mono">{certificate?.checksum || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Timeline Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">Linimasa Rekam Jejak Transaksi</h3>
            <table className="w-full text-[11px] border border-neutral-400">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-400">
                  <th className="p-2 text-left w-10">No</th>
                  <th className="p-2 text-left">Waktu (WIB)</th>
                  <th className="p-2 text-left">Tindakan</th>
                  <th className="p-2 text-left">Petugas / Aktor</th>
                  <th className="p-2 text-left">Jabatan</th>
                  <th className="p-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item, idx) => (
                  <tr key={item.id} className="border-b border-neutral-300">
                    <td className="p-2 font-mono">{idx + 1}</td>
                    <td className="p-2 font-mono">{formatBureaucraticDateTime(item.timestamp)}</td>
                    <td className="p-2 font-semibold">{item.action}</td>
                    <td className="p-2">{item.actor_name}</td>
                    <td className="p-2">{item.actor_role}</td>
                    <td className="p-2 text-[10px]">{item.comment || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div className="space-y-16">
              <p>Petugas Operator Sistem,</p>
              <p className="font-bold underline">( ............................................ )</p>
            </div>
            <div className="space-y-16">
              <p>Kepala Desa / Pejabat Berwenang,</p>
              <p className="font-bold underline">( ............................................ )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
