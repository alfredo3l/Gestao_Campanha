# Gestão de Campanha — Handoff para Cursor

> Documento de contexto para retomar o desenvolvimento no Cursor.
> Cole este arquivo no projeto e use-o como referência inicial para o agente.

---

## 1. Sobre o projeto

Sistema interno de **gestão de campanha eleitoral** para candidatura a
**Deputado Estadual no Mato Grosso do Sul**.

A campanha precisa de uma plataforma única onde a coordenação:

- cadastra **apoiadores** (eleitores que prometeram voto ou estão sendo trabalhados);
- organiza **lideranças** (coordenadores regionais, líderes de bairro, líderes rurais);
- vincula cada apoiador a uma liderança responsável;
- define **metas de votos** por região geográfica do estado;
- recebe e acompanha **demandas** dos eleitores (saúde, infraestrutura, etc.).

O sistema é **desktop-first** (uso principal no escritório de coordenação),
mas precisa ser totalmente responsivo — cabos eleitorais usarão pelo celular em campo.

---

## 2. Stack técnica

| Camada           | Tecnologia                                       |
|------------------|--------------------------------------------------|
| Framework        | **Next.js 14** (App Router) + TypeScript         |
| Estilização      | **Tailwind CSS** + **shadcn/ui**                 |
| Banco / Auth     | **Supabase** (Postgres + Auth + RLS)             |
| Storage          | **Supabase Storage** (anexos de demandas)        |
| Realtime         | **Supabase Realtime** (kanban, comentários)      |
| Dados / cache    | **TanStack Query**                               |
| Forms / valid.   | **react-hook-form** + **Zod**                    |
| Tabelas          | **TanStack Table**                               |
| Gráficos         | **Recharts** (suficiente para o que o protótipo mostra) |
| Ícones           | **lucide-react**                                 |

---

## 3. Telas e fluxos

O protótipo HTML já navega entre estas 12 telas:

### Autenticação
- **`/login`** — Login com e-mail/senha + opção Google Workspace.
  - Magic link via Supabase Auth é o caminho mais rápido.
  - Restringir cadastro a convites (não há registro público).

### Principal
- **`/`** ou **`/dashboard`** — Visão geral com KPIs (apoiadores, lideranças
  ativas, meta de votos, demandas abertas), gráfico de evolução de cadastros,
  donut de meta, top lideranças, demandas urgentes, cadastros recentes.

### Cadastros
- **`/apoiadores`** — Lista com filtros (busca, status, município, liderança),
  importação CSV, exportação.
- **`/apoiadores/novo`** e **`/apoiadores/[id]`** — Formulário com seções:
  dados pessoais, título de eleitor, endereço, vínculo (liderança),
  tags + observações.
- **`/liderancas`** — Lista com visão em cards (default) e tabela.
- **`/liderancas/novo`** — Formulário com cargo, contato, localidade e
  meta inicial de votos.
- **`/liderancas/[id]`** — Detalhe com KPIs da liderança e abas:
  Apoiadores · Demandas · Atividade.

### Planejamento
- **`/metas`** — Tabela de regiões com progresso (eleitores, lideranças,
  % atingido, meta), projeção mensal e resumo executivo (cenário, folga vs.
  quociente eleitoral, regiões em atenção).

### Atendimento
- **`/demandas`** — Kanban com 3 colunas (Aberta · Em andamento · Resolvida)
  ou Timeline agrupada por semana. Filtros por categoria, prioridade, liderança.
- **`/demandas/nova`** e **`/demandas/[id]`** — Formulário completo +
  histórico/comentários + anexos.

### Análise / Admin
- **`/relatorios`** — Cards de relatórios disponíveis + gráfico de performance.
- **`/configuracoes`** — Usuários, permissões, categorias, integração Supabase.

---

## 4. Modelo de dados (Supabase / Postgres)

Use estes tipos enumerados:

```sql
CREATE TYPE role_usuario  AS ENUM ('admin', 'coordenador', 'operador', 'visualizador');
CREATE TYPE status_apoio  AS ENUM ('confirmado', 'provavel', 'indeciso', 'contato', 'nao_vota');
CREATE TYPE cargo_lider   AS ENUM ('coord_regional', 'coord_zona', 'lider_bairro', 'lider_comunitario', 'lider_rural');
CREATE TYPE status_demanda AS ENUM ('aberta', 'andamento', 'resolvida', 'cancelada');
CREATE TYPE prioridade    AS ENUM ('baixa', 'media', 'alta', 'urgente');
```

### Tabelas

**`profiles`** — espelha `auth.users` com dados do app.
```
id (uuid, PK = auth.users.id) | nome | role | ativo | created_at
```

**`liderancas`**
```
id (uuid) | nome | cargo (cargo_lider) | municipio | bairro | tel | email
meta_votos (int) | ativa (bool) | profile_id (FK profiles, nullable)
created_at | updated_at | created_by (FK profiles)
```

**`apoiadores`**
```
id (uuid) | nome | cpf (unique) | titulo_eleitor | zona | secao
tel | email | nascimento (date)
endereco | bairro | municipio | cep
lider_id (FK liderancas) | status (status_apoio)
indicado_por | observacoes | created_at | updated_at | created_by
```

**`apoiador_tags`** — N:N
```
apoiador_id (FK) | tag (text)
PK (apoiador_id, tag)
```

**`metas_regiao`**
```
id | regiao (text) | municipios (text[]) | eleitores (int)
meta_votos (int) | prazo (date) | created_at
```

**`demandas`**
```
id (uuid) | codigo (text, ex: D-2401, gerado por trigger)
titulo | descricao | categoria | prioridade (prioridade) | status (status_demanda)
solicitante_id (FK apoiadores, nullable)
lider_id (FK liderancas) | prazo (date)
created_at | updated_at | created_by | resolvida_em (timestamp)
```

**`demanda_movimentacoes`** — histórico/comentários
```
id | demanda_id (FK) | autor_id (FK profiles)
tipo (text: 'comentario' | 'status_change' | 'anexo')
texto | metadata (jsonb) | criada_em
```

**`demanda_anexos`**
```
id | demanda_id (FK) | storage_path | nome | mime | tamanho | created_at
```

### Views úteis

- **`v_dashboard_kpis`** — totais para o dashboard.
- **`v_progresso_lideranca`** — apoiadores + votos projetados + % meta.
- **`v_progresso_regiao`** — agregação para `/metas`.

### Índices
Criar índices em: `apoiadores.lider_id`, `apoiadores.municipio`, `apoiadores.status`,
`demandas.status`, `demandas.lider_id`, `demandas.prazo`.

### RLS (Row Level Security) — ATIVAR EM TODAS AS TABELAS

Política recomendada:

- **`admin`** vê e edita tudo.
- **`coordenador`** vê e edita lideranças/apoiadores/demandas das suas regiões
  (definir `regiao` no profile, ou usar `liderancas.profile_id`).
- **`operador`** pode criar/editar apoiadores e demandas, sem deletar.
- **`visualizador`** apenas SELECT.

```sql
-- Exemplo para apoiadores
CREATE POLICY "Coord vê seus apoiadores"
ON apoiadores FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR lider_id IN (
    SELECT id FROM liderancas WHERE profile_id = auth.uid()
  )
);
```

---

## 5. Regras de negócio importantes

1. **Vínculo obrigatório**: todo apoiador tem **uma e somente uma** liderança.
2. **Meta automática**: a meta da liderança soma para a meta da região.
3. **Quociente eleitoral (MS)**: usar como referência ~28.500 votos para
   Deputado Estadual — exibir folga no `/metas`.
4. **CPF**: validar dígito verificador no front e adicionar `CHECK` no banco
   (formato + tamanho).
5. **Título de eleitor**: 12 dígitos, validar dígitos verificadores.
6. **LGPD**: registrar consentimento no cadastro, ter `data_consentimento`
   no apoiador, permitir exclusão sob solicitação.
7. **Auditoria**: trigger genérica para gravar `created_by`/`updated_by`.

---

## 6. Sistema visual

Já implementado no `styles.css` — replicar como `tailwind.config.ts`.

**Cores principais:**
```
brand-900: #0a2540   (azul-marinho institucional)
brand-800: #0f3a5f   (primary)
brand-700: #16507f
brand-500: #2683bf

green-700: #156b3f   (secondary)
green-500: #2ba867

gold-500:  #d4a124   (accent, uso restrito)

status-red: #b3261e, status-amber: #a26511, status-green: #15803d, status-blue: #1d6aa0
```

**Tipografia:**
- Sans: **Public Sans** (corpo, UI, números com `tabular-nums`)
- Serif: **Source Serif 4** (KPIs, títulos de página)
- Mono: **JetBrains Mono** (CPF, ID, chaves)

**Raio:** 4 / 6 / 10 / 14 px
**Densidade:** linhas de tabela 12px vertical, fontes base 13–14px.

---

## 7. Componentes shadcn a instalar

```
npx shadcn-ui add button input label select textarea checkbox
npx shadcn-ui add table dialog drawer sheet tabs badge
npx shadcn-ui add dropdown-menu avatar separator card form
npx shadcn-ui add command (para busca global)
npx shadcn-ui add toast (sonner)
```

---

## 8. Estrutura de pastas sugerida

```
app/
  (auth)/login/page.tsx
  (app)/
    layout.tsx                 ← sidebar + topbar
    dashboard/page.tsx
    apoiadores/
      page.tsx                 ← lista
      novo/page.tsx
      [id]/page.tsx            ← editar
    liderancas/
      page.tsx
      novo/page.tsx
      [id]/page.tsx
    metas/page.tsx
    demandas/
      page.tsx
      nova/page.tsx
      [id]/page.tsx
    relatorios/page.tsx
    configuracoes/page.tsx
components/
  ui/                          ← shadcn
  app/
    sidebar.tsx
    topbar.tsx
    kpi-card.tsx
    progress-bar.tsx
    avatar-initials.tsx
    status-badge.tsx
    demand-card.tsx
    line-chart.tsx, bar-chart.tsx
lib/
  supabase/
    client.ts                  ← createBrowserClient
    server.ts                  ← createServerClient
    middleware.ts              ← refresh session
  validations/
    apoiador.ts                ← zod schemas
    lideranca.ts
    demanda.ts
  utils/
    cpf.ts, titulo-eleitor.ts, formatters.ts
types/database.ts              ← gerado via `supabase gen types typescript`
supabase/
  migrations/
    0001_initial.sql
    0002_rls.sql
    0003_triggers.sql
  seed.sql                     ← dados de exemplo (opcional)
```

---

## 9. Ordem de implementação recomendada

1. **Setup**
   - Criar projeto no Supabase, criar `.env.local` com URL e ANON KEY.
   - Subir migration 0001 (tabelas + enums).
   - Configurar Supabase Auth (e-mail/senha; convites manuais).
2. **Auth + layout**
   - Middleware de proteção de rotas.
   - Layout `/app` com Sidebar + Topbar (copiar visual do protótipo).
3. **Lideranças** (CRUD completo — é a entidade mais simples)
4. **Apoiadores** (CRUD + filtros + importação CSV via PapaParse)
5. **Demandas** (kanban → timeline → anexos via Supabase Storage)
6. **Metas** (views materializadas + tela de progresso)
7. **Dashboard** (queries de agregação)
8. **Relatórios e exportações**
9. **Configurações** (gestão de usuários + convites)
10. **Polimento mobile + PWA opcional**

---

## 10. Prompt inicial para o Cursor Agent

> Estou desenvolvendo um sistema de **gestão de campanha eleitoral** para um
> candidato a Deputado Estadual no MS. Quero usar **Next.js 14 (App Router) +
> TypeScript + Tailwind + shadcn/ui + Supabase**.
>
> Use o arquivo **HANDOFF.md** como contexto completo do projeto (telas, modelo
> de dados, regras de negócio, paleta visual).
>
> Comece criando: (1) a estrutura de pastas conforme a seção 8, (2) o
> `tailwind.config.ts` com os tokens da seção 6, (3) a migration inicial
> em `supabase/migrations/0001_initial.sql` com os enums e tabelas da seção 4,
> e (4) os clients Supabase (browser, server, middleware).
>
> Não implemente as telas ainda — só o esqueleto. Pergunte antes de fazer
> qualquer suposição sobre regras de negócio.

---

## 11. Referência visual

O HTML em `Gestão de Campanha.html` é a **fonte da verdade visual e de fluxo**.
Abra no navegador, navegue pelas telas, e replique a estrutura em React/Tailwind.
Os componentes do protótipo (`ui.jsx`, `dashboard.jsx`, etc.) servem como
guia de marcação — não são para serem migrados literalmente, e sim como
referência de hierarquia visual.

---

_Última atualização: 24/05/2026_
