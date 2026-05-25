-- ============================================================================
-- 0014 — Lideranças: campo livre de observações
-- ----------------------------------------------------------------------------
-- Adiciona coluna `observacoes` (text livre) em `campanha.liderancas` para
-- que o usuário possa fazer anotações sobre a liderança (perfil, histórico,
-- compromissos, particularidades de relacionamento).
--
-- Mesmo padrão já utilizado em `campanha.apoiadores.observacoes`.
-- ============================================================================

ALTER TABLE campanha.liderancas
  ADD COLUMN IF NOT EXISTS observacoes text;

COMMENT ON COLUMN campanha.liderancas.observacoes IS
  'Campo livre para anotações e observações sobre a liderança (texto livre, sem PII estruturada).';
