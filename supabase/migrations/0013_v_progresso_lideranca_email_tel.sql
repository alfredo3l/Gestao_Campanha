-- ============================================================================
-- 0013 — Expand v_progresso_lideranca com email e tel
-- ----------------------------------------------------------------------------
-- Necessário para que a tela /liderancas possa fazer busca textual em nome,
-- e-mail e telefone diretamente sobre a view (mesmo padrão de /apoiadores).
-- ============================================================================
DROP VIEW IF EXISTS campanha.v_progresso_lideranca;

CREATE VIEW campanha.v_progresso_lideranca AS
SELECT
  l.id,
  l.nome,
  l.cargo,
  l.municipio,
  l.bairro,
  l.tel,
  l.email,
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
  'Por liderança: contagem de apoiadores, votos projetados, foto, e-mail/tel e SETORES (array JSON N:N).';
