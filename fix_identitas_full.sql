-- FIX COMPLETE FOR IDENTITAS_DESA
-- Run this entire script in Supabase SQL Editor to fix the "new row violates row-level security policy" error
-- and ensure all columns exist.

-- 1. Ensure columns exist (Idempotent)
ALTER TABLE identitas_desa ADD COLUMN IF NOT EXISTS sejarah TEXT;
ALTER TABLE identitas_desa ADD COLUMN IF NOT EXISTS visi TEXT;
ALTER TABLE identitas_desa ADD COLUMN IF NOT EXISTS misi TEXT;
ALTER TABLE identitas_desa ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Reset RLS Policies completely
-- We drop everything to ensure no conflicting old policies remain
ALTER TABLE identitas_desa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON identitas_desa;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON identitas_desa;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON identitas_desa;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON identitas_desa;
DROP POLICY IF EXISTS "Public Read Access" ON identitas_desa;
DROP POLICY IF EXISTS "Admin Update Access" ON identitas_desa;

-- 3. Create Permissive Policies

-- READ: Everyone (public and logged in) can read
CREATE POLICY "Enable read access for all users" 
ON identitas_desa FOR SELECT 
USING (true);

-- INSERT: Any logged-in user can insert (if table is empty)
CREATE POLICY "Enable insert for authenticated users" 
ON identitas_desa FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Any logged-in user can update
CREATE POLICY "Enable update for authenticated users" 
ON identitas_desa FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 4. Verify/Fix Permissions (Grant access to authenticated role)
GRANT ALL ON identitas_desa TO authenticated;
GRANT SELECT ON identitas_desa TO anon;
GRANT USAGE, SELECT ON SEQUENCE identitas_desa_id_seq TO authenticated; -- If using serial id
