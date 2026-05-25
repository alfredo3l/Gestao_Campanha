-- ============================================================================
-- 0011 — Auditoria completa (created_by / updated_by automáticos)
-- ----------------------------------------------------------------------------
-- 1. Adiciona `updated_by` em todas as tabelas que admitem UPDATE.
-- 2. Adiciona `updated_at`, `created_by`, `updated_by` em tabelas que ainda
--    não tinham auditoria (profiles, metas_regiao).
-- 3. Cria função genérica `campanha.fn_set_audit_fields()`:
--      INSERT  → preenche created_by/updated_by = auth.uid() se nulos.
--      UPDATE  → preenche updated_by = auth.uid() e updated_at = now();
--                NUNCA altera created_by/created_at (imutáveis após criar).
-- 4. Vincula a trigger nas tabelas com auditoria.
-- 5. Mantém as funções antigas (fn_set_updated_at, fn_set_created_by) por
--    compatibilidade — os triggers antigos são SUBSTITUÍDOS pelo unificado.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Função genérica unificada
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.fn_set_audit_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL THEN
      NEW.created_by := v_uid;
    END IF;
    NEW.updated_by := v_uid;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Imutáveis: protege created_by/created_at contra modificação acidental.
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := pg_catalog.now();
    NEW.updated_by := v_uid;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION campanha.fn_set_audit_fields() IS
  'Trigger genérica: preenche created_by/updated_by = auth.uid() e mantém created_* imutáveis.';

-- ----------------------------------------------------------------------------
-- 2. Adicionar updated_by nas tabelas que já têm updated_at
-- ----------------------------------------------------------------------------
ALTER TABLE campanha.liderancas
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE campanha.apoiadores
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE campanha.demandas
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE campanha.cargos_lider
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3. Backfill em tabelas que ainda não tinham auditoria
-- ----------------------------------------------------------------------------
-- profiles → adiciona updated_at + created_by + updated_by
ALTER TABLE campanha.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- metas_regiao → adiciona updated_at + created_by + updated_by
ALTER TABLE campanha.metas_regiao
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 4. (Re)cria triggers — substituindo os antigos por um único set_audit_fields
--    em BEFORE INSERT OR UPDATE.
--    Os triggers antigos (trg_*_set_updated_at, trg_*_set_created_by) são
--    removidos para evitar dupla execução.
-- ----------------------------------------------------------------------------

-- liderancas
DROP TRIGGER IF EXISTS trg_liderancas_set_updated_at ON campanha.liderancas;
DROP TRIGGER IF EXISTS trg_liderancas_set_created_by ON campanha.liderancas;
DROP TRIGGER IF EXISTS trg_liderancas_audit         ON campanha.liderancas;
CREATE TRIGGER trg_liderancas_audit
  BEFORE INSERT OR UPDATE ON campanha.liderancas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_audit_fields();

-- apoiadores
DROP TRIGGER IF EXISTS trg_apoiadores_set_updated_at ON campanha.apoiadores;
DROP TRIGGER IF EXISTS trg_apoiadores_set_created_by ON campanha.apoiadores;
DROP TRIGGER IF EXISTS trg_apoiadores_audit         ON campanha.apoiadores;
CREATE TRIGGER trg_apoiadores_audit
  BEFORE INSERT OR UPDATE ON campanha.apoiadores
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_audit_fields();

-- demandas
DROP TRIGGER IF EXISTS trg_demandas_set_updated_at ON campanha.demandas;
DROP TRIGGER IF EXISTS trg_demandas_set_created_by ON campanha.demandas;
DROP TRIGGER IF EXISTS trg_demandas_audit         ON campanha.demandas;
CREATE TRIGGER trg_demandas_audit
  BEFORE INSERT OR UPDATE ON campanha.demandas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_audit_fields();

-- cargos_lider
DROP TRIGGER IF EXISTS trg_cargos_lider_set_updated_at ON campanha.cargos_lider;
DROP TRIGGER IF EXISTS trg_cargos_lider_set_created_by ON campanha.cargos_lider;
DROP TRIGGER IF EXISTS trg_cargos_lider_audit         ON campanha.cargos_lider;
CREATE TRIGGER trg_cargos_lider_audit
  BEFORE INSERT OR UPDATE ON campanha.cargos_lider
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_audit_fields();

-- profiles (passa a ter auditoria completa)
DROP TRIGGER IF EXISTS trg_profiles_audit ON campanha.profiles;
CREATE TRIGGER trg_profiles_audit
  BEFORE INSERT OR UPDATE ON campanha.profiles
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_audit_fields();

-- metas_regiao (passa a ter auditoria completa)
DROP TRIGGER IF EXISTS trg_metas_regiao_audit ON campanha.metas_regiao;
CREATE TRIGGER trg_metas_regiao_audit
  BEFORE INSERT OR UPDATE ON campanha.metas_regiao
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_audit_fields();

-- demanda_anexos: append-only — mantemos só o created_by (já tem trigger).
-- demanda_movimentacoes: append-only com `autor_id` próprio (já é o "criador").

-- ----------------------------------------------------------------------------
-- 5. Índices para acelerar consultas "quem criou/alterou"
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_apoiadores_updated_by ON campanha.apoiadores (updated_by);
CREATE INDEX IF NOT EXISTS idx_liderancas_updated_by ON campanha.liderancas (updated_by);
CREATE INDEX IF NOT EXISTS idx_demandas_updated_by   ON campanha.demandas   (updated_by);

COMMENT ON COLUMN campanha.apoiadores.updated_by IS
  'Usuário que fez a última alteração (preenchido por trigger).';
COMMENT ON COLUMN campanha.liderancas.updated_by IS
  'Usuário que fez a última alteração (preenchido por trigger).';
COMMENT ON COLUMN campanha.demandas.updated_by IS
  'Usuário que fez a última alteração (preenchido por trigger).';
