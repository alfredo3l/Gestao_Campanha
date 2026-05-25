import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export interface SetorRow {
  id: string;
  numero: number;
  nome: string;
  municipio: string;
  cor: string | null;
  ativo: boolean;
}

export interface BairroRow {
  id: string;
  nome: string;
  municipio: string;
  setor_id: string | null;
  ativo: boolean;
}

/**
 * Item enriquecido — bairro com o setor já resolvido (n° + nome).
 * Usado no combobox para mostrar o setor inferido ao selecionar o bairro.
 */
export interface BairroComSetor extends BairroRow {
  setor_numero: number | null;
  setor_nome: string | null;
}

/**
 * Lista todos os setores. Mantém inativos para que registros antigos ainda
 * exibam o label do setor (mesmo se o admin tiver desativado depois).
 */
export const getSetores = cache(async (): Promise<SetorRow[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setores")
    .select("id, numero, nome, municipio, cor, ativo")
    .order("municipio", { ascending: true })
    .order("numero", { ascending: true });

  if (error) {
    console.error("[localidades] Falha ao carregar setores:", error);
    return [];
  }
  return data ?? [];
});

/**
 * Lista bairros + setor associado.
 * Inclui inativos (necessário para renderizar labels de registros antigos);
 * filtre por `ativo` no client/UI quando estiver listando opções de cadastro.
 */
export const getBairrosComSetor = cache(async (): Promise<BairroComSetor[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bairros")
    .select(
      "id, nome, municipio, setor_id, ativo, setores:setor_id(numero, nome)"
    )
    .order("municipio", { ascending: true })
    .order("nome", { ascending: true });

  if (error) {
    console.error("[localidades] Falha ao carregar bairros:", error);
    return [];
  }

  // O cliente Supabase usa o nome da FK como propriedade. Aqui devolvemos plano.
  return (data ?? []).map((row) => {
    const setorEmbutido = row.setores as
      | { numero: number; nome: string }
      | { numero: number; nome: string }[]
      | null;
    const setor = Array.isArray(setorEmbutido) ? setorEmbutido[0] : setorEmbutido;
    return {
      id: row.id,
      nome: row.nome,
      municipio: row.municipio,
      setor_id: row.setor_id,
      ativo: row.ativo,
      setor_numero: setor?.numero ?? null,
      setor_nome: setor?.nome ?? null,
    } satisfies BairroComSetor;
  });
});
