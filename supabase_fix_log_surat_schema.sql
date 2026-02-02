-- Memperbaiki kolom no_surat yang terlalu pendek (varchar(20)) menjadi TEXT
ALTER TABLE log_surat ALTER COLUMN no_surat TYPE text;

-- Memastikan kolom form_data ada untuk menyimpan isian dinamis
ALTER TABLE log_surat ADD COLUMN IF NOT EXISTS form_data JSONB;
