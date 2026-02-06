import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export type ReferenceItem = {
  id: number;
  nama: string;
};

export const getRefAgama = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_agama").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefPekerjaan = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_pekerjaan").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefPendidikan = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_pendidikan").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefPendidikanKK = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_pendidikan_kk").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefStatusKawin = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_status_kawin").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefGolonganDarah = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_golongan_darah").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefWarganegara = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_warganegara").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefHubunganKeluarga = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_hubungan_keluarga").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefStatusPenduduk = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_status_penduduk").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefCacat = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_cacat").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefSakitMenahun = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_sakit_menahun").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefAsuransi = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_asuransi").select("*").order("id");
  return data as ReferenceItem[];
};

export const getRefCaraKB = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.from("ref_cara_kb").select("*").order("id");
  return data as ReferenceItem[];
};
