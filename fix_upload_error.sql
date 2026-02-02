-- Perintah SQL untuk memperbaiki error upload
-- Jalankan perintah ini di Supabase Dashboard -> SQL Editor

-- 1. Tambahkan kolom signed_file_path yang hilang ke tabel log_surat
ALTER TABLE log_surat ADD COLUMN IF NOT EXISTS signed_file_path TEXT;

-- 2. Pastikan kolom status bisa menerima nilai 0-4 (hapus constraint jika ada)
-- Jika perintah ini gagal, abaikan saja (artinya tidak ada constraint)
ALTER TABLE log_surat DROP CONSTRAINT IF EXISTS log_surat_status_check;

-- 3. (Opsional) Verifikasi struktur tabel setelah perubahan
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'log_surat';
