-- ============================================================================
-- 0010 — Fotos / Avatares de apoiadores, lideranças e usuários (profiles)
-- ----------------------------------------------------------------------------
-- 1. Adiciona coluna `foto_path` (caminho dentro do bucket de Storage) em:
--      campanha.apoiadores
--      campanha.liderancas
--      campanha.profiles
--
-- 2. Cria o bucket público `campanha-fotos` (2 MB, imagens comuns) e suas
--    policies de Storage. Bucket público = qualquer cliente com a URL pode
--    LER (necessário para <img> sem signed URLs); WRITE/UPDATE/DELETE só com
--    permissão `campanha.pode_escrever()` ou dono/admin.
--
-- 3. Recria a view `v_progresso_lideranca` expondo `foto_path` para que as
--    listagens já mostrem o avatar sem nova join.
--
-- Convenção de caminho dentro do bucket:
--   apoiadores/{apoiador_id}/{timestamp}-{nome-arquivo.ext}
--   liderancas/{lideranca_id}/{timestamp}-{nome-arquivo.ext}
--   profiles/{user_id}/{timestamp}-{nome-arquivo.ext}
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Colunas foto_path
-- ----------------------------------------------------------------------------
ALTER TABLE campanha.apoiadores
  ADD COLUMN IF NOT EXISTS foto_path text;

ALTER TABLE campanha.liderancas
  ADD COLUMN IF NOT EXISTS foto_path text;

ALTER TABLE campanha.profiles
  ADD COLUMN IF NOT EXISTS foto_path text;

COMMENT ON COLUMN campanha.apoiadores.foto_path IS
  'Caminho do arquivo dentro do bucket "campanha-fotos". NULL = sem foto (usar placeholder de iniciais).';
COMMENT ON COLUMN campanha.liderancas.foto_path IS
  'Caminho do arquivo dentro do bucket "campanha-fotos". NULL = sem foto (usar placeholder de iniciais).';
COMMENT ON COLUMN campanha.profiles.foto_path IS
  'Caminho do arquivo dentro do bucket "campanha-fotos". NULL = sem foto (usar placeholder de iniciais).';

-- ----------------------------------------------------------------------------
-- 2. Bucket campanha-fotos (público p/ leitura, 2 MB, imagens comuns)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campanha-fotos',
  'campanha-fotos',
  true,
  2097152,  -- 2 MB
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- Policies de Storage para esse bucket
-- ----------------------------------------------------------------------------
-- SELECT — bucket é público, mas mantemos policy explícita para consistência.
DROP POLICY IF EXISTS "campanha_fotos_select" ON storage.objects;
CREATE POLICY "campanha_fotos_select"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'campanha-fotos');

-- INSERT — qualquer usuário autenticado que pode escrever no módulo.
DROP POLICY IF EXISTS "campanha_fotos_insert" ON storage.objects;
CREATE POLICY "campanha_fotos_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campanha-fotos'
    AND campanha.pode_escrever()
  );

-- UPDATE — dono do objeto ou admin do módulo.
DROP POLICY IF EXISTS "campanha_fotos_update" ON storage.objects;
CREATE POLICY "campanha_fotos_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campanha-fotos'
    AND (owner = auth.uid() OR campanha.is_admin())
  )
  WITH CHECK (
    bucket_id = 'campanha-fotos'
    AND (owner = auth.uid() OR campanha.is_admin())
  );

-- DELETE — dono do objeto ou admin do módulo.
DROP POLICY IF EXISTS "campanha_fotos_delete" ON storage.objects;
CREATE POLICY "campanha_fotos_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campanha-fotos'
    AND (owner = auth.uid() OR campanha.is_admin())
  );

-- ----------------------------------------------------------------------------
-- 3. View v_progresso_lideranca recriada com foto_path
-- ----------------------------------------------------------------------------
-- DROP necessário porque CREATE OR REPLACE não permite reordenar colunas
-- (inserimos foto_path no meio para manter agrupado com os campos básicos).
DROP VIEW IF EXISTS campanha.v_progresso_lideranca;

CREATE VIEW campanha.v_progresso_lideranca AS
SELECT
  l.id,
  l.nome,
  l.cargo,
  l.municipio,
  l.bairro,
  l.meta_votos,
  l.ativa,
  l.profile_id,
  l.foto_path,
  COUNT(a.id)                                            AS apoiadores_total,
  COUNT(a.id) FILTER (WHERE a.status = 'confirmado')     AS apoiadores_confirmados,
  ROUND(
    COALESCE(SUM(
      CASE a.status
        WHEN 'confirmado' THEN 1.0
        WHEN 'provavel'   THEN 0.7
        WHEN 'indeciso'   THEN 0.3
        WHEN 'contato'    THEN 0.1
        ELSE 0.0
      END
    ), 0)
  )::integer                                             AS votos_projetados,
  CASE
    WHEN l.meta_votos = 0 THEN NULL
    ELSE LEAST(1.0, COALESCE(SUM(
      CASE a.status
        WHEN 'confirmado' THEN 1.0
        WHEN 'provavel'   THEN 0.7
        WHEN 'indeciso'   THEN 0.3
        WHEN 'contato'    THEN 0.1
        ELSE 0.0
      END
    ), 0) / l.meta_votos)
  END                                                    AS pct_meta
FROM campanha.liderancas l
LEFT JOIN campanha.apoiadores a ON a.lider_id = l.id
GROUP BY l.id;

COMMENT ON VIEW campanha.v_progresso_lideranca IS
  'Por liderança: contagem de apoiadores, votos projetados e foto_path para o avatar das listagens.';
