"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { demandaSchema, movimentacaoSchema } from "@/lib/validations/demanda";

export type ActionState = { error?: string; ok?: boolean };

function parse(formData: FormData) {
  const sol = String(formData.get("solicitante_id") ?? "");
  return demandaSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || "",
    categoria: formData.get("categoria"),
    prioridade: formData.get("prioridade") || "media",
    status: formData.get("status") || "aberta",
    solicitante_id: sol && sol !== "none" ? sol : null,
    lider_id: formData.get("lider_id"),
    prazo: formData.get("prazo") || "",
  });
}

export async function criarDemanda(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p = parsed.data;

  const { data, error } = await supabase
    .from("demandas")
    .insert({
      titulo: p.titulo,
      descricao: p.descricao || null,
      categoria: p.categoria,
      prioridade: p.prioridade,
      status: p.status,
      solicitante_id: p.solicitante_id || null,
      lider_id: p.lider_id,
      prazo: p.prazo || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/demandas");
  redirect(`/demandas/${data.id}`);
}

export async function atualizarDemanda(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p = parsed.data;

  const { error } = await supabase
    .from("demandas")
    .update({
      titulo: p.titulo,
      descricao: p.descricao || null,
      categoria: p.categoria,
      prioridade: p.prioridade,
      status: p.status,
      solicitante_id: p.solicitante_id || null,
      lider_id: p.lider_id,
      prazo: p.prazo || null,
      resolvida_em: p.status === "resolvida" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/demandas");
  revalidatePath(`/demandas/${id}`);
  return { ok: true };
}

export async function moverStatusDemanda(id: string, novoStatus: "aberta" | "andamento" | "resolvida" | "cancelada") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const update: Record<string, unknown> = {
    status: novoStatus,
    resolvida_em: novoStatus === "resolvida" ? new Date().toISOString() : null,
  };

  const { error } = await supabase.from("demandas").update(update).eq("id", id);
  if (error) return { error: error.message };

  await supabase.from("demanda_movimentacoes").insert({
    demanda_id: id,
    autor_id: user.id,
    tipo: "status_change",
    texto: `Status alterado para "${novoStatus}".`,
  });

  revalidatePath("/demandas");
  revalidatePath(`/demandas/${id}`);
  return { ok: true };
}

export async function comentarDemanda(
  demandaId: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const parsed = movimentacaoSchema.safeParse({
    demanda_id: demandaId,
    tipo: "comentario",
    texto: formData.get("texto"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const { error } = await supabase.from("demanda_movimentacoes").insert({
    demanda_id: demandaId,
    autor_id: user.id,
    tipo: "comentario",
    texto: parsed.data.texto,
  });
  if (error) return { error: error.message };

  revalidatePath(`/demandas/${demandaId}`);
  return { ok: true };
}

export async function excluirDemanda(id: string): Promise<ActionState> {
  const supabase = createClient();
  const { error } = await supabase.from("demandas").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/demandas");
  redirect("/demandas");
}
