import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export interface CargoLiderRow {
  id: string;
  value: string;
  label: string;
  ordem: number;
  ativo: boolean;
}

/**
 * Retorna todos os cargos de liderança cadastrados no banco, ordenados por
 * `ordem` ASC, depois `label` ASC. Usa `React.cache()` para deduplicar a
 * chamada dentro de um mesmo render (layout + page + componentes em paralelo).
 *
 * Inclui cargos inativos (necessário para renderizar labels de registros
 * antigos). Componentes que listam opções em formulários devem filtrar por
 * `ativo` antes de exibir.
 */
export const getCargosLider = cache(async (): Promise<CargoLiderRow[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cargos_lider")
    .select("id, value, label, ordem, ativo")
    .order("ordem", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    console.error("[cargos] Falha ao carregar cargos_lider:", error);
    return [];
  }
  return data ?? [];
});

/**
 * Mapa `value → label` para tradução rápida em badges e listagens.
 * Para `value` desconhecido (cargo deletado, etc.), devolve o próprio `value`.
 */
export const getCargosLiderMap = cache(async (): Promise<Record<string, string>> => {
  const cargos = await getCargosLider();
  return Object.fromEntries(cargos.map((c) => [c.value, c.label]));
});
