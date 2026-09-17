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
import { Resident, mapResidentFromDb } from "@/lib/services/penduduk";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { formatChunkedNIK } from "@/lib/utils/formatters";
import VisualAuditTrailModal from "@/components/audit/VisualAuditTrailModal";
import { ShieldCheck } from "lucide-react";

interface ResidentContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  onEdit?: (resident: Resident) => void;
  onSelectResident?: (resident: Resident) => void;
}

export function ResidentContextDrawer({
  isOpen,
  onClose,
  resident,
  onEdit,
  onSelectResident,
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
      const cleanNoKk = (resident.no_kk || "").replace(/\D/g, "");
      const cleanNik = (resident.nik || "").replace(/\D/g, "");

      // 1. Fetch Family Members if No KK exists
      if (cleanNoKk) {
        setLoadingFamily(true);
        try {
          const { data, error } = await supabase
            .from("penduduk")
            .select("*")
            .eq("no_kk", cleanNoKk);

          if (error) throw error;

          if (isMounted && data) {
            const mapped = data.map(mapResidentFromDb);
            // Sort: Kepala Keluarga -> Istri/Suami -> Anak -> Orang Tua/Mertua -> Famili Lain
            const sorted = mapped.sort((a, b) => {
              const getWeight = (r: Resident) => {
                const hk = (r.hubungan_keluarga || "").toUpperCase();
                if (hk.includes("KEPALA")) return 1;
                if (hk.includes("ISTRI") || hk.includes("SUAMI")) return 2;
                if (hk.includes("ANAK")) return 3;
                if (hk.includes("ORANG TUA") || hk.includes("MERTUA")) return 4;
                return 5;
              };
              return getWeight(a) - getWeight(b);
            });
            setFamilyMembers(sorted);
          }
        } catch (err) {
          console.error("Error fetching family members:", err);
          if (isMounted) setFamilyMembers([]);
        } finally {
          if (isMounted) setLoadingFamily(false);
        }
      } else {
        setFamilyMembers([]);
      }

      // 2. Fetch Recent Letters for this Resident from log_surat
      setLoadingLetters(true);
      try {
        let query = supabase
          .from("log_surat")
          .select(`
            id,
            no_surat,
            tanggal,
            keperluan,
            keterangan,
            surat_formats (
              nama
            )
          `)
          .order("tanggal", { ascending: false })
          .limit(5);

        if (resident.id) {
          query = query.eq("id_pend", resident.id);
        } else if (cleanNik) {
          const { data: resByNik } = await supabase
            .from("penduduk")
            .select("id")
            .eq("nik", cleanNik)
            .maybeSingle();
            
          if (resByNik?.id) {
            query = query.eq("id_pend", resByNik.id);
          }
        }

        const { data: letterData } = await query;
        if (isMounted && letterData) {
          setRecentLetters(letterData);
        }
      } catch (err) {
        console.error("Error fetching recent letters:", err);
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

  const cleanKk = (resident.no_kk || "").replace(/\D/g, "");

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col h-full p-0 gap-0 border-l border-border-color shadow-2xl bg-card-bg">
          {/* Drawer Header (Close button is rendered natively by SheetContent) */}
          <SheetHeader className="px-6 py-4 border-b border-border-color bg-card-bg sticky top-0 z-10 pr-12">
            <div className="flex items-center gap-3">
              <Avatar
                alt={resident.nama}
                fallback={resident.nama.substring(0, 2).toUpperCase()}
                size="md"
                shape="circle"
              />
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base font-semibold text-primary-text truncate">
                  {resident.nama}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-secondary-text mt-0.5">
                  NIK: {formatChunkedNIK(resident.nik)}
                </SheetDescription>
              </div>
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
                <span>Keluarga (No. KK: {cleanKk || "-"})</span>
              </h4>
              {cleanKk && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/keluarga?search=${cleanKk}`);
                  }}
                  className="h-6 text-[11px] px-2 gap-1 text-primary-text hover:bg-hover-bg"
                >
                  <Users className="w-3 h-3 text-primary-500" />
                  <span>Lihat KK</span>
                  <ArrowRight className="w-3 h-3 opacity-60" />
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
                      onClick={() => {
                        if (!isCurrent && onSelectResident) {
                          onSelectResident(m);
                        }
                      }}
                      className={`p-2.5 flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? "bg-primary-500/10 font-semibold"
                          : onSelectResident
                          ? "hover:bg-hover-bg cursor-pointer"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-primary-text">{m.nama}</span>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal bg-primary-500/10 text-primary-600 border-primary-500/30">
                            Warga Ini
                          </Badge>
                        )}
                      </div>
                      <span className="text-secondary-text text-[11px] font-medium">
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
                {recentLetters.map((letter) => {
                  const jenisSurat = letter.surat_formats?.nama || letter.jenis_surat || "Surat Keterangan";
                  const tanggalFormatted = letter.tanggal
                    ? new Date(letter.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";
                  return (
                    <div
                      key={letter.id}
                      className="p-3 bg-body-bg/40 border border-border-color rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary-text">
                          {jenisSurat}
                        </span>
                        <span className="text-[10px] font-mono text-secondary-text">
                          {tanggalFormatted}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-secondary-text">
                        <span className="font-mono text-[11px]">No: {letter.no_surat || letter.nomor_surat || "-"}</span>
                        <span className="italic truncate max-w-[200px]">{letter.keperluan || letter.keterangan || "Layanan administrasi"}</span>
                      </div>
                    </div>
                  );
                })}
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
