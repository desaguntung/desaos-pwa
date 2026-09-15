"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export type ReferenceItem = {
  id: number;
  nama: string;
};

export type DusunItem = {
  id: number | bigint;
  nama: string;
};

export type RWItem = {
  id: number | bigint;
  dusun_id: number | bigint;
  nomor_rw: number | string;
};

export type RTItem = {
  id: number | bigint;
  rw_id: number | bigint;
  nomor_rt: number | string;
};

// In-memory cache to prevent redundant HTTP requests across renders/pages
const cache: Record<string, { data: any[]; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T[]>): Promise<T[]> {
  const cached = cache[key];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T[];
  }

  try {
    const data = await fetcher();
    cache[key] = { data: data || [], timestamp: now };
    return data || [];
  } catch (error) {
    console.error(`Error fetching reference [${key}]:`, error);
    return cached?.data ? (cached.data as T[]) : [];
  }
}

export const getRefAgama = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_agama", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_agama").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefJenisKelamin = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_jenis_kelamin", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_jenis_kelamin").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefPekerjaan = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_pekerjaan", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_pekerjaan").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefPendidikan = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_pendidikan", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_pendidikan").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefPendidikanKK = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_pendidikan_kk", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_pendidikan_kk").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefStatusKawin = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_status_kawin", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_status_kawin").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefGolonganDarah = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_golongan_darah", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_golongan_darah").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefWarganegara = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_warganegara", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_warganegara").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefHubunganKeluarga = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_hubungan_keluarga", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_hubungan_keluarga").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefStatusPenduduk = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_status_penduduk", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_status_penduduk").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefCacat = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_cacat", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_cacat").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefSakitMenahun = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_sakit_menahun", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_sakit_menahun").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefAsuransi = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_asuransi", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_asuransi").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefCaraKB = async (): Promise<ReferenceItem[]> => {
  return fetchWithCache("ref_cara_kb", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("ref_cara_kb").select("*").order("id");
    return (data || []) as ReferenceItem[];
  });
};

export const getRefDusun = async (): Promise<DusunItem[]> => {
  return fetchWithCache("wilayah_dusun", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("wilayah_dusun").select("id, nama").order("nama");
    return (data || []) as DusunItem[];
  });
};

export const getRefRW = async (): Promise<RWItem[]> => {
  return fetchWithCache("wilayah_rw", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("wilayah_rw").select("*").order("nomor_rw");
    return (data || []) as RWItem[];
  });
};

export const getRefRT = async (): Promise<RTItem[]> => {
  return fetchWithCache("wilayah_rt", async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("wilayah_rt").select("*").order("nomor_rt");
    return (data || []) as RTItem[];
  });
};

export interface AllReferences {
  agama: ReferenceItem[];
  jenisKelamin: ReferenceItem[];
  pekerjaan: ReferenceItem[];
  pendidikan: ReferenceItem[];
  pendidikanKK: ReferenceItem[];
  statusKawin: ReferenceItem[];
  golDarah: ReferenceItem[];
  warganegara: ReferenceItem[];
  hubKeluarga: ReferenceItem[];
  statusPenduduk: ReferenceItem[];
  cacat: ReferenceItem[];
  sakitMenahun: ReferenceItem[];
  asuransi: ReferenceItem[];
  caraKB: ReferenceItem[];
  dusun: DusunItem[];
  rw: RWItem[];
  rt: RTItem[];
}

export const getAllReferences = async (): Promise<AllReferences> => {
  const [
    agama,
    jenisKelamin,
    pekerjaan,
    pendidikan,
    pendidikanKK,
    statusKawin,
    golDarah,
    warganegara,
    hubKeluarga,
    statusPenduduk,
    cacat,
    sakitMenahun,
    asuransi,
    caraKB,
    dusun,
    rw,
    rt,
  ] = await Promise.all([
    getRefAgama(),
    getRefJenisKelamin(),
    getRefPekerjaan(),
    getRefPendidikan(),
    getRefPendidikanKK(),
    getRefStatusKawin(),
    getRefGolonganDarah(),
    getRefWarganegara(),
    getRefHubunganKeluarga(),
    getRefStatusPenduduk(),
    getRefCacat(),
    getRefSakitMenahun(),
    getRefAsuransi(),
    getRefCaraKB(),
    getRefDusun(),
    getRefRW(),
    getRefRT(),
  ]);

  return {
    agama,
    jenisKelamin,
    pekerjaan,
    pendidikan,
    pendidikanKK,
    statusKawin,
    golDarah,
    warganegara,
    hubKeluarga,
    statusPenduduk,
    cacat,
    sakitMenahun,
    asuransi,
    caraKB,
    dusun,
    rw,
    rt,
  };
};

/**
 * Custom React Hook for dynamically consuming all reference data with auto-caching.
 */
export function useReferenceData() {
  const [data, setData] = useState<AllReferences>({
    agama: [],
    jenisKelamin: [],
    pekerjaan: [],
    pendidikan: [],
    pendidikanKK: [],
    statusKawin: [],
    golDarah: [],
    warganegara: [],
    hubKeluarga: [],
    statusPenduduk: [],
    cacat: [],
    sakitMenahun: [],
    asuransi: [],
    caraKB: [],
    dusun: [],
    rw: [],
    rt: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAllReferences()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load reference data in hook:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...data, loading };
}
