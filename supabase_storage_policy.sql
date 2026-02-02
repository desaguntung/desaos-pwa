-- Enable RLS on objects if not already enabled (usually is)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for reading files (Public)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING ( bucket_id = 'surat-documents' );

-- Policy for uploading files (Authenticated users only)
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT
  WITH CHECK ( 
    bucket_id = 'surat-documents' 
    AND auth.role() = 'authenticated' 
  );

-- Policy for updating files (Authenticated users only)
CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE
  USING ( 
    bucket_id = 'surat-documents' 
    AND auth.role() = 'authenticated' 
  );

-- Policy for deleting files (Authenticated users only)
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE
  USING ( 
    bucket_id = 'surat-documents' 
    AND auth.role() = 'authenticated' 
  );
