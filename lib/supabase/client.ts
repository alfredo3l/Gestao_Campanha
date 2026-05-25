"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Client Supabase para uso no browser (Client Components, event handlers).
 *
 * Importante: trabalha no schema `campanha` por padrão.
 * Para queries em outro schema use `supabase.schema('public').from(...)`.
 *
 * Se as envs `NEXT_PUBLIC_SUPABASE_*` não foram inlinadas no bundle (deploy
 * sem configurar variáveis na Vercel), lança um erro com mensagem clara em
 * vez do enigmático "supabaseUrl is required".
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Configuração ausente: defina NEXT_PUBLIC_SUPABASE_URL e " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY no painel da Vercel e refaça o deploy."
    );
  }
  return createBrowserClient<Database, "campanha">(url, anonKey, {
    db: { schema: "campanha" },
  });
}
