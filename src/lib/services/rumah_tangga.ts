"use client";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident, mapResidentFromDb } from "./penduduk";

export interface RumahTangga {
  id: string;
  no_rtm: string;
  kepala_rtm_id?: string;
  tgl_daftar: string;
  kelas_sosial?: number | string;
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

const getClient = () => createSupabaseBrowserClient();

/**
 * Standard Dukcapil & Desa RTM Member Sorting Hierarchy:
 * 1. Kepala Rumah Tangga (rtm_level_id = 1 / matches kepala_rtm_id)
 * 2. Suami / Istri (hubungan_keluarga_id = 2, 3)
 * 3. Anak (hubungan_keluarga_id = 4) - sorted by birth date (oldest first)
 * 4. Menantu (5), Cucu (6), Orang Tua (7), Mertua (8), Famili Lain (9), Pembantu (10), Lainnya
 */
export const sortRtmMembers = (members: Resident[], kepalaRtmId?: string): Resident[] => {
  if (!members || members.length <= 1) return members || [];

  const getWeight = (m: Resident): number => {
    if (kepalaRtmId && m.id === kepalaRtmId) return 0;
    if (m.rtm_level_id === 1) return 0;
    const hub = (m.hubungan_keluarga || "").toUpperCase();
    const hubId = Number(m.hubungan_keluarga_id || 0);

    if (hubId === 1 || hub.includes("KEPALA")) return 1;
    if (hubId === 2 || hub.includes("SUAMI")) return 2;
    if (hubId === 3 || hub.includes("ISTRI")) return 3;
    if (hubId === 4 || hub.includes("ANAK")) return 4;
    if (hubId === 5 || hub.includes("MENANTU")) return 5;
    if (hubId === 6 || hub.includes("CUCU")) return 6;
    if (hubId === 7 || hub.includes("ORANG TUA")) return 7;
    if (hubId === 8 || hub.includes("MERTUA")) return 8;
    if (hubId === 9 || hub.includes("FAMILI")) return 9;
    if (hubId === 10 || hub.includes("PEMBANTU")) return 10;
    return 11;
  };

  return [...members].sort((a, b) => {
    const weightA = getWeight(a);
    const weightB = getWeight(b);
    if (weightA !== weightB) return weightA - weightB;

    // If both are children or same relationship, sort by birth date (oldest child first)
    if (a.tanggal_lahir && b.tanggal_lahir) {
      return new Date(a.tanggal_lahir).getTime() - new Date(b.tanggal_lahir).getTime();
    }
    return (a.nama || "").localeCompare(b.nama || "");
  });
};

export const getRumahTanggaList = async (): Promise<RumahTangga[]> => {
  const pageSize = 1000;
  const allData: RumahTangga[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await getClient()
      .from("rumah_tangga")
      .select(`
        *,
        kepala_rtm:penduduk!fk_rumah_tangga_kepala(*),
        anggota:penduduk!rumah_tangga_id(*)
      `)
      .order("no_rtm")
      .range(from, to);

    if (error) {
      console.error("Error fetching rumah tangga:", error);
      throw error;
    }

    const batch = (data || []).map((item: any) => {
      const kepalaMapped = item.kepala_rtm ? mapResidentFromDb(item.kepala_rtm) : undefined;
      const rawAnggota = (item.anggota || []).map(mapResidentFromDb);
      const sortedAnggota = sortRtmMembers(rawAnggota, item.kepala_rtm_id);

      return {
        ...item,
        kepala_rtm: kepalaMapped,
        anggota: sortedAnggota,
        jumlah_anggota: rawAnggota.length || (kepalaMapped ? 1 : 0),
      };
    }) as RumahTangga[];

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

  const kepalaMapped = data.kepala_rtm ? mapResidentFromDb(data.kepala_rtm) : undefined;
  const rawAnggota = (data.anggota || []).map(mapResidentFromDb);
  const sortedAnggota = sortRtmMembers(rawAnggota, data.kepala_rtm_id);

  return {
    ...data,
    kepala_rtm: kepalaMapped,
    anggota: sortedAnggota,
    jumlah_anggota: rawAnggota.length || (kepalaMapped ? 1 : 0),
  } as RumahTangga;
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
  // First disassociate all residents linked to this RTM
  try {
    await getClient()
      .from("penduduk")
      .update({ rumah_tangga_id: null, id_rtm: null, rtm_level_id: null })
      .eq("rumah_tangga_id", id);
  } catch (e) {
    console.warn("Could not unbind penduduk from deleted RTM:", e);
  }

  const { error } = await getClient()
    .from("rumah_tangga")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

export const addMemberToRumahTangga = async (rumahTanggaId: string, residentId: string, noRtm?: string): Promise<void> => {
  const { error } = await getClient()
    .from("penduduk")
    .update({ 
      rumah_tangga_id: rumahTanggaId,
      id_rtm: noRtm || null,
      rtm_level_id: 2
    })
    .eq("id", residentId);

  if (error) {
    throw error;
  }
};

export const removeMemberFromRumahTangga = async (residentId: string): Promise<void> => {
  const { error } = await getClient()
    .from("penduduk")
    .update({ 
      rumah_tangga_id: null,
      id_rtm: null,
      rtm_level_id: null
    })
    .eq("id", residentId);

  if (error) {
    throw error;
  }
};
