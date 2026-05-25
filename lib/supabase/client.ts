"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Client Supabase para uso no browser (Client Components, event handlers).
 *
 * Importante: trabalha no schema `campanha` por padrão.
 * Para queries em outro schema use `supabase.schema('public').from(...)`.
 */
export function createClient() {
  return createBrowserClient<Database, "campanha">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "campanha" },
    }
  );
}
