-- ============================================================================
-- 0002 — Enums + tabela campanha.profiles
-- ----------------------------------------------------------------------------
-- Cria os tipos enumerados do domínio e a tabela de perfis dos usuários do
-- módulo Campanha. profiles vive em "campanha" e referencia auth.users(id)
-- — quem não tem registro aqui não tem acesso ao módulo (mesmo logando).
-- ============================================================================

CREATE TYPE campanha.role_usuario AS ENUM (
  'admin',
  'coordenador',
  'operador',
  'visualizador'
);

CREATE TYPE campanha.status_apoio AS ENUM (
  'confirmado',
  'provavel',
  'indeciso',
  'contato',
  'nao_vota'
);

CREATE TYPE campanha.cargo_lider AS ENUM (
  'coord_regional',
  'coord_zona',
  'lider_bairro',
  'lider_comunitario',
  'lider_rural'
);

CREATE TYPE campanha.status_demanda AS ENUM (
  'aberta',
  'andamento',
  'resolvida',
  'cancelada'
);

CREATE TYPE campanha.prioridade AS ENUM (
  'baixa',
  'media',
  'alta',
  'urgente'
);

-- ----------------------------------------------------------------------------
-- Tabela profiles
-- ----------------------------------------------------------------------------
CREATE TABLE campanha.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome        text NOT NULL CHECK (length(btrim(nome)) >= 2),
  role        campanha.role_usuario NOT NULL DEFAULT 'visualizador',
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE campanha.profiles IS
  'Perfis dos usuários do módulo Campanha. Quem não tem linha aqui é tratado como sem acesso (RLS bloqueia).';
COMMENT ON COLUMN campanha.profiles.role IS
  'Papel no módulo Campanha — DIFERENTE de public.user_role (Acto).';
