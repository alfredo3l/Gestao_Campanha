# Tela de Login — Especificação para o Cursor

> Documento de especificação **pixel-fiel** da tela de login do sistema
> de Gestão de Campanha. Use como contexto para replicar em
> **Next.js 14 + Tailwind + shadcn/ui + Supabase Auth**.

---

## 1. Visão geral

Tela de **login institucional** dividida em duas colunas no desktop:

- **Esquerda (hero, ~52% da largura):** fundo azul-marinho com gradientes
  radiais sutis, logo "Campanha 25", chamada principal, parágrafo de
  apoio, 3 estatísticas em destaque e rodapé com aviso de LGPD.
- **Direita (~48%):** card branco centralizado com formulário de login,
  link de recuperação de senha, botão de Google Workspace e aviso de
  acesso por convite.

No **mobile**, as colunas viram uma só (hero no topo, card abaixo).

---

## 2. Design tokens

### 2.1 Cores

```css
/* Brand — azul-marinho institucional */
--brand-900: #0a2540;   /* fundo do hero */
--brand-800: #0f3a5f;   /* primário (botões) */
--brand-700: #16507f;
--brand-600: #1d6aa0;
--brand-500: #2683bf;   /* foco em inputs */
--brand-100: #e5eef6;
--brand-50:  #f3f7fb;

/* Accent */
--gold-500:  #d4a124;   /* letra do crest */

/* Verde institucional (sucesso) */
--green-700: #156b3f;

/* Neutros (warm gray) */
--ink-900: #0e1623;
--ink-800: #1c2638;
--ink-700: #344155;
--ink-600: #4a5670;
--ink-500: #6a7689;     /* texto secundário */
--ink-400: #8f99aa;
--ink-200: #dde2ea;     /* borda de inputs */
--ink-100: #ecf0f5;
--ink-50:  #f6f8fb;
--bg:      #f4f6fa;     /* fundo da coluna direita */
--white:   #ffffff;
```

### 2.2 Tipografia

| Uso              | Fonte             | Peso | Tamanho | Detalhe                          |
|------------------|-------------------|------|---------|----------------------------------|
| Headline (hero)  | Source Serif 4    | 600  | 38px    | line-height 1.15, letter-spacing -0.5px |
| Título do card   | Source Serif 4    | 600  | 22px    | cor `--ink-900`                  |
| Body do hero     | Public Sans       | 400  | 15px    | cor `rgba(255,255,255,0.75)`, line-height 1.55 |
| Lead (sub-título)| Public Sans       | 400  | 13.5px  | cor `--ink-500`                  |
| Labels           | Public Sans       | 600  | 12px    | cor `--ink-700`                  |
| Input            | Public Sans       | 400  | 13px    | cor `--ink-800`                  |
| Botão            | Public Sans       | 600  | 13px    |                                  |
| Stats (números)  | Source Serif 4    | 600  | 26px    | branco                            |
| Stats (label)    | Public Sans       | 400  | 11.5px  | cor `rgba(255,255,255,0.6)`, uppercase, letter-spacing 0.8px |
| Foot             | Public Sans       | 400  | 12px    | cor `rgba(255,255,255,0.45)`     |

**Carregar via Google Fonts:**

```html
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" rel="stylesheet">
```

### 2.3 Espaçamento, raio, sombra

```css
--r-md: 6px;     /* botões e inputs */
--r-lg: 10px;
--r-xl: 12px;    /* card do login */

/* Sombras */
--sh-lg: 0 8px 24px rgba(15, 35, 65, 0.12), 0 2px 6px rgba(15, 35, 65, 0.06);
```

- Padding do hero: **56px 64px**
- Padding do card: **36px**
- Gap interno do card: padrão (margin-bottom 14px em `.field`)
- Padding interno dos botões grandes: **10px** vertical, full width
- Padding dos inputs: **8px 11px**

---

## 3. Layout

### Container raiz

```css
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;   /* hero ligeiramente mais largo */
  background:
    radial-gradient(1100px 600px at 80% 20%, rgba(38, 131, 191, 0.12), transparent 60%),
    radial-gradient(900px 500px at 10% 80%, rgba(31, 138, 82, 0.10), transparent 60%),
    var(--brand-900);
}

/* Mobile */
@media (max-width: 880px) {
  .login-page { grid-template-columns: 1fr; }
}
```

### Coluna esquerda (hero)

```css
.hero {
  padding: 56px 64px;
  color: var(--white);
  display: flex;
  flex-direction: column;
  justify-content: space-between;  /* top, mid, foot distribuídos */
}
```

Estrutura vertical do hero:

1. **Topo** — logo + nome do produto
2. **Meio** — headline + parágrafo + estatísticas
3. **Rodapé** — texto pequeno com aviso de LGPD

### Coluna direita (card)

```css
.form-side {
  background: var(--bg);
  display: grid;
  place-items: center;
  padding: 40px;
}
.login-card {
  background: var(--white);
  border-radius: 12px;
  border: 1px solid var(--ink-200);
  box-shadow: var(--sh-lg);
  padding: 36px;
  width: 100%;
  max-width: 410px;
}
```

---

## 4. Componentes da página — detalhamento

### 4.1 Crest (logo "CM")

Quadrado **44×44px**, raio 8px, gradiente diagonal.
Letras **"CM"** em Source Serif 4, peso 700, 20px, cor `--gold-500`.

```css
.crest {
  width: 44px; height: 44px;
  border-radius: 8px;
  background: linear-gradient(155deg, #1d6aa0, #0a2540 70%);
  display: grid; place-items: center;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 20px;
  color: var(--gold-500);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
}
```

Ao lado: bloco com duas linhas.

- **Linha 1:** "Campanha 25" — Public Sans 600, 14px, branco, letter-spacing 0.3px
- **Linha 2:** "Gestão de Campanha · MS" — Public Sans 400, 11.5px, `rgba(255,255,255,0.55)`

### 4.2 Headline e parágrafo

```html
<h2>Coordene a campanha<br/>com clareza de dados.</h2>
<p>
  Cadastre apoiadores, organize lideranças por bairro, acompanhe metas
  de votos por região e responda demandas dos eleitores em um único lugar.
</p>
```

- `<h2>`: Source Serif 4, 38px, peso 600, line-height 1.15, margin 0 0 14px
- `<p>`: max-width 460px, line-height 1.55, cor `rgba(255,255,255,0.75)`

### 4.3 Estatísticas (3 colunas)

```css
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 28px;
  max-width: 460px;
}
```

Para cada item:

- **Valor (`.v`)**: Source Serif 4, 26px, peso 600, branco.
- **Label (`.l`)**: Public Sans 11.5px, `rgba(255,255,255,0.6)`,
  text-transform uppercase, letter-spacing 0.8px, margin-top 4px.

Conteúdo dos 3 stats:

| Valor   | Label              |
|---------|--------------------|
| 12      | Lideranças ativas  |
| 1.412   | Apoiadores         |
| 41,2%   | Meta atingida      |

### 4.4 Rodapé do hero

Public Sans, 12px, cor `rgba(255,255,255,0.45)`.
Texto: **"© 2026 · Sistema interno de coordenação. Dados protegidos pela LGPD."**

### 4.5 Card de formulário

Estrutura na ordem:

1. **Título** — "Entrar no sistema"
2. **Lead** — "Acesse com seu e-mail institucional da campanha."
3. **Field: E-mail** (placeholder `voce@campanha.app`)
4. **Field: Senha** (placeholder `••••••••`)
5. **Linha extra** — checkbox "Manter conectado" à esquerda; link
   "Esqueci minha senha" à direita.
6. **Botão primário** — "Entrar" (full width, padding vertical 10px).
   Quando carregando, texto vira "Entrando…" e fica disabled.
7. **Divider** — "OU" centralizado, linhas horizontais nas laterais.
8. **Botão secundário** — "Entrar com Google Workspace" (full width,
   borda `--ink-200`, ícone Google colorido oficial à esquerda).
9. **Aviso final** — "Acesso restrito · solicite convite ao coordenador"
   (centralizado, 12px, `--ink-500`).

### 4.6 Field (label + input)

```css
.field {
  display: flex; flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
}
.field label {
  font-size: 12px; font-weight: 600;
  color: var(--ink-700);
}
.field input {
  padding: 8px 11px;
  border: 1px solid var(--ink-200);
  border-radius: 6px;
  background: var(--white);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus {
  border-color: var(--brand-500);
  box-shadow: 0 0 0 3px rgba(38, 131, 191, 0.12);
}
```

### 4.7 Linha "extra" (checkbox + link)

```css
.extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  margin: -4px 0 12px;
}
```

- Checkbox: nativo, label "Manter conectado" em `--ink-600`.
- Link: cor `--brand-700`, hover com sublinhado.

### 4.8 Botão primário "Entrar"

```css
.btn-primary {
  background: var(--brand-800);
  color: var(--white);
  border: 1px solid var(--brand-800);
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  padding: 10px;
  width: 100%;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.12s;
}
.btn-primary:hover { background: var(--brand-900); border-color: var(--brand-900); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
```

### 4.9 Divider "OU"

```css
.divider {
  text-align: center;
  color: var(--ink-400);
  font-size: 11.5px;
  margin: 22px 0 16px;
  position: relative;
}
.divider::before, .divider::after {
  content: "";
  position: absolute; top: 50%;
  width: 38%; height: 1px;
  background: var(--ink-200);
}
.divider::before { left: 0; }
.divider::after  { right: 0; }
```

### 4.10 Botão Google Workspace

- Estrutura igual ao primary, mas com `background: var(--white)`,
  `color: var(--ink-800)`, `border-color: var(--ink-200)`.
- Hover: `background: var(--ink-50)`, `border-color: var(--ink-300)`.
- Ícone Google **colorido oficial** (4 cores) à esquerda, 16×16px,
  gap 7px com o texto.

```svg
<svg width="16" height="16" viewBox="0 0 24 24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>
```

---

## 5. Estrutura HTML completa (referência)

```html
<div class="login-page">

  <!-- HERO -->
  <section class="hero">
    <header class="top">
      <div class="crest">CM</div>
      <div>
        <div class="brand-name">Campanha 25</div>
        <div class="brand-sub">Gestão de Campanha · MS</div>
      </div>
    </header>

    <div>
      <h2>Coordene a campanha<br/>com clareza de dados.</h2>
      <p>
        Cadastre apoiadores, organize lideranças por bairro,
        acompanhe metas de votos por região e responda demandas
        dos eleitores em um único lugar.
      </p>
      <div class="stats">
        <div><div class="v">12</div>    <div class="l">Lideranças ativas</div></div>
        <div><div class="v">1.412</div> <div class="l">Apoiadores</div></div>
        <div><div class="v">41,2%</div> <div class="l">Meta atingida</div></div>
      </div>
    </div>

    <footer class="foot">
      © 2026 · Sistema interno de coordenação. Dados protegidos pela LGPD.
    </footer>
  </section>

  <!-- FORM -->
  <section class="form-side">
    <form class="login-card" onSubmit="...">
      <h3>Entrar no sistema</h3>
      <p class="lead">Acesse com seu e-mail institucional da campanha.</p>

      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" type="email" placeholder="voce@campanha.app"/>
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input id="password" type="password" placeholder="••••••••"/>
      </div>

      <div class="extra">
        <label><input type="checkbox" defaultChecked/> Manter conectado</label>
        <a href="/recuperar-senha">Esqueci minha senha</a>
      </div>

      <button type="submit" class="btn-primary">Entrar</button>

      <div class="divider">OU</div>

      <button type="button" class="btn-secondary">
        <!-- Google logo SVG -->
        Entrar com Google Workspace
      </button>

      <div class="foot-card">
        Acesso restrito · solicite convite ao coordenador
      </div>
    </form>
  </section>
</div>
```

---

## 6. Tradução para Tailwind + shadcn/ui (Next.js)

### 6.1 `tailwind.config.ts` (parcial)

```ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f3f7fb',
          100: '#e5eef6',
          500: '#2683bf',
          600: '#1d6aa0',
          700: '#16507f',
          800: '#0f3a5f',
          900: '#0a2540',
        },
        ink: {
          50:  '#f6f8fb',
          100: '#ecf0f5',
          200: '#dde2ea',
          300: '#b9c1cd',
          400: '#8f99aa',
          500: '#6a7689',
          600: '#4a5670',
          700: '#344155',
          800: '#1c2638',
          900: '#0e1623',
        },
        gold: { 500: '#d4a124' },
      },
      fontFamily: {
        sans:  ['"Public Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(15,35,65,0.12), 0 2px 6px rgba(15,35,65,0.06)',
      },
    },
  },
}
```

### 6.2 `app/(auth)/login/page.tsx` (esqueleto)

```tsx
import { LoginForm } from './login-form';
import { CrestLogo } from '@/components/app/crest-logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.05fr_1fr]
                    bg-brand-900
                    bg-[radial-gradient(1100px_600px_at_80%_20%,rgba(38,131,191,0.12),transparent_60%),
                        radial-gradient(900px_500px_at_10%_80%,rgba(31,138,82,0.10),transparent_60%)]">
      {/* HERO */}
      <section className="px-8 md:px-16 py-14 text-white flex flex-col justify-between gap-12">
        <header className="flex items-center gap-3">
          <CrestLogo />
          <div>
            <div className="font-semibold tracking-tight">Campanha 25</div>
            <div className="text-[11.5px] text-white/55">Gestão de Campanha · MS</div>
          </div>
        </header>

        <div>
          <h2 className="font-serif text-[38px] font-semibold leading-[1.15] tracking-tight mb-3.5">
            Coordene a campanha<br/>com clareza de dados.
          </h2>
          <p className="max-w-[460px] text-[15px] leading-[1.55] text-white/75">
            Cadastre apoiadores, organize lideranças por bairro,
            acompanhe metas de votos por região e responda demandas
            dos eleitores em um único lugar.
          </p>
          <div className="grid grid-cols-3 gap-x-6 mt-7 max-w-[460px]">
            <Stat value="12"    label="Lideranças ativas"/>
            <Stat value="1.412" label="Apoiadores"/>
            <Stat value="41,2%" label="Meta atingida"/>
          </div>
        </div>

        <footer className="text-xs text-white/45">
          © 2026 · Sistema interno de coordenação. Dados protegidos pela LGPD.
        </footer>
      </section>

      {/* FORM */}
      <section className="bg-[#f4f6fa] grid place-items-center p-10">
        <div className="bg-white border border-ink-200 rounded-xl shadow-card p-9 w-full max-w-[410px]">
          <h3 className="font-serif text-[22px] font-semibold text-ink-900 mb-1">
            Entrar no sistema
          </h3>
          <p className="text-ink-500 text-[13.5px] mb-6">
            Acesse com seu e-mail institucional da campanha.
          </p>
          <LoginForm/>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-[26px] font-semibold text-white">{value}</div>
      <div className="text-[11.5px] text-white/60 uppercase tracking-[0.05em] mt-1">{label}</div>
    </div>
  );
}
```

### 6.3 `login-form.tsx` com Supabase Auth

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export function LoginForm() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-ink-700">E-mail</Label>
        <Input id="email" type="email" required
               placeholder="voce@campanha.app"
               value={email} onChange={(e) => setEmail(e.target.value)}/>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-ink-700">Senha</Label>
        <Input id="password" type="password" required
               placeholder="••••••••"
               value={password} onChange={(e) => setPassword(e.target.value)}/>
      </div>

      <div className="flex items-center justify-between text-[12.5px] -mt-1">
        <label className="flex items-center gap-1.5 text-ink-600">
          <Checkbox defaultChecked/> Manter conectado
        </label>
        <Link href="/recuperar-senha" className="text-brand-700 hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      {error && <p className="text-status-red text-xs">{error}</p>}

      <Button type="submit" disabled={loading}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white font-semibold py-2.5">
        {loading ? 'Entrando…' : 'Entrar'}
      </Button>

      <div className="relative my-5 text-center text-[11.5px] text-ink-400">
        <span className="bg-white px-3 relative z-10">OU</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-ink-200"/>
      </div>

      <Button type="button" variant="outline" onClick={signInGoogle}
              className="w-full border-ink-200 text-ink-800 hover:bg-ink-50 font-semibold py-2.5 gap-2">
        <GoogleIcon/> Entrar com Google Workspace
      </Button>

      <p className="text-center text-xs text-ink-500 mt-4">
        Acesso restrito · solicite convite ao coordenador
      </p>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
```

### 6.4 `CrestLogo`

```tsx
export function CrestLogo() {
  return (
    <div className="w-11 h-11 rounded-lg grid place-items-center
                    font-serif font-bold text-xl text-gold-500
                    bg-[linear-gradient(155deg,#1d6aa0,#0a2540_70%)]
                    shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
      CM
    </div>
  );
}
```

---

## 7. Comportamento e estados

| Estado            | Comportamento                                                        |
|-------------------|----------------------------------------------------------------------|
| **Inicial**       | Inputs vazios; botão "Entrar" habilitado.                            |
| **Validação**     | E-mail precisa ser válido; senha mínimo 8 caracteres.                |
| **Loading**       | Botão muda para "Entrando…" e fica disabled durante a chamada.       |
| **Erro de auth**  | Exibir mensagem `text-status-red` (vermelho `#b3261e`) abaixo dos campos. |
| **Sucesso**       | `router.push('/dashboard')`. Sessão persistida pelo cookie do Supabase. |
| **Lembrar-me**    | Checkbox marcado → sessão de longa duração; desmarcado → expira no fim da sessão. |
| **Google OAuth**  | Redireciona para `/auth/callback` que troca o code por sessão.       |
| **Esqueci senha** | Link para `/recuperar-senha` (envia magic link via Supabase).        |

---

## 8. Responsividade

| Breakpoint    | Comportamento                                                  |
|---------------|----------------------------------------------------------------|
| `≥ 1024px`    | Layout duas colunas (hero + form), padrão.                     |
| `768–1023px`  | Mantém duas colunas, padding do hero reduz para `40px 36px`.   |
| `< 768px`     | Uma coluna vertical: hero em cima (reduzido, sem stats ou com stats em row), card abaixo. Card vira full width com margens de 16px. |

```css
@media (max-width: 880px) {
  .login-page { grid-template-columns: 1fr; }
  .hero { padding: 32px 24px; }
  .hero h2 { font-size: 28px; }
  .form-side { padding: 16px; }
}
```

---

## 9. Acessibilidade

- Todos os inputs com `<label>` associado por `htmlFor`/`id`.
- Botão de login com `type="submit"`.
- Mensagem de erro com `role="alert"` ou `aria-live="polite"`.
- Contraste do botão primário: branco sobre `#0f3a5f` = 9.7:1 (AAA).
- Foco visível nos inputs (`box-shadow` azul de 3px).
- Crest com `aria-hidden="true"` (decorativo).

---

## 10. Integração com Supabase Auth

### Variáveis de ambiente (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Client browser (`lib/supabase/client.ts`)

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Middleware de proteção (`middleware.ts`)

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach((c) => res.cookies.set(c.name, c.value, c.options)),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');

  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/public).*)'],
};
```

### Tabela `profiles` (trigger pós-cadastro)

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  role role_usuario NOT NULL DEFAULT 'visualizador',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Cria profile automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, nome)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nome', new.email));
  RETURN new;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

---

## 11. Checklist de implementação

- [ ] Instalar Tailwind e copiar tokens da seção 6.1
- [ ] Configurar Google Fonts (Public Sans + Source Serif 4)
- [ ] Criar `app/(auth)/login/page.tsx` com layout em duas colunas
- [ ] Criar `LoginForm` client component
- [ ] Criar `CrestLogo` reutilizável
- [ ] Configurar `lib/supabase/client.ts` e `lib/supabase/server.ts`
- [ ] Criar `middleware.ts` de proteção de rotas
- [ ] Criar tabela `profiles` + trigger `handle_new_user`
- [ ] Configurar OAuth com Google no painel do Supabase (Authentication > Providers)
- [ ] Criar rota `/auth/callback` para troca de code → session
- [ ] Criar rota `/recuperar-senha` (out of scope deste doc)
- [ ] Validar contraste, foco e responsividade

---

## 12. Prompt para colar no Cursor Agent

> Use o arquivo **`tela-login.md`** como especificação completa.
> Implemente exatamente a tela de login descrita: layout em duas colunas
> (hero + card), tokens visuais (cores, tipografia, espaçamento) e
> comportamento listados.
>
> Stack: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase Auth.
>
> Crie:
> 1. Atualize `tailwind.config.ts` com a paleta da seção 6.1
> 2. `app/(auth)/login/page.tsx` (página)
> 3. `app/(auth)/login/login-form.tsx` (form client)
> 4. `components/app/crest-logo.tsx` (logo)
> 5. `lib/supabase/client.ts` (Supabase browser client)
> 6. `middleware.ts` (proteção de rotas, conforme seção 10)
>
> Não implemente "recuperar senha" agora — apenas deixe o link apontando
> para `/recuperar-senha`. Pergunte se houver ambiguidade.

---

_Especificação versionada em 24/05/2026 — Gestão de Campanha · MS_
