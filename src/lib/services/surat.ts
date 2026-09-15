import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { mapResidentFromDb, Resident } from "./penduduk";

// Interfaces
export interface KlasifikasiSurat {
  id?: number;
  kode: string;
  nama: string;
  uraian: string;
  enabled: number;
}

export interface FormatSurat {
  id?: number;
  nama: string;
  url_surat: string;
  kode_surat?: string;
  lampiran?: string;
  kunci: number;
  favorit: number;
  jenis: number;
  mandiri?: number;
  masa_berlaku?: number;
  satuan_masa_berlaku?: string;
  syarat_surat?: string;
  template?: string;
  template_desa?: string;
  form_isian?: string;
  kode_isian?: string;
  orientasi?: string;
  ukuran?: string;
  margin?: string;
  footer: number;
  header: number;
  format_nomor?: string;
}

export interface SuratMasuk {
  id?: number;
  nomor_urut?: number;
  tanggal_penerimaan: string;
  nomor_surat: string;
  kode_surat: string; // References KlasifikasiSurat.kode or id? Backup says varchar(10)
  tanggal_surat: string;
  pengirim: string;
  isi_singkat: string;
  isi_disposisi?: string;
  berkas_scan?: string;
  lokasi_arsip?: string;
}

export interface LogSurat {
  id?: number;
  id_format_surat: number;
  id_pend?: string; // UUID
  id_pamong: number;
  id_user: number;
  tanggal: string;
  no_surat?: string;
  nama_surat?: string;
  lampiran?: string;
  nik_non_warga?: number;
  nama_non_warga?: string;
  keterangan?: string;
  status: number; // 0: Konsep, 1: Cetak
  isi_surat?: string;
  url_surat?: string; // Derived or joined
  form_data?: any; // JSONB data for dynamic forms
  signed_file_path?: string; // Path to the uploaded signed file
}

export interface DisposisiSurat {
  id_disposisi?: number;
  id_surat_masuk: number;
  id_desa_pamong?: number;
  disposisi_ke?: string;
}

export interface Pamong {
  pamong_id: number;
  pamong_nama: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  pamong_nip?: string;
  pamong_nik?: string;
  jabatan_id?: number | null;
  pamong_status?: number;
  pamong_ttd?: number;
  foto?: string;
  pamong_nosk?: string;
  pamong_tglsk?: string;
  pamong_niap?: string;
  pamong_pangkat?: string;
  jabatan?: string;
  id_pend?: string;
  urut?: number;
  pamong_nohenti?: string;
  pamong_tglhenti?: string;
  pamong_ub?: number;
  atasan?: number;
  bagan_tingkat?: number;
  penduduk?: {
    nama: string;
    nik: string;
    foto?: string;
  };
}

// Services

export interface IdentitasDesa {
  id?: number;
  nama_desa: string;
  kode_desa: string;
  kode_pos: string;
  nama_kecamatan: string;
  kode_kecamatan: string;
  nama_kabupaten: string;
  kode_kabupaten: string;
  nama_provinsi: string;
  kode_provinsi: string;
  alamat_kantor: string;
  email_desa: string;
  telepon_desa: string;
  website_desa: string;
  logo: string;
  sebutan_desa?: string;
  singkatan_desa?: string;
  sebutan_kabupaten?: string;
  sebutan_kabupaten_singkat?: string;
  sebutan_kecamatan?: string;
  sebutan_kecamatan_singkat?: string;
  sebutan_dusun?: string;
  sejarah?: string;
  visi?: string;
  misi?: string;
  nama_kepala_desa?: string;
  nip_kepala_desa?: string;
}

export interface PengaturanAplikasi {
  key: string;
  value: string;
  keterangan?: string;
}

export async function getIdentitasDesa() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("identitas_desa")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching identitas desa:", error);
    // Don't throw, just return null so UI handles it gracefully
    return null;
  }
  return data as IdentitasDesa;
}

export async function updateIdentitasDesa(data: Partial<IdentitasDesa>) {
    const supabase = createSupabaseBrowserClient();
    // Assuming there's only one row, update all
    // But usually we need an ID. If ID is unknown, we can update where ID is not null or similar logic.
    // For safety, let's fetch first or assume ID 1 if standard.
    // Better: Update based on the single row constraint if possible.
    // But Supabase update requires a WHERE clause.
    
    // We will update the first row found.
    const { data: current } = await supabase.from("identitas_desa").select("id").limit(1).single();
    
    if (!current) return null;

    const { data: updated, error } = await supabase
        .from("identitas_desa")
        .update(data)
        .eq("id", current.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating identitas desa:", error);
        throw error;
    }
    return updated as IdentitasDesa;
}

export async function getPengaturanAplikasi(key: string) {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("pengaturan_aplikasi")
        .select("*")
        .eq("key", key)
        .single();
    
    if (error) return null;
    return data as PengaturanAplikasi;
}

export async function savePengaturanAplikasi(data: Partial<PengaturanAplikasi>) {
    const supabase = createSupabaseBrowserClient();
    const { data: result, error } = await supabase
        .from("pengaturan_aplikasi")
        .upsert(data)
        .select()
        .single();

    if (error) throw error;
    return result as PengaturanAplikasi;
}

function toRoman(num: number): string {
    const roman: { [key: number]: string } = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
        7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
    };
    return roman[num] || '';
}

export async function generateNomorSurat(
    type: 'masuk' | 'keluar' | 'layanan', 
    kode_surat: string, 
    tanggal: Date,
    id_format_surat?: number
) {
    const supabase = createSupabaseBrowserClient();
    const year = tanggal.getFullYear();
    const month = tanggal.getMonth() + 1;
    
    // Get Identitas Desa
    const identitas = await getIdentitasDesa();
    const singkatan = identitas?.singkatan_desa || 'GT';

    // Get Penomoran Option
    const setting = await getPengaturanAplikasi('penomoran_surat_opsi');
    const option = setting?.value || '1';

    // Determine Key
    let key = '';
    if (option === '1') {
        // Option 1: Masuk, Keluar, Layanan (all same)
        if (type === 'masuk') key = `masuk_${year}`;
        else if (type === 'keluar') key = `keluar_${year}`;
        else key = `layanan_${year}`;
    } else if (option === '2') {
        // Option 2: Masuk, Keluar, Layanan (per type)
        if (type === 'masuk') key = `masuk_${year}`;
        else if (type === 'keluar') key = `keluar_${year}`;
        else key = `layanan_${id_format_surat || 'general'}_${year}`;
    } else if (option === '3') {
        // Option 3: Global
        key = `global_${year}`;
    } else if (option === '4') {
        // Option 4: Per Kode
        key = `kode_${kode_surat}_${year}`;
    }

    // Get Last Number from Counter Table
    // We assume table 'surat_last_number' exists (key, last_number)
    const { data } = await supabase
        .from('surat_last_number')
        .select('last_number')
        .eq('key', key)
        .single();
    
    const currentNumber = data?.last_number || 0;
    const nextNumber = currentNumber + 1;

    // Format: 140/001/GT/VII/2021
    const paddedNumber = String(nextNumber).padStart(3, '0');
    const romanMonth = toRoman(month);
    const format = `${kode_surat}/${paddedNumber}/${singkatan}/${romanMonth}/${year}`;

    return {
        nomor_urut: nextNumber,
        format_nomor: format,
        key: key // Return key so we can increment later if needed
    };
}

// Function to increment counter (call this when saving the letter)
export async function incrementNomorSurat(key: string) {
    const supabase = createSupabaseBrowserClient();
    
    // Get current again to be safe? Or just atomic increment if possible.
    // Simple approach: Get, Increment, Upsert.
    const { data } = await supabase
        .from('surat_last_number')
        .select('last_number')
        .eq('key', key)
        .single();
    
    const next = (data?.last_number || 0) + 1;
    
    const { error } = await supabase
        .from('surat_last_number')
        .upsert({ key, last_number: next });
        
    if (error) throw error;
    return next;
}


// --- Aparatur / Pamong Helpers & Services ---

export function mapAparaturToPamong(row: any): Pamong {
  if (!row) return row;
  const idVal = row.id !== undefined ? Number(row.id) : (row.pamong_id !== undefined ? Number(row.pamong_id) : 1);
  return {
    pamong_id: idVal,
    pamong_nama: row.nama || row.pamong_nama || "",
    gelar_depan: row.gelar_depan || undefined,
    gelar_belakang: row.gelar_belakang || undefined,
    pamong_nip: row.nip || row.pamong_nip || "-",
    pamong_nik: row.nik || row.pamong_nik || "",
    pamong_niap: row.niap || row.pamong_niap || undefined,
    pamong_pangkat: row.pangkat || row.pamong_pangkat || undefined,
    jabatan: row.jabatan || (row.jabatan_id === 1 ? "Kepala Desa" : row.jabatan_id === 2 ? "Sekretaris Desa" : "Perangkat Desa"),
    jabatan_id: row.jabatan_id ?? undefined,
    pamong_status: row.status !== undefined
      ? (typeof row.status === "boolean" ? (row.status ? 1 : 0) : Number(row.status))
      : (row.is_active !== undefined ? (row.is_active ? 1 : 0) : 1),
    pamong_ttd: row.ttd_berhak !== undefined
      ? (typeof row.ttd_berhak === "boolean" ? (row.ttd_berhak ? 1 : 0) : Number(row.ttd_berhak))
      : (row.pamong_ttd ?? 0),
    foto: row.avatar_url || row.foto || undefined,
    pamong_nosk: row.no_sk_angkat || row.pamong_nosk || undefined,
    pamong_tglsk: row.tgl_sk_angkat || row.pamong_tglsk || undefined,
    pamong_nohenti: row.no_sk_henti || row.pamong_nohenti || undefined,
    pamong_tglhenti: row.tgl_sk_henti || row.pamong_tglhenti || undefined,
    id_pend: row.penduduk_id ? String(row.penduduk_id) : (row.id_pend ? String(row.id_pend) : undefined),
    urut: row.urutan ?? row.urut ?? undefined,
    atasan: row.atasan_id ?? row.atasan ?? undefined,
    bagan_tingkat: row.level_struktur ?? row.bagan_tingkat ?? undefined,
    penduduk: row.penduduk ?? undefined,
  };
}

export function mapPamongToAparatur(p: Partial<Pamong>): any {
  const payload: any = {};
  if (p.pamong_nama !== undefined) payload.nama = p.pamong_nama;
  if (p.gelar_depan !== undefined) payload.gelar_depan = p.gelar_depan;
  if (p.gelar_belakang !== undefined) payload.gelar_belakang = p.gelar_belakang;
  if (p.pamong_nip !== undefined) payload.nip = p.pamong_nip;
  if (p.pamong_nik !== undefined) payload.nik = p.pamong_nik;
  if (p.pamong_niap !== undefined) payload.niap = p.pamong_niap;
  if (p.pamong_pangkat !== undefined) payload.pangkat = p.pamong_pangkat;
  if (p.jabatan !== undefined) payload.jabatan = p.jabatan;
  if (p.jabatan_id !== undefined) payload.jabatan_id = p.jabatan_id;
  if (p.pamong_status !== undefined) {
    payload.status = p.pamong_status;
    payload.is_active = p.pamong_status === 1;
  }
  if (p.pamong_ttd !== undefined) {
    payload.ttd_berhak = Boolean(p.pamong_ttd);
  }
  if (p.foto !== undefined) payload.avatar_url = p.foto;
  if (p.pamong_nosk !== undefined) payload.no_sk_angkat = p.pamong_nosk;
  if (p.pamong_tglsk !== undefined) payload.tgl_sk_angkat = p.pamong_tglsk;
  if (p.pamong_nohenti !== undefined) payload.no_sk_henti = p.pamong_nohenti;
  if (p.pamong_tglhenti !== undefined) payload.tgl_sk_henti = p.pamong_tglhenti;
  if (p.id_pend !== undefined) payload.penduduk_id = p.id_pend;
  if (p.urut !== undefined) payload.urutan = p.urut;
  if (p.atasan !== undefined) payload.atasan_id = p.atasan;
  if (p.bagan_tingkat !== undefined) payload.level_struktur = p.bagan_tingkat;
  return payload;
}

export async function getPamong(): Promise<Pamong[]> {
  const supabase = createSupabaseBrowserClient();

  // 1. Try 'aparatur_desa' (standard Supabase schema)
  const { data: dataAparatur, error: errorAparatur } = await supabase
    .from("aparatur_desa")
    .select("*")
    .order("urutan", { ascending: true });

  if (!errorAparatur && dataAparatur && dataAparatur.length > 0) {
    return (dataAparatur as any[]).map(mapAparaturToPamong);
  }

  // 2. Try 'pamong_desa'
  const { data: dataPamongDesa, error: errorPamongDesa } = await supabase
    .from("pamong_desa")
    .select("*");

  if (!errorPamongDesa && dataPamongDesa && dataPamongDesa.length > 0) {
    return (dataPamongDesa as any[]).map(mapAparaturToPamong);
  }

  // 3. Try 'pamong' (legacy fallback)
  const { data: dataLegacy, error: errorLegacy } = await supabase
    .from("pamong")
    .select("*");

  if (!errorLegacy && dataLegacy && dataLegacy.length > 0) {
    return (dataLegacy as any[]).map(mapAparaturToPamong);
  }

  if (errorAparatur) {
    console.error("Error fetching aparatur_desa:", errorAparatur);
  }
  return [];
}

export async function getPamongById(id: number | string): Promise<Pamong | null> {
  const supabase = createSupabaseBrowserClient();

  // 1. Try 'aparatur_desa'
  const { data: dataAparatur, error: errorAparatur } = await supabase
    .from("aparatur_desa")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!errorAparatur && dataAparatur) {
    return mapAparaturToPamong(dataAparatur);
  }

  // 2. Try 'pamong_desa'
  const { data: dataPamongDesa, error: errorPamongDesa } = await supabase
    .from("pamong_desa")
    .select("*")
    .eq("pamong_id", id)
    .maybeSingle();

  if (!errorPamongDesa && dataPamongDesa) {
    return mapAparaturToPamong(dataPamongDesa);
  }

  // 3. Try 'pamong'
  const { data: dataLegacy, error: errorLegacy } = await supabase
    .from("pamong")
    .select("*")
    .eq("pamong_id", id)
    .maybeSingle();

  if (!errorLegacy && dataLegacy) {
    return mapAparaturToPamong(dataLegacy);
  }

  return null;
}

export async function createPamong(pamong: Partial<Pamong>): Promise<Pamong> {
  const supabase = createSupabaseBrowserClient();

  // 1. Try insert into 'aparatur_desa'
  const aparaturPayload = mapPamongToAparatur(pamong);
  const { data: dataAparatur, error: errorAparatur } = await supabase
    .from("aparatur_desa")
    .insert([aparaturPayload])
    .select()
    .single();

  if (!errorAparatur && dataAparatur) {
    return mapAparaturToPamong(dataAparatur);
  }

  // 2. Fallback to 'pamong_desa'
  const { data: dataPamongDesa, error: errorPamongDesa } = await supabase
    .from("pamong_desa")
    .insert([pamong])
    .select()
    .single();

  if (!errorPamongDesa && dataPamongDesa) {
    return mapAparaturToPamong(dataPamongDesa);
  }

  // 3. Fallback to 'pamong'
  const { data: dataLegacy, error: errorLegacy } = await supabase
    .from("pamong")
    .insert([pamong])
    .select()
    .single();

  if (!errorLegacy && dataLegacy) {
    return mapAparaturToPamong(dataLegacy);
  }

  throw errorAparatur || errorPamongDesa || errorLegacy;
}

export async function updatePamong(id: number | string, pamong: Partial<Pamong>): Promise<Pamong> {
  const supabase = createSupabaseBrowserClient();

  // 1. Try 'aparatur_desa'
  const aparaturPayload = mapPamongToAparatur(pamong);
  const { data: dataAparatur, error: errorAparatur } = await supabase
    .from("aparatur_desa")
    .update(aparaturPayload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (!errorAparatur && dataAparatur) {
    return mapAparaturToPamong(dataAparatur);
  }

  // 2. Fallback to 'pamong_desa'
  const { data: dataPamongDesa, error: errorPamongDesa } = await supabase
    .from("pamong_desa")
    .update(pamong)
    .eq("pamong_id", id)
    .select()
    .maybeSingle();

  if (!errorPamongDesa && dataPamongDesa) {
    return mapAparaturToPamong(dataPamongDesa);
  }

  // 3. Fallback to 'pamong'
  const { data: dataLegacy, error: errorLegacy } = await supabase
    .from("pamong")
    .update(pamong)
    .eq("pamong_id", id)
    .select()
    .maybeSingle();

  if (!errorLegacy && dataLegacy) {
    return mapAparaturToPamong(dataLegacy);
  }

  throw errorAparatur || errorPamongDesa || errorLegacy;
}

export async function deletePamong(id: number | string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();

  // 1. Try 'aparatur_desa'
  const { error: errorAparatur } = await supabase
    .from("aparatur_desa")
    .delete()
    .eq("id", id);

  if (!errorAparatur) {
    return true;
  }

  // 2. Fallback to 'pamong_desa'
  const { error: errorPamongDesa } = await supabase
    .from("pamong_desa")
    .delete()
    .eq("pamong_id", id);

  if (!errorPamongDesa) {
    return true;
  }

  // 3. Fallback to 'pamong'
  const { error: errorLegacy } = await supabase
    .from("pamong")
    .delete()
    .eq("pamong_id", id);

  if (!errorLegacy) {
    return true;
  }

  throw errorAparatur || errorPamongDesa || errorLegacy;
}

export async function getSuratMasuk() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surat_masuk")
    .select("*")
    .order("tanggal_penerimaan", { ascending: false });

  if (error) {
    console.error("Error fetching surat masuk:", error);
    throw error;
  }
  return data as SuratMasuk[];
}

export async function createSuratMasuk(surat: SuratMasuk) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surat_masuk")
    .insert([surat])
    .select()
    .single();

  if (error) {
    console.error("Error creating surat masuk:", error);
    throw error;
  }
  return data as SuratMasuk;
}

export async function updateSuratMasuk(id: number, surat: Partial<SuratMasuk>) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surat_masuk")
    .update(surat)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating surat masuk:", error);
    throw error;
  }
  return data as SuratMasuk;
}

export async function deleteSuratMasuk(id: number) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("surat_masuk")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting surat masuk:", error);
    throw error;
  }
  return true;
}

// --- Klasifikasi Surat ---

export async function getKlasifikasiSurat() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("klasifikasi_surat")
    .select("*")
    .eq("enabled", 1)
    .order("kode", { ascending: true });

  if (error) {
    console.error("Error fetching klasifikasi surat:", error);
    throw error;
  }
  return data as KlasifikasiSurat[];
}

// --- Format Surat (Template) ---

export async function getFormatSurat() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surat_formats")
    .select("*")
    .order("nama", { ascending: true });

  if (error) {
    console.error("Error fetching format surat:", error);
    throw error;
  }
  return data as FormatSurat[];
}

// --- Log Surat (Surat Keluar / Arsip) ---

export const getLogSurat = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("log_surat")
    .select(`
      *,
      surat_formats (
        nama
      ),
      penduduk (
        nama,
        nik
      )
    `)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error("Error fetching log surat:", error);
    return null;
  }

  return data;
};

export const updateLogSuratStatus = async (id: number, status: number) => {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("log_surat")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

export const uploadSignedSurat = async (id: number, file: File) => {
  const supabase = createSupabaseBrowserClient();
  const fileExt = file.name.split('.').pop();
  // Use timestamp for uniqueness and cleanliness
  const fileName = `${id}-signed-${Date.now()}.${fileExt}`;
  const filePath = `signed_surat/${fileName}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage.from('surat-documents').upload(filePath, file);
  if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
  }
  
  // Update database
  const { error: updateError } = await supabase.from("log_surat").update({ status: 4, signed_file_path: filePath }).eq("id", id);
  if (updateError) {
      console.error("Database update error:", updateError);
      // Try to clean up the uploaded file if DB update fails (optional but good practice)
      await supabase.storage.from('surat-documents').remove([filePath]);
      throw updateError;
  }
  
  return filePath;
};

export interface BuildSuratPreviewParams {
  surat?: {
    id?: number;
    nomor?: string;
    no_surat?: string;
    tanggal?: string | Date;
    tanggal_surat?: string | Date;
    nama_surat?: string;
    kode?: string;
    kode_surat?: string;
    keterangan?: string;
  };
  resident?: Resident | any;
  pamong?: Pamong | any;
  identitasDesa?: IdentitasDesa | null;
  formData?: Record<string, any>;
  signature?: any;
}

export function buildSuratPreviewData({
  surat,
  resident,
  pamong,
  identitasDesa,
  formData = {},
  signature,
}: BuildSuratPreviewParams) {
  // Format Date Helper
  const formatDateIndo = (d: string | Date | undefined) => {
    if (!d) return "";
    try {
      const dt = typeof d === "string" ? new Date(d) : d;
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  // Title Case Helper with Roman numerals and acronyms support
  const ROMAN_OR_ACRONYMS = new Set([
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii',
    'rt', 'rw', 'kk', 'nik', 'ktp', 'skck', 'wni', 'wna', 'pns', 'tni', 'polri',
    'bpd', 'lpm', 'pdam', 'pln', 'bpjs', 'sim', 'hp', 'dki', 'diy'
  ]);

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => {
      const lower = txt.toLowerCase();
      if (ROMAN_OR_ACRONYMS.has(lower)) {
        return lower.toUpperCase();
      }
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  };

  // Helper to clean duplicate prefixes like "Kabupaten Kabupaten", "Kecamatan Kecamatan", "Desa Desa"
  const cleanPrefix = (str: string, prefix: string) => {
    if (!str) return "";
    const trimmed = str.trim();
    const reg = new RegExp(`^${prefix}\\s+`, 'i');
    return trimmed.replace(reg, '').trim();
  };

  // Helper to format and deduplicate Indonesian address
  const formatIndonesianAddress = (params: {
    jalan?: string;
    dusun?: string;
    rt?: any;
    rw?: any;
    desa?: string;
    kecamatan?: string;
    kabupaten?: string;
  }) => {
    const { jalan, dusun, rt, rw, desa, kecamatan, kabupaten } = params;
    let rawJalan = (jalan && jalan !== "-" && jalan !== "0") ? jalan.trim() : "";
    let rawDusun = (dusun && dusun !== "-" && dusun !== "0") ? dusun.trim() : "";

    // Normalize Dusun
    let cleanDusun = "";
    if (rawDusun) {
      const dusunLower = rawDusun.toLowerCase();
      if (dusunLower.startsWith("dusun ") || dusunLower.startsWith("lingkungan ") || dusunLower.startsWith("dukuh ") || dusunLower.startsWith("kampung ")) {
        cleanDusun = toTitleCase(rawDusun);
      } else {
        cleanDusun = `Dusun ${toTitleCase(rawDusun)}`;
      }
    }

    // Normalize Jalan & prevent duplicate with Dusun
    let cleanJalan = "";
    if (rawJalan) {
      const normJalan = rawJalan.toLowerCase().replace(/[\s\-_.,/]+/g, "");
      const normDusun = rawDusun.toLowerCase().replace(/[\s\-_.,/]+/g, "");
      const normDusunNoPrefix = normDusun.replace(/^(dusun|lingkungan|dukuh|kampung)/, "");

      const isSameAsDusun = normJalan === normDusun || 
        normJalan === `dusun${normDusunNoPrefix}` || 
        normJalan === normDusunNoPrefix;

      if (isSameAsDusun) {
        if (!cleanDusun) {
          cleanDusun = rawJalan.toLowerCase().startsWith("dusun ") ? toTitleCase(rawJalan) : `Dusun ${toTitleCase(rawJalan)}`;
        }
        cleanJalan = "";
      } else {
        cleanJalan = toTitleCase(rawJalan);
        if (cleanDusun && cleanJalan.toLowerCase().includes(cleanDusun.toLowerCase())) {
          cleanDusun = "";
        }
      }
    }

    // Format RT / RW
    let rtRw = "";
    const cleanRt = (rt && rt !== "-" && rt !== "0") ? String(rt).replace(/^rt\.?\s*/i, "").trim() : "";
    const cleanRw = (rw && rw !== "-" && rw !== "0") ? String(rw).replace(/^rw\.?\s*/i, "").trim() : "";
    if (cleanRt && cleanRw) {
      rtRw = `RT ${cleanRt} / RW ${cleanRw}`;
    } else if (cleanRt) {
      rtRw = `RT ${cleanRt}`;
    } else if (cleanRw) {
      rtRw = `RW ${cleanRw}`;
    }

    // Prevent duplicate RT/RW if already in jalan
    if (rtRw && cleanJalan) {
      const jLow = cleanJalan.toLowerCase();
      if (jLow.includes("rt ") || jLow.includes("rt.") || jLow.includes("rw ") || jLow.includes("rw.")) {
        rtRw = "";
      }
    }

    const desaVal = desa ? `Desa ${cleanPrefix(desa, "Desa")}` : "";
    const kecVal = kecamatan ? `Kec. ${cleanPrefix(kecamatan, "Kecamatan")}` : "";
    const kabVal = kabupaten ? `Kab. ${cleanPrefix(kabupaten, "Kabupaten")}` : "";

    const rawParts = [
      cleanJalan,
      cleanDusun,
      rtRw,
      desaVal,
      kecVal,
      kabVal,
    ].filter(Boolean);

    // Deduplicate parts case-insensitively
    const uniqueParts: string[] = [];
    for (const part of rawParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const alreadyPresent = uniqueParts.some(p => p.toLowerCase() === trimmed.toLowerCase());
      if (!alreadyPresent) {
        uniqueParts.push(trimmed);
      }
    }

    return uniqueParts.length > 0 ? uniqueParts.join(", ") : (jalan || "-");
  };

  const rawKab = identitasDesa?.nama_kabupaten || "";
  const sebutanKab = identitasDesa?.sebutan_kabupaten || "KABUPATEN";
  const cleanKab = cleanPrefix(rawKab, sebutanKab);

  const rawKec = identitasDesa?.nama_kecamatan || "";
  const sebutanKec = identitasDesa?.sebutan_kecamatan || "KECAMATAN";
  const cleanKec = cleanPrefix(rawKec, sebutanKec);

  const rawDes = identitasDesa?.nama_desa || "";
  const sebutanDes = identitasDesa?.sebutan_desa || "DESA";
  const cleanDes = cleanPrefix(rawDes, sebutanDes);

  // 1. Format Surat Data
  const tglSuratRaw = surat?.tanggal_surat || surat?.tanggal || new Date();
  const tglSuratFormatted = formatDateIndo(tglSuratRaw);
  const nomorSurat = surat?.nomor || surat?.no_surat || "";

  const suratObj = {
    ...surat,
    id: surat?.id,
    nomor: nomorSurat,
    no_surat: nomorSurat,
    format_nomor_surat: nomorSurat,
    tanggal: tglSuratFormatted,
    tanggal_surat: tglSuratFormatted,
    tgl_surat: tglSuratFormatted,
    kode: surat?.kode || surat?.kode_surat || "",
    kode_surat: surat?.kode || surat?.kode_surat || "",
  };

  // 2. Format Desa Data
  const desaObj = {
    ...identitasDesa,
    nama: identitasDesa?.nama_desa ? toTitleCase(cleanDes) : "",
    nama_desa: identitasDesa?.nama_desa ? toTitleCase(cleanDes) : "",
    sebutan_desa: toTitleCase(sebutanDes),
    kecamatan: identitasDesa?.nama_kecamatan ? toTitleCase(cleanKec) : "",
    nama_kecamatan: identitasDesa?.nama_kecamatan ? toTitleCase(cleanKec) : "",
    sebutan_kecamatan: toTitleCase(sebutanKec),
    kabupaten: identitasDesa?.nama_kabupaten ? toTitleCase(cleanKab) : "",
    nama_kabupaten: identitasDesa?.nama_kabupaten ? toTitleCase(cleanKab) : "",
    sebutan_kabupaten: toTitleCase(sebutanKab),
    provinsi: identitasDesa?.nama_provinsi ? toTitleCase(identitasDesa.nama_provinsi) : "",
    nama_provinsi: identitasDesa?.nama_provinsi ? toTitleCase(identitasDesa.nama_provinsi) : "",
    alamat: identitasDesa?.alamat_kantor || "",
    alamat_kantor: identitasDesa?.alamat_kantor || "",
    alamat_desa: identitasDesa?.alamat_kantor || "",
    kode_pos: identitasDesa?.kode_pos || "",
    telepon: identitasDesa?.telepon_desa || "",
    telepon_desa: identitasDesa?.telepon_desa || "",
    email: identitasDesa?.email_desa || "",
    email_desa: identitasDesa?.email_desa || "",
    website: identitasDesa?.website_desa || "",
    website_desa: identitasDesa?.website_desa || "",
    kades: identitasDesa?.nama_kepala_desa || pamong?.pamong_nama || pamong?.nama || "IDRIS",
    nama_kepala_desa: identitasDesa?.nama_kepala_desa || pamong?.pamong_nama || pamong?.nama || "IDRIS",
    kades_nip: identitasDesa?.nip_kepala_desa || pamong?.pamong_nip || pamong?.nip || "-",
    nip_kepala_desa: identitasDesa?.nip_kepala_desa || pamong?.pamong_nip || pamong?.nip || "-",
    logo: identitasDesa?.logo || "",
  };

  // 3. Format Pamong / Penandatangan Data
  const pamongNama = pamong?.pamong_nama || pamong?.nama || desaObj.kades || "IDRIS";
  const pamongNip = pamong?.pamong_nip || pamong?.nip || desaObj.kades_nip || "-";
  const pamongJabatan = pamong?.pamong_jabatan || pamong?.jabatan || "Kepala Desa";
  const pamongPangkat = pamong?.pamong_pangkat || pamong?.pangkat || "-";

  const pamongObj = {
    ...pamong,
    id: pamong?.pamong_id || pamong?.id,
    nama: pamongNama,
    pamong_nama: pamongNama,
    nip: pamongNip,
    pamong_nip: pamongNip,
    pangkat: pamongPangkat,
    pamong_pangkat: pamongPangkat,
    jabatan: pamongJabatan,
    penandatangan: pamongJabatan,
  };

  // 4. Format Resident Data
  let residentObj: Record<string, any> = {};
  if (resident) {
    const rawRes: any = typeof resident === "object" ? mapResidentFromDb(resident) : {};
    const tglLahirFormatted = formatDateIndo(rawRes.tanggal_lahir);
    const tempatLahir = rawRes.tempat_lahir ? toTitleCase(rawRes.tempat_lahir) : "";
    const ttl = tempatLahir && tglLahirFormatted 
      ? `${tempatLahir}, ${tglLahirFormatted}` 
      : (tempatLahir || tglLahirFormatted || "-");

    // Address Assembly using Deduplication Formatter
    const fullAddress = formatIndonesianAddress({
      jalan: rawRes.alamat_saat_ini || rawRes.alamat_rt || rawRes.alamat_sebelumnya,
      dusun: rawRes.dusun,
      rt: rawRes.rt,
      rw: rawRes.rw,
      desa: desaObj.nama,
      kecamatan: desaObj.kecamatan,
      kabupaten: desaObj.kabupaten,
    });

    const genderVal = rawRes.jenis_kelamin || (rawRes.sex === 1 || rawRes.sex === "1" ? "Laki-laki" : rawRes.sex === 2 || rawRes.sex === "2" ? "Perempuan" : rawRes.sex || "-");
    const kewarganegaraan = rawRes.kewarganegaraan || rawRes.warga_negara || "WNI";

    residentObj = {
      ...rawRes,
      nama: rawRes.nama || "",
      nama_lengkap: rawRes.nama || "",
      nama_penduduk: rawRes.nama || "",
      nik: rawRes.nik || "",
      no_kk: rawRes.no_kk || "",
      tempat_lahir: tempatLahir,
      tanggal_lahir: tglLahirFormatted,
      ttl: ttl,
      tempat_tanggal_lahir: ttl,
      sex: genderVal,
      jenis_kelamin: genderVal,
      jk: genderVal,
      agama: rawRes.agama || "-",
      pekerjaan: rawRes.pekerjaan || "-",
      pendidikan: rawRes.pendidikan_kk || rawRes.pendidikan_saat_ini || rawRes.pendidikan || "-",
      status_kawin: rawRes.status_kawin || "-",
      status_perkawinan: rawRes.status_kawin || "-",
      alamat: fullAddress,
      alamat_saat_ini: fullAddress,
      alamat_penduduk: fullAddress,
      alamat_lengkap: fullAddress,
      rt: rawRes.rt || "-",
      rw: rawRes.rw || "-",
      dusun: rawRes.dusun || "-",
      warga_negara: kewarganegaraan,
      kewarganegaraan: kewarganegaraan,
      warganegara: kewarganegaraan,
      ayah: rawRes.nama_ayah || "-",
      nama_ayah: rawRes.nama_ayah || "-",
      ibu: rawRes.nama_ibu || "-",
      nama_ibu: rawRes.nama_ibu || "-",
    };
  }

  // 5. Build Normalized Form Data Aliases
  const normalizedFormData: Record<string, any> = { ...(formData || {}) };
  if (formData && typeof formData === 'object') {
    Object.entries(formData).forEach(([k, v]) => {
      const lower = k.toLowerCase();
      const snake = lower.replace(/[\s\-_/]+/g, '_');
      normalizedFormData[lower] = v;
      normalizedFormData[snake] = v;
      normalizedFormData[k.trim()] = v;
    });
  }

  return {
    surat: suratObj,
    desa: desaObj,
    pamong: pamongObj,
    penduduk: residentObj,
    form_data: normalizedFormData,
    signature: signature,
  };
}

export async function getLogSuratDetail(id: number) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("log_surat")
    .select(`
      *,
      surat_formats (*),
      penduduk:id_pend (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching log surat detail:", error);
    throw error;
  }

  if (data) {
    if (data.penduduk) {
      data.penduduk = mapResidentFromDb(data.penduduk);
    }
    if (data.id_pamong) {
      try {
        const pamong = await getPamongById(data.id_pamong);
        data.pamong = pamong;
      } catch {}
    }
  }

  return data;
}

export async function createLogSurat(log: LogSurat) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("log_surat")
    .insert([log])
    .select()
    .single();

  if (error) {
    console.error("Error creating log surat:", error);
    throw error;
  }
  return data as LogSurat;
}

// --- Permohonan Surat ---

export interface PermohonanSurat {
  id: number;
  id_pemohon: string; // UUID
  id_surat: number;
  isian_form: string;
  status: number; // 0: Pending, 1: Disetujui, 2: Ditolak
  alasan?: string;
  keterangan?: string;
  no_hp_aktif: string;
  syarat: string;
  created_at?: string;
  updated_at?: string;
  no_antrian?: string;
  penduduk?: {
    nama: string;
    nik: string;
  };
  surat_formats?: {
    nama: string;
  };
}

export async function getPermohonanSurat() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("permohonan_surat")
    .select(`
      *,
      penduduk:id_pemohon (
        nama,
        nik
      ),
      surat_formats:id_surat (
        nama
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching permohonan surat:", error);
    throw error;
  }
  return data as PermohonanSurat[];
}

