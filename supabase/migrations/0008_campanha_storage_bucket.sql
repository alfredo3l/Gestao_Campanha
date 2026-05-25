-- ============================================================================
-- 0008 — Bucket de Storage para anexos das demandas + policies
-- ----------------------------------------------------------------------------
-- Bucket: 'campanha-demandas-anexos' (privado)
--   - Tamanho máximo por arquivo: 10 MB
--   - Limita MIME types comuns (image/*, application/pdf, doc/docx, xls/xlsx, txt)
--
-- Convenção de caminho dentro do bucket:
--   "{demanda_id}/{uuid}-{nome-original.ext}"
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campanha-demandas-anexos',
  'campanha-demandas-anexos',
  false,
  10485760,  -- 10 MB
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Policies de Storage para esse bucket
-- ----------------------------------------------------------------------------
CREATE POLICY "campanha_anexos_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'campanha-demandas-anexos'
    AND campanha.pode_ler()
  );

CREATE POLICY "campanha_anexos_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campanha-demandas-anexos'
    AND campanha.pode_escrever()
  );

CREATE POLICY "campanha_anexos_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campanha-demandas-anexos'
    AND (owner = auth.uid() OR campanha.is_admin())
  )
  WITH CHECK (
    bucket_id = 'campanha-demandas-anexos'
    AND (owner = auth.uid() OR campanha.is_admin())
  );

CREATE POLICY "campanha_anexos_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campanha-demandas-anexos'
    AND (owner = auth.uid() OR campanha.is_admin())
  );
