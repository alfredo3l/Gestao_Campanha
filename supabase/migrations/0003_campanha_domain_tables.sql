-- ============================================================================
-- 0003 — Tabelas de domínio
-- ----------------------------------------------------------------------------
-- liderancas → apoiadores (e suas tags) · metas_regiao · demandas
-- (+ movimentações e anexos)
--
-- Triggers de auditoria (updated_at, created_by) e índices de performance
-- são adicionados na 0004 para manter este DDL puramente estrutural.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- liderancas
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.liderancas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text NOT NULL CHECK (length(btrim(nome)) >= 3),
  cargo        campanha.cargo_lider NOT NULL,
  municipio    text NOT NULL CHECK (length(btrim(municipio)) >= 2),
  bairro       text,
  tel          text,
  email        text CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  meta_votos   integer NOT NULL DEFAULT 0 CHECK (meta_votos >= 0),
  ativa        boolean NOT NULL DEFAULT true,
  profile_id   uuid REFERENCES campanha.profiles (id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

COMMENT ON COLUMN campanha.liderancas.profile_id IS
  'Vincula a liderança a um usuário do sistema (quando a liderança também opera o app).';

-- ----------------------------------------------------------------------------
-- apoiadores
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.apoiadores (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                 text NOT NULL CHECK (length(btrim(nome)) >= 3),
  cpf                  text NOT NULL UNIQUE CHECK (cpf ~ '^[0-9]{11}$'),
  titulo_eleitor       text CHECK (titulo_eleitor IS NULL OR titulo_eleitor ~ '^[0-9]{12}$'),
  zona                 text CHECK (zona IS NULL OR zona ~ '^[0-9]{1,4}$'),
  secao                text CHECK (secao IS NULL OR secao ~ '^[0-9]{1,4}$'),
  tel                  text,
  email                text CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  nascimento           date,
  endereco             text,
  bairro               text,
  municipio            text NOT NULL CHECK (length(btrim(municipio)) >= 2),
  cep                  text CHECK (cep IS NULL OR cep ~ '^[0-9]{8}$'),
  lider_id             uuid NOT NULL REFERENCES campanha.liderancas (id) ON DELETE RESTRICT,
  status               campanha.status_apoio NOT NULL DEFAULT 'contato',
  indicado_por         text,
  observacoes          text,
  data_consentimento   timestamptz,  -- LGPD: gravar momento do opt-in
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

COMMENT ON COLUMN campanha.apoiadores.cpf IS
  '11 dígitos (somente números). Validação de DV no client/Zod; aqui só formato.';
COMMENT ON COLUMN campanha.apoiadores.data_consentimento IS
  'LGPD — preencher quando o apoiador autoriza tratamento dos dados.';

-- ----------------------------------------------------------------------------
-- apoiador_tags (N:N entre apoiadores e tags livres)
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.apoiador_tags (
  apoiador_id  uuid NOT NULL REFERENCES campanha.apoiadores (id) ON DELETE CASCADE,
  tag          text NOT NULL CHECK (length(btrim(tag)) BETWEEN 1 AND 40),
  PRIMARY KEY (apoiador_id, tag)
);

-- ----------------------------------------------------------------------------
-- metas_regiao
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.metas_regiao (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regiao       text NOT NULL UNIQUE CHECK (length(btrim(regiao)) >= 2),
  municipios   text[] NOT NULL DEFAULT '{}',
  eleitores    integer NOT NULL DEFAULT 0 CHECK (eleitores >= 0),
  meta_votos   integer NOT NULL DEFAULT 0 CHECK (meta_votos >= 0),
  prazo        date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- demandas (codigo será preenchido pelo trigger criado em 0004)
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.demandas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          text UNIQUE,  -- preenchido por trigger em 0004
  titulo          text NOT NULL CHECK (length(btrim(titulo)) >= 5),
  descricao       text,
  categoria       text NOT NULL,
  prioridade      campanha.prioridade NOT NULL DEFAULT 'media',
  status          campanha.status_demanda NOT NULL DEFAULT 'aberta',
  solicitante_id  uuid REFERENCES campanha.apoiadores (id) ON DELETE SET NULL,
  lider_id        uuid NOT NULL REFERENCES campanha.liderancas (id) ON DELETE RESTRICT,
  prazo           date,
  resolvida_em    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- demanda_movimentacoes (histórico / comentários)
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.demanda_movimentacoes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id  uuid NOT NULL REFERENCES campanha.demandas (id) ON DELETE CASCADE,
  autor_id    uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  tipo        text NOT NULL CHECK (tipo IN ('comentario', 'status_change', 'anexo')),
  texto       text,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  criada_em   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- demanda_anexos
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.demanda_anexos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id    uuid NOT NULL REFERENCES campanha.demandas (id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  nome          text NOT NULL,
  mime          text,
  tamanho       bigint CHECK (tamanho IS NULL OR tamanho >= 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
