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

export function mapResidentFromDb(row: any): Resident {
  if (!row) return row;

  const dusunId = row.wilayah_dusun_id ? Number(row.wilayah_dusun_id) : undefined;
  const rawDusun = row.dusun || (dusunId ? DUSUN_MAP[dusunId] || `Dusun ${dusunId}` : undefined);
  const dusunName = rawDusun ? formatDusunName(rawDusun) : undefined;

  let alamat = row.alamat_saat_ini || row.alamat_rt || row.alamat_sebelumnya;
  if (!alamat && dusunName && dusunName !== "Tanpa Dusun") {
    const parts = [dusunName];
    if (row.rt || row.wilayah_rt_id) parts.push(`RT ${row.rt || row.wilayah_rt_id}`);
    if (row.rw || row.wilayah_rw_id) parts.push(`RW ${row.rw || row.wilayah_rw_id}`);
    alamat = parts.join(", ");
  }

  return {
    ...row,
    id: row.id,
    nik: row.nik || "",
    nama: row.nama || "",
    no_kk: row.no_kk || "",
    jenis_kelamin: row.jenis_kelamin || (row.jenis_kelamin_id ? GENDER_MAP[Number(row.jenis_kelamin_id)] || "" : ""),
    agama: row.agama || (row.agama_id ? AGAMA_MAP[Number(row.agama_id)] || "" : ""),
    status_kawin: row.status_kawin || (row.status_kawin_id ? STATUS_KAWIN_MAP[Number(row.status_kawin_id)] || "" : ""),
    status_penduduk: row.status_penduduk || (row.status_penduduk_id ? STATUS_PENDUDUK_MAP[Number(row.status_penduduk_id)] || "Aktif" : (row.status_dasar === 1 ? "Aktif" : "Aktif")),
    hubungan_keluarga: row.hubungan_keluarga || (row.hubungan_keluarga_id ? HUBUNGAN_KELUARGA_MAP[Number(row.hubungan_keluarga_id)] || "" : ""),
    golongan_darah: row.golongan_darah || (row.golongan_darah_id ? GOLONGAN_DARAH_MAP[Number(row.golongan_darah_id)] || "" : ""),
    dusun: dusunName,
    alamat_saat_ini: alamat || "-",
    pekerjaan: row.pekerjaan || (row.pekerjaan_id ? PEKERJAAN_MAP[Number(row.pekerjaan_id)] || "" : ""),
    pendidikan_kk: row.pendidikan_kk || (row.pendidikan_kk_id ? PENDIDIKAN_KK_MAP[Number(row.pendidikan_kk_id)] || "" : ""),
    tanggal_lahir: row.tanggal_lahir ? (typeof row.tanggal_lahir === 'string' ? row.tanggal_lahir.split('T')[0] : new Date(row.tanggal_lahir).toISOString().split('T')[0]) : undefined,
  };
}

export function reverseLookup(map: Record<number, string>, val?: string | null): number | undefined {
  if (!val) return undefined;
  const target = val.trim().toUpperCase();
  const entry = Object.entries(map).find(([_, v]) => v.trim().toUpperCase() === target);
  if (entry) return Number(entry[0]);
  const partialEntry = Object.entries(map).find(([_, v]) => 
    v.trim().toUpperCase().includes(target) || target.includes(v.trim().toUpperCase())
  );
  return partialEntry ? Number(partialEntry[0]) : undefined;
}

export function mapResidentToDb(resident: Partial<Resident>): any {
  const payload: any = { ...resident };
  
  // Clean NIK & KK numbers (remove spaces or formatting)
  if (payload.nik && typeof payload.nik === "string") {
    payload.nik = payload.nik.replace(/\D/g, "");
  }
  if (payload.no_kk && typeof payload.no_kk === "string") {
    payload.no_kk = payload.no_kk.replace(/\D/g, "");
  }

  // Reverse map Gender
  if (resident.jenis_kelamin) {
    const s = resident.jenis_kelamin.toUpperCase();
    const gId = s.startsWith("L") ? 1 : 2;
    payload.jenis_kelamin_id = gId;
    payload.sex = gId;
  }
  delete payload.jenis_kelamin;
  
  // Reverse map Agama
  if (resident.agama) {
    const aId = reverseLookup(AGAMA_MAP, resident.agama);
    if (aId !== undefined) payload.agama_id = aId;
  }
  delete payload.agama;

  // Reverse map Status Kawin
  if (resident.status_kawin) {
    const skId = reverseLookup(STATUS_KAWIN_MAP, resident.status_kawin);
    if (skId !== undefined) payload.status_kawin_id = skId;
  }
  delete payload.status_kawin;

  // Reverse map Status Penduduk
  if (resident.status_penduduk) {
    const spId = reverseLookup(STATUS_PENDUDUK_MAP, resident.status_penduduk);
    if (spId !== undefined) {
      payload.status_penduduk_id = spId;
      payload.status_dasar = spId === 1 ? 1 : spId;
    }
  }
  delete payload.status_penduduk;

  // Reverse map Hubungan Keluarga
  if (resident.hubungan_keluarga) {
    const hkId = reverseLookup(HUBUNGAN_KELUARGA_MAP, resident.hubungan_keluarga);
    if (hkId !== undefined) payload.hubungan_keluarga_id = hkId;
  }
  delete payload.hubungan_keluarga;

  // Reverse map Golongan Darah
  if (resident.golongan_darah) {
    const gdId = reverseLookup(GOLONGAN_DARAH_MAP, resident.golongan_darah);
    if (gdId !== undefined) payload.golongan_darah_id = gdId;
  }
  delete payload.golongan_darah;

  // Reverse map Pendidikan KK
  if (resident.pendidikan_kk) {
    const pkkId = reverseLookup(PENDIDIKAN_KK_MAP, resident.pendidikan_kk);
    if (pkkId !== undefined) payload.pendidikan_kk_id = pkkId;
  }
  delete payload.pendidikan_kk;

  // Reverse map Pekerjaan
  if (resident.pekerjaan) {
    const pekId = reverseLookup(PEKERJAAN_MAP, resident.pekerjaan);
    if (pekId !== undefined) payload.pekerjaan_id = pekId;
  }
  delete payload.pekerjaan;

  // Dusun & Wilayah Dusun ID
  if (resident.dusun) {
    const norm = normalizeDusunKey(resident.dusun);
    const foundEntry = Object.entries(DUSUN_MAP).find(([_, v]) => normalizeDusunKey(v) === norm);
    if (foundEntry) {
      payload.wilayah_dusun_id = Number(foundEntry[0]);
    }
    payload.dusun = formatDusunName(resident.dusun);
  }

  // Remove primary key id and metadata from payload if present
  delete payload.id;
  delete payload.created_at;
  
  return payload;
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
