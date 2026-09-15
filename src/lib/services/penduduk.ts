"use client";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export interface Resident {
  id?: string;
  nik: string;
  nama: string;
  nama_desa?: string;
  nama_kecamatan?: string;
  nama_kabupaten?: string;
  nama_provinsi?: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  no_kk: string;
  hubungan_keluarga: string;
  jenis_kelamin: string;
  agama?: string;
  status_penduduk?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  tanggal_perkawinan?: string;
  waktu_lahir?: string;
  detail_tempat_lahir?: string;
  jenis_tempat_lahir?: string; // New field for RS/RB, Puskesmas, etc.
  jenis_kelahiran?: string; // New field for Tunggal, Kembar
  cara_lahir?: string; // Mapped to Penolong Kelahiran (Dokter, Bidan...)
  anak_ke?: number;
  berat_lahir?: string;
  panjang_lahir?: string;
  golongan_darah?: string;
  pendidikan_kk?: string;
  pendidikan_saat_ini?: string;
  pekerjaan?: string;
  keahlian_khusus?: string;
  kepesertaan_asuransi?: string;
  cacat_fisik_mental?: string;
  sakit_menahun?: string;
  akseptor_kb?: string;
  cara_kb_id?: number | null;
  status_kehamilan?: string;
  status_ekonomi_dtks?: string;
  penghasilan_rata_rata?: string;
  kepemilikan_rumah?: string;
  sumber_air_minum?: string;
  akta_kelahiran_nomor?: string;
  nik_ayah?: string;
  nama_ayah?: string;
  nik_ibu?: string;
  nama_ibu?: string;
  alamat_rt?: string;
  alamat_sebelumnya?: string;
  alamat_saat_ini?: string;
  dusun?: string;
  rt?: string;
  rw?: string;
  telepon?: string;
  email?: string;
  kode_pos?: string;
  status_kawin?: string;
  kewarganegaraan?: string;
  foto_url?: string;
  akun_facebook?: string;
  akun_instagram?: string;
  akun_twitter?: string;
  id_sosial_lainnya?: string;
  scan_ktp_url?: string;
  scan_kk_url?: string;
  scan_akta_lahir_url?: string;
  scan_akta_nikah_url?: string;
  scan_ijazah_url?: string;
  scan_paspor_url?: string;
  no_paspor?: string;
  no_kitap?: string;
  keluarga_id?: string | null;
  rumah_tangga_id?: string | null;
  status_dalam_keluarga?: string | null;
  status_dalam_rumah_tangga?: string | null;
  status_kepemilikan_identitas?: string;
  identitas_elektronik?: string;
  status_rekam?: string;
  tag_id_card?: string;
  suku_etnis?: string;
  no_kitas?: string;
  tgl_berakhir_paspor?: string;
  akta_perceraian?: string;
  akta_perkawinan?: string;
  tanggal_perceraian?: string;
  no_akta_nikah?: string;
  cara_hubung_warga?: string;
  telegram?: string;
  nomor_bpjs_ketenagakerjaan?: string;
  no_kk_sebelumnya?: string;
  created_at?: string;
}

export const IDENTITAS_ELEKTRONIK_OPTIONS = [
  "BELUM",
  "KTP-EL",
  "KIA"
];

export const STATUS_REKAM_OPTIONS = [
  "BELUM REKAM",
  "SUDAH REKAM",
  "CARD PRINTED",
  "PRINT READY TO RECORD",
  "CARD SHIPPED",
  "SENT FOR CARD PRINTING",
  "CARD ISSUED",
  "BELUM WAJIB"
];

export const AGAMA_OPTIONS = [
  "ISLAM",
  "KRISTEN",
  "KATHOLIK",
  "HINDU",
  "BUDHA",
  "KONGHUCU",
  "KEPERCAYAAN TERHADAP TUHAN YME / LAINNYA"
];

export const HUBUNGAN_KELUARGA_OPTIONS = [
  "KEPALA KELUARGA",
  "SUAMI",
  "ISTRI",
  "ANAK",
  "MENANTU",
  "CUCU",
  "ORANG TUA",
  "MERTUA",
  "FAMILI LAIN",
  "PEMBANTU",
  "LAINNYA",
];

export const STATUS_PENDUDUK_OPTIONS = [
  "TETAP",
  "TIDAK TETAP"
];

export const JENIS_TEMPAT_LAHIR_OPTIONS = [
  "RS/RB",
  "PUSKESMAS",
  "POLINDES",
  "RUMAH",
  "LAINNYA"
];

export const JENIS_KELAHIRAN_OPTIONS = [
  "TUNGGAL",
  "KEMBAR 2",
  "KEMBAR 3",
  "KEMBAR 4"
];

export const PENOLONG_KELAHIRAN_OPTIONS = [
  "DOKTER",
  "BIDAN PERAWAT",
  "DUKUN",
  "LAINNYA"
];

export const PENDIDIKAN_KK_OPTIONS = [
  "TIDAK / BELUM SEKOLAH",
  "BELUM TAMAT SD/SEDERAJAT",
  "TAMAT SD / SEDERAJAT",
  "SLTP/SEDERAJAT",
  "SLTA / SEDERAJAT",
  "DIPLOMA I / II",
  "AKADEMI/ DIPLOMA III/S. MUDA",
  "DIPLOMA IV/ STRATA I",
  "STRATA II",
  "STRATA III"
];

export const PENDIDIKAN_SAAT_INI_OPTIONS = [
  "BELUM MASUK TK/KELOMPOK BERMAIN",
  "SEDANG TK/KELOMPOK BERMAIN",
  "TIDAK PERNAH SEKOLAH",
  "SEDANG SD/SEDERAJAT",
  "TIDAK TAMAT SD/SEDERAJAT",
  "SEDANG SLTP/SEDERAJAT",
  "TIDAK TAMAT SLTP/SEDERAJAT",
  "SEDANG SLTA/SEDERAJAT",
  "TIDAK TAMAT SLTA/SEDERAJAT",
  "SEDANG D-1/SEDERAJAT",
  "SEDANG D-2/SEDERAJAT",
  "SEDANG D-3/SEDERAJAT",
  "SEDANG S-1/SEDERAJAT",
  "SEDANG S-2/SEDERAJAT",
  "SEDANG S-3/SEDERAJAT",
  "SEDANG SLB A/SEDERAJAT",
  "SEDANG SLB B/SEDERAJAT",
  "SEDANG SLB C/SEDERAJAT",
  "TIDAK DAPAT MEMBACA DAN MENULIS HURUF LATIN/ARAB",
  "TIDAK SEDANG SEKOLAH"
];

export const PEKERJAAN_OPTIONS = [
  "BELUM/TIDAK BEKERJA",
  "MENGURUS RUMAH TANGGA",
  "PELAJAR/MAHASISWA",
  "PENSIUNAN",
  "PEGAWAI NEGERI SIPIL (PNS)",
  "TENTARA NASIONAL INDONESIA (TNI)",
  "KEPOLISIAN RI (POLRI)",
  "PERDAGANGAN",
  "PETANI/PEKEBUN",
  "PETERNAK",
  "NELAYAN/PERIKANAN",
  "INDUSTRI",
  "KONSTRUKSI",
  "TRANSPORTASI",
  "KARYAWAN SWASTA",
  "KARYAWAN BUMN",
  "KARYAWAN BUMD",
  "KARYAWAN HONORER",
  "BURUH HARIAN LEPAS",
  "BURUH TANI/PERKEBUNAN",
  "BURUH NELAYAN/PERIKANAN",
  "BURUH PETERNAKAN",
  "PEMBANTU RUMAH TANGGA",
  "TUKANG CUKUR",
  "TUKANG LISTRIK",
  "TUKANG BATU",
  "TUKANG KAYU",
  "TUKANG SOL SEPATU",
  "TUKANG LAS/PANDAI BESI",
  "TUKANG JAHIT",
  "TUKANG GIGI",
  "PENATA RIAS",
  "PENATA BUSANA",
  "PENATA RAMBUT",
  "MEKANIK",
  "SENIMAN",
  "TABIB",
  "PARAJI",
  "PERANCANG BUSANA",
  "PENTERJEMAH",
  "IMAM MASJID",
  "PENDETA",
  "PASTOR",
  "WARTAWAN",
  "USTADZ/MUBALIGH",
  "JURU MASAK",
  "PROMOTOR ACARA",
  "ANGGOTA DPR-RI",
  "ANGGOTA DPD",
  "ANGGOTA BPK",
  "PRESIDEN",
  "WAKIL PRESIDEN",
  "ANGGOTA MAHKAMAH KONSTITUSI",
  "ANGGOTA KABINET KEMENTERIAN",
  "DUTA BESAR",
  "GUBERNUR",
  "WAKIL GUBERNUR",
  "BUPATI",
  "WAKIL BUPATI",
  "WALIKOTA",
  "WAKIL WALIKOTA",
  "ANGGOTA DPRD PROVINSI",
  "ANGGOTA DPRD KABUPATEN/KOTA",
  "DOSEN",
  "GURU",
  "PILOT",
  "PENGACARA",
  "NOTARIS",
  "ARSITEK",
  "AKUNTAN",
  "KONSULTAN",
  "DOKTER",
  "BIDAN",
  "PERAWAT",
  "APOTEKER",
  "PSIKIATER/PSIKOLOG",
  "PENYIAR TELEVISI",
  "PENYIAR RADIO",
  "PELAUT",
  "PENELITI",
  "SOPIR",
  "PIALANG",
  "PARANORMAL",
  "PEDAGANG",
  "PERANGKAT DESA",
  "KEPALA DESA",
  "BIARAWATI",
  "WIRASWASTA",
  "LAINNYA"
];

export const GOLONGAN_DARAH_OPTIONS = [
  "A",
  "B",
  "AB",
  "O",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "TIDAK TAHU"
];

export const CACAT_OPTIONS = [
  "TIDAK ADA",
  "CACAT FISIK",
  "CACAT NETRA/BUTA",
  "CACAT RUNGU/WICARA",
  "CACAT MENTAL/JIWA",
  "CACAT FISIK DAN MENTAL",
  "LAINNYA"
];

export const SAKIT_MENAHUN_OPTIONS = [
  "TIDAK ADA",
  "JANTUNG",
  "LEVER",
  "PARU-PARU",
  "KANKER",
  "STROKE",
  "DIABETES MELITUS",
  "GINJAL",
  "MALARIA",
  "LEPRA/KUSTA",
  "HIV/AIDS",
  "GILA/STRESS",
  "TBC",
  "ASTHMA",
  "LAINNYA"
];

export const AKSEPTOR_KB_OPTIONS = [
  "TIDAK MENGGUNAKAN",
  "PIL",
  "IUD",
  "SUNTIK",
  "KONDOM",
  "SUSUK KB",
  "STERILISASI WANITA",
  "STERILISASI PRIA",
  "LAINNYA"
];

export const WARGA_NEGARA_OPTIONS = [
  "WNI",
  "WNA"
];

export const STATUS_KAWIN_OPTIONS = [
  "BELUM KAWIN",
  "KAWIN",
  "CERAI HIDUP",
  "CERAI MATI"
];

export const STATUS_HAMIL_OPTIONS = [
  "TIDAK HAMIL",
  "HAMIL"
];

export const KEPEMILIKAN_RUMAH_OPTIONS = [
  "MILIK SENDIRI",
  "SEWA/KONTRAK",
  "MENUMPANG",
  "LAINNYA"
];

export const SUMBER_AIR_OPTIONS = [
  "PDAM",
  "SUMUR GALI",
  "SUMUR BOR",
  "MATA AIR",
  "SUNGAI",
  "LAINNYA"
];

export const ASURANSI_OPTIONS = [
  "TIDAK ADA",
  "BPJS KESEHATAN",
  "BPJS KETENAGAKERJAAN",
  "ASURANSI SWASTA",
  "LAINNYA"
];

export const STATUS_EKONOMI_OPTIONS = [
  "TIDAK ADA",
  "PKH",
  "BPNT",
  "BST",
  "BLT DANA DESA",
  "LAINNYA"
];

const getClient = () => createSupabaseBrowserClient();

export const getResidents = async (options?: { rumahTanggaId?: string | null }): Promise<Resident[]> => {
  const supabase = getClient();
  const rumahTanggaId = options?.rumahTanggaId;
  const pageSize = 200; // Smaller batch size to avoid timeouts/limits
  const allResidents: Resident[] = [];
  
  // Optional: Get Exact Count First for verification
  let countQuery = supabase.from("penduduk").select("*", { count: 'exact', head: true });
  
  if (rumahTanggaId === null) {
    countQuery = countQuery.is("rumah_tangga_id", null);
  } else if (rumahTanggaId) {
    countQuery = countQuery.eq("rumah_tangga_id", rumahTanggaId);
  }

  const { count } = await countQuery;
  const expectedTotal = count || 0;

  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const to = from + pageSize - 1;
    let query = supabase.from("penduduk").select("*").order("nik", { ascending: true });

    if (rumahTanggaId === null) {
      query = query.is("rumah_tangga_id", null);
    } else if (rumahTanggaId) {
      query = query.eq("rumah_tangga_id", rumahTanggaId);
    }

    const { data, error } = await query.range(from, to);

    if (error) {
      console.error(`Error fetching residents page ${from}-${to}:`, error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    allResidents.push(...data);
    
    // Check if we have reached the end based on returned data size
    if (data.length < pageSize) {
      hasMore = false;
    }
    
    // Safety check against expected total if available
    if (expectedTotal > 0 && allResidents.length >= expectedTotal) {
        hasMore = false;
    }

    from += pageSize;
  }

  return allResidents;
};

export const getResidentByNIK = async (nik: string): Promise<Resident | null> => {
  const { data, error } = await getClient()
    .from("penduduk")
    .select("*")
    .eq("nik", nik)
    .single();

  if (error) {
    console.error("Error fetching resident by NIK:", error);
    return null;
  }

  return data;
};

export const getLatestTemporaryNik = async (prefix: string): Promise<string | null> => {
  const { data, error } = await getClient()
    .from("penduduk")
    .select("nik")
    .like("nik", `${prefix}%`)
    .order("nik", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest temporary NIK:", error);
    return null;
  }

  return data?.nik || null;
};

export interface Dusun {
  id: number;
  nama: string;
}

export const getDusunList = async (): Promise<Dusun[]> => {
  const { data, error } = await getClient()
    .from("wilayah_dusun")
    .select("id, nama")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching dusun list:", error);
    return [];
  }
  return data as Dusun[];
};

export interface ReferenceItem {
  id: number;
  nama: string;
}

export const getAgamaList = async (): Promise<string[]> => {
  const { data, error } = await getClient().from('ref_agama').select('nama').order('id');
  if (error || !data) {
    // console.warn("Using static AGAMA options due to DB error or missing table");
    return AGAMA_OPTIONS;
  }
  return data.map((d: any) => d.nama);
};

export const getPendidikanList = async (): Promise<string[]> => {
  const { data, error } = await getClient().from('ref_pendidikan_kk').select('nama').order('id');
  if (error || !data) {
    // console.warn("Using static PENDIDIKAN options due to DB error or missing table");
    return PENDIDIKAN_KK_OPTIONS;
  }
  return data.map((d: any) => d.nama);
};

export const getPekerjaanList = async (): Promise<string[]> => {
  const { data, error } = await getClient()
    .from('ref_pekerjaan')
    .select('nama')
    .lte('id', 89)
    .order('id');
  if (error || !data) {
    // console.warn("Using static PEKERJAAN options due to DB error or missing table");
    return PEKERJAAN_OPTIONS;
  }
  return data.map((d: any) => d.nama);
};

export const uploadResidentDocument = async (file: File, path: string): Promise<string | null> => {
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from('dokumen_penduduk')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Error uploading document:", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('dokumen_penduduk')
    .getPublicUrl(data.path);
    
  return publicUrlData.publicUrl;
};

export const addResident = async (resident: Omit<Resident, "id">) => {
  const { data, error } = await getClient().from("penduduk").insert(resident).select().single();
  if (error) {
    throw error;
  }
  return data;
};

export const updateResident = async (id: string, resident: Partial<Resident>) => {
  const { data, error } = await getClient()
    .from("penduduk")
    .update(resident)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const deleteResident = async (id: string) => {
  const { error } = await getClient().from("penduduk").delete().eq("id", id);
  if (error) {
    throw error;
  }
};
