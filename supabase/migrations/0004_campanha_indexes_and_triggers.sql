-- ============================================================================
-- 0004 — Índices + triggers (updated_at, created_by, código de demanda)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Índices (alinhados ao §4 do HANDOFF)
-- ----------------------------------------------------------------------------
CREATE INDEX idx_apoiadores_lider_id   ON campanha.apoiadores (lider_id);
CREATE INDEX idx_apoiadores_municipio  ON campanha.apoiadores (municipio);
CREATE INDEX idx_apoiadores_status     ON campanha.apoiadores (status);
CREATE INDEX idx_apoiadores_created_at ON campanha.apoiadores (created_at DESC);

CREATE INDEX idx_liderancas_municipio  ON campanha.liderancas (municipio);
CREATE INDEX idx_liderancas_profile_id ON campanha.liderancas (profile_id);
CREATE INDEX idx_liderancas_ativa      ON campanha.liderancas (ativa);

CREATE INDEX idx_demandas_status   ON campanha.demandas (status);
CREATE INDEX idx_demandas_lider_id ON campanha.demandas (lider_id);
CREATE INDEX idx_demandas_prazo    ON campanha.demandas (prazo);

CREATE INDEX idx_demanda_movs_demanda_id ON campanha.demanda_movimentacoes (demanda_id, criada_em DESC);
CREATE INDEX idx_demanda_anexos_demanda_id ON campanha.demanda_anexos (demanda_id);

-- ----------------------------------------------------------------------------
-- Triggers: updated_at em todas as tabelas com a coluna
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_liderancas_set_updated_at
  BEFORE UPDATE ON campanha.liderancas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_updated_at();

CREATE TRIGGER trg_apoiadores_set_updated_at
  BEFORE UPDATE ON campanha.apoiadores
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_updated_at();

CREATE TRIGGER trg_demandas_set_updated_at
  BEFORE UPDATE ON campanha.demandas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_updated_at();

-- ----------------------------------------------------------------------------
-- Triggers: created_by = auth.uid() em INSERT (quando ainda nulo)
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_liderancas_set_created_by
  BEFORE INSERT ON campanha.liderancas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_created_by();

CREATE TRIGGER trg_apoiadores_set_created_by
  BEFORE INSERT ON campanha.apoiadores
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_created_by();

CREATE TRIGGER trg_demandas_set_created_by
  BEFORE INSERT ON campanha.demandas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_created_by();

CREATE TRIGGER trg_demanda_anexos_set_created_by
  BEFORE INSERT ON campanha.demanda_anexos
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_set_created_by();

-- ----------------------------------------------------------------------------
-- Gerador de código humano de demandas: "D-26####" (YY + sequência de 4 dígitos)
--   Nota: a sequência é global; o YY indica o ano de criação da linha.
--   Não há reset por ano (D-260001 → D-269999 → D-270000 …).
-- ----------------------------------------------------------------------------
CREATE SEQUENCE campanha.seq_demanda_codigo
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  NO MAXVALUE
  CACHE 1;

CREATE OR REPLACE FUNCTION campanha.fn_gerar_codigo_demanda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.codigo IS NULL OR length(btrim(NEW.codigo)) = 0 THEN
    NEW.codigo := 'D-'
      || pg_catalog.to_char(pg_catalog.now(), 'YY')
      || pg_catalog.lpad(pg_catalog.nextval('campanha.seq_demanda_codigo')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_demandas_gerar_codigo
  BEFORE INSERT ON campanha.demandas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_gerar_codigo_demanda();

-- ----------------------------------------------------------------------------
-- Trigger: ao mudar status para 'resolvida', preencher resolvida_em automaticamente.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION campanha.fn_marcar_resolvida_em()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'resolvida' AND (OLD.status IS DISTINCT FROM 'resolvida') THEN
    NEW.resolvida_em := pg_catalog.now();
  ELSIF NEW.status <> 'resolvida' AND NEW.resolvida_em IS NOT NULL THEN
    NEW.resolvida_em := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_demandas_marcar_resolvida
  BEFORE UPDATE OF status ON campanha.demandas
  FOR EACH ROW EXECUTE FUNCTION campanha.fn_marcar_resolvida_em();
