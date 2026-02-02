-- Migration to clean up legacy table names (tweb_ prefix) and standardize schema

-- 1. Rename Reference Tables (Penduduk)
ALTER TABLE IF EXISTS tweb_penduduk_agama RENAME TO ref_agama;
ALTER TABLE IF EXISTS tweb_penduduk_asuransi RENAME TO ref_asuransi;
ALTER TABLE IF EXISTS tweb_penduduk_cacat RENAME TO ref_cacat;
ALTER TABLE IF EXISTS tweb_penduduk_golongan_darah RENAME TO ref_golongan_darah;
ALTER TABLE IF EXISTS tweb_penduduk_hubungan RENAME TO ref_hubungan_keluarga;
ALTER TABLE IF EXISTS tweb_penduduk_kawin RENAME TO ref_status_kawin;
ALTER TABLE IF EXISTS tweb_penduduk_kb RENAME TO ref_cara_kb;
ALTER TABLE IF EXISTS tweb_penduduk_pekerjaan RENAME TO ref_pekerjaan;
ALTER TABLE IF EXISTS tweb_penduduk_pendidikan RENAME TO ref_pendidikan;
ALTER TABLE IF EXISTS tweb_penduduk_pendidikan_kk RENAME TO ref_pendidikan_kk;
ALTER TABLE IF EXISTS tweb_penduduk_sakit_menahun RENAME TO ref_sakit_menahun;
ALTER TABLE IF EXISTS tweb_penduduk_sex RENAME TO ref_jenis_kelamin;
ALTER TABLE IF EXISTS tweb_penduduk_status RENAME TO ref_status_penduduk;
ALTER TABLE IF EXISTS tweb_penduduk_warganegara RENAME TO ref_warganegara;

-- 2. Rename Surat Format Table
ALTER TABLE IF EXISTS tweb_surat_format RENAME TO surat_formats;

-- 3. Rename Pamong/Officials Table
ALTER TABLE IF EXISTS tweb_desa_pamong RENAME TO pamong_desa;

-- 4. Add Foreign Key for Articles (Optional but recommended for future)
-- We keep 'category' text column for now to not break the app, but we should eventually migrate.

-- 5. Fix potentially missing RLS policies if needed (Supabase usually preserves them)
