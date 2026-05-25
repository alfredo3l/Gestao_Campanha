-- =============================================================================
-- Primeiro admin do módulo Campanha
-- =============================================================================
-- Não rode tudo de uma vez. Faça os 3 passos abaixo, na ordem.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 1 — Criar o usuário no Supabase Auth (use o Dashboard, não SQL)
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Acesse: https://supabase.com/dashboard/project/qvjpnucpwdrtxfjqicsu/auth/users
-- 2. Clique em "Add user → Create new user"
-- 3. Preencha e-mail + senha (>= 8 caracteres)
-- 4. MARQUE "Auto Confirm User" (senão o login não funciona sem clicar em e-mail)
-- 5. Anote o UUID que aparece na lista de usuários (formato 8-4-4-4-12 hex)

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 2 — Inserir o profile dele no módulo Campanha
-- ─────────────────────────────────────────────────────────────────────────────
-- Substitua <UUID-DO-USUARIO> e <NOME COMPLETO> abaixo, depois rode no
-- Supabase Dashboard → SQL Editor.

INSERT INTO campanha.profiles (id, nome, role, ativo)
VALUES (
  '<UUID-DO-USUARIO>'::uuid,    -- ex: '6f3c2d8a-...-9b1c'
  '<NOME COMPLETO>',            -- ex: 'Maria da Silva'
  'admin'::campanha.role_usuario,
  true
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PASSO 3 — Verificar que ficou OK
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  p.id,
  p.nome,
  p.role,
  p.ativo,
  u.email
FROM campanha.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- Esperado: 1 linha com role='admin', ativo=true, com o e-mail que você criou no Passo 1.

-- =============================================================================
-- ALTERNATIVA — Tudo num único SQL (se você quiser, depois do Passo 1):
-- =============================================================================
-- WITH novo_usuario AS (
--   SELECT id FROM auth.users WHERE email = '<E-MAIL-CRIADO-NO-DASHBOARD>'
-- )
-- INSERT INTO campanha.profiles (id, nome, role, ativo)
-- SELECT id, '<NOME COMPLETO>', 'admin'::campanha.role_usuario, true
-- FROM novo_usuario;
