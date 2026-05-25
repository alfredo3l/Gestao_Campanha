-- ============================================================================
-- 0001 — Schema "campanha" + funções utilitárias
-- ----------------------------------------------------------------------------
-- Cria o schema dedicado ao módulo Campanha (isolado do "public", que pertence
-- ao app Acto coexistindo neste mesmo projeto Supabase) e funções utilitárias
-- usadas por triggers das migrations seguintes.
--
-- Boas práticas seguidas:
--   * SECURITY INVOKER (default) — funções de trigger não elevam privilégio.
--   * SET search_path = '' — previne search_path injection (regra do linter
--     security_advisor do Supabase).
--   * Todas as referências de schema são qualificadas (pg_catalog, auth, etc.).
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS campanha;

COMMENT ON SCHEMA campanha IS
  'Módulo "Gestão de Campanha Eleitoral" — totalmente isolado do schema public (que pertence ao app Acto).';

-- Permitir uso do schema pelos papéis do PostgREST.
-- (As tabelas individuais ainda exigem GRANTs próprios + RLS.)
GRANT USAGE ON SCHEMA campanha TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA campanha
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA campanha
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA campanha
  GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Trigger genérica: define NEW.updated_at = now() em UPDATE.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION campanha.fn_set_updated_at() IS
  'Atualiza updated_at = now() em cada UPDATE (uso geral em triggers BEFORE UPDATE).';

-- ----------------------------------------------------------------------------
-- Trigger genérica: define NEW.created_by = auth.uid() em INSERT (se null).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.fn_set_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION campanha.fn_set_created_by() IS
  'Preenche created_by com auth.uid() se ainda for NULL (BEFORE INSERT).';
