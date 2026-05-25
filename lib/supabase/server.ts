import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Erro tipado lançado quando as variáveis de ambiente Supabase não estão
 * configuradas no servidor. Helpers como `getCurrentUser` capturam esse erro
 * específico e tratam o usuário como não-autenticado, evitando que o site
 * inteiro caia com 500 quando o deploy esquece os envs.
 */
export class MissingSupabaseEnvError extends Error {
  constructor(missing: string[]) {
    super(
      `[supabase/server] Variáveis ausentes: ${missing.join(", ")}. ` +
        "Configure em Vercel → Project → Settings → Environment Variables."
    );
    this.name = "MissingSupabaseEnvError";
  }
}

function requireSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) throw new MissingSupabaseEnvError(missing);
  return { url: url as string, anonKey: anonKey as string };
}

/**
 * Client Supabase para uso server-side (Server Components, Server Actions, Route Handlers).
 *
 * Importante: trabalha no schema `campanha` por padrão.
 * Cookies do Next 14 são sync; a API `cookies()` aqui é usada de forma síncrona.
 */
export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  const cookieStore = cookies();

  return createServerClient<Database, "campanha">(url, anonKey, {
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
  });
}

/**
 * Client com service-role para operações administrativas.
 * NUNCA use em rota acessada por usuário não-autenticado sem checks extras.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) throw new MissingSupabaseEnvError(missing);

  return createServerClient<Database, "campanha">(url as string, serviceKey as string, {
    db: { schema: "campanha" },
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* noop */
      },
    },
  });
}
