/**
 * Human Bureaucracy Language & Data Formatting Helpers
 * DesaOS - Village Governance UX Suite
 */

/**
 * Formats a 16-digit Indonesian NIK into a readable 4-chunk string:
 * e.g., "1219030102930001" -> "1219 0301 0293 0001"
 * Reduces eye strain when matching physical KTPs.
 */
export function formatChunkedNIK(nik: string | undefined | null): string {
  if (!nik) return "";
  const cleaned = nik.replace(/\D/g, "").slice(0, 16);
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    chunks.push(cleaned.slice(i, i + 4));
  }
  return chunks.join(" ");
}

/**
 * Cleans spaced/formatted NIK back to pure 16 digits for database storage.
 */
export function parseChunkedNIK(val: string | undefined | null): string {
  if (!val) return "";
  return val.replace(/\D/g, "").slice(0, 16);
}

/**
 * Bureaucratic Plain Language Mapping for Letter Flow & Document Statuses
 * Converts confusing technical strings into human operational terms for village staff.
 */
export interface HumanStatus {
  label: string;
  variant: "default" | "success" | "warning" | "error" | "info" | "neutral";
  description: string;
  actionHint?: string;
}

export function getHumanStatusLabel(status: number | string | undefined | null): HumanStatus {
  const s = String(status ?? "").toLowerCase().trim();

  switch (s) {
    case "0":
    case "draft":
      return {
        label: "Draf Baru",
        variant: "neutral",
        description: "Dokumen baru dibuat, belum diajukan ke pimpinan.",
        actionHint: "Ajukan ke Sekdes"
      };

    case "1":
    case "pending_sekdes":
      return {
        label: "Menunggu Verifikasi Sekdes",
        variant: "warning",
        description: "Menunggu pemeriksaan berkas dan data oleh Sekretaris Desa.",
        actionHint: "Periksa Berkas"
      };

    case "2":
    case "pending_kades":
      return {
        label: "Menunggu Tanda Tangan Kades",
        variant: "info",
        description: "Sudah diverifikasi Sekdes, siap ditandatangani Kepala Desa.",
        actionHint: "Tandatangani Dokumen"
      };

    case "3":
    case "ready_to_print":
      return {
        label: "Siap Dicetak",
        variant: "success",
        description: "Dokumen telah disahkan secara resmi dan siap dicetak/diberikan ke warga.",
        actionHint: "Cetak Dokumen"
      };

    case "4":
    case "signed":
      return {
        label: "Selesai & Disahkan",
        variant: "success",
        description: "Dokumen resmi telah selesai diproses dan memiliki nomor register sah.",
        actionHint: "Lihat Arsip"
      };

    case "5":
    case "rejected_sekdes":
    case "rejected_kades":
    case "rejected":
      return {
        label: "Perlu Perbaikan",
        variant: "error",
        description: "Dokumen dikembalikan oleh pimpinan dengan catatan perbaikan.",
        actionHint: "Edit & Ajukan Ulang"
      };

    case "printed":
      return {
        label: "Telah Dicetak",
        variant: "default",
        description: "Fisik surat telah dicetak untuk diserahkan kepada pemohon."
      };

    default:
      return {
        label: "Tersimpan",
        variant: "neutral",
        description: "Status dokumen aktif tercatat di sistem."
      };
  }
}

/**
 * Human Role Labeling
 */
export function getHumanRoleLabel(role: string | undefined | null): string {
  if (!role) return "Petugas";
  const r = role.toLowerCase().trim();
  if (r.includes("kades") || r.includes("kepala_desa")) return "Kepala Desa";
  if (r.includes("sekdes") || r.includes("sekretaris")) return "Sekretaris Desa";
  if (r.includes("kaur") || r.includes("kasi")) return "Kaur / Kasi Pelayanan";
  if (r.includes("kadus") || r.includes("kepala_dusun")) return "Kepala Dusun";
  if (r.includes("admin") || r.includes("operator")) return "Operator Pelayanan";
  return role;
}

/**
 * Formats date into official Indonesian bureaucratic style:
 * e.g., "17 September 2026, 09:15 WIB"
 */
export function formatBureaucraticDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

export function formatBureaucraticDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}
