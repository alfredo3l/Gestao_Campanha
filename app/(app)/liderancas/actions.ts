"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { liderancaSchema, type LiderancaInput } from "@/lib/validations/lideranca";

export type ActionState = { error?: string; ok?: boolean };

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
    tel: formData.get("tel") || "",
    email: formData.get("email") || "",
    meta_votos: formData.get("meta_votos") || 0,
    ativa: formData.get("ativa") === "on" || formData.get("ativa") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("liderancas")
    .insert({
      nome: payload.nome,
      cargo: payload.cargo,
      municipio: payload.municipio,
      bairro: payload.bairro || null,
      tel: payload.tel || null,
      email: payload.email || null,
      meta_votos: payload.meta_votos,
      ativa: payload.ativa,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

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
    tel: formData.get("tel") || "",
    email: formData.get("email") || "",
    meta_votos: formData.get("meta_votos") || 0,
    ativa: formData.get("ativa") === "on" || formData.get("ativa") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p: LiderancaInput = parsed.data;

  const { error } = await supabase
    .from("liderancas")
    .update({
      nome: p.nome,
      cargo: p.cargo,
      municipio: p.municipio,
      bairro: p.bairro || null,
      tel: p.tel || null,
      email: p.email || null,
      meta_votos: p.meta_votos,
      ativa: p.ativa,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/liderancas");
  revalidatePath(`/liderancas/${id}`);
  return { ok: true };
}

export async function excluirLideranca(id: string): Promise<ActionState> {
  const supabase = createClient();
  const { error } = await supabase.from("liderancas").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/liderancas");
  redirect("/liderancas");
}
