-- Fix RLS policies for identitas_desa table
-- This table stores public village identity but should only be editable by admins

-- Enable RLS
ALTER TABLE identitas_desa ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON identitas_desa;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON identitas_desa;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON identitas_desa;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON identitas_desa;
DROP POLICY IF EXISTS "Public Read Access" ON identitas_desa;
DROP POLICY IF EXISTS "Admin Update Access" ON identitas_desa;

-- 1. Allow everyone (public) to READ the data
CREATE POLICY "Enable read access for all users" 
ON identitas_desa FOR SELECT 
USING (true);

-- 2. Allow authenticated users (admins) to INSERT data
CREATE POLICY "Enable insert for authenticated users" 
ON identitas_desa FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow authenticated users (admins) to UPDATE data
CREATE POLICY "Enable update for authenticated users" 
ON identitas_desa FOR UPDATE 
USING (auth.role() = 'authenticated');
