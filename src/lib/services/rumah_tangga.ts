"use client";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident } from "./penduduk";

export interface RumahTangga {
  id: string;
  no_rtm: string;
  kepala_rtm_id?: string;
  tgl_daftar: string;
  kelas_sosial?: number;
  bdt?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  dusun?: string;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
  // Relasi
  kepala_rtm?: Resident;
  anggota?: Resident[];
  jumlah_anggota?: number;
}

type RumahTanggaWithAnggota = RumahTangga & {
  anggota?: { id: string }[];
};

const getClient = () => createSupabaseBrowserClient();

export const getRumahTanggaList = async (): Promise<RumahTangga[]> => {
  const pageSize = 1000;
  const allData: RumahTangga[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    // Kita ambil data rumah tangga beserta kepala keluarga
    // Untuk anggota, kita bisa hitung jumlahnya atau ambil detailnya
    // Di sini kita ambil detail kepala keluarga
    const { data, error } = await getClient()
      .from("rumah_tangga")
      .select(`
        *,
        kepala_rtm:penduduk!fk_rumah_tangga_kepala(*),
        anggota:penduduk!rumah_tangga_id(id)
      `)
      .order("no_rtm")
      .range(from, to);

    if (error) {
      console.error("Error fetching rumah tangga:", error);
      throw error;
    }

    const batch = (data || []).map((item: RumahTanggaWithAnggota) => ({
      ...item,
      jumlah_anggota: item.anggota?.length || 0,
      // Hapus raw anggota agar tidak memberatkan jika hanya butuh jumlah
      anggota: undefined 
    })) as RumahTangga[];

    allData.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allData;
};

export const getRumahTanggaById = async (id: string): Promise<RumahTangga | null> => {
  const { data, error } = await getClient()
    .from("rumah_tangga")
    .select(`
      *,
      kepala_rtm:penduduk!fk_rumah_tangga_kepala(*),
      anggota:penduduk!rumah_tangga_id(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching rumah tangga by id:", error);
    return null;
  }

  return data as RumahTangga;
};

export const createRumahTangga = async (rtm: Partial<RumahTangga>): Promise<RumahTangga> => {
  const { data, error } = await getClient()
    .from("rumah_tangga")
    .insert([rtm])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateRumahTangga = async (id: string, rtm: Partial<RumahTangga>): Promise<RumahTangga> => {
  const { data, error } = await getClient()
    .from("rumah_tangga")
    .update(rtm)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteRumahTangga = async (id: string): Promise<void> => {
  const { error } = await getClient()
    .from("rumah_tangga")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

// Fungsi untuk menambah anggota ke Rumah Tangga
export const addMemberToRumahTangga = async (rumahTanggaId: string, residentId: string): Promise<void> => {
  const { error } = await getClient()
    .from("penduduk")
    .update({ rumah_tangga_id: rumahTanggaId })
    .eq("id", residentId);

  if (error) {
    throw error;
  }
};

// Fungsi untuk menghapus anggota dari Rumah Tangga
export const removeMemberFromRumahTangga = async (residentId: string): Promise<void> => {
  const { error } = await getClient()
    .from("penduduk")
    .update({ rumah_tangga_id: null })
    .eq("id", residentId);

  if (error) {
    throw error;
  }
};
