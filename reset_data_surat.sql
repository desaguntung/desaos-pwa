-- SQL Script untuk Mereset Data Surat dan Nomor Surat (Uji Coba)
-- PERINGATAN: Script ini akan MENGHAPUS SEMUA DATA riwayat surat, log verifikasi, dan mereset nomor surat.
-- Gunakan hanya untuk keperluan testing/development.

BEGIN;

-- 1. Hapus riwayat log alur verifikasi (Action Logs)
TRUNCATE TABLE surat_flow_logs CASCADE;

-- 2. Hapus data surat keluar/layanan (Log Surat)
-- Menggunakan CASCADE untuk memastikan data terkait ikut terhapus jika ada relasi FK lain
TRUNCATE TABLE log_surat CASCADE;

-- 3. Reset Counter Nomor Surat
-- Menghapus semua entry di tabel counter akan membuat nomor surat kembali mulai dari 1
TRUNCATE TABLE surat_last_number;

-- 4. Opsional: Hapus Surat Masuk (Jika ingin benar-benar bersih total)
-- Hapus tanda komentar (--) di bawah jika ingin menghapus surat masuk juga
-- TRUNCATE TABLE surat_masuk CASCADE;

-- 5. Opsional: Hapus Permohonan Surat (Jika ada tabel ini)
-- TRUNCATE TABLE permohonan_surat CASCADE;

COMMIT;

-- Verifikasi hasil reset
SELECT COUNT(*) as sisa_log_flow FROM surat_flow_logs;
SELECT COUNT(*) as sisa_surat FROM log_surat;
SELECT COUNT(*) as sisa_counter FROM surat_last_number;
