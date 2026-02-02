import { createSupabaseBrowserClient } from "@/utils/supabase/client";

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


// --- Surat Masuk ---

export async function getPamong() {
  const supabase = createSupabaseBrowserClient();
  // Try to fetch from pamong_desa first (more likely correct in this schema)
  const { data, error } = await supabase
    .from("pamong_desa") 
    .select("*");

  if (error) {
    // Fallback to 'pamong' if 'pamong_desa' fails (legacy support)
    const { data: dataLegacy, error: errorLegacy } = await supabase
      .from("pamong")
      .select("*");
      
    if (errorLegacy) {
      console.error("Error fetching pamong:", errorLegacy);
      throw errorLegacy;
    }
    return dataLegacy as Pamong[];
  }
  return data as Pamong[];
}

export async function createPamong(pamong: Partial<Pamong>) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("pamong_desa")
    .insert([pamong])
    .select()
    .single();

  if (error) {
    console.error("Error creating pamong:", error);
    throw error;
  }
  return data as Pamong;
}

export async function updatePamong(id: number, pamong: Partial<Pamong>) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("pamong_desa")
    .update(pamong)
    .eq("pamong_id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating pamong:", error);
    throw error;
  }
  return data as Pamong;
}

export async function deletePamong(id: number) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("pamong_desa")
    .delete()
    .eq("pamong_id", id);

  if (error) {
    console.error("Error deleting pamong:", error);
    throw error;
  }
  return true;
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

export async function getLogSuratDetail(id: number) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("log_surat")
    .select(`
      *,
      surat_formats (*),
      penduduk:id_pend (*),
      pamong:id_pamong (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching log surat detail:", error);
    throw error;
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

