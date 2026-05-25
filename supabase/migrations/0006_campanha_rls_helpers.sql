-- ============================================================================
-- 0006 — Funções helper para RLS
-- ----------------------------------------------------------------------------
-- Encapsulam consultas a campanha.profiles para evitar recursão infinita em
-- policies (uma policy que consulta a própria tabela protegida acaba em loop).
--
-- Características:
--   * SECURITY DEFINER — executam com privilégios do dono e podem ler profiles
--     mesmo quando o caller ainda não tem permissão.
--   * SET search_path = '' — boa prática Supabase (security_definer_search_path).
--   * STABLE — não modifica dados; o planner pode cachear.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- current_role: papel do usuário corrente no módulo Campanha.
-- Retorna NULL se o usuário não tem profile (= sem acesso).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.current_role()
RETURNS campanha.role_usuario
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role
  FROM campanha.profiles
  WHERE id = auth.uid()
    AND ativo = true
  LIMIT 1;
$$;

COMMENT ON FUNCTION campanha.current_role() IS
  'Retorna o role do usuário corrente em campanha.profiles, ou NULL se sem acesso.';

-- ----------------------------------------------------------------------------
-- is_admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM campanha.profiles
    WHERE id = auth.uid()
      AND ativo = true
      AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- has_role: testa se o user corrente tem QUALQUER role da lista informada.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.has_role(VARIADIC roles campanha.role_usuario[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM campanha.profiles
    WHERE id = auth.uid()
      AND ativo = true
      AND role = ANY (roles)
  );
$$;

-- ----------------------------------------------------------------------------
-- pode_ler: qualquer profile ativo pode ler dados gerais.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.pode_ler()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM campanha.profiles
    WHERE id = auth.uid() AND ativo = true
  );
$$;

-- ----------------------------------------------------------------------------
-- pode_escrever: admin, coordenador, operador (visualizador é read-only).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.pode_escrever()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT campanha.has_role('admin'::campanha.role_usuario,
                           'coordenador'::campanha.role_usuario,
                           'operador'::campanha.role_usuario);
$$;

-- ----------------------------------------------------------------------------
-- pode_deletar: somente admin.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.pode_deletar()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT campanha.is_admin();
$$;

-- ----------------------------------------------------------------------------
-- lideranca_eh_minha: usuário é dono da liderança (via profile_id).
--   Usado por policies de apoiadores/demandas para escopo de coordenador.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.lideranca_eh_minha(p_lider_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM campanha.liderancas l
    WHERE l.id = p_lider_id
      AND l.profile_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- GRANT EXECUTE para os papéis do PostgREST
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION campanha.current_role(),
                          campanha.is_admin(),
                          campanha.has_role(VARIADIC campanha.role_usuario[]),
                          campanha.pode_ler(),
                          campanha.pode_escrever(),
                          campanha.pode_deletar(),
                          campanha.lideranca_eh_minha(uuid)
  TO authenticated, service_role;
