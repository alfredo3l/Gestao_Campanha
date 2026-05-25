-- ============================================================================
-- 0007 — Habilita RLS e cria as policies em todas as tabelas
-- ----------------------------------------------------------------------------
-- Resumo do modelo (HANDOFF §4.RLS):
--   admin          → tudo (SELECT, INSERT, UPDATE, DELETE)
--   coordenador    → SELECT em tudo (visão estratégica); INSERT/UPDATE em
--                    liderancas/apoiadores/demandas dele; sem DELETE
--   operador       → SELECT em tudo; INSERT/UPDATE em apoiadores e demandas
--                    (sem mexer em liderancas / metas / profiles); sem DELETE
--   visualizador   → somente SELECT
--
-- Coordenador "dele" = liderança onde liderancas.profile_id = auth.uid()
--                   ou apoiador/demanda que aponta para essa liderança.
-- ============================================================================

ALTER TABLE campanha.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.liderancas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.apoiadores             ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.apoiador_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.metas_regiao           ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.demandas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.demanda_movimentacoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha.demanda_anexos         ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- profiles
-- ============================================================================
CREATE POLICY profiles_select_self_or_admin
  ON campanha.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR campanha.is_admin());

CREATE POLICY profiles_insert_admin
  ON campanha.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (campanha.is_admin());

CREATE POLICY profiles_update_admin_or_self
  ON campanha.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR campanha.is_admin())
  WITH CHECK (
    -- usuário comum só pode editar o próprio nome; admin pode tudo
    campanha.is_admin() OR (id = auth.uid())
  );

CREATE POLICY profiles_delete_admin
  ON campanha.profiles
  FOR DELETE
  TO authenticated
  USING (campanha.is_admin());

-- ============================================================================
-- liderancas
-- ============================================================================
CREATE POLICY liderancas_select_all
  ON campanha.liderancas
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY liderancas_insert_admin_or_coord
  ON campanha.liderancas
  FOR INSERT
  TO authenticated
  WITH CHECK (campanha.has_role('admin'::campanha.role_usuario,
                                'coordenador'::campanha.role_usuario));

CREATE POLICY liderancas_update_admin_or_owner
  ON campanha.liderancas
  FOR UPDATE
  TO authenticated
  USING (
    campanha.is_admin()
    OR (campanha.has_role('coordenador'::campanha.role_usuario) AND profile_id = auth.uid())
  )
  WITH CHECK (
    campanha.is_admin()
    OR (campanha.has_role('coordenador'::campanha.role_usuario) AND profile_id = auth.uid())
  );

CREATE POLICY liderancas_delete_admin
  ON campanha.liderancas
  FOR DELETE
  TO authenticated
  USING (campanha.is_admin());

-- ============================================================================
-- apoiadores
-- ============================================================================
CREATE POLICY apoiadores_select_all
  ON campanha.apoiadores
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY apoiadores_insert_writer
  ON campanha.apoiadores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    campanha.is_admin()
    OR campanha.has_role('operador'::campanha.role_usuario)
    OR (campanha.has_role('coordenador'::campanha.role_usuario)
        AND campanha.lideranca_eh_minha(lider_id))
  );

CREATE POLICY apoiadores_update_writer
  ON campanha.apoiadores
  FOR UPDATE
  TO authenticated
  USING (
    campanha.is_admin()
    OR campanha.has_role('operador'::campanha.role_usuario)
    OR (campanha.has_role('coordenador'::campanha.role_usuario)
        AND campanha.lideranca_eh_minha(lider_id))
  )
  WITH CHECK (
    campanha.is_admin()
    OR campanha.has_role('operador'::campanha.role_usuario)
    OR (campanha.has_role('coordenador'::campanha.role_usuario)
        AND campanha.lideranca_eh_minha(lider_id))
  );

CREATE POLICY apoiadores_delete_admin
  ON campanha.apoiadores
  FOR DELETE
  TO authenticated
  USING (campanha.is_admin());

-- ============================================================================
-- apoiador_tags (visibilidade segue o apoiador)
-- ============================================================================
CREATE POLICY apoiador_tags_select_all
  ON campanha.apoiador_tags
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY apoiador_tags_write_writer
  ON campanha.apoiador_tags
  FOR ALL
  TO authenticated
  USING (campanha.pode_escrever())
  WITH CHECK (campanha.pode_escrever());

-- ============================================================================
-- metas_regiao
-- ============================================================================
CREATE POLICY metas_select_all
  ON campanha.metas_regiao
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY metas_write_admin_or_coord
  ON campanha.metas_regiao
  FOR ALL
  TO authenticated
  USING (campanha.has_role('admin'::campanha.role_usuario,
                           'coordenador'::campanha.role_usuario))
  WITH CHECK (campanha.has_role('admin'::campanha.role_usuario,
                                'coordenador'::campanha.role_usuario));

-- ============================================================================
-- demandas
-- ============================================================================
CREATE POLICY demandas_select_all
  ON campanha.demandas
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY demandas_insert_writer
  ON campanha.demandas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    campanha.is_admin()
    OR campanha.has_role('operador'::campanha.role_usuario)
    OR (campanha.has_role('coordenador'::campanha.role_usuario)
        AND campanha.lideranca_eh_minha(lider_id))
  );

CREATE POLICY demandas_update_writer
  ON campanha.demandas
  FOR UPDATE
  TO authenticated
  USING (
    campanha.is_admin()
    OR campanha.has_role('operador'::campanha.role_usuario)
    OR (campanha.has_role('coordenador'::campanha.role_usuario)
        AND campanha.lideranca_eh_minha(lider_id))
  )
  WITH CHECK (
    campanha.is_admin()
    OR campanha.has_role('operador'::campanha.role_usuario)
    OR (campanha.has_role('coordenador'::campanha.role_usuario)
        AND campanha.lideranca_eh_minha(lider_id))
  );

CREATE POLICY demandas_delete_admin
  ON campanha.demandas
  FOR DELETE
  TO authenticated
  USING (campanha.is_admin());

-- ============================================================================
-- demanda_movimentacoes
-- ============================================================================
CREATE POLICY demanda_movs_select_all
  ON campanha.demanda_movimentacoes
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY demanda_movs_insert_writer
  ON campanha.demanda_movimentacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (campanha.pode_escrever());

CREATE POLICY demanda_movs_update_author_or_admin
  ON campanha.demanda_movimentacoes
  FOR UPDATE
  TO authenticated
  USING (autor_id = auth.uid() OR campanha.is_admin())
  WITH CHECK (autor_id = auth.uid() OR campanha.is_admin());

CREATE POLICY demanda_movs_delete_admin
  ON campanha.demanda_movimentacoes
  FOR DELETE
  TO authenticated
  USING (campanha.is_admin());

-- ============================================================================
-- demanda_anexos (metadados; o arquivo em si vai pelo Storage — bucket 0008)
-- ============================================================================
CREATE POLICY demanda_anexos_select_all
  ON campanha.demanda_anexos
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

CREATE POLICY demanda_anexos_insert_writer
  ON campanha.demanda_anexos
  FOR INSERT
  TO authenticated
  WITH CHECK (campanha.pode_escrever());

CREATE POLICY demanda_anexos_delete_admin
  ON campanha.demanda_anexos
  FOR DELETE
  TO authenticated
  USING (campanha.is_admin());
