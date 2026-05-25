import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Client Supabase para uso server-side (Server Components, Server Actions, Route Handlers).
 *
 * Importante: trabalha no schema `campanha` por padrão.
 * Cookies do Next 14 são sync; a API `cookies()` aqui é usada de forma síncrona.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database, "campanha">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "campanha" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Em RSC puro o set lança — ignorado: o middleware cuida do refresh.
          }
        },
      },
    }
  );
}

/**
 * Client com service-role para operações administrativas.
 * NUNCA use em rota acessada por usuário não-autenticado sem checks extras.
 */
export function createServiceClient() {
  return createServerClient<Database, "campanha">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "campanha" },
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* noop */
        },
      },
    }
  );
}
