"use client";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { formatDusunName, normalizeDusunKey } from "./wilayah";

export { formatDusunName, normalizeDusunKey };

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
  hubungan_keluarga_id?: number | null;
  jenis_kelamin: string;
  jenis_kelamin_id?: number | null;
  agama?: string;
  agama_id?: number | null;
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
  id_rtm?: string | null;
  rtm_level_id?: number | null;
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
  no_asuransi?: string;
  bpjs_ketenagakerjaan?: string;
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


export const GENDER_MAP: Record<number, string> = {
  1: "LAKI-LAKI",
  2: "PEREMPUAN",
};

export const AGAMA_MAP: Record<number, string> = {
  1: "ISLAM",
  2: "KRISTEN",
  3: "KATHOLIK",
  4: "HINDU",
  5: "BUDHA",
  6: "KONGHUCU",
  7: "KEPERCAYAAN TERHADAP TUHAN YME / LAINNYA",
};

export const STATUS_KAWIN_MAP: Record<number, string> = {
  1: "BELUM KAWIN",
  2: "KAWIN",
  3: "CERAI HIDUP",
  4: "CERAI MATI",
};

export const STATUS_PENDUDUK_MAP: Record<number, string> = {
  1: "TETAP",
  2: "MENINGGAL",
  3: "PINDAH",
  4: "HILANG",
  5: "HILANG",
  6: "TIDAK TETAP",
};

export const HUBUNGAN_KELUARGA_MAP: Record<number, string> = {
  1: "KEPALA KELUARGA",
  2: "SUAMI",
  3: "ISTRI",
  4: "ANAK",
  5: "MENANTU",
  6: "CUCU",
  7: "ORANG TUA",
  8: "MERTUA",
  9: "FAMILI LAIN",
  10: "PEMBANTU",
  11: "LAINNYA",
};

export const GOLONGAN_DARAH_MAP: Record<number, string> = {
  1: "A",
  2: "B",
  3: "AB",
  4: "O",
  5: "A+",
  6: "A-",
  7: "B+",
  8: "B-",
  9: "AB+",
  10: "AB-",
  11: "O+",
  12: "O-",
  13: "TIDAK TAHU",
};

export const DUSUN_MAP: Record<number, string> = {
  1: "Dusun I",
  2: "Dusun II",
  3: "Dusun III",
  4: "Dusun IV",
  5: "Dusun V",
  6: "Dusun VI",
  7: "Dusun VII",
  8: "Dusun VIII",
};

export const PENDIDIKAN_KK_MAP: Record<number, string> = {
  1: "TIDAK / BELUM SEKOLAH",
  2: "BELUM TAMAT SD/SEDERAJAT",
  3: "TAMAT SD / SEDERAJAT",
  4: "SLTP/SEDERAJAT",
  5: "SLTA / SEDERAJAT",
  6: "DIPLOMA I / II",
  7: "AKADEMI/ DIPLOMA III/S. MUDA",
  8: "DIPLOMA IV/ STRATA I",
  9: "STRATA II",
  10: "STRATA III",
};

export const PENDIDIKAN_SEDANG_MAP: Record<number, string> = {
  1: "Belum Masuk TK / Kelompok Bermain",
  2: "Sedang TK / Kelompok Bermain",
  3: "Tidak Pernah Sekolah",
  4: "Sedang SD / Sederajat",
  5: "Tidak Tamat SD / Sederajat",
  6: "Sedang SLTP / Sederajat",
  7: "Sedang SLTA / Sederajat",
  8: "Sedang D-1 / Sederajat",
  9: "Sedang D-2 / Sederajat",
  10: "Sedang D-3 / Sederajat",
  11: "Sedang S-1 / Sederajat",
  12: "Sedang S-2 / Sederajat",
  13: "Sedang S-3 / Sederajat",
  14: "Tamat SD / Sederajat",
  15: "Tamat SLTP / Sederajat",
  16: "Tamat SLTA / Sederajat",
  17: "Tamat D-1 / Sederajat",
  18: "Tamat D-2 / Sederajat",
  19: "Tamat D-3 / Sederajat",
  20: "Tamat S-1 / Sederajat",
  21: "Tamat S-2 / Sederajat",
  22: "Tamat S-3 / Sederajat",
  23: "Tamat SLB A / Sederajat",
  24: "Tamat SLB B / Sederajat",
  25: "Tamat SLB C / Sederajat",
  26: "Tidak Dapat Membaca dan Menulis Huruf Latin / Arab",
  27: "Tidak Sedang Sekolah",
};

export const WARGANEGARA_MAP: Record<number, string> = {
  1: "WNI",
  2: "WNA",
  3: "DUA KEWARGANEGARAAN",
};

export const CACAT_MAP: Record<number, string> = {
  1: "CACAT FISIK",
  2: "CACAT NETRA / BUTA",
  3: "CACAT RUNGU / WICARA",
  4: "CACAT MENTAL / JIWA",
  5: "CACAT FISIK DAN MENTAL",
  6: "CACAT LAINNYA",
  7: "TIDAK CACAT",
};

export const SAKIT_MENAHUN_MAP: Record<number, string> = {
  1: "JANTUNG",
  2: "LEVER",
  3: "PARU - PARU",
  4: "KANKER",
  5: "STROKE",
  6: "DIABETES MILITUS",
  7: "GINJAL",
  8: "MALARIA",
  9: "LEPRA / KUSTA",
  10: "HIV / AIDS",
  11: "GILA / STRESS",
  12: "TBC",
  13: "ASTHMA",
  14: "TIDAK ADA / TIDAK SAKIT",
};

export const ASURANSI_MAP: Record<number, string> = {
  1: "TIDAK/BELUM PUNYA",
  2: "BPJS PBI",
  3: "BPJS NON PBI",
  4: "ASURANSI LAINNYA",
};

export const CARA_KB_MAP: Record<number, string> = {
  1: "PIL",
  2: "IUD",
  3: "SUNTIK",
  4: "KONDOM",
  5: "SUSUK KB",
  6: "STERILISASI WANITA",
  7: "STERILISASI PRIA",
  8: "LAINNYA",
  9: "TIDAK MENGGUNAKAN",
};

export const WAJIB_IDENTITAS_MAP: Record<number, string> = {
  1: "WAJIB",
  2: "TIDAK WAJIB",
};

export const IDENTITAS_ELEKTRONIK_MAP: Record<number, string> = {
  1: "BELUM",
  2: "KTP-EL",
  3: "KIA",
};

export const STATUS_REKAM_MAP: Record<number, string> = {
  1: "BELUM REKAM",
  2: "SUDAH REKAM",
  3: "CARD PRINTED",
  4: "PRINT READY TO RECORD",
  5: "CARD SHIPPED",
  6: "SENT FOR CARD PRINTING",
  7: "CARD ISSUED",
  8: "BELUM WAJIB",
};

export const TEMPAT_DILAHIRKAN_MAP: Record<number, string> = {
  1: "RS/RB",
  2: "PUSKESMAS",
  3: "POLINDES",
  4: "RUMAH",
  5: "LAINNYA",
};

export const JENIS_KELAHIRAN_MAP: Record<number, string> = {
  1: "TUNGGAL",
  2: "KEMBAR 2",
  3: "KEMBAR 3",
  4: "KEMBAR 4",
};

export const PENOLONG_KELAHIRAN_MAP: Record<number, string> = {
  1: "DOKTER",
  2: "BIDAN PERAWAT",
  3: "DUKUN",
  4: "LAINNYA",
};

export const PEKERJAAN_MAP: Record<number, string> = {
  1: "BELUM / TIDAK BEKERJA",
  2: "MENGURUS RUMAH TANGGA",
  3: "PELAJAR / MAHASISWA",
  4: "PENSIUNAN",
  5: "PEGAWAI NEGERI SIPIL (PNS)",
  6: "TENTARA NASIONAL INDONESIA (TNI)",
  7: "KEPOLISIAN RI (POLRI)",
  8: "PERDAGANGAN",
  9: "PETANI / PEKEBUN",
  10: "PETERNAK",
  11: "NELAYAN / PERIKANAN",
  12: "INDUSTRI",
  13: "KONSTRUKSI",
  14: "TRANSPORTASI",
  15: "KARYAWAN SWASTA",
  16: "KARYAWAN BUMN",
  17: "KARYAWAN BUMD",
  18: "KARYAWAN HONORER",
  19: "BURUH HARIAN LEPAS",
  20: "BURUH TANI / PERKEBUNAN",
  21: "BURUH NELAYAN / PERIKANAN",
  22: "BURUH PETERNAKAN",
  23: "PEMBANTU RUMAH TANGGA",
  24: "TUKANG CUKUR",
  25: "TUKANG LISTRIK",
  26: "TUKANG BATU",
  27: "TUKANG KAYU",
  28: "TUKANG SOL SEPATU",
  29: "TUKANG LAS / PANDAI BESI",
  30: "TUKANG JAHIT",
  31: "TUKANG GIGI",
  32: "PENATA RIAS",
  33: "PENATA BUSANA",
  34: "PENATA RAMBUT",
  35: "MEKANIK",
  36: "SENIMAN",
  37: "TABIB",
  38: "PARAJI",
  39: "PERANCANG BUSANA",
  40: "PENTERJEMAH",
  41: "IMAM MASJID",
  42: "PENDETA",
  43: "PASTOR",
  44: "WARTAWAN",
  45: "USTADZ / MUBALIGH",
  46: "JURU MASAK",
  47: "PROMOTOR ACARA",
  48: "ANGGOTA DPR-RI",
  49: "ANGGOTA DPD",
  50: "ANGGOTA BPK",
  51: "PRESIDEN",
  52: "WAKIL PRESIDEN",
  53: "ANGGOTA MAHKAMAH KONSTITUSI",
  54: "ANGGOTA KABINET KEMENTERIAN",
  55: "DUTA BESAR",
  56: "GUBERNUR",
  57: "WAKIL GUBERNUR",
  58: "BUPATI",
  59: "WAKIL BUPATI",
  60: "WALIKOTA",
  61: "WAKIL WALIKOTA",
  62: "ANGGOTA DPRD PROVINSI",
  63: "ANGGOTA DPRD KABUPATEN/KOTA",
  64: "DOSEN",
  65: "GURU",
  66: "PILOT",
  67: "PENGACARA",
  68: "NOTARIS",
  69: "ARSITEK",
  70: "AKUNTAN",
  71: "KONSULTAN",
  72: "DOKTER",
  73: "BIDAN",
  74: "PERAWAT",
  75: "APOTEKER",
  76: "PSIKIATER / PSIKOLOG",
  77: "PENYIAR TELEVISI",
  78: "PENYIAR RADIO",
  79: "PELAUT",
  80: "PENELITI",
  81: "SOPIR",
  82: "PIALANG",
  83: "PARANORMAL",
  84: "PEDAGANG",
  85: "PERANGKAT DESA",
  86: "KEPALA DESA",
  87: "BIARAWATI",
  88: "WIRASWASTA",
  89: "LAINNYA"
};

export function reverseLookup(map: Record<number, string>, val?: string | number | null): number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number") return val;
  const target = String(val).trim().toUpperCase();
  const entry = Object.entries(map).find(([_, v]) => v.trim().toUpperCase() === target);
  if (entry) return Number(entry[0]);
  const partialEntry = Object.entries(map).find(([_, v]) => 
    v.trim().toUpperCase().includes(target) || target.includes(v.trim().toUpperCase())
  );
  return partialEntry ? Number(partialEntry[0]) : undefined;
}

const formatDateToDb = (val?: string | Date | null): string | null => {
  if (!val) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    return trimmed.split("T")[0];
  }
  try {
    return new Date(val).toISOString().split("T")[0];
  } catch {
    return null;
  }
};

const ALLOWED_PENDUDUK_DB_COLUMNS = new Set([
  'nik',
  'nama',
  'no_kk',
  'tempat_lahir',
  'tanggal_lahir',
  'waktu_lahir',
  'tempat_dilahirkan_id',
  'jenis_kelahiran_id',
  'anak_ke',
  'berat_lahir',
  'panjang_lahir',
  'nik_ayah',
  'nama_ayah',
  'nik_ibu',
  'nama_ibu',
  'alamat_rt',
  'alamat_sebelumnya',
  'alamat_saat_ini',
  'wilayah_dusun_id',
  'wilayah_rw_id',
  'wilayah_rt_id',
  'identitas_desa_id',
  'telepon',
  'email',
  'foto_url',
  'gelar_depan',
  'gelar_belakang',
  'akta_kelahiran_nomor',
  'keahlian_khusus',
  'status_ekonomi_dtks',
  'penghasilan_rata_rata',
  'kepemilikan_rumah',
  'sumber_air_minum',
  'akun_facebook',
  'akun_instagram',
  'akun_twitter',
  'id_sosial_lainnya',
  'scan_ktp_url',
  'scan_kk_url',
  'scan_akta_lahir_url',
  'scan_akta_nikah_url',
  'scan_ijazah_url',
  'scan_paspor_url',
  'tanggal_perkawinan',
  'no_paspor',
  'no_kitap',
  'rumah_tangga_id',
  'id_kk',
  'no_kk_sebelumnya',
  'id_rtm',
  'rtm_level_id',
  'id_cluster',
  'status_tinggal_id',
  'status_dasar',
  'jenis_kelamin_id',
  'penolong_kelahiran_id',
  'agama_id',
  'pendidikan_kk_id',
  'pendidikan_sedang_id',
  'pekerjaan_id',
  'warganegara_id',
  'golongan_darah_id',
  'cacat_id',
  'sakit_menahun_id',
  'cara_kb_id',
  'bahasa_id',
  'status_kawin_id',
  'hubungan_keluarga_id',
  'status_penduduk_id',
  'identitas_elektronik_id',
  'status_rekam_id',
  'wajib_identitas_id',
  'akte_kelahiran_id',
  'tanggal_akhir_paspor',
  'akta_perkawinan',
  'akta_perceraian',
  'tanggalperceraian',
  'tag_id_card',
  'tempat_cetak_ktp',
  'tanggal_cetak_ktp',
  'hubung_warga',
  'email_token',
  'email_tgl_kadaluarsa',
  'email_tgl_verifikasi',
  'telegram',
  'telegram_token',
  'telegram_tgl_kadaluarsa',
  'telegram_tgl_verifikasi',
  'hamil',
  'id_asuransi',
  'no_asuransi',
  'bpjs_ketenagakerjaan',
  'suku_id',
  'negara_asal',
  'ket',
  'created_by',
  'updated_by'
]);

export function mapResidentFromDb(row: any): Resident {
  if (!row) return row;

  const dusunId = row.wilayah_dusun_id ? Number(row.wilayah_dusun_id) : undefined;
  const rawDusun = row.dusun || (dusunId ? DUSUN_MAP[dusunId] || `Dusun ${dusunId}` : undefined);
  const dusunName = rawDusun ? formatDusunName(rawDusun) : undefined;

  let rwVal = row.wilayah_rw_id ? String(row.wilayah_rw_id).padStart(3, '0') : (row.rw ? String(row.rw).padStart(3, '0') : undefined);
  let rtVal = row.wilayah_rt_id ? String(row.wilayah_rt_id).padStart(3, '0') : (row.rt ? String(row.rt).padStart(3, '0') : undefined);

  if (row.alamat_rt) {
    if (!rtVal) {
      const rtMatch = row.alamat_rt.match(/RT\s*[:\.]?\s*(\d+)/i);
      if (rtMatch) rtVal = rtMatch[1].padStart(3, '0');
    }
    if (!rwVal) {
      const rwMatch = row.alamat_rt.match(/RW\s*[:\.]?\s*(\d+)/i);
      if (rwMatch) rwVal = rwMatch[1].padStart(3, '0');
    }
  }

  let alamat = row.alamat_saat_ini || row.alamat_sebelumnya;
  if (!alamat && dusunName && dusunName !== "Tanpa Dusun") {
    const parts = [dusunName];
    if (rtVal) parts.push(`RT ${rtVal}`);
    if (rwVal) parts.push(`RW ${rwVal}`);
    alamat = parts.join(", ");
  }

  return {
    ...row,
    id: row.id,
    nik: row.nik || "",
    nama: row.nama || "",
    no_kk: row.no_kk || "",
    jenis_kelamin: row.jenis_kelamin || (row.jenis_kelamin_id ? GENDER_MAP[Number(row.jenis_kelamin_id)] || "" : (row.sex ? GENDER_MAP[Number(row.sex)] || "" : "")),
    jenis_kelamin_id: row.jenis_kelamin_id || row.sex || null,
    agama: row.agama || (row.agama_id ? AGAMA_MAP[Number(row.agama_id)] || "" : ""),
    agama_id: row.agama_id || null,
    status_kawin: row.status_kawin || (row.status_kawin_id ? STATUS_KAWIN_MAP[Number(row.status_kawin_id)] || "" : ""),
    status_penduduk: row.status_penduduk || (row.status_penduduk_id ? STATUS_PENDUDUK_MAP[Number(row.status_penduduk_id)] || "Tetap" : (row.status_dasar === 1 ? "Tetap" : "Tetap")),
    hubungan_keluarga: row.hubungan_keluarga || (row.hubungan_keluarga_id ? HUBUNGAN_KELUARGA_MAP[Number(row.hubungan_keluarga_id)] || "" : ""),
    hubungan_keluarga_id: row.hubungan_keluarga_id || null,
    golongan_darah: row.golongan_darah || (row.golongan_darah_id ? GOLONGAN_DARAH_MAP[Number(row.golongan_darah_id)] || "" : ""),
    dusun: dusunName,
    rw: rwVal,
    rt: rtVal,
    alamat_saat_ini: alamat || "-",
    alamat_rt: row.alamat_rt || (rtVal && rwVal ? `RT ${rtVal} / RW ${rwVal}` : undefined),
    pekerjaan: row.pekerjaan || (row.pekerjaan_id ? PEKERJAAN_MAP[Number(row.pekerjaan_id)] || "" : ""),
    pendidikan_kk: row.pendidikan_kk || (row.pendidikan_kk_id ? PENDIDIKAN_KK_MAP[Number(row.pendidikan_kk_id)] || "" : ""),
    pendidikan_saat_ini: row.pendidikan_saat_ini || (row.pendidikan_sedang_id ? PENDIDIKAN_SEDANG_MAP[Number(row.pendidikan_sedang_id)] || "" : ""),
    kewarganegaraan: row.kewarganegaraan || (row.warganegara_id ? WARGANEGARA_MAP[Number(row.warganegara_id)] || "WNI" : "WNI"),
    cacat_fisik_mental: row.cacat_fisik_mental || (row.cacat_id ? CACAT_MAP[Number(row.cacat_id)] || "" : ""),
    sakit_menahun: row.sakit_menahun || (row.sakit_menahun_id ? SAKIT_MENAHUN_MAP[Number(row.sakit_menahun_id)] || "" : ""),
    kepesertaan_asuransi: row.kepesertaan_asuransi || (row.id_asuransi ? ASURANSI_MAP[Number(row.id_asuransi)] || "" : ""),
    cara_kb_id: row.cara_kb_id || null,
    akseptor_kb: row.cara_kb_id ? CARA_KB_MAP[Number(row.cara_kb_id)] || "" : "",
    status_kepemilikan_identitas: row.wajib_identitas_id ? WAJIB_IDENTITAS_MAP[Number(row.wajib_identitas_id)] || "WAJIB" : "WAJIB",
    identitas_elektronik: row.identitas_elektronik_id ? IDENTITAS_ELEKTRONIK_MAP[Number(row.identitas_elektronik_id)] || "BELUM" : "BELUM",
    status_rekam: row.status_rekam_id ? STATUS_REKAM_MAP[Number(row.status_rekam_id)] || "" : "",
    jenis_tempat_lahir: row.tempat_dilahirkan_id ? TEMPAT_DILAHIRKAN_MAP[Number(row.tempat_dilahirkan_id)] || "" : "",
    jenis_kelahiran: row.jenis_kelahiran_id ? JENIS_KELAHIRAN_MAP[Number(row.jenis_kelahiran_id)] || "TUNGGAL" : "TUNGGAL",
    cara_lahir: row.penolong_kelahiran_id ? PENOLONG_KELAHIRAN_MAP[Number(row.penolong_kelahiran_id)] || "" : "",
    status_kehamilan: row.hamil === 2 ? "HAMIL" : "TIDAK HAMIL",
    tanggal_lahir: formatDateToDb(row.tanggal_lahir) || undefined,
    tanggal_perkawinan: formatDateToDb(row.tanggal_perkawinan) || undefined,
    tanggal_perceraian: formatDateToDb(row.tanggalperceraian || row.tanggal_perceraian) || undefined,
    tgl_berakhir_paspor: formatDateToDb(row.tanggal_akhir_paspor || row.tgl_berakhir_paspor) || undefined,
  };
}

export function mapResidentToDb(resident: Partial<Resident>): any {
  const raw: any = { ...resident };
  const dbData: Record<string, any> = {};

  // Clean NIK & KK numbers
  if (raw.nik && typeof raw.nik === "string") {
    dbData.nik = raw.nik.replace(/\D/g, "");
  }
  if (raw.no_kk && typeof raw.no_kk === "string") {
    dbData.no_kk = raw.no_kk.replace(/\D/g, "");
  }
  if (raw.nama) dbData.nama = raw.nama;

  // Gender
  if (raw.jenis_kelamin_id) {
    dbData.jenis_kelamin_id = Number(raw.jenis_kelamin_id);
  } else if (raw.jenis_kelamin) {
    const s = raw.jenis_kelamin.toUpperCase();
    dbData.jenis_kelamin_id = s.startsWith("L") ? 1 : 2;
  }

  // Agama
  if (raw.agama_id) {
    dbData.agama_id = Number(raw.agama_id);
  } else if (raw.agama) {
    const aId = reverseLookup(AGAMA_MAP, raw.agama);
    if (aId !== undefined) dbData.agama_id = aId;
  }

  // Status Kawin
  if (raw.status_kawin) {
    const skId = reverseLookup(STATUS_KAWIN_MAP, raw.status_kawin);
    if (skId !== undefined) dbData.status_kawin_id = skId;
  }

  // Status Penduduk
  if (raw.status_penduduk) {
    const spId = reverseLookup(STATUS_PENDUDUK_MAP, raw.status_penduduk);
    if (spId !== undefined) {
      dbData.status_penduduk_id = spId;
      dbData.status_dasar = spId === 1 ? 1 : spId;
    }
  }

  // Hubungan Keluarga
  if (raw.hubungan_keluarga_id) {
    dbData.hubungan_keluarga_id = Number(raw.hubungan_keluarga_id);
  } else if (raw.hubungan_keluarga) {
    const hkId = reverseLookup(HUBUNGAN_KELUARGA_MAP, raw.hubungan_keluarga);
    if (hkId !== undefined) dbData.hubungan_keluarga_id = hkId;
  }

  // Golongan Darah
  if (raw.golongan_darah) {
    const gdId = reverseLookup(GOLONGAN_DARAH_MAP, raw.golongan_darah);
    if (gdId !== undefined) dbData.golongan_darah_id = gdId;
  }

  // Pendidikan KK
  if (raw.pendidikan_kk) {
    const pkkId = reverseLookup(PENDIDIKAN_KK_MAP, raw.pendidikan_kk);
    if (pkkId !== undefined) dbData.pendidikan_kk_id = pkkId;
  }

  // Pendidikan Sedang Ditempuh
  if (raw.pendidikan_saat_ini) {
    const psId = reverseLookup(PENDIDIKAN_SEDANG_MAP, raw.pendidikan_saat_ini);
    if (psId !== undefined) dbData.pendidikan_sedang_id = psId;
  }

  // Pekerjaan
  if (raw.pekerjaan) {
    const pekId = reverseLookup(PEKERJAAN_MAP, raw.pekerjaan);
    if (pekId !== undefined) dbData.pekerjaan_id = pekId;
  }

  // Warganegara
  if (raw.kewarganegaraan) {
    const wnId = reverseLookup(WARGANEGARA_MAP, raw.kewarganegaraan);
    if (wnId !== undefined) dbData.warganegara_id = wnId;
  }

  // Cacat
  if (raw.cacat_fisik_mental) {
    const cId = reverseLookup(CACAT_MAP, raw.cacat_fisik_mental);
    if (cId !== undefined) dbData.cacat_id = cId;
  }

  // Sakit Menahun
  if (raw.sakit_menahun) {
    const smId = reverseLookup(SAKIT_MENAHUN_MAP, raw.sakit_menahun);
    if (smId !== undefined) dbData.sakit_menahun_id = smId;
  }

  // Asuransi
  if (raw.kepesertaan_asuransi) {
    const asId = reverseLookup(ASURANSI_MAP, raw.kepesertaan_asuransi);
    if (asId !== undefined) dbData.id_asuransi = asId;
  }

  // Cara KB
  if (raw.cara_kb_id !== undefined && raw.cara_kb_id !== null) {
    dbData.cara_kb_id = Number(raw.cara_kb_id) || null;
  } else if (raw.akseptor_kb) {
    const kbId = reverseLookup(CARA_KB_MAP, raw.akseptor_kb);
    if (kbId !== undefined) dbData.cara_kb_id = kbId;
  }

  // Wajib Identitas
  if (raw.status_kepemilikan_identitas) {
    const wiId = reverseLookup(WAJIB_IDENTITAS_MAP, raw.status_kepemilikan_identitas);
    if (wiId !== undefined) dbData.wajib_identitas_id = wiId;
  }

  // Identitas Elektronik
  if (raw.identitas_elektronik) {
    const ieId = reverseLookup(IDENTITAS_ELEKTRONIK_MAP, raw.identitas_elektronik);
    if (ieId !== undefined) dbData.identitas_elektronik_id = ieId;
  }

  // Status Rekam
  if (raw.status_rekam) {
    const srId = reverseLookup(STATUS_REKAM_MAP, raw.status_rekam);
    if (srId !== undefined) dbData.status_rekam_id = srId;
  }

  // Tempat Dilahirkan
  if (raw.jenis_tempat_lahir) {
    const tlId = reverseLookup(TEMPAT_DILAHIRKAN_MAP, raw.jenis_tempat_lahir);
    if (tlId !== undefined) dbData.tempat_dilahirkan_id = tlId;
  }

  // Jenis Kelahiran
  if (raw.jenis_kelahiran) {
    const jkId = reverseLookup(JENIS_KELAHIRAN_MAP, raw.jenis_kelahiran);
    if (jkId !== undefined) dbData.jenis_kelahiran_id = jkId;
  }

  // Penolong Kelahiran
  if (raw.cara_lahir) {
    const pkId = reverseLookup(PENOLONG_KELAHIRAN_MAP, raw.cara_lahir);
    if (pkId !== undefined) dbData.penolong_kelahiran_id = pkId;
  }

  // Kehamilan
  if (raw.status_kehamilan) {
    dbData.hamil = raw.status_kehamilan.toUpperCase().includes("TIDAK") ? 1 : 2;
  }

  // Dusun & Wilayah Dusun ID
  if (raw.dusun) {
    const norm = normalizeDusunKey(raw.dusun);
    const foundEntry = Object.entries(DUSUN_MAP).find(([_, v]) => normalizeDusunKey(v) === norm);
    if (foundEntry) {
      dbData.wilayah_dusun_id = Number(foundEntry[0]);
    } else {
      const numOnly = raw.dusun.replace(/\D/g, "");
      if (numOnly) dbData.wilayah_dusun_id = Number(numOnly);
    }
  }

  // RW and RT: Format into alamat_rt to avoid FK constraint violations on empty wilayah_rw/wilayah_rt tables
  if (raw.rw || raw.rt) {
    const rtStr = raw.rt ? String(raw.rt).padStart(3, '0') : '';
    const rwStr = raw.rw ? String(raw.rw).padStart(3, '0') : '';
    if (!raw.alamat_rt || !raw.alamat_rt.trim()) {
      if (rtStr && rwStr) {
        dbData.alamat_rt = `RT ${rtStr} / RW ${rwStr}`;
      } else if (rtStr) {
        dbData.alamat_rt = `RT ${rtStr}`;
      } else if (rwStr) {
        dbData.alamat_rt = `RW ${rwStr}`;
      }
    }
  }

  // Text and Standard Fields
  const directFields: (keyof Resident)[] = [
    "tempat_lahir",
    "waktu_lahir",
    "anak_ke",
    "berat_lahir",
    "panjang_lahir",
    "nik_ayah",
    "nama_ayah",
    "nik_ibu",
    "nama_ibu",
    "alamat_rt",
    "alamat_sebelumnya",
    "alamat_saat_ini",
    "telepon",
    "email",
    "gelar_depan",
    "gelar_belakang",
    "akta_kelahiran_nomor",
    "keahlian_khusus",
    "status_ekonomi_dtks",
    "penghasilan_rata_rata",
    "kepemilikan_rumah",
    "sumber_air_minum",
    "akun_facebook",
    "akun_instagram",
    "akun_twitter",
    "id_sosial_lainnya",
    "no_paspor",
    "no_kitap",
    "no_kk_sebelumnya",
    "tag_id_card",
    "akta_perkawinan",
    "akta_perceraian",
    "no_asuransi",
    "bpjs_ketenagakerjaan",
    "foto_url",
    "scan_ktp_url",
    "scan_kk_url",
    "scan_akta_lahir_url",
    "scan_akta_nikah_url",
    "scan_ijazah_url",
    "scan_paspor_url",
  ];

  directFields.forEach((field) => {
    if (raw[field] !== undefined) {
      (dbData as any)[field] = raw[field] === "" ? null : raw[field];
    }
  });

  // Date Fields (Formatted to YYYY-MM-DD or null)
  if (raw.tanggal_lahir !== undefined) dbData.tanggal_lahir = formatDateToDb(raw.tanggal_lahir);
  if (raw.tanggal_perkawinan !== undefined) dbData.tanggal_perkawinan = formatDateToDb(raw.tanggal_perkawinan);
  if (raw.tanggal_perceraian !== undefined) dbData.tanggalperceraian = formatDateToDb(raw.tanggal_perceraian);
  if (raw.tgl_berakhir_paspor !== undefined) dbData.tanggal_akhir_paspor = formatDateToDb(raw.tgl_berakhir_paspor);

  // Filter strictly against allowed Supabase DB table columns
  const finalPayload: Record<string, any> = {};
  for (const [k, v] of Object.entries(dbData)) {
    if (ALLOWED_PENDUDUK_DB_COLUMNS.has(k)) {
      finalPayload[k] = v;
    }
  }

  return finalPayload;
}

const getClient = () => createSupabaseBrowserClient();

export interface GetResidentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusFilter?: string;
  dusunFilter?: string;
  genderFilter?: string;
  agamaFilter?: string;
  kawinFilter?: string;
  sortDirection?: "asc" | "desc";
  sortBy?: string;
  rumahTanggaId?: string | null;
}

export interface PaginatedResidentsResult {
  data: Resident[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getPaginatedResidents = async (
  params: GetResidentsParams = {}
): Promise<PaginatedResidentsResult> => {
  const supabase = getClient();
  const {
    page = 1,
    pageSize = 10,
    search = "",
    statusFilter = "Semua",
    dusunFilter = "Semua",
    genderFilter = "Semua",
    agamaFilter = "Semua",
    kawinFilter = "Semua",
    sortDirection = "asc",
    sortBy = "nama",
    rumahTanggaId,
  } = params;

  let query = supabase.from("penduduk").select("*", { count: "exact" });

  if (rumahTanggaId === null) {
    query = query.is("rumah_tangga_id", null);
  } else if (rumahTanggaId) {
    query = query.eq("rumah_tangga_id", rumahTanggaId);
  }

  // Gender filter
  if (genderFilter && genderFilter !== "Semua") {
    const isMale = genderFilter.toUpperCase().startsWith("L");
    query = query.or(`jenis_kelamin_id.eq.${isMale ? 1 : 2},sex.eq.${isMale ? 1 : 2},jenis_kelamin.ilike.${isMale ? "LAKI-LAKI" : "PEREMPUAN"}`);
  }

  // Dusun filter
  if (dusunFilter && dusunFilter !== "Semua" && dusunFilter !== "all") {
    const norm = normalizeDusunKey(dusunFilter);
    const entry = Object.entries(DUSUN_MAP).find(([_, v]) => normalizeDusunKey(v) === norm);
    if (entry) {
      query = query.or(`wilayah_dusun_id.eq.${entry[0]},dusun.ilike.%${formatDusunName(dusunFilter)}%,dusun.ilike.%${norm}%`);
    } else {
      query = query.ilike("dusun", `%${dusunFilter}%`);
    }
  }

  // Status filter
  if (statusFilter && statusFilter !== "Semua") {
    const sUpper = statusFilter.toUpperCase();
    if (sUpper === "AKTIF" || sUpper === "TETAP") {
      query = query.or("status_dasar.eq.1,status_penduduk_id.eq.1,status_penduduk.ilike.%Aktif%,status_penduduk.ilike.%Tetap%");
    } else if (sUpper === "MENINGGAL" || sUpper === "MATI") {
      query = query.or("status_dasar.eq.2,status_penduduk_id.eq.2,status_penduduk.ilike.%Meninggal%,status_penduduk.ilike.%Mati%");
    } else if (sUpper === "PINDAH") {
      query = query.or("status_dasar.eq.3,status_penduduk_id.eq.3,status_penduduk.ilike.%Pindah%");
    } else if (sUpper === "HILANG") {
      query = query.or("status_dasar.eq.4,status_penduduk_id.eq.4,status_penduduk.ilike.%Hilang%");
    }
  }

  // Agama filter
  if (agamaFilter && agamaFilter !== "Semua") {
    const entry = Object.entries(AGAMA_MAP).find(([_, v]) => v.toUpperCase() === agamaFilter.toUpperCase());
    if (entry) {
      query = query.or(`agama_id.eq.${entry[0]},agama.ilike.${agamaFilter}`);
    } else {
      query = query.ilike("agama", `%${agamaFilter}%`);
    }
  }

  // Kawin filter
  if (kawinFilter && kawinFilter !== "Semua") {
    const entry = Object.entries(STATUS_KAWIN_MAP).find(([_, v]) => v.toUpperCase() === kawinFilter.toUpperCase());
    if (entry) {
      query = query.or(`status_kawin_id.eq.${entry[0]},status_kawin.ilike.${kawinFilter}`);
    } else {
      query = query.ilike("status_kawin", `%${kawinFilter}%`);
    }
  }

  // Search by NIK or Nama or No KK
  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(`nik.ilike.%${s}%,nama.ilike.%${s}%,no_kk.ilike.%${s}%`);
  }

  // Sorting
  query = query.order(sortBy === "nama" ? "nama" : "nik", { ascending: sortDirection === "asc" });

  // Pagination Range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error("Error fetching paginated residents:", error);
    throw error;
  }

  const mappedData = (data || []).map(mapResidentFromDb);
  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: mappedData,
    total,
    page,
    pageSize,
    totalPages,
  };
};

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

    allResidents.push(...(data.map(mapResidentFromDb)));
    
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

  return mapResidentFromDb(data);
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
  const payload = mapResidentToDb(resident);
  const { data, error } = await getClient().from("penduduk").insert(payload).select().single();
  if (error) {
    throw error;
  }
  return mapResidentFromDb(data);
};

export const updateResident = async (id: string, resident: Partial<Resident>) => {
  const payload = mapResidentToDb(resident);
  const { data, error } = await getClient()
    .from("penduduk")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return mapResidentFromDb(data);
};

export const deleteResident = async (id: string) => {
  const { error } = await getClient().from("penduduk").delete().eq("id", id);
  if (error) {
    throw error;
  }
};
