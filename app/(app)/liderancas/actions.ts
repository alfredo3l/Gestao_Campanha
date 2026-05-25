"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { liderancaSchema, type LiderancaInput } from "@/lib/validations/lideranca";

export type ActionState = { error?: string; ok?: boolean };

/**
 * Lê todos os IDs de setor enviados no FormData (campo `setor_ids` aparece
 * múltiplas vezes — um <input hidden> por setor selecionado).
 */
function extrairSetorIds(formData: FormData): string[] {
  return formData
    .getAll("setor_ids")
    .map((v) => String(v))
    .filter((v) => v.length > 0);
}

/**
 * Sincroniza a tabela N:N `lideranca_setores`: insere os novos, remove os que
 * não estão mais selecionados. Usa um diff em memória para evitar reescrita
 * desnecessária e disparos extras de auditoria.
 */
async function sincronizarSetores(
  supabase: ReturnType<typeof createClient>,
  liderancaId: string,
  setorIdsDesejados: string[]
): Promise<{ error?: string }> {
  const desejados = new Set(setorIdsDesejados);

  const { data: atuaisRows, error: selErr } = await supabase
    .from("lideranca_setores")
    .select("setor_id")
    .eq("lideranca_id", liderancaId);
  if (selErr) return { error: selErr.message };

  const atuais = new Set((atuaisRows ?? []).map((r) => r.setor_id));

  const paraInserir = [...desejados].filter((s) => !atuais.has(s));
  const paraRemover = [...atuais].filter((s) => !desejados.has(s));

  if (paraInserir.length > 0) {
    const { error } = await supabase
      .from("lideranca_setores")
      .insert(
        paraInserir.map((setor_id) => ({
          lideranca_id: liderancaId,
          setor_id,
        }))
      );
    if (error) return { error: error.message };
  }

  if (paraRemover.length > 0) {
    const { error } = await supabase
      .from("lideranca_setores")
      .delete()
      .eq("lideranca_id", liderancaId)
      .in("setor_id", paraRemover);
    if (error) return { error: error.message };
  }

  return {};
}

export async function criarLideranca(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const parsed = liderancaSchema.safeParse({
    nome: formData.get("nome"),
    cargo: formData.get("cargo"),
    municipio: formData.get("municipio"),
    bairro: formData.get("bairro") || "",
    bairro_id: formData.get("bairro_id") || "",
    setor_id: formData.get("setor_id") || "",
    setor_ids: extrairSetorIds(formData),
    tel: formData.get("tel") || "",
    email: formData.get("email") || "",
    meta_votos: formData.get("meta_votos") || 0,
    ativa: formData.get("ativa") === "on" || formData.get("ativa") === "true",
    observacoes: formData.get("observacoes") || "",
    foto_path: formData.get("foto_path") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const payload = parsed.data;
  // Mantém compat: se vier algum setor selecionado e o setor_id legado não
  // estiver preenchido, replica o primeiro como "setor principal" (legado).
  const setorPrincipal =
    payload.setor_id ?? (payload.setor_ids.length > 0 ? payload.setor_ids[0] : null);

  const { data, error } = await supabase
    .from("liderancas")
    .insert({
      nome: payload.nome,
      cargo: payload.cargo,
      municipio: payload.municipio,
      bairro: payload.bairro || null,
      bairro_id: payload.bairro_id,
      setor_id: setorPrincipal,
      tel: payload.tel || null,
      email: payload.email || null,
      meta_votos: payload.meta_votos,
      ativa: payload.ativa,
      observacoes: payload.observacoes,
      foto_path: payload.foto_path,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const sincErr = await sincronizarSetores(supabase, data.id, payload.setor_ids);
  if (sincErr.error) return { error: sincErr.error };

  revalidatePath("/liderancas");
  redirect(`/liderancas/${data.id}`);
}

export async function atualizarLideranca(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();

  const parsed = liderancaSchema.safeParse({
    nome: formData.get("nome"),
    cargo: formData.get("cargo"),
    municipio: formData.get("municipio"),
    bairro: formData.get("bairro") || "",
    bairro_id: formData.get("bairro_id") || "",
    setor_id: formData.get("setor_id") || "",
    setor_ids: extrairSetorIds(formData),
    tel: formData.get("tel") || "",
    email: formData.get("email") || "",
    meta_votos: formData.get("meta_votos") || 0,
    ativa: formData.get("ativa") === "on" || formData.get("ativa") === "true",
    observacoes: formData.get("observacoes") || "",
    foto_path: formData.get("foto_path") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p: LiderancaInput = parsed.data;
  const setorPrincipal =
    p.setor_id ?? (p.setor_ids.length > 0 ? p.setor_ids[0] : null);

  const { error } = await supabase
    .from("liderancas")
    .update({
      nome: p.nome,
      cargo: p.cargo,
      municipio: p.municipio,
      bairro: p.bairro || null,
      bairro_id: p.bairro_id,
      setor_id: setorPrincipal,
      tel: p.tel || null,
      email: p.email || null,
      meta_votos: p.meta_votos,
      ativa: p.ativa,
      observacoes: p.observacoes,
      foto_path: p.foto_path,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const sincErr = await sincronizarSetores(supabase, id, p.setor_ids);
  if (sincErr.error) return { error: sincErr.error };

  revalidatePath("/liderancas");
  revalidatePath(`/liderancas/${id}`);
  return { ok: true };
}

export async function excluirLideranca(id: string): Promise<ActionState> {
  const supabase = createClient();

  const [apoiadoresRes, demandasRes] = await Promise.all([
    supabase
      .from("apoiadores")
      .select("id", { count: "exact", head: true })
      .eq("lider_id", id),
    supabase
      .from("demandas")
      .select("id", { count: "exact", head: true })
      .eq("lider_id", id),
  ]);

  if (apoiadoresRes.error) return { error: apoiadoresRes.error.message };
  if (demandasRes.error) return { error: demandasRes.error.message };

  const totalApoiadores = apoiadoresRes.count ?? 0;
  const totalDemandas = demandasRes.count ?? 0;

  if (totalApoiadores > 0 || totalDemandas > 0) {
    const partes: string[] = [];
    if (totalApoiadores > 0) {
      partes.push(
        `${totalApoiadores} ${totalApoiadores === 1 ? "apoiador vinculado" : "apoiadores vinculados"}`
      );
    }
    if (totalDemandas > 0) {
      partes.push(
        `${totalDemandas} ${totalDemandas === 1 ? "demanda vinculada" : "demandas vinculadas"}`
      );
    }
    return {
      error: `Não é possível excluir: existem ${partes.join(" e ")}. Realoque ou exclua esses registros antes de remover a liderança.`,
    };
  }

  const { error } = await supabase.from("liderancas").delete().eq("id", id);
  if (error) {
    if ((error as { code?: string }).code === "23503") {
      return {
        error:
          "Não é possível excluir: a liderança possui registros vinculados. Realoque ou exclua esses registros antes.",
      };
    }
    return { error: error.message };
  }
  revalidatePath("/liderancas");
  redirect("/liderancas");
}
