import { createClient } from "@/lib/supabase/server";

/**
 * Resumo mínimo de um usuário para exibir em trilhas de auditoria.
 */
export interface AuditoriaUsuario {
  id: string;
  nome: string;
  foto_path: string | null;
}

/**
 * Resolve nomes e fotos para um conjunto de UUIDs de usuários (auth.users.id ↔ campanha.profiles.id).
 *
 * - Aceita um array misto com NULLs/undefined; eles são ignorados.
 * - Faz UMA query agregada (em vez de N joins separados nas listagens).
 * - Retorna um Map<userId, { nome, foto_path }> para lookup O(1).
 * - Quando o uuid não existe em `profiles` (ex.: usuário do Supabase Auth que
 *   nunca foi vinculado ao módulo Campanha), retorna `null` no Map.
 */
export async function resolverUsuariosAuditoria(
  ids: Array<string | null | undefined>
): Promise<Map<string, AuditoriaUsuario | null>> {
  const map = new Map<string, AuditoriaUsuario | null>();
  const unicos = Array.from(
    new Set(ids.filter((v): v is string => typeof v === "string" && v.length > 0))
  );
  if (unicos.length === 0) return map;

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nome, foto_path")
    .in("id", unicos);

  for (const id of unicos) {
    const row = data?.find((p) => p.id === id);
    map.set(id, row ? { id: row.id, nome: row.nome, foto_path: row.foto_path } : null);
  }
  return map;
}
