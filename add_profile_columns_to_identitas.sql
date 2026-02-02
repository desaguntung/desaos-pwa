-- Add profile columns to identitas_desa table
ALTER TABLE identitas_desa 
ADD COLUMN IF NOT EXISTS sejarah TEXT,
ADD COLUMN IF NOT EXISTS visi TEXT,
ADD COLUMN IF NOT EXISTS misi TEXT;
