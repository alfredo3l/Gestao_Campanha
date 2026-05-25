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

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  // Rotas públicas: não instancia client, não toca cookie, não bate em rede.
  if (isPublic) {
    // Caso especial: se já existe sessão e o usuário tenta acessar /login,
    // redireciona para o dashboard. Aqui ainda lemos o cookie localmente.
    if (pathname === "/login") {
      const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
      if (hasAuthCookie) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.searchParams.delete("next");
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database, "campanha">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // `getSession()` lê apenas o cookie e renova o JWT quando expirado.
  // Não faz roundtrip ao Supabase Auth a cada request — diferença grande vs `getUser()`.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
