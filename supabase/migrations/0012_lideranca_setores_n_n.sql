-- ============================================================================
-- 0012 — Lideranças N:N Setores
-- ----------------------------------------------------------------------------
-- Permite associar uma liderança a MÚLTIPLOS setores simultaneamente.
-- Mantém a coluna legada `liderancas.setor_id` (não removida nesta migração)
-- por retrocompatibilidade, mas a fonte de verdade passa a ser a nova tabela
-- `lideranca_setores`. A view `v_progresso_lideranca` é recriada para expor
-- um array JSON com os setores associados (id, número, nome).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela de vínculo (N:N)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campanha.lideranca_setores (
  lideranca_id  uuid NOT NULL REFERENCES campanha.liderancas (id) ON DELETE CASCADE,
  setor_id      uuid NOT NULL REFERENCES campanha.setores (id)    ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  PRIMARY KEY (lideranca_id, setor_id)
);

COMMENT ON TABLE campanha.lideranca_setores IS
  'Vínculo N:N entre lideranças e setores. Uma liderança pode atender múltiplos setores.';

CREATE INDEX IF NOT EXISTS idx_lideranca_setores_setor    ON campanha.lideranca_setores (setor_id);
CREATE INDEX IF NOT EXISTS idx_lideranca_setores_lideranca ON campanha.lideranca_setores (lideranca_id);

-- ----------------------------------------------------------------------------
-- 2. Migra dados existentes (liderancas.setor_id → lideranca_setores)
-- ----------------------------------------------------------------------------
INSERT INTO campanha.lideranca_setores (lideranca_id, setor_id)
SELECT id, setor_id
  FROM campanha.liderancas
 WHERE setor_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. RLS — espelha as políticas de `liderancas`
-- ----------------------------------------------------------------------------
ALTER TABLE campanha.lideranca_setores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lideranca_setores_select_all ON campanha.lideranca_setores;
CREATE POLICY lideranca_setores_select_all
  ON campanha.lideranca_setores
  FOR SELECT
  TO authenticated
  USING (campanha.pode_ler());

DROP POLICY IF EXISTS lideranca_setores_write_admin_or_owner ON campanha.lideranca_setores;
CREATE POLICY lideranca_setores_write_admin_or_owner
  ON campanha.lideranca_setores
  FOR ALL
  TO authenticated
  USING (
    campanha.is_admin()
    OR (
      campanha.has_role('coordenador'::campanha.role_usuario)
      AND EXISTS (
        SELECT 1 FROM campanha.liderancas l
         WHERE l.id = lideranca_setores.lideranca_id
           AND l.profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    campanha.is_admin()
    OR (
      campanha.has_role('coordenador'::campanha.role_usuario)
      AND EXISTS (
        SELECT 1 FROM campanha.liderancas l
         WHERE l.id = lideranca_setores.lideranca_id
           AND l.profile_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 4. View v_progresso_lideranca — agora expõe array de setores
-- ----------------------------------------------------------------------------
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
  COALESCE(
    (
      SELECT jsonb_agg(
               jsonb_build_object(
                 'id',      s.id,
                 'numero',  s.numero,
                 'nome',    s.nome,
                 'cor',     s.cor
               )
               ORDER BY s.numero
             )
        FROM campanha.lideranca_setores ls
        JOIN campanha.setores s ON s.id = ls.setor_id
       WHERE ls.lideranca_id = l.id
    ),
    '[]'::jsonb
  ) AS setores,
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
  'Por liderança: contagem de apoiadores, votos projetados, foto e SETORES (array JSON N:N).';
