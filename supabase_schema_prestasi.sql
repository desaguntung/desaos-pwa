-- Create prestasi_desa table
CREATE TABLE IF NOT EXISTS prestasi_desa (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  judul text NOT NULL,
  deskripsi text,
  tanggal date,
  tingkat text, -- e.g. Kecamatan, Kabupaten, Provinsi, Nasional, Internasional
  foto_url text
);

-- Enable RLS
ALTER TABLE prestasi_desa ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view prestasi_desa" ON prestasi_desa
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prestasi_desa" ON prestasi_desa
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update prestasi_desa" ON prestasi_desa
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete prestasi_desa" ON prestasi_desa
  FOR DELETE USING (auth.role() = 'authenticated');
