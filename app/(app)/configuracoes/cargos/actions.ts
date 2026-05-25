"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import { cargoLiderRecordSchema } from "@/lib/validations/lideranca";

export type ActionState = { error?: string; ok?: boolean };

const PAPEIS_AUTORIZADOS = new Set(["admin", "coordenador"]);

async function exigirPermissao(): Promise<{ error?: string; userId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sessão expirada." };
  if (!profile.ativo) return { error: "Seu perfil está inativo." };
  if (!PAPEIS_AUTORIZADOS.has(profile.role)) {
    return { error: "Apenas administradores e coordenadores podem alterar cargos." };
  }
  return { userId: profile.id };
}

/** Converte um slug textual em algo válido para `cargos_lider.value`. */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .slice(0, 50);
}

export async function criarCargoLider(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const labelInput = String(formData.get("label") ?? "").trim();
  const valueInput = String(formData.get("value") ?? "").trim();
  const ordemInput = formData.get("ordem");

  // Se o admin não informar value, gera a partir do label.
  const valueFinal = valueInput.length > 0 ? slugify(valueInput) : slugify(labelInput);

  const parsed = cargoLiderRecordSchema.safeParse({
    value: valueFinal,
    label: labelInput,
    ordem: ordemInput ?? 0,
    ativo: true,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cargos_lider")
    .insert({
      value: parsed.data.value,
      label: parsed.data.label,
      ordem: parsed.data.ordem,
      ativo: parsed.data.ativo,
      created_by: permissao.userId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `Já existe um cargo com o identificador "${parsed.data.value}".` };
    }
    return { error: error.message };
  }

  revalidatePath("/configuracoes/cargos");
  revalidatePath("/liderancas/novo");
  return { ok: true };
}

export async function atualizarCargoLider(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const labelInput = String(formData.get("label") ?? "").trim();
  const ordemInput = formData.get("ordem");
  // O `value` (slug) é imutável pela UI para evitar quebra de FKs em massa.
  // Caso necessário ajustar no futuro, fazer via SQL direto com ON UPDATE CASCADE.

  const parsed = cargoLiderRecordSchema
    .pick({ label: true, ordem: true })
    .safeParse({ label: labelInput, ordem: ordemInput ?? 0 });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cargos_lider")
    .update({ label: parsed.data.label, ordem: parsed.data.ordem })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes/cargos");
  revalidatePath("/liderancas");
  return { ok: true };
}

export async function alternarAtivoCargoLider(
  id: string,
  ativo: boolean
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("cargos_lider")
    .update({ ativo })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes/cargos");
  revalidatePath("/liderancas/novo");
  return { ok: true };
}

export async function excluirCargoLider(id: string): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();

  // Bloqueia exclusão se houver liderança referenciando o cargo.
  const { data: cargo, error: getError } = await supabase
    .from("cargos_lider")
    .select("value")
    .eq("id", id)
    .single();
  if (getError) return { error: getError.message };

  const { count, error: countError } = await supabase
    .from("liderancas")
    .select("id", { count: "exact", head: true })
    .eq("cargo", cargo.value);
  if (countError) return { error: countError.message };
  if ((count ?? 0) > 0) {
    return {
      error: `Não é possível excluir: ${count} liderança(s) ainda usam este cargo. Desative em vez de excluir.`,
    };
  }

  const { error } = await supabase.from("cargos_lider").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/configuracoes/cargos");
  revalidatePath("/liderancas/novo");
  return { ok: true };
}
