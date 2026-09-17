import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident } from "@/lib/services/penduduk";

export type SHDK =
  | "KEPALA KELUARGA"
  | "SUAMI"
  | "ISTRI"
  | "ANAK"
  | "MENANTU"
  | "CUCU"
  | "ORANG TUA"
  | "MERTUA"
  | "FAMILI LAIN"
  | "PEMBANTU"
  | "LAINNYA";

export const SHDK_OPTIONS: { id: number; label: SHDK }[] = [
  { id: 1, label: "KEPALA KELUARGA" },
  { id: 2, label: "SUAMI" },
  { id: 3, label: "ISTRI" },
  { id: 4, label: "ANAK" },
  { id: 5, label: "MENANTU" },
  { id: 6, label: "CUCU" },
  { id: 7, label: "ORANG TUA" },
  { id: 8, label: "MERTUA" },
  { id: 9, label: "FAMILI LAIN" },
  { id: 10, label: "PEMBANTU" },
  { id: 11, label: "LAINNYA" },
];

export interface AnggotaKeluarga {
  nik: string;
  nama: string;
  hubungan_keluarga?: string;
  hubungan_keluarga_id?: number | null;
  no_kk: string;
}

export interface PecahKKPayload {
  noKkAsal: string;
  noKkBaru: string;
  nikKepalaKeluargaBaru: string;
  nikAnggotaPindah: string[];
  shdkAnggotaBaru?: Record<string, { hubungan: string; hubunganId: number }>;
  nikKepalaKeluargaAsalBaru?: string; // Required if old head moves and members remain
  alamatBaru?: {
    dusun?: string;
    rw?: string;
    rt?: string;
    alamat_saat_ini?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export class KependudukanDomainService {
  /**
   * Validates Family Card Split (Pecah KK) according to Indonesian civil registry integrity rules.
   */
  public static validatePecahKK(
    kkAsalAnggota: Resident[] | AnggotaKeluarga[],
    payload: PecahKKPayload
  ): ValidationResult {
    // 1. Validasi keberadaan anggota yang pindah
    if (!payload.nikAnggotaPindah || payload.nikAnggotaPindah.length === 0) {
      return {
        valid: false,
        reason: "Pilih minimal 1 anggota keluarga yang akan memisahkan diri ke KK baru.",
      };
    }

    // 2. Pastikan calon kepala keluarga baru ada dalam daftar anggota yang pindah
    if (!payload.nikAnggotaPindah.includes(payload.nikKepalaKeluargaBaru)) {
      return {
        valid: false,
        reason: "Kepala Keluarga baru harus merupakan salah satu anggota yang memisahkan diri.",
      };
    }

    // 3. Format NIK & No KK integrity (Indonesian 16-digit standard)
    const isValid16Digit = (val: string) => /^[1-9][0-9]{15}$/.test(val.trim());
    if (!isValid16Digit(payload.noKkBaru)) {
      return {
        valid: false,
        reason: "Format Nomor KK Baru tidak valid (wajib 16 digit angka diawali 1-9).",
      };
    }

    if (payload.noKkBaru.trim() === payload.noKkAsal.trim()) {
      return {
        valid: false,
        reason: "Nomor KK Baru tidak boleh sama dengan Nomor KK Asal.",
      };
    }

    // 4. Cegah KK asal kehilangan Kepala Keluarga tanpa suksesi
    const kepalaKeluargaAsal = kkAsalAnggota.find(
      (a) =>
        (a.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA" ||
        a.hubungan_keluarga_id === 1
    );

    const kepalaKeluargaPindah = payload.nikAnggotaPindah.includes(
      kepalaKeluargaAsal?.nik ?? ""
    );
    const sisaAnggota = kkAsalAnggota.filter(
      (a) => !payload.nikAnggotaPindah.includes(a.nik)
    );

    if (kepalaKeluargaPindah && sisaAnggota.length > 0) {
      if (!payload.nikKepalaKeluargaAsalBaru) {
        return {
          valid: false,
          reason:
            "Kepala Keluarga lama ikut memisahkan diri sementara masih ada anggota keluarga yang tersisa di KK asal. Anda wajib menunjuk Kepala Keluarga Pengganti untuk KK asal.",
        };
      }

      const calonSuksesiAdaDiSisa = sisaAnggota.some(
        (a) => a.nik === payload.nikKepalaKeluargaAsalBaru
      );
      if (!calonSuksesiAdaDiSisa) {
        return {
          valid: false,
          reason:
            "Kepala Keluarga Pengganti untuk KK asal harus berasal dari anggota keluarga yang tetap tinggal di KK asal.",
        };
      }
    }

    return { valid: true };
  }

  /**
   * Executes atomic database mutation for Pecah KK and SHDK updates.
   */
  public static async executePecahKK(
    kkAsalAnggota: Resident[],
    payload: PecahKKPayload
  ): Promise<{ success: boolean; message: string }> {
    const validation = this.validatePecahKK(kkAsalAnggota, payload);
    if (!validation.valid) {
      return { success: false, message: validation.reason || "Validasi gagal." };
    }

    const supabase = createSupabaseBrowserClient();

    try {
      // 1. Cek apakah No KK Baru sudah terdaftar pada orang lain di luar KK ini
      const { data: existingKkData, error: checkError } = await supabase
        .from("penduduk")
        .select("id, nik, nama, no_kk")
        .eq("no_kk", payload.noKkBaru.trim())
        .limit(5);

      if (checkError) {
        console.error("Error checking existing KK:", checkError);
      }

      if (existingKkData && existingKkData.length > 0) {
        const isSelfMember = existingKkData.every((r) =>
          payload.nikAnggotaPindah.includes(r.nik)
        );
        if (!isSelfMember) {
          return {
            success: false,
            message: `Nomor KK ${payload.noKkBaru} sudah aktif digunakan oleh keluarga lain di database.`,
          };
        }
      }

      // 2. Mutasi anggota yang pindah ke KK Baru
      for (const nik of payload.nikAnggotaPindah) {
        const isKepalaBaru = nik === payload.nikKepalaKeluargaBaru;
        const customShdk = payload.shdkAnggotaBaru?.[nik];

        const hubunganKeluarga = isKepalaBaru
          ? "KEPALA KELUARGA"
          : customShdk?.hubungan || "ANAK";
        const hubunganKeluargaId = isKepalaBaru
          ? 1
          : customShdk?.hubunganId || 4;

        const updatePayload: any = {
          no_kk: payload.noKkBaru.trim(),
          hubungan_keluarga: hubunganKeluarga,
          hubungan_keluarga_id: hubunganKeluargaId,
        };

        if (payload.alamatBaru) {
          if (payload.alamatBaru.dusun) updatePayload.dusun = payload.alamatBaru.dusun;
          if (payload.alamatBaru.rw) updatePayload.rw = payload.alamatBaru.rw;
          if (payload.alamatBaru.rt) updatePayload.rt = payload.alamatBaru.rt;
          if (payload.alamatBaru.alamat_saat_ini) {
            updatePayload.alamat_saat_ini = payload.alamatBaru.alamat_saat_ini;
          }
        }

        const { error: updateError } = await supabase
          .from("penduduk")
          .update(updatePayload)
          .eq("nik", nik);

        if (updateError) {
          throw new Error(`Gagal memperbarui data anggota NIK ${nik}: ${updateError.message}`);
        }
      }

      // 3. Suksesi Kepala Keluarga KK Asal (jika diperlukan)
      if (payload.nikKepalaKeluargaAsalBaru) {
        const { error: suksesiError } = await supabase
          .from("penduduk")
          .update({
            hubungan_keluarga: "KEPALA KELUARGA",
            hubungan_keluarga_id: 1,
          })
          .eq("nik", payload.nikKepalaKeluargaAsalBaru);

        if (suksesiError) {
          throw new Error(`Gagal menetapkan Kepala Keluarga baru untuk KK asal: ${suksesiError.message}`);
        }
      }

      return {
        success: true,
        message: `Pemisahan Kartu Keluarga berhasil! KK Baru (${payload.noKkBaru}) telah dibuat dengan ${payload.nikAnggotaPindah.length} anggota.`,
      };
    } catch (err: any) {
      console.error("Error executing Pecah KK:", err);
      return {
        success: false,
        message: err.message || "Terjadi kesalahan sistem saat memproses pemisahan KK.",
      };
    }
  }
}
