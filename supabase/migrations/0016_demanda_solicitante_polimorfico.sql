-- =====================================================================
-- 0016 — Solicitante polimórfico de demanda
-- =====================================================================
-- Permite que o solicitante de uma demanda seja:
--   * um apoiador já cadastrado     (FK campanha.apoiadores)
--   * uma liderança já cadastrada   (FK campanha.liderancas)
--   * um avulso (nome + tel + bairro em texto livre)
--
-- Modelagem discriminada com enum `tipo_solicitante` + colunas dedicadas
-- por tipo, garantindo integridade referencial onde aplicável e
-- consistência via CHECK constraint.
-- =====================================================================

-- 1) Enum do tipo de solicitante
CREATE TYPE campanha.tipo_solicitante AS ENUM ('apoiador', 'lideranca', 'avulso');

-- 2) Novas colunas em demandas
ALTER TABLE campanha.demandas
  ADD COLUMN solicitante_tipo campanha.tipo_solicitante,
  ADD COLUMN solicitante_lider_id uuid REFERENCES campanha.liderancas (id) ON DELETE RESTRICT,
  ADD COLUMN solicitante_nome text,
  ADD COLUMN solicitante_tel text,
  ADD COLUMN solicitante_bairro text;

-- 3) Backfill: demandas com solicitante_id viram 'apoiador';
--    o resto (não deve existir hoje) cai em 'avulso' com nome placeholder.
UPDATE campanha.demandas
SET solicitante_tipo = 'apoiador'
WHERE solicitante_id IS NOT NULL;

UPDATE campanha.demandas
SET solicitante_tipo = 'avulso',
    solicitante_nome = COALESCE(solicitante_nome, 'Não informado')
WHERE solicitante_tipo IS NULL;

-- 4) Solicitante passa a ser obrigatório
ALTER TABLE campanha.demandas
  ALTER COLUMN solicitante_tipo SET NOT NULL;

-- 5) CHECK constraint de consistência entre tipo e campos preenchidos
ALTER TABLE campanha.demandas
  ADD CONSTRAINT demandas_solicitante_consistencia CHECK (
    (solicitante_tipo = 'apoiador'
      AND solicitante_id IS NOT NULL
      AND solicitante_lider_id IS NULL
      AND solicitante_nome IS NULL
      AND solicitante_tel IS NULL
      AND solicitante_bairro IS NULL)
    OR
    (solicitante_tipo = 'lideranca'
      AND solicitante_lider_id IS NOT NULL
      AND solicitante_id IS NULL
      AND solicitante_nome IS NULL
      AND solicitante_tel IS NULL
      AND solicitante_bairro IS NULL)
    OR
    (solicitante_tipo = 'avulso'
      AND solicitante_nome IS NOT NULL
      AND length(btrim(solicitante_nome)) > 0
      AND solicitante_id IS NULL
      AND solicitante_lider_id IS NULL)
  );

-- 6) Índices para consulta por solicitante
CREATE INDEX IF NOT EXISTS idx_demandas_solicitante_lider_id
  ON campanha.demandas (solicitante_lider_id)
  WHERE solicitante_lider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_demandas_solicitante_tipo
  ON campanha.demandas (solicitante_tipo);

-- 7) Comentários explicativos
COMMENT ON COLUMN campanha.demandas.solicitante_tipo IS
  'Tipo do solicitante: apoiador (FK solicitante_id), lideranca (FK solicitante_lider_id) ou avulso (campos texto livres).';
COMMENT ON COLUMN campanha.demandas.solicitante_lider_id IS
  'FK para liderancas — usado quando solicitante_tipo = ''lideranca''.';
COMMENT ON COLUMN campanha.demandas.solicitante_nome IS
  'Nome do solicitante avulso (não cadastrado).';
COMMENT ON COLUMN campanha.demandas.solicitante_tel IS
  'Telefone do solicitante avulso (opcional, dígitos apenas).';
COMMENT ON COLUMN campanha.demandas.solicitante_bairro IS
  'Bairro/região informados pelo solicitante avulso (opcional).';

-- =====================================================================
-- 8) Trigger: ao excluir um apoiador, migrar suas demandas para 'avulso'
--    preservando nome/tel/bairro. Substitui o antigo ON DELETE SET NULL,
--    que entraria em conflito com o CHECK quando solicitante_tipo='apoiador'.
-- =====================================================================
ALTER TABLE campanha.demandas
  DROP CONSTRAINT IF EXISTS demandas_solicitante_id_fkey;

ALTER TABLE campanha.demandas
  ADD CONSTRAINT demandas_solicitante_id_fkey
  FOREIGN KEY (solicitante_id) REFERENCES campanha.apoiadores (id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE OR REPLACE FUNCTION campanha.fn_apoiador_delete_migra_demandas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = campanha, public
AS $$
BEGIN
  UPDATE campanha.demandas
     SET solicitante_tipo = 'avulso',
         solicitante_id   = NULL,
         solicitante_nome = COALESCE(NULLIF(btrim(OLD.nome), ''), 'Não informado'),
         solicitante_tel  = OLD.tel,
         solicitante_bairro = OLD.bairro
   WHERE solicitante_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_apoiador_delete_migra_demandas ON campanha.apoiadores;
CREATE TRIGGER trg_apoiador_delete_migra_demandas
BEFORE DELETE ON campanha.apoiadores
FOR EACH ROW EXECUTE FUNCTION campanha.fn_apoiador_delete_migra_demandas();
