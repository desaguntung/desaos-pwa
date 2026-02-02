
-- Migration for Surat Workflow (Verifikasi Sekdes -> Tanda Tangan Kades)

-- 1. Create table for tracking history/comments
CREATE TABLE IF NOT EXISTS surat_flow_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    surat_id INTEGER NOT NULL REFERENCES log_surat(id) ON DELETE CASCADE,
    user_id UUID, -- auth.uid()
    user_name TEXT,
    role TEXT NOT NULL, -- 'operator', 'sekdes', 'kades', 'warga'
    action TEXT NOT NULL, -- 'submit', 'approve', 'reject', 'sign'
    status_from INTEGER,
    status_to INTEGER,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add RLS policies
ALTER TABLE surat_flow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read access" ON surat_flow_logs FOR SELECT USING (true);
CREATE POLICY "Insert access" ON surat_flow_logs FOR INSERT WITH CHECK (true); -- Ideally restrict to authenticated

-- 3. Add Status Enum comment (Documentation)
-- log_surat.status values:
-- 0: Draft / Konsep (Operator/Warga)
-- 1: Menunggu Verifikasi Sekdes
-- 2: Menunggu Tanda Tangan Kades
-- 3: Sudah Ditandatangani (Selesai)
-- 4: Ditolak Sekdes (Kembali ke Operator)
-- 5: Ditolak Kades (Kembali ke Sekdes)

-- Optional: Create index for performance
CREATE INDEX IF NOT EXISTS idx_surat_flow_logs_surat_id ON surat_flow_logs(surat_id);
