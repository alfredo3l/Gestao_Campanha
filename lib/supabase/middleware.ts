import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

/**
 * Atualiza a sessão do Supabase em todo request e protege as rotas autenticadas.
 *
 * Performance:
 *  - Para rotas públicas, retorna imediatamente sem instanciar o client Supabase.
 *  - Para rotas privadas, usa `getSession()` (lê apenas o cookie local — sem rede).
 *    A validação forte do usuário fica a cargo do layout autenticado, que já
 *    chama `auth.getUser()` uma única vez por navegação.
 *
 * Regras:
 *   /login            → público
 *   /auth/*           → público (callbacks, reset de senha, etc.)
 *   tudo o resto      → exige sessão; caso contrário redireciona para /login?next=...
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStatic =
    pathname.startsWith("/_next") || pathname === "/favicon.ico";
  if (isStatic) return NextResponse.next({ request });

  const isPublic = pathname.startsWith("/login") || pathname.startsWith("/auth");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Defesa contra MIDDLEWARE_INVOCATION_FAILED: se as variáveis Supabase não
  // estiverem configuradas (ex.: deploy sem env vars na Vercel), libera o
  // request em vez de derrubar o site inteiro com erro 500. A autenticação
  // ainda será exigida pelo layout autenticado / RLS no banco.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes — configure no painel da Vercel."
    );
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database, "campanha">(
    supabaseUrl,
    supabaseAnonKey,
    {
      db: { schema: "campanha" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // `getSession()` lê o cookie e renova o JWT quando necessário, sem roundtrip
  // a cada request (diferente de `getUser()`). Mas o cookie pode estar
  // corrompido / com JWT expirado / pertencendo a um projeto Supabase antigo.
  // Em qualquer falha aqui consideramos "sem sessão" e LIMPAMOS os cookies
  // antes de redirecionar — isso evita o loop com o layout autenticado, que
  // valida o usuário de verdade via `getUser()`.
  let hasValidSession = false;
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!error && session) {
      // Confere validade temporal — JWT expirado é tratado como sem sessão.
      const exp = session.expires_at ? session.expires_at * 1000 : 0;
      hasValidSession = exp > Date.now();
    }
  } catch (error) {
    console.error("[middleware] Erro ao validar sessão Supabase:", error);
    hasValidSession = false;
  }

  // Rota pública: deixa entrar. Não redirecionamos /login → /dashboard
  // baseado em sessão — o layout autenticado é a fonte da verdade. Isso
  // remove a possibilidade de loop quando o cookie está corrompido.
  if (isPublic) return response;

  // Rota privada sem sessão válida: limpa cookies de auth e manda para /login.
  if (!hasValidSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        redirect.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    }
    return redirect;
  }

  return response;
}
