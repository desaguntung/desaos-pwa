"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  User,
  FileText,
  Send,
  Users,
  MapPin,
  Calendar,
  HeartHandshake,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Pencil,
  ArrowRight,
  Clock,
  History,
  CheckCircle2,
  X,
  Loader2
} from "lucide-react";
import { Resident, getResidents } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { formatChunkedNIK } from "@/lib/utils/formatters";
import VisualAuditTrailModal from "@/components/audit/VisualAuditTrailModal";
import { ShieldCheck } from "lucide-react";

interface ResidentContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  onEdit?: (resident: Resident) => void;
}

export function ResidentContextDrawer({
  isOpen,
  onClose,
  resident,
  onEdit,
}: ResidentContextDrawerProps) {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<Resident[]>([]);
  const [recentLetters, setRecentLetters] = useState<any[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  useEffect(() => {
    if (!resident || !isOpen) return;

    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    const fetchData = async () => {
      // Fetch Family Members if No KK exists
      if (resident.no_kk) {
        setLoadingFamily(true);
        try {
          const { data } = await supabase
            .from("penduduk")
            .select("id, nik, nama, hubungan_keluarga, jenis_kelamin, tanggal_lahir")
            .eq("no_kk", resident.no_kk);
          if (isMounted) {
            setFamilyMembers((data as Resident[]) || []);
          }
        } catch {
          if (isMounted) setFamilyMembers([]);
        } finally {
          if (isMounted) setLoadingFamily(false);
        }
      } else {
        setFamilyMembers([]);
      }

      // Fetch Recent Letters for this Resident
      setLoadingLetters(true);
      try {
        const { data } = await supabase
          .from("surat_keluar")
          .select("id, nomor_surat, tanggal_surat, keperluan, jenis_surat, status")
          .eq("nik_pemohon", resident.nik)
          .order("tanggal_surat", { ascending: false })
          .limit(5);
        if (isMounted) {
          setRecentLetters(data || []);
        }
      } catch {
        if (isMounted) setRecentLetters([]);
      } finally {
        if (isMounted) setLoadingLetters(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [resident, isOpen]);

  if (!resident) return null;

  const isMale = (resident.jenis_kelamin || "").toUpperCase().startsWith("L");
  const age = resident.tanggal_lahir
    ? Math.max(
        0,
        new Date().getFullYear() - new Date(resident.tanggal_lahir).getFullYear()
      )
    : "-";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col h-full p-0 gap-0 border-l border-border-color shadow-2xl bg-card-bg">
          {/* Drawer Header */}
          <SheetHeader className="px-6 py-4 border-b border-border-color bg-card-bg sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  alt={resident.nama}
                  fallback={resident.nama.substring(0, 2).toUpperCase()}
                  size="md"
                  shape="circle"
                />
                <div>
                  <SheetTitle className="text-base font-semibold text-primary-text line-clamp-1">
                    {resident.nama}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-mono text-secondary-text mt-0.5">
                    NIK: {formatChunkedNIK(resident.nik)}
                  </SheetDescription>
                </div>
              </div>
              <SheetClose className="text-secondary-text hover:text-primary-text p-1 rounded-md hover:bg-hover-bg transition-colors">
                <X className="w-4 h-4" />
              </SheetClose>
            </div>

            {/* Quick Action Bar: Direct Letter Issuance */}
            <div className="pt-3 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push(`/surat/cetak?nik=${resident.nik}`);
                }}
                className="flex-1 gap-2 font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Terbitkan Surat</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onEdit) {
                    onEdit(resident);
                  } else {
                    onClose();
                    router.push(`/penduduk/edit/${resident.nik}`);
                  }
                }}
                className="gap-1.5"
                title="Edit Data Warga"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuditModalOpen(true)}
                className="gap-1.5"
                title="Lihat Jejak Audit & Riwayat Mutasi"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audit</span>
              </Button>
            </div>
          </SheetHeader>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ringkasan Identitas Utama */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-text">
              Identitas & Domisili
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-body-bg/40 p-4 rounded-xl border border-border-color">
              <div>
                <span className="text-secondary-text block">Jenis Kelamin</span>
                <span className="font-medium text-primary-text">{isMale ? "Laki-laki" : "Perempuan"}</span>
              </div>
              <div>
                <span className="text-secondary-text block">Usia</span>
                <span className="font-medium text-primary-text">{age} Tahun</span>
              </div>
              <div>
                <span className="text-secondary-text block">Agama</span>
                <span className="font-medium text-primary-text">{resident.agama || "-"}</span>
              </div>
              <div>
                <span className="text-secondary-text block">Status Perkawinan</span>
                <span className="font-medium text-primary-text">{resident.status_kawin || "-"}</span>
              </div>
              <div>
                <span className="text-secondary-text block">Pekerjaan</span>
                <span className="font-medium text-primary-text truncate block">{resident.pekerjaan || "-"}</span>
              </div>
              <div>
                <span className="text-secondary-text block">Pendidikan</span>
                <span className="font-medium text-primary-text truncate block">{resident.pendidikan_kk || "-"}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-border-color">
                <span className="text-secondary-text block">Alamat</span>
                <span className="font-medium text-primary-text">
                  {resident.alamat_saat_ini || "-"}
                  {(resident.dusun || resident.rw || resident.rt) && (
                    <span className="block text-secondary-text mt-0.5">
                      {[resident.dusun, resident.rw && `RW ${resident.rw}`, resident.rt && `RT ${resident.rt}`].filter(Boolean).join(" / ")}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Konteks Kartu Keluarga & Anggota */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Keluarga (No. KK: {resident.no_kk || "-"})</span>
              </h4>
              {resident.no_kk && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/keluarga`);
                  }}
                  className="h-6 text-[11px] text-secondary-text hover:text-primary-text p-1"
                >
                  Lihat KK
                </Button>
              )}
            </div>

            {loadingFamily ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-text" />
              </div>
            ) : familyMembers.length > 0 ? (
              <div className="border border-border-color rounded-xl divide-y divide-border-color bg-body-bg/30 overflow-hidden">
                {familyMembers.map((m) => {
                  const isCurrent = m.nik === resident.nik;
                  return (
                    <div
                      key={m.nik}
                      className={`p-2.5 flex items-center justify-between text-xs ${
                        isCurrent ? "bg-card-bg font-semibold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-primary-text">{m.nama}</span>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1">
                            Warga Ini
                          </Badge>
                        )}
                      </div>
                      <span className="text-secondary-text text-[11px]">
                        {m.hubungan_keluarga || "Anggota"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-secondary-text italic bg-body-bg/30 p-3 rounded-lg border border-border-color">
                Nomor KK belum terdaftar atau tidak memiliki anggota lain.
              </p>
            )}
          </div>

          {/* Riwayat Surat yang Pernah Diterbitkan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Layanan Surat Terbit</span>
            </h4>

            {loadingLetters ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-text" />
              </div>
            ) : recentLetters.length > 0 ? (
              <div className="space-y-2">
                {recentLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="p-3 bg-body-bg/40 border border-border-color rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary-text">
                        {letter.jenis_surat || "Surat Keterangan"}
                      </span>
                      <span className="text-[10px] font-mono text-secondary-text">
                        {letter.tanggal_surat}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-secondary-text">
                      <span className="font-mono text-[11px]">No: {letter.nomor_surat || "-"}</span>
                      <span className="italic">{letter.keperluan || "Keperluan warga"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-border-color rounded-xl bg-body-bg/20">
                <FileText className="w-6 h-6 text-secondary-text/40 mx-auto mb-1.5" />
                <p className="text-xs text-secondary-text">Belum ada riwayat surat untuk warga ini.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/surat/cetak?nik=${resident.nik}`);
                  }}
                  className="mt-3 text-xs h-7"
                >
                  Buat Surat Pertama
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Visual Audit Trail Modal */}
    {resident && (
      <VisualAuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        entityType="PENDUDUK"
        entityId={resident.id || resident.nik}
        entityIdentifier={resident.nik}
        title={`Jejak Audit & Riwayat: ${resident.nama}`}
        subtitle={`NIK: ${formatChunkedNIK(resident.nik)}`}
      />
    )}
  </>
  );
}

export default ResidentContextDrawer;
