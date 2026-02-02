-- Add Geografis columns to identitas_desa
ALTER TABLE identitas_desa
ADD COLUMN IF NOT EXISTS luas_wilayah text,
ADD COLUMN IF NOT EXISTS batas_utara text,
ADD COLUMN IF NOT EXISTS batas_selatan text,
ADD COLUMN IF NOT EXISTS batas_timur text,
ADD COLUMN IF NOT EXISTS batas_barat text,
ADD COLUMN IF NOT EXISTS ketinggian text,
ADD COLUMN IF NOT EXISTS peta_wilayah text; -- Can be iframe embed code or image URL

-- Force refresh schema cache if needed (usually automatic in Supabase client)
