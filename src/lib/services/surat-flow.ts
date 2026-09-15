import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export enum SuratFlowStatus {
  DRAFT = 0,
  PENDING_SEKDES = 1,
  PENDING_KADES = 2,
  SIGNED = 3,
  REJECTED_SEKDES = 4,
  REJECTED_KADES = 5,
}

export interface SuratFlowLog {
  id: string;
  surat_id: number;
  user_id: string;
  user_name?: string;
  role: string;
  action: string;
  status_from: number;
  status_to: number;
  comment?: string;
  created_at: string;
}

export interface SuratTask extends Record<string, any> {
  id: number;
  tanggal: string;
  no_surat?: string;
  status: number;
  nama_surat?: string; // from format_surat
  pemohon_nama?: string; // from penduduk
  pemohon_nik?: string;
  keterangan?: string;
  surat_formats?: {
    nama: string;
    kode_surat?: string;
    template?: any;
  };
  penduduk?: {
    nama: string;
    nik: string;
  };
}

export interface FormFieldDefinition {
    id: string;
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'land_sketch' | 'land_boundaries';
    required?: boolean;
    options?: string[]; // For select types
    placeholder?: string;
    defaultValue?: any;
}

export function extractFieldsFromTemplate(content: string, typeOrName?: string, formIsianDb?: any): FormFieldDefinition[] {
    const uniqueFields = new Set<string>();
    const fields: FormFieldDefinition[] = [];

    // 1. If form_isian is already defined from database (surat_formats.form_isian), parse and use it directly
    if (formIsianDb) {
      try {
        const parsed = typeof formIsianDb === 'string' ? JSON.parse(formIsianDb) : formIsianDb;
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((item: any) => {
            if (item && (item.key || item.id || item.label)) {
              const fieldKey = (item.key || item.id || item.label).trim();
              if (!uniqueFields.has(fieldKey)) {
                uniqueFields.add(fieldKey);
                fields.push({
                  id: item.id || fieldKey,
                  key: fieldKey,
                  label: item.label || fieldKey.replace(/_/g, ' '),
                  type: item.type || 'text',
                  required: item.required !== false,
                  placeholder: item.placeholder || `Masukkan ${item.label || fieldKey}...`,
                  defaultValue: item.defaultValue,
                  options: item.options
                });
              }
            }
          });
          if (fields.length > 0) return fields;
        }
      } catch (e) {
        // Fallback to template parsing
      }
    }
    
    // List of system variables that are auto-filled from Database
    const systemVariables = [
        // Identitas Desa
        "Nama_Desa", "Kecamatan", "Kabupaten", "Kode_Desa", "Provinsi",
        "Nama_Kepala_Desa", "NIP_Kepala_Desa", "Jabatan_Kepala_Desa",
        "Nama_Sekretaris_Desa", "NIP_Sekretaris_Desa",
        "Alamat_Desa", "Logo_Desa", "Website_Desa", "Email_Desa", "Kode_Pos_Desa", "Kode_Pos",
        "Sebutan_Desa", "Sebutan_Kabupaten", "Sebutan_Kecamatan", 
        "Nama_Kecamatan", "Nama_Kabupaten", "Nama_Provinsi",
        "Penandatangan", "Tgl_Surat", "Tanggal_Surat", "Tempat_Tanggal_Surat",
        
        // Aliases / Common variations
        "Nama_Des", "Nama_Kec", "Nama_Kab", "Nama_Prov", "Alamat_Des", "Alamat_Kantor",
        "Format_Nomor_Surat", "Kode_Surat", "Tahun", "Nomor_Surat", "No_Surat",
        "Nama_Pamong", "NIP_Pamong", "Pangkat_Pamong", "Jabatan_Pamong",
        
        // Data Penduduk (Dotted & Flat)
        "Nama", "Nama_Lengkap", "Nama_Penduduk", "Nama_Pemohon",
        "NIK", "No_KTP", "NIK_Penduduk", "NIK_Pemohon", "No_KK", "Nomor_KK",
        "Tempat_Lahir", "Tanggal_Lahir", "Tempat_Tanggal_Lahir", "Tgl_Lahir", "TTL", "Tempat_Tgl_Lahir",
        "Jenis_Kelamin", "Sex", "JK",
        "Agama",
        "Status_Perkawinan", "Status_Kawin",
        "Pekerjaan", "Pekerjaan_Terakhir", "Pekerjaan_KK",
        "Kewarganegaraan", "Warga_Negara", "Warganegara", "Status_Kewarganegaraan",
        "Pendidikan", "Pendidikan_Terakhir", "Pendidikan_KK",
        "Golongan_Darah", "Gol_Darah",
        "Nama_Ayah", "Nama_Ibu", "Ayah", "Ibu",
        "Alamat", "Alamat_Lengkap", "Alamat_Rumah", "Alamat_Penduduk", "Alamat_Tempat_Tinggal", "Alamat_Saat_Ini",
        "RT", "RW", "Dusun", "Lingkungan",
        "Umur",
    ];

    const isSystemVar = (key: string) => {
        const lowerKey = key.trim().toLowerCase();
        // Check dotted patterns like 'penduduk.nama', 'desa.nama_desa', 'pamong.nip', 'surat.nomor'
        if (lowerKey.startsWith('penduduk.') || lowerKey.startsWith('desa.') || lowerKey.startsWith('pamong.') || lowerKey.startsWith('surat.')) {
          return true;
        }
        return systemVariables.some(
            sysVar => sysVar.toLowerCase() === lowerKey || 
                      sysVar.toLowerCase().replace(/_/g, ' ') === lowerKey.replace(/_/g, ' ') ||
                      sysVar.toLowerCase().replace(/_/g, '') === lowerKey.replace(/_/g, '')
        );
    };

    const addField = (key: string, explicitType?: FormFieldDefinition['type'], label?: string, required = true, placeholder?: string) => {
        const cleanKey = key.trim();
        if (!cleanKey) return;
        
        if (!uniqueFields.has(cleanKey) && !isSystemVar(cleanKey)) {
            uniqueFields.add(cleanKey);
            
            let type: FormFieldDefinition['type'] = explicitType || 'text';
            const lowerKey = cleanKey.toLowerCase();

            if (!explicitType) {
                if (lowerKey.includes('tanggal') || lowerKey.includes('tgl') || lowerKey.includes('waktu')) {
                    type = 'date';
                } else if (lowerKey.includes('umur') || lowerKey.includes('jumlah') || lowerKey.includes('nilai') || lowerKey.includes('harga') || lowerKey.includes('anak ke') || lowerKey.includes('luas')) {
                    type = 'number';
                } else if (lowerKey.includes('uraian') || lowerKey.includes('keterangan') || lowerKey.includes('isi') || lowerKey.includes('pesan') || lowerKey.includes('keperluan') || lowerKey.includes('alasan') || lowerKey.includes('maksud') || lowerKey.includes('rincian')) {
                    type = 'textarea';
                } else if (cleanKey === 'Sketsa_Tanah' || lowerKey.includes('sketsa_tanah') || lowerKey.includes('sketsa tanah')) {
                    type = 'land_sketch';
                } else if (cleanKey === 'Batas_Tanah' || lowerKey.includes('batas_tanah') || lowerKey.includes('batas tanah')) {
                    type = 'land_boundaries';
                }
            }
            
            fields.push({
                id: cleanKey,
                key: cleanKey, 
                label: label || cleanKey.replace(/_/g, ' '),
                type: type,
                required: required,
                placeholder: placeholder || `Masukkan ${label || cleanKey.replace(/_/g, ' ')}...`
            });
        }
    };

    // 2. Parse CraftJS JSON AST if template contains JSON structure
    if (content && typeof content === 'string' && content.trim().startsWith('{')) {
      try {
        const jsonContent = JSON.parse(content);
        if (typeof jsonContent === 'object' && jsonContent !== null) {
            Object.values(jsonContent).forEach((node: any) => {
                const resolved = node?.type?.resolvedName || node?.displayName;
                if (resolved === 'Input') {
                    const label = node.props?.label;
                    if (label) {
                        const inputType = node.props?.inputType === 'number' ? 'number' : node.props?.inputType === 'date' ? 'date' : node.props?.inputType === 'textarea' ? 'textarea' : 'text';
                        addField(label, inputType, label, node.props?.required !== false, node.props?.placeholder);
                    }
                } else if (resolved === 'DataRow') {
                    const variable = node.props?.variable;
                    const label = node.props?.label || variable;
                    const useInput = node.props?.useInput;
                    if (variable && (useInput || !isSystemVar(variable))) {
                        addField(variable, 'text', label, true, node.props?.inputPlaceholder);
                    }
                } else if (resolved === 'LandSketch') {
                    addField('Sketsa_Tanah', 'land_sketch', 'Sketsa Gambar Tanah (Canvas & Titik Koordinat)');
                } else if (resolved === 'LandBoundaries') {
                    addField('Batas_Tanah', 'land_boundaries', 'Batas-Batas Tanah (Utara, Timur, Selatan, Barat)');
                } else if (resolved === 'Text') {
                    const text = node.props?.text;
                    if (typeof text === 'string') {
                        const regex = /\[([a-zA-Z0-9_\-\s\/]+)\]/g;
                        const matches = Array.from(text.matchAll(regex));
                        matches.forEach(match => addField(match[1]));
                    }
                }
            });
            
            if (fields.length > 0) return fields;
        }
      } catch (e) {
        // Not JSON, proceed to regex fallback
      }
    }

    // 3. Fallback: Regex on content string if available
    if (content && typeof content === 'string') {
      const regex = /\[([a-zA-Z0-9_\-\s\/]+)\]/g;
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
          addField(match[1]);
      });
      if (fields.length > 0) return fields;
    }

    // 4. Exhaustive Legal Fallback: Match against all 46 Surat types
    if (typeOrName) {
      const t = typeOrName.toLowerCase().replace(/[\s\-_/]+/g, '_');
      
      if (t.includes('sporadik')) {
        addField('Nomor Persil', 'text', 'Nomor Alas Hak / Persil', false);
        addField('Luas Tanah M2', 'number', 'Luas Bidang Tanah (m²)', true);
        addField('Penggunaan Tanah', 'text', 'Dipergunakan Untuk', true);
        addField('Batas Utara', 'text', 'Batas Sebelah Utara', true);
        addField('Batas Timur', 'text', 'Batas Sebelah Timur', true);
        addField('Batas Selatan', 'text', 'Batas Sebelah Selatan', true);
        addField('Batas Barat', 'text', 'Batas Sebelah Barat', true);
        addField('Sketsa_Tanah', 'land_sketch', 'Sketsa Bidang Tanah');
        addField('Batas_Tanah', 'land_boundaries', 'Preview Batas Tanah');
      } else if (t.includes('domisili_usaha_non_warga')) {
        addField('Nama Usaha', 'text', 'Nama Usaha / Perusahaan', true);
        addField('Jenis Usaha', 'text', 'Jenis / Bidang Usaha', true);
        addField('Alamat Usaha', 'text', 'Alamat Lokasi Usaha', true);
        addField('Status Bangunan', 'text', 'Status Bangunan Usaha', true);
      } else if (t.includes('domisili_usaha')) {
        addField('Nama Usaha', 'text', 'Nama Usaha / Perusahaan', true);
        addField('Jenis Usaha', 'text', 'Jenis / Bidang Usaha', true);
        addField('Alamat Usaha', 'text', 'Alamat Lokasi Usaha', true);
        addField('Jumlah Tenaga Kerja', 'number', 'Jumlah Tenaga Kerja', false);
      } else if (t.includes('ket_usaha') || t.includes('usaha')) {
        addField('Nama Usaha', 'text', 'Nama Usaha', true);
        addField('Jenis Usaha', 'text', 'Jenis / Bidang Usaha', true);
        addField('Alamat Usaha', 'text', 'Alamat Lokasi Usaha', true);
        addField('Tahun Berdiri', 'number', 'Tahun Berdiri Usaha', false);
      } else if (t.includes('domisili')) {
        addField('Sejak Tanggal', 'date', 'Berdomisili Sejak Tanggal', false);
        addField('Keperluan', 'textarea', 'Keperluan Surat Domisili', true);
      } else if (t.includes('penghasilan_ayah')) {
        addField('Nama Ayah', 'text', 'Nama Ayah', true);
        addField('Pekerjaan Ayah', 'text', 'Pekerjaan Ayah', true);
        addField('Penghasilan Ayah', 'text', 'Penghasilan Ayah / Bulan', true);
        addField('Keperluan', 'textarea', 'Keperluan Surat', true);
      } else if (t.includes('penghasilan_ibu')) {
        addField('Nama Ibu', 'text', 'Nama Ibu', true);
        addField('Pekerjaan Ibu', 'text', 'Pekerjaan Ibu', true);
        addField('Penghasilan Ibu', 'text', 'Penghasilan Ibu / Bulan', true);
        addField('Keperluan', 'textarea', 'Keperluan Surat', true);
      } else if (t.includes('penghasilan_orangtua') || t.includes('penghasilan_ortu')) {
        addField('Nama Ayah', 'text', 'Nama Ayah', true);
        addField('Nama Ibu', 'text', 'Nama Ibu', true);
        addField('Total Penghasilan', 'text', 'Total Penghasilan Orang Tua / Bulan', true);
        addField('Jumlah Tanggungan', 'number', 'Jumlah Tanggungan Anak', true);
        addField('Keperluan', 'textarea', 'Keperluan Surat', true);
      } else if (t.includes('penghasilan')) {
        addField('Penghasilan Per Bulan', 'text', 'Penghasilan Rata-rata / Bulan', true);
        addField('Jumlah Tanggungan', 'number', 'Jumlah Tanggungan Keluarga', true);
        addField('Keperluan', 'textarea', 'Keperluan Surat', true);
      } else if (t.includes('beda_identitas_kis') || (t.includes('beda_identitas') && t.includes('kis'))) {
        addField('No Kartu KIS', 'text', 'Nomor Kartu KIS / BPJS', true);
        addField('Nama di KIS', 'text', 'Nama Tertulis di Kartu KIS', true);
        addField('Nama di KTP/KK', 'text', 'Nama Tertulis di KTP / KK', true);
        addField('Perbedaan Data', 'textarea', 'Rincian Perbedaan Identitas', true);
      } else if (t.includes('beda_nama')) {
        addField('Nama di Dokumen 1', 'text', 'Nama Tertulis di Dokumen 1', true);
        addField('Jenis Dokumen 1', 'text', 'Nama / Jenis Dokumen 1', true);
        addField('Nama di Dokumen 2', 'text', 'Nama Tertulis di Dokumen 2', true);
        addField('Jenis Dokumen 2', 'text', 'Nama / Jenis Dokumen 2', true);
        addField('Nama Yang Benar', 'text', 'Nama Yang Benar & Berlaku', true);
      } else if (t.includes('jalan') || t.includes('bepergian') || t.includes('berpergian')) {
        addField('Tempat Tujuan', 'text', 'Kota / Tempat Tujuan', true);
        addField('Maksud Keperluan', 'textarea', 'Maksud / Keperluan Bepergian', true);
        addField('Lama Bepergian', 'text', 'Lama Bepergian (Hari/Bulan)', true);
        addField('Pengikut', 'text', 'Jumlah / Nama Pengikut', false);
      } else if (t.includes('izin_orangtua') || t.includes('izin_orang_tua')) {
        addField('Nama Pemberi Izin', 'text', 'Nama Lengkap Pemberi Izin', true);
        addField('Hubungan Keluarga', 'text', 'Hubungan Keluarga (Orang Tua/Suami/Istri)', true);
        addField('Keperluan Izin', 'textarea', 'Diberikan Izin Untuk Keperluan', true);
      } else if (t.includes('keramaian')) {
        addField('Nama Acara', 'text', 'Nama Kegiatan / Acara / Hajatan', true);
        addField('Hari Tanggal Acara', 'text', 'Hari & Tanggal Pelaksanaan', true);
        addField('Waktu Acara', 'text', 'Waktu / Pukul Pelaksanaan', true);
        addField('Tempat Acara', 'text', 'Lokasi / Tempat Pelaksanaan', true);
        addField('Jenis Hiburan', 'text', 'Jenis Hiburan / Keramaian', false);
      } else if (t.includes('catatan_kriminal') || t.includes('skck')) {
        addField('Keperluan', 'textarea', 'Keperluan Permohonan SKCK', true);
      } else if (t.includes('jamkesos')) {
        addField('Keperluan', 'textarea', 'Keperluan Pengusulan Jamkesos', true);
      } else if (t.includes('jual_beli')) {
        addField('Nama Pembeli', 'text', 'Nama Lengkap Pembeli', true);
        addField('NIK Pembeli', 'text', 'NIK Pembeli', true);
        addField('Obyek Transaksi', 'text', 'Barang / Obyek Jual Beli', true);
        addField('Harga Transaksi', 'text', 'Harga Kesepakatan Transaksi (Rp)', true);
      } else if (t.includes('kehilangan')) {
        addField('Barang Hilang', 'text', 'Nama Barang / Dokumen Hilang', true);
        addField('Rincian Dokumen', 'textarea', 'Rincian / Nomor / Ciri Dokumen Hilang', true);
        addField('Tempat Hilang', 'text', 'Perkiraan Lokasi Kehilangan', true);
        addField('Waktu Hilang', 'text', 'Perkiraan Hari/Tanggal Kehilangan', true);
      } else if (t.includes('kelahiran') && !t.includes('duplikat') && !t.includes('lahir_mati')) {
        addField('Nama Anak', 'text', 'Nama Lengkap Anak', true);
        addField('TTL Anak', 'text', 'Tempat & Tanggal Lahir Anak', true);
        addField('Jenis Kelamin Anak', 'text', 'Jenis Kelamin Anak (Laki-laki/Perempuan)', true);
        addField('Anak Ke', 'number', 'Anak Ke-', true);
        addField('Nama Ayah', 'text', 'Nama Lengkap Ayah', true);
        addField('Nama Ibu', 'text', 'Nama Lengkap Ibu', true);
      } else if (t.includes('kematian')) {
        addField('Hari Tanggal Kematian', 'text', 'Hari & Tanggal Kematian', true);
        addField('Waktu Kematian', 'text', 'Pukul / Waktu Kematian', false);
        addField('Tempat Kematian', 'text', 'Tempat Kematian (Rumah/RS)', true);
        addField('Penyebab Kematian', 'text', 'Penyebab Kematian', true);
        addField('Nama Pelapor', 'text', 'Nama Lengkap Pelapor', true);
      } else if (t.includes('kendaraan')) {
        addField('Jenis Kendaraan', 'text', 'Jenis Kendaraan (Sepeda Motor / Mobil)', true);
        addField('Merk Type', 'text', 'Merk / Type Kendaraan', true);
        addField('Nomor Polisi', 'text', 'Nomor Polisi (Plat Nomor)', true);
        addField('Nomor Rangka', 'text', 'Nomor Rangka (VIN)', true);
        addField('Nomor Mesin', 'text', 'Nomor Mesin', true);
        addField('Warna Kendaraan', 'text', 'Warna Kendaraan', true);
      } else if (t.includes('kepemilikan_tanah') || t.includes('tanah')) {
        addField('Luas Tanah', 'text', 'Luas Bidang Tanah (m²)', true);
        addField('Letak Tanah', 'text', 'Lokasi / Blok Tanah', true);
        addField('Batas Utara', 'text', 'Batas Sebelah Utara', true);
        addField('Batas Timur', 'text', 'Batas Sebelah Timur', true);
        addField('Batas Selatan', 'text', 'Batas Sebelah Selatan', true);
        addField('Batas Barat', 'text', 'Batas Sebelah Barat', true);
      } else if (t.includes('ktp_dalam_proses')) {
        addField('Keperluan', 'textarea', 'Keperluan Surat Keterangan e-KTP', true);
      } else if (t.includes('kurang_mampu') || t.includes('sktm')) {
        addField('Keperluan', 'textarea', 'Keperluan Permohonan SKTM', true);
      } else if (t.includes('janda') || t.includes('duda')) {
        addField('Status (Janda/Duda)', 'text', 'Status (Janda / Duda)', true);
        addField('Nama Pasangan', 'text', 'Nama Mantan Pasangan', true);
        addField('Penyebab (Cerai Mati/Hidup)', 'text', 'Penyebab (Cerai Mati / Cerai Hidup)', true);
      } else if (t.includes('lahir_mati')) {
        addField('Hari Tanggal Lahir Mati', 'text', 'Hari & Tanggal Lahir Mati', true);
        addField('Tempat Lahir Mati', 'text', 'Tempat Kejadian', true);
        addField('Lama Kandungan', 'text', 'Lama Kandungan (Bulan/Minggu)', true);
        addField('Nama Ibu', 'text', 'Nama Lengkap Ibu', true);
      } else if (t.includes('pergi_kawin')) {
        addField('Nama Calon Pasangan', 'text', 'Nama Calon Suami / Istri', true);
        addField('Tujuan Perkawinan', 'text', 'Tempat / Desa / KUA Tujuan Perkawinan', true);
        addField('Tanggal Perkawinan', 'date', 'Rencana Tanggal Perkawinan', true);
      } else if (t.includes('pindah')) {
        addField('Alasan Pindah', 'textarea', 'Alasan Kepindahan', true);
        addField('Alamat Tujuan', 'text', 'Alamat Lengkap Tujuan Pindah', true);
        addField('Desa Tujuan', 'text', 'Desa / Kelurahan Tujuan', true);
        addField('Kecamatan Tujuan', 'text', 'Kecamatan Tujuan', true);
        addField('Kabupaten Tujuan', 'text', 'Kabupaten / Kota Tujuan', true);
        addField('Provinsi Tujuan', 'text', 'Provinsi Tujuan', true);
        addField('Pengikut', 'number', 'Jumlah Anggota Keluarga Yang Ikut Pindah', true);
      } else if (t.includes('rujuk_cerai') || t.includes('rujuk')) {
        addField('Status', 'text', 'Status (Rujuk / Cerai)', true);
        addField('Nama Pasangan', 'text', 'Nama Suami / Istri', true);
        addField('Tanggal Kejadian', 'date', 'Tanggal Kejadian Peristiwa', true);
        addField('No Akta', 'text', 'Nomor Akta / Surat Nikah/Cerai', true);
      } else if (t.includes('wali_hakim')) {
        addField('Nama Calon Suami', 'text', 'Nama Calon Suami', true);
        addField('Sebab Wali Hakim', 'textarea', 'Sebab / Alasan Menjadi Wali Hakim', true);
      } else if (t.includes('kuasa')) {
        addField('Nama Penerima Kuasa', 'text', 'Nama Penerima Kuasa', true);
        addField('NIK Penerima Kuasa', 'text', 'NIK Penerima Kuasa', true);
        addField('Pekerjaan Penerima Kuasa', 'text', 'Pekerjaan Penerima Kuasa', true);
        addField('Alamat Penerima Kuasa', 'text', 'Alamat Penerima Kuasa', true);
        addField('Keperluan Kuasa', 'textarea', 'Keperluan / Wewenang Yang Dikuasakan', true);
      } else if (t.includes('perjalanan_dinas') || t.includes('sppd')) {
        addField('Nama Pejabat', 'text', 'Nama Pejabat Yang Melaksanakan Dinas', true);
        addField('Jabatan Pejabat', 'text', 'Jabatan Pejabat', true);
        addField('Tujuan Dinas', 'text', 'Tempat / Lokasi Tujuan', true);
        addField('Maksud Perjalanan', 'textarea', 'Maksud / Keperluan Perjalanan Dinas', true);
        addField('Lama Perjalanan', 'text', 'Lama Perjalanan Dinas (Hari)', true);
        addField('Tanggal Berangkat', 'date', 'Tanggal Berangkat', true);
        addField('Tanggal Kembali', 'date', 'Tanggal Kembali', true);
        addField('Beban Anggaran', 'text', 'Sumber Dana / Beban Anggaran', false);
      } else if (t.includes('permohonan_akta')) {
        addField('Nama Anak', 'text', 'Nama Lengkap Anak', true);
        addField('TTL Anak', 'text', 'Tempat / Tanggal Lahir Anak', true);
        addField('Anak Ke', 'number', 'Anak Ke-', true);
        addField('Nama Ayah', 'text', 'Nama Lengkap Ayah', true);
        addField('Nama Ibu', 'text', 'Nama Lengkap Ibu', true);
      } else if (t.includes('cerai')) {
        addField('Nama Pasangan', 'text', 'Nama Pasangan (Suami/Istri)', true);
        addField('Alasan Cerai', 'textarea', 'Alasan Permohonan Perceraian', true);
      } else if (t.includes('duplikat_kelahiran')) {
        addField('No Akta Lama', 'text', 'Nomor Akta Kelahiran Lama', false);
        addField('Alasan Duplikat', 'textarea', 'Alasan Permohonan Duplikat Akta Kelahiran', true);
      } else if (t.includes('duplikat_nikah')) {
        addField('No Nikah Lama', 'text', 'Nomor Surat / Buku Nikah Lama', false);
        addField('Alasan Duplikat', 'textarea', 'Alasan Permohonan Duplikat Surat Nikah', true);
      } else if (t.includes('perubahan_kk') || t.includes('perubahan_kartu_keluarga')) {
        addField('No KK Lama', 'text', 'Nomor Kartu Keluarga (KK) Lama', true);
        addField('Alasan Perubahan', 'textarea', 'Alasan Perubahan Data Kartu Keluarga', true);
      } else if (t.includes('permohonan_kk') || t.includes('kartu_keluarga')) {
        addField('Alasan Permohonan', 'textarea', 'Alasan Permohonan Kartu Keluarga Baru', true);
        addField('Jumlah Anggota', 'number', 'Jumlah Anggota Keluarga', true);
      } else if (t.includes('pas_lintas')) {
        addField('Tujuan Perjalanan', 'text', 'Negara / Wilayah Tujuan Pas Lintas', true);
        addField('Maksud Perjalanan', 'textarea', 'Maksud / Keperluan Melintas Batas', true);
        addField('Lama Kunjungan', 'text', 'Lama Kunjungan (Hari)', true);
      } else if (t.includes('pernyataan_akta')) {
        addField('Nama Anak', 'text', 'Nama Anak Yang Dimohonkan', true);
        addField('Isi Pernyataan', 'textarea', 'Isi Pernyataan Akta', true);
      } else if (t.includes('nikah_non_muslim')) {
        addField('Nama Pasangan', 'text', 'Nama Lengkap Calon Pasangan', true);
        addField('Agama Pasangan', 'text', 'Agama / Kepercayaan Calon Pasangan', true);
        addField('Tempat Pernikahan', 'text', 'Tempat Pelaksanaan Pernikahan', true);
        addField('Tanggal Pernikahan', 'date', 'Tanggal Pelaksanaan Pernikahan', true);
      } else if (t.includes('nikah')) {
        addField('Nama Calon Pasangan', 'text', 'Nama Calon Pasangan', true);
        addField('Status Pemohon', 'text', 'Status Perkawinan Pemohon (Jejaka/Perawan/Duda/Janda)', true);
        addField('Nama Wali', 'text', 'Nama Wali Nikah', false);
      } else {
        // Universal fallback for any custom letter
        addField('Keperluan', 'textarea', 'Keperluan Surat', true);
      }
    }
    
    return fields;
}

export async function getSuratTasks(role: 'operator' | 'sekdes' | 'kades') {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("log_surat")
    .select(`
      *,
      surat_formats (nama),
      penduduk:id_pend (nama, nik)
    `)
    .order("tanggal", { ascending: false });

  // Filter based on role
  if (role === 'sekdes') {
    // Sekdes sees: Pending Sekdes (1) OR Returned from Kades (5)
    query = query.in('status', [SuratFlowStatus.PENDING_SEKDES, SuratFlowStatus.REJECTED_KADES]);
  } else if (role === 'kades') {
    // Kades sees: Pending Kades (2)
    query = query.eq('status', SuratFlowStatus.PENDING_KADES);
  } else {
    // Operator sees: Draft (0) OR Rejected Sekdes (4)
    // Or maybe everything? Let's limit to tasks needing attention
    query = query.in('status', [SuratFlowStatus.DRAFT, SuratFlowStatus.REJECTED_SEKDES]);
  }

  const { data, error } = await query;
  if (error) throw error;

  let tasks = data as SuratTask[];

  // Smart Filter for Operator: Hide Rejected tasks if a newer Signed task exists
  // This solves the issue where "Rejected" tasks linger even after the document has been re-submitted and signed.
  if (role === 'operator' && tasks.length > 0) {
      // Get list of relevant resident IDs
      const residentIds = tasks.map((t: any) => t.id_pend).filter(Boolean);
      
      if (residentIds.length > 0) {
          // Fetch signed documents for these residents
          const { data: signedDocs } = await supabase
              .from("log_surat")
              .select("id, id_pend, id_format_surat, status")
              .eq("status", SuratFlowStatus.SIGNED)
              .in("id_pend", residentIds);
              
          if (signedDocs && signedDocs.length > 0) {
              tasks = tasks.filter(task => {
                  // Always keep drafts
                  if (task.status === SuratFlowStatus.DRAFT) return true;
                  
                  // For rejected tasks, check if there's a newer signed doc
                  if (task.status === SuratFlowStatus.REJECTED_SEKDES) {
                      const taskPendId = (task as any).id_pend;
                      const taskFormatId = (task as any).id_format_surat;
                      
                      const hasNewerSigned = signedDocs.some(signed => 
                          signed.id_pend === taskPendId && 
                          signed.id_format_surat === taskFormatId &&
                          signed.id > task.id // Assuming higher ID is newer
                      );
                      
                      // If a newer signed document exists, hide this rejected task
                      return !hasNewerSigned;
                  }
                  
                  return true;
              });
          }
      }
  }

  return tasks;
}

export async function processSuratFlow(
  suratId: number, 
  action: 'submit' | 'approve' | 'reject' | 'sign',
  role: 'operator' | 'sekdes' | 'kades',
  comment?: string
) {
  const supabase = createSupabaseBrowserClient();
  
  // 1. Get current status
  const { data: surat, error: fetchError } = await supabase
    .from("log_surat")
    .select("status")
    .eq("id", suratId)
    .single();
    
  if (fetchError || !surat) throw new Error("Surat not found");

  const currentStatus = surat.status;
  let nextStatus = currentStatus;

  // 2. Determine next status
  if (role === 'operator' && action === 'submit') {
    if (currentStatus === SuratFlowStatus.DRAFT || currentStatus === SuratFlowStatus.REJECTED_SEKDES) {
      nextStatus = SuratFlowStatus.PENDING_SEKDES;
    }
  } else if (role === 'sekdes') {
    if (action === 'approve') nextStatus = SuratFlowStatus.PENDING_KADES;
    if (action === 'reject') nextStatus = SuratFlowStatus.REJECTED_SEKDES;
  } else if (role === 'kades') {
    if (action === 'sign') nextStatus = SuratFlowStatus.SIGNED;
    if (action === 'reject') nextStatus = SuratFlowStatus.REJECTED_KADES; // Returns to Sekdes
  }

  if (nextStatus === currentStatus && action !== 'reject') {
     // If status doesn't change and not rejecting (which might keep status same but adds log), throw?
     // Actually rejecting Kades -> Sekdes changes status 2 -> 5.
     // Rejecting Sekdes -> Operator changes status 1 -> 4.
     // So status usually changes.
  }

  // 3. Update Surat Status
  const { error: updateError } = await supabase
    .from("log_surat")
    .update({ status: nextStatus })
    .eq("id", suratId);

  if (updateError) throw updateError;

  // 4. Insert Log
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from("surat_flow_logs").insert({
    surat_id: suratId,
    user_id: user?.id,
    user_name: user?.user_metadata?.full_name || user?.email,
    role: role,
    action: action,
    status_from: currentStatus,
    status_to: nextStatus,
    comment: comment || ""
  });

  return { success: true, nextStatus };
}

export async function getFlowHistory(suratId: number) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surat_flow_logs")
    .select("*")
    .eq("surat_id", suratId)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data as SuratFlowLog[];
}

export async function getSuratDetail(id: number) {
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

  if (error) throw error;
  return data;
}

export async function updateSuratSignature(id: number, signatureData: any) {
  const supabase = createSupabaseBrowserClient();
  
  // First get existing form_data
  const { data: existing, error: fetchError } = await supabase
    .from("log_surat")
    .select("form_data")
    .eq("id", id)
    .single();
    
  if (fetchError) throw fetchError;
  
  const updatedFormData = {
    ...(existing?.form_data || {}),
    signature: signatureData
  };
  
  const { error } = await supabase
    .from("log_surat")
    .update({ 
        form_data: updatedFormData
    })
    .eq("id", id);

  if (error) throw error;
  return updatedFormData;
}

export async function updateSuratDocument(id: number, documentData: any) {
  const supabase = createSupabaseBrowserClient();
  
  // First get existing form_data
  const { data: existing, error: fetchError } = await supabase
    .from("log_surat")
    .select("form_data")
    .eq("id", id)
    .single();
    
  if (fetchError) throw fetchError;
  
  const updatedFormData = {
    ...(existing?.form_data || {}),
    uploaded_document: documentData
  };
  
  const { error } = await supabase
    .from("log_surat")
    .update({ 
        form_data: updatedFormData,
        signed_file_path: documentData.path
    })
    .eq("id", id);

  if (error) throw error;
  return updatedFormData;
}
