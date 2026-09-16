import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export type Dusun = {
  id: number;
  nama: string;
};

export type Rw = {
  id: number;
  dusun_id: number;
  nomor_rw: number;
};

export type Rt = {
  id: number;
  rw_id: number;
  nomor_rt: number;
};

/**
 * Formats a dusun string into a clean "Dusun X" representation.
 * Handles inputs like "DUSUN I", "Dusun I", "I", "Dusun DUSUN I", "Tanpa Dusun", "-", etc.
 */
export function formatDusunName(dusun?: string | null): string {
  if (!dusun || dusun === "-" || dusun.trim() === "") return "Tanpa Dusun";
  const trimmed = dusun.trim();
  if (trimmed.toLowerCase() === "tanpa dusun" || trimmed.toLowerCase() === "tanpa_dusun") {
    return "Tanpa Dusun";
  }
  // Remove repeated "dusun" or "DUSUN" prefixes (e.g., "Dusun DUSUN VIII" -> "VIII", "DUSUN I" -> "I")
  let clean = trimmed.replace(/^(dusun\s+)+/i, "").trim();
  if (!clean || clean.toLowerCase() === "tanpa dusun") return "Tanpa Dusun";
  return `Dusun ${clean}`;
}

/**
 * Normalizes dusun string for case-insensitive and prefix-insensitive comparisons / keys.
 */
export function normalizeDusunKey(dusun?: string | null): string {
  if (!dusun || dusun === "-" || dusun.trim() === "") return "tanpa_dusun";
  const trimmed = dusun.trim();
  if (trimmed.toLowerCase() === "tanpa dusun" || trimmed.toLowerCase() === "tanpa_dusun") {
    return "tanpa_dusun";
  }
  const clean = trimmed.replace(/^(dusun\s+)+/i, "").trim().toUpperCase();
  return clean || "tanpa_dusun";
}

export async function getWilayahData() {
  const supabase = createSupabaseBrowserClient();
  
  const [dusunResult, rwResult, rtResult] = await Promise.all([
    supabase.from("wilayah_dusun").select("id, nama").order("nama"),
    supabase.from("wilayah_rw").select("id, dusun_id, nomor_rw").order("nomor_rw"),
    supabase.from("wilayah_rt").select("id, rw_id, nomor_rt").order("nomor_rt")
  ]);

  if (dusunResult.error) throw dusunResult.error;
  if (rwResult.error) throw rwResult.error;
  if (rtResult.error) throw rtResult.error;

  return {
    dusunList: dusunResult.data as Dusun[],
    rwList: rwResult.data as Rw[],
    rtList: rtResult.data as Rt[]
  };
}

