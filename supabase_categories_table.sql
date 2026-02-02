-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON categories
  FOR SELECT USING (true);

-- Allow write access to authenticated users (assuming admins are authenticated)
CREATE POLICY "Allow authenticated insert" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Berita Desa', 'berita-desa'),
  ('Pengumuman', 'pengumuman'),
  ('Kesehatan', 'kesehatan'),
  ('Pembangunan', 'pembangunan'),
  ('Kegiatan', 'kegiatan')
ON CONFLICT (name) DO NOTHING;
