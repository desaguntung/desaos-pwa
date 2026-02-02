-- Add form_data column to log_surat to store dynamic form values (JSON)
ALTER TABLE log_surat ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN log_surat.form_data IS 'Stores dynamic form values (key-value pairs) for variable replacement in surat template';
