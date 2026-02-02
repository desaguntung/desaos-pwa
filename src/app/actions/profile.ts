'use server';

import { createSupabaseServerClient } from "@/utils/supabase/server";

export interface ProfileData {
  identitas: {
    nama_desa: string;
    sebutan_desa: string;
    sejarah: string;
    visi: string;
    misi: string;
    luas_wilayah: string;
    ketinggian: string;
    batas_utara: string;
    batas_selatan: string;
    batas_timur: string;
    batas_barat: string;
    lat: string;
    lng: string;
    peta_wilayah: string;
    alamat_kantor?: string;
    email_desa?: string;
    telepon_desa?: string;
    website?: string;
    nama_kecamatan: string;
    nama_kabupaten: string;
    nama_provinsi: string;
  };
  pamong: Array<{
    pamong_id: string;
    pamong_nama: string;
    pamong_nip: string;
    pamong_niap: string;
    jabatan: string;
    foto: string;
    pamong_status: number;
    penduduk?: {
      nama: string;
    };
  }>;
  prestasi: Array<{
    id: string;
    judul: string;
    deskripsi: string;
    tanggal: string;
    foto_url?: string;
    tingkat?: string;
  }>;
}

export async function getProfileData(): Promise<{ data: ProfileData | null; error?: string }> {
  try {
    const supabase = createSupabaseServerClient();
    
    // 1. Fetch Identitas Desa
    const { data: identitas, error: idError } = await supabase
      .from("identitas_desa")
      .select("*")
      .single();

    if (idError) throw idError;

    // 2. Fetch Pamong Desa (Apparatus)
    const { data: pamong, error: pamongError } = await supabase
      .from("pamong_desa")
      .select(`
        *,
        penduduk:id_pend (
          nama
        )
      `)
      .eq("pamong_status", 1) // Active only
      .order("pamong_nama", { ascending: true });

    if (pamongError) console.error("Error fetching pamong:", pamongError);

    // 3. Fetch Prestasi Desa
    const { data: prestasi, error: prestasiError } = await supabase
      .from("prestasi_desa")
      .select("*")
      .order("tanggal", { ascending: false });

    if (prestasiError) console.error("Error fetching prestasi:", prestasiError);

    return {
      data: {
        identitas: identitas || {},
        pamong: pamong || [],
        prestasi: prestasi || []
      }
    };

  } catch (error: any) {
    console.error("Failed to fetch profile data:", error);
    return { data: null, error: error.message };
  }
}
