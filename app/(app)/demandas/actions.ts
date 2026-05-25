"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  demandaSchema,
  movimentacaoSchema,
  type SolicitanteInput,
} from "@/lib/validations/demanda";

export type ActionState = { error?: string; ok?: boolean };

/**
 * Constrói o objeto bruto do solicitante a partir do FormData. O formulário
 * envia `solicitante_tipo` + um conjunto de campos específicos por tipo.
 * A validação real (presença de ID, formato, etc.) é feita pelo Zod
 * discriminated union em `solicitanteSchema`.
 */
function buildSolicitanteRaw(formData: FormData): unknown {
  const tipo = String(formData.get("solicitante_tipo") ?? "apoiador");
  if (tipo === "lideranca") {
    return {
      tipo: "lideranca",
      lider_id: formData.get("solicitante_lider_id") || "",
    };
  }
  if (tipo === "avulso") {
    return {
      tipo: "avulso",
      nome: formData.get("solicitante_nome") || "",
      tel: formData.get("solicitante_tel") || "",
      bairro: formData.get("solicitante_bairro") || "",
    };
  }
  return {
    tipo: "apoiador",
    apoiador_id: formData.get("solicitante_apoiador_id") || "",
  };
}

function parse(formData: FormData) {
  return demandaSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || "",
    categoria: formData.get("categoria"),
    prioridade: formData.get("prioridade") || "media",
    status: formData.get("status") || "aberta",
    solicitante: buildSolicitanteRaw(formData),
    lider_id: formData.get("lider_id"),
    bairro: formData.get("bairro") || "",
    bairro_id: formData.get("bairro_id") || "",
    setor_id: formData.get("setor_id") || "",
    prazo: formData.get("prazo") || "",
  });
}

/**
 * Mapeia o objeto validado do solicitante para as colunas físicas da tabela
 * `campanha.demandas`. O CHECK constraint do banco impõe que exatamente um
 * conjunto de colunas esteja preenchido por tipo.
 */
function mapSolicitanteParaColunas(s: SolicitanteInput) {
  if (s.tipo === "apoiador") {
    return {
      solicitante_tipo: "apoiador" as const,
      solicitante_id: s.apoiador_id,
      solicitante_lider_id: null,
      solicitante_nome: null,
      solicitante_tel: null,
      solicitante_bairro: null,
    };
  }
  if (s.tipo === "lideranca") {
    return {
      solicitante_tipo: "lideranca" as const,
      solicitante_id: null,
      solicitante_lider_id: s.lider_id,
      solicitante_nome: null,
      solicitante_tel: null,
      solicitante_bairro: null,
    };
  }
  return {
    solicitante_tipo: "avulso" as const,
    solicitante_id: null,
    solicitante_lider_id: null,
    solicitante_nome: s.nome,
    solicitante_tel: s.tel,
    solicitante_bairro: s.bairro,
  };
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
  const sol = mapSolicitanteParaColunas(p.solicitante);

  const { data, error } = await supabase
    .from("demandas")
    .insert({
      titulo: p.titulo,
      descricao: p.descricao || null,
      categoria: p.categoria,
      prioridade: p.prioridade,
      status: p.status,
      ...sol,
      lider_id: p.lider_id,
      bairro: p.bairro || null,
      bairro_id: p.bairro_id,
      setor_id: p.setor_id,
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
  const sol = mapSolicitanteParaColunas(p.solicitante);

  const { error } = await supabase
    .from("demandas")
    .update({
      titulo: p.titulo,
      descricao: p.descricao || null,
      categoria: p.categoria,
      prioridade: p.prioridade,
      status: p.status,
      ...sol,
      lider_id: p.lider_id,
      bairro: p.bairro || null,
      bairro_id: p.bairro_id,
      setor_id: p.setor_id,
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

  const { error } = await supabase
    .from("demandas")
    .update({
      status: novoStatus,
      resolvida_em: novoStatus === "resolvida" ? new Date().toISOString() : null,
    })
    .eq("id", id);
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
