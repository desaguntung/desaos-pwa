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
