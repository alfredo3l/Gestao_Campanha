-- ============================================================================
-- 0005 — Views de agregação para Dashboard e tela de Metas
-- ----------------------------------------------------------------------------
-- Convenção de "votos projetados" (espelha planilha do candidato):
--   confirmado * 1.0
--   provavel   * 0.7
--   indeciso   * 0.3
--   contato    * 0.1
--   nao_vota   * 0.0
-- ============================================================================

-- ----------------------------------------------------------------------------
-- v_progresso_lideranca — por liderança: apoiadores, votos projetados, % meta
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW campanha.v_progresso_lideranca AS
SELECT
  l.id,
  l.nome,
  l.cargo,
  l.municipio,
  l.bairro,
  l.meta_votos,
  l.ativa,
  l.profile_id,
  COUNT(a.id)                                    AS apoiadores_total,
  COUNT(a.id) FILTER (WHERE a.status = 'confirmado') AS apoiadores_confirmados,
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
  )::integer                                     AS votos_projetados,
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
  END                                            AS pct_meta
FROM campanha.liderancas l
LEFT JOIN campanha.apoiadores a ON a.lider_id = l.id
GROUP BY l.id;

COMMENT ON VIEW campanha.v_progresso_lideranca IS
  'Por liderança: contagem de apoiadores, votos projetados (média ponderada por status) e % da meta.';

-- ----------------------------------------------------------------------------
-- v_progresso_regiao — agrega metas_regiao com lideranças/apoiadores
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW campanha.v_progresso_regiao AS
SELECT
  m.id,
  m.regiao,
  m.municipios,
  m.eleitores,
  m.meta_votos,
  m.prazo,
  COUNT(DISTINCT l.id) FILTER (WHERE l.ativa) AS liderancas_ativas,
  COUNT(a.id)                                  AS apoiadores_total,
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
  )::integer                                   AS votos_projetados,
  CASE
    WHEN m.meta_votos = 0 THEN NULL
    ELSE LEAST(1.0, COALESCE(SUM(
      CASE a.status
        WHEN 'confirmado' THEN 1.0
        WHEN 'provavel'   THEN 0.7
        WHEN 'indeciso'   THEN 0.3
        WHEN 'contato'    THEN 0.1
        ELSE 0.0
      END
    ), 0) / m.meta_votos)
  END                                          AS pct_meta
FROM campanha.metas_regiao m
LEFT JOIN campanha.liderancas l ON l.municipio = ANY (m.municipios)
LEFT JOIN campanha.apoiadores a ON a.lider_id = l.id
GROUP BY m.id;

COMMENT ON VIEW campanha.v_progresso_regiao IS
  'Por região: agrega lideranças, apoiadores e votos projetados — base da tela /metas.';

-- ----------------------------------------------------------------------------
-- v_dashboard_kpis — totais para a tela inicial
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW campanha.v_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM campanha.apoiadores)                                  AS apoiadores_total,
  (SELECT COUNT(*) FROM campanha.apoiadores
     WHERE created_at >= now() - interval '7 days')                            AS apoiadores_semana,
  (SELECT COUNT(*) FROM campanha.liderancas WHERE ativa)                       AS liderancas_ativas,
  (SELECT COALESCE(SUM(meta_votos), 0) FROM campanha.metas_regiao)             AS meta_total,
  (SELECT COALESCE(SUM(votos_projetados), 0) FROM campanha.v_progresso_regiao) AS votos_projetados,
  (SELECT COUNT(*) FROM campanha.demandas WHERE status <> 'resolvida'
                                            AND status <> 'cancelada')         AS demandas_abertas,
  (SELECT COUNT(*) FROM campanha.demandas
     WHERE status NOT IN ('resolvida', 'cancelada')
       AND prazo <= (now() + interval '7 days')::date)                         AS demandas_vencendo;

COMMENT ON VIEW campanha.v_dashboard_kpis IS
  'KPIs agregados do dashboard. Sempre uma única linha.';
