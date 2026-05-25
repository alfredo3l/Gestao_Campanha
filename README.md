# Gestão de Campanha

Sistema interno de **gestão de campanha eleitoral** — candidatura a **Deputado Estadual / Mato Grosso do Sul**.

> Documento de contexto completo do produto: [`HANDOFF.md`](./HANDOFF.md).
> Referência visual / fluxo (protótipo HTML legado): pasta [`Sistema/`](./Sistema/).

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** estrito
- **Tailwind CSS 3** + **shadcn/ui** (tokens institucionais em `tailwind.config.ts`)
- **Supabase** (Postgres + Auth + Storage + Realtime) via [`@supabase/ssr`](https://github.com/supabase/auth-helpers)
- **TanStack Query** (cache de dados) + **TanStack Table** (tabelas)
- **react-hook-form** + **Zod** (forms e validação)
- **Recharts** + **lucide-react** + **sonner**

---

## Setup local

```bash
npm install
cp .env.local.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) → você será redirecionado para `/login`.

---

## Supabase

| Item | Valor |
|---|---|
| Projeto | **Acto** (`qvjpnucpwdrtxfjqicsu`) — região `us-west-2` |
| URL | `https://qvjpnucpwdrtxfjqicsu.supabase.co` |
| Schema | **`campanha`** (isolado do schema `public` que pertence ao app Acto) |

### IMPORTANTE — expor o schema `campanha` na API PostgREST

O projeto Acto usa o schema `public`. Como a Campanha vive em `campanha`, é preciso liberar esse schema para a API:

1. Abra o Dashboard do Supabase → **Project Settings → API**.
2. Em **Exposed schemas**, adicione `campanha` à lista (mantenha `public, graphql_public`).
3. Salve. O PostgREST recarrega em segundos.

Sem isso, queries do client retornarão erro `schema must be one of ...`.

### Primeiro acesso (criar usuário admin)

Não há cadastro público. Para criar o primeiro admin:

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**.
2. Defina e-mail + senha (marque "Auto Confirm User").
3. Após aplicar as migrations da Fase 2, insira o perfil dele:
   ```sql
   INSERT INTO campanha.profiles (id, nome, role, ativo)
   VALUES ('<uuid-do-auth.users>', 'Nome do Admin', 'admin', true);
   ```

A partir daí o admin pode criar/desativar outros usuários pela tela `/configuracoes` (Fase 9).

---

## Estrutura de pastas

```
app/
  (auth)/login/           ← login com e-mail + senha
  (app)/                  ← rotas autenticadas (sidebar + topbar)
    dashboard/
    apoiadores/[ novo · [id] ]
    liderancas/[ novo · [id] ]
    metas/
    demandas/[ nova · [id] ]
    relatorios/
    configuracoes/
components/
  ui/                     ← shadcn/ui base (button, input, label, card, …)
  app/                    ← componentes específicos do app (sidebar, topbar, kpi-card, …)
  providers.tsx           ← TanStack Query
lib/
  supabase/{client,server,middleware}.ts   ← clients com db.schema='campanha'
  utils/{cn,cpf,titulo-eleitor,formatters}.ts
  validations/{apoiador,lideranca,demanda}.ts  ← schemas Zod
middleware.ts             ← protege (app)/*, refresh de sessão
types/
  database.ts             ← gerado via MCP `generate_typescript_types`
  index.ts
supabase/
  migrations/             ← histórico SQL versionado (espelho do que foi aplicado via MCP)
```

---

## Comandos shadcn/ui adicionais

Já incluídos (manualmente): `button`, `input`, `label`, `card`.
Para os demais previstos no HANDOFF §7, rode quando precisar:

```bash
npx shadcn@latest add select textarea checkbox
npx shadcn@latest add table dialog drawer sheet tabs badge
npx shadcn@latest add dropdown-menu avatar separator form command
```

---

## Roadmap

Veja **§9 do `HANDOFF.md`**. Status atual:

- [x] **Setup base** (Next.js + Tailwind + shadcn + clients Supabase + estrutura de pastas)
- [ ] **Migrations 0001–0008** (schema `campanha`, tabelas, RLS, views, storage) — Fase 2
- [ ] **Tipos TS gerados** do schema real (substituir `types/database.ts` placeholder)
- [ ] **Layout autenticado completo** (Sidebar + Topbar replicando o protótipo)
- [ ] **CRUD de Lideranças**
- [ ] **CRUD de Apoiadores** + importação CSV
- [ ] **Demandas** (kanban / timeline / anexos)
- [ ] **Metas**, **Dashboard**, **Relatórios**, **Configurações**
