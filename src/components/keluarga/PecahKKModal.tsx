"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  GitFork, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Info,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { Keluarga } from "@/lib/services/keluarga";
import { Resident } from "@/lib/services/penduduk";
import { 
  KependudukanDomainService, 
  SHDK_OPTIONS, 
  PecahKKPayload 
} from "@/lib/domain/kependudukan/pecah-kk";

interface PecahKKModalProps {
  isOpen: boolean;
  onClose: () => void;
  keluarga: Keluarga | null;
  onSuccess: () => void;
  dusunOptions?: string[];
}

export default function PecahKKModal({
  isOpen,
  onClose,
  keluarga,
  onSuccess,
  dusunOptions = [],
}: PecahKKModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State
  const [selectedMovingNiks, setSelectedMovingNiks] = useState<string[]>([]);
  const [noKkBaru, setNoKkBaru] = useState("");
  const [nikKepalaKeluargaBaru, setNikKepalaKeluargaBaru] = useState("");
  const [shdkAnggotaBaru, setShdkAnggotaBaru] = useState<Record<string, { hubungan: string; hubunganId: number }>>({});
  const [nikKepalaKeluargaAsalBaru, setNikKepalaKeluargaAsalBaru] = useState("");
  
  // New address state
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [dusunBaru, setDusunBaru] = useState("");
  const [rwBaru, setRwBaru] = useState("");
  const [rtBaru, setRtBaru] = useState("");
  const [alamatBaru, setAlamatBaru] = useState("");

  const members = keluarga?.members || [];

  // Identify Old Head of Family
  const oldHead = useMemo(() => {
    return members.find(
      (m) =>
        (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA" ||
        (m as any).hubungan_keluarga_id === 1
    );
  }, [members]);

  const isOldHeadMoving = oldHead ? selectedMovingNiks.includes(oldHead.nik) : false;
  const remainingMembers = members.filter((m) => !selectedMovingNiks.includes(m.nik));
  const movingMembers = members.filter((m) => selectedMovingNiks.includes(m.nik));
  const needsOldHeadSuccession = isOldHeadMoving && remainingMembers.length > 0;

  // Toggle member selection
  const handleToggleMember = (nik: string) => {
    setSelectedMovingNiks((prev) => {
      const isSelected = prev.includes(nik);
      const next = isSelected ? prev.filter((id) => id !== nik) : [...prev, nik];
      
      // Auto assign new head if first selected or current head unselected
      if (!isSelected && next.length === 1) {
        setNikKepalaKeluargaBaru(nik);
      } else if (isSelected && nikKepalaKeluargaBaru === nik) {
        setNikKepalaKeluargaBaru(next[0] || "");
      }

      return next;
    });
  };

  const handleShdkChange = (nik: string, opt: { id: number; label: string }) => {
    setShdkAnggotaBaru((prev) => ({
      ...prev,
      [nik]: { hubungan: opt.label, hubunganId: opt.id },
    }));
  };

  const handleProcessPecahKK = async () => {
    if (!keluarga) return;

    const payload: PecahKKPayload = {
      noKkAsal: keluarga.nomorKK,
      noKkBaru: noKkBaru.trim(),
      nikKepalaKeluargaBaru,
      nikAnggotaPindah: selectedMovingNiks,
      shdkAnggotaBaru,
      nikKepalaKeluargaAsalBaru: needsOldHeadSuccession ? nikKepalaKeluargaAsalBaru : undefined,
      alamatBaru: isCustomAddress
        ? {
            dusun: dusunBaru || undefined,
            rw: rwBaru || undefined,
            rt: rtBaru || undefined,
            alamat_saat_ini: alamatBaru || undefined,
          }
        : undefined,
    };

    // Pre-validation
    const validation = KependudukanDomainService.validatePecahKK(members, payload);
    if (!validation.valid) {
      toast.error(validation.reason || "Validasi pemisahan KK gagal.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await KependudukanDomainService.executePecahKK(members, payload);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pemisahan KK.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card-bg border border-border-color shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border-color bg-card-bg sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-body-bg border border-border-color flex items-center justify-center text-primary-text">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-primary-text">
                Pecah Kartu Keluarga (Pemisahan KK)
              </DialogTitle>
              <DialogDescription className="text-xs text-secondary-text mt-0.5">
                KK Asal: <span className="font-mono font-medium text-primary-text">{keluarga?.nomorKK}</span> ({keluarga?.headName})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Langkah 1: Pilih Anggota yang Memisahkan Diri */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-secondary-text flex items-center gap-2">
                <span>1. Pilih Anggota Keluarga yang Pindah ke KK Baru</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {selectedMovingNiks.length} dari {members.length} dipilih
                </Badge>
              </Label>
            </div>

            <div className="border border-border-color rounded-lg divide-y divide-border-color bg-body-bg/40 overflow-hidden">
              {members.map((member) => {
                const isSelected = selectedMovingNiks.includes(member.nik);
                const isHead = (member.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA" || (member as any).hubungan_keluarga_id === 1;

                return (
                  <div
                    key={member.nik}
                    onClick={() => handleToggleMember(member.nik)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-card-bg font-medium" : "hover:bg-card-bg/60 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by div click
                        className="rounded border-border-color text-primary focus:ring-0 cursor-pointer h-4 w-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary-text">{member.nama}</span>
                          {isHead && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                              Kepala KK Asal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs font-mono text-secondary-text">
                          NIK: {member.nik} • {member.hubungan_keluarga || "Anggota"}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <Badge variant="default" className="text-[10px]">
                          Pindah
                        </Badge>
                      ) : (
                        <span className="text-xs text-secondary-text italic">Tetap di KK Asal</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Langkah 2: Nomor KK Baru & Kepala Keluarga Baru */}
          {selectedMovingNiks.length > 0 && (
            <div className="space-y-4 border-t border-border-color pt-5">
              <Label className="text-xs font-bold uppercase tracking-wider text-secondary-text">
                2. Tentukan Identitas Kartu Keluarga Baru
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary-text">
                    Nomor KK Baru (16 Digit) <span className="text-error-text">*</span>
                  </label>
                  <Input
                    type="text"
                    maxLength={16}
                    placeholder="Contoh: 3201010101230001"
                    value={noKkBaru}
                    onChange={(e) => setNoKkBaru(e.target.value.replace(/\D/g, ""))}
                    className="font-mono text-sm"
                  />
                  {noKkBaru.length > 0 && noKkBaru.length !== 16 && (
                    <p className="text-[11px] text-error-text">Wajib 16 digit numerik ({noKkBaru.length}/16 digit)</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary-text">
                    Kepala Keluarga Baru <span className="text-error-text">*</span>
                  </label>
                  <select
                    value={nikKepalaKeluargaBaru}
                    onChange={(e) => setNikKepalaKeluargaBaru(e.target.value)}
                    className="w-full h-9 text-xs bg-card-bg border border-border-color rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary-text/10 text-primary-text"
                  >
                    {movingMembers.map((m) => (
                      <option key={m.nik} value={m.nik}>
                        {m.nama} (NIK: {m.nik})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Atur SHDK Anggota Lain di KK Baru */}
              {movingMembers.length > 1 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-medium text-secondary-text">
                    Hubungan Keluarga (SHDK) di KK Baru:
                  </label>
                  <div className="space-y-2 bg-body-bg/30 p-3 rounded-lg border border-border-color">
                    {movingMembers.map((m) => {
                      const isNewHead = m.nik === nikKepalaKeluargaBaru;
                      if (isNewHead) return null;

                      const currentVal = shdkAnggotaBaru[m.nik]?.hubunganId || 4;

                      return (
                        <div key={m.nik} className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-medium text-primary-text truncate max-w-[200px]">
                            {m.nama}
                          </span>
                          <select
                            value={currentVal}
                            onChange={(e) => {
                              const selId = Number(e.target.value);
                              const opt = SHDK_OPTIONS.find((o) => o.id === selId);
                              if (opt) handleShdkChange(m.nik, opt);
                            }}
                            className="h-8 text-xs bg-card-bg border border-border-color rounded px-2 text-primary-text"
                          >
                            {SHDK_OPTIONS.filter((o) => o.id !== 1).map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Langkah 3: Suksesi Kepala Keluarga KK Asal (Kondisional) */}
          {needsOldHeadSuccession && (
            <div className="space-y-3 border-t border-border-color pt-5 bg-warning-bg/10 p-4 rounded-lg border border-warning-border">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-warning-text shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-primary-text">
                    Suksesi Kepala Keluarga KK Asal Diperlukan
                  </h4>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    Kepala Keluarga lama ({oldHead?.nama}) ikut memisahkan diri, dan masih ada{" "}
                    <strong>{remainingMembers.length} anggota</strong> yang tersisa di KK asal ({keluarga?.nomorKK}).
                    Pilih salah satu anggota tersisa untuk ditetapkan sebagai Kepala Keluarga Baru di KK asal:
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <select
                  value={nikKepalaKeluargaAsalBaru}
                  onChange={(e) => setNikKepalaKeluargaAsalBaru(e.target.value)}
                  className="w-full h-9 text-xs bg-card-bg border border-border-color rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary-text/10 text-primary-text"
                >
                  <option value="">-- Pilih Kepala Keluarga Pengganti --</option>
                  {remainingMembers.map((m) => (
                    <option key={m.nik} value={m.nik}>
                      {m.nama} ({m.hubungan_keluarga || "Anggota"}, NIK: {m.nik})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Langkah 4: Domisili / Alamat Baru (Opsional) */}
          {selectedMovingNiks.length > 0 && (
            <div className="space-y-3 border-t border-border-color pt-5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="customAddressCheck"
                  checked={isCustomAddress}
                  onChange={(e) => setIsCustomAddress(e.target.checked)}
                  className="rounded border-border-color text-primary focus:ring-0 cursor-pointer h-4 w-4"
                />
                <label htmlFor="customAddressCheck" className="text-xs font-medium text-primary-text cursor-pointer">
                  Perbarui Alamat Domisili untuk KK Baru (Opsional jika pindah rumah/dusun)
                </label>
              </div>

              {isCustomAddress && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-body-bg/40 rounded-lg border border-border-color">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-secondary-text">Dusun</label>
                    <select
                      value={dusunBaru}
                      onChange={(e) => setDusunBaru(e.target.value)}
                      className="w-full h-8 text-xs bg-card-bg border border-border-color rounded px-2 text-primary-text"
                    >
                      <option value="">-- Pilih Dusun --</option>
                      {dusunOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-secondary-text">RW</label>
                    <Input
                      placeholder="Contoh: 001"
                      value={rwBaru}
                      onChange={(e) => setRwBaru(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-secondary-text">RT</label>
                    <Input
                      placeholder="Contoh: 002"
                      value={rtBaru}
                      onChange={(e) => setRtBaru(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-secondary-text">Alamat Jalan / Blok</label>
                    <Input
                      placeholder="Jalan / Gang / No Rumah"
                      value={alamatBaru}
                      onChange={(e) => setAlamatBaru(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border-color bg-card-bg sticky bottom-0 flex justify-between items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleProcessPecahKK}
            disabled={
              isSubmitting ||
              selectedMovingNiks.length === 0 ||
              noKkBaru.length !== 16 ||
              !nikKepalaKeluargaBaru ||
              (needsOldHeadSuccession && !nikKepalaKeluargaAsalBaru)
            }
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses Mutasi...
              </>
            ) : (
              <>
                <GitFork className="w-4 h-4" />
                Proses Pemisahan KK
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
