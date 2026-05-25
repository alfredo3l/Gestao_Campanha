"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";
import {
  bairroRecordSchema,
  setorRecordSchema,
} from "@/lib/validations/localidade";

export type ActionState = { error?: string; ok?: boolean };

const PAPEIS_AUTORIZADOS = new Set(["admin", "coordenador"]);

async function exigirPermissao(): Promise<{ error?: string; userId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sessão expirada." };
  if (!profile.ativo) return { error: "Seu perfil está inativo." };
  if (!PAPEIS_AUTORIZADOS.has(profile.role)) {
    return {
      error: "Apenas administradores e coordenadores podem alterar bairros e setores.",
    };
  }
  return { userId: profile.id };
}

function revalidarTudo() {
  revalidatePath("/configuracoes");
  revalidatePath("/configuracoes/bairros");
  revalidatePath("/apoiadores/novo");
  revalidatePath("/liderancas/novo");
  revalidatePath("/demandas/nova");
}

// ============================================================================
// Setores
// ============================================================================

export async function criarSetor(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const parsed = setorRecordSchema.safeParse({
    numero: formData.get("numero"),
    nome: formData.get("nome"),
    municipio: formData.get("municipio") || "Três Lagoas",
    cor: formData.get("cor") || "",
    ativo: true,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const supabase = createClient();
  const { error } = await supabase.from("setores").insert({
    numero: parsed.data.numero,
    nome: parsed.data.nome,
    municipio: parsed.data.municipio,
    cor: parsed.data.cor,
    ativo: parsed.data.ativo,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: `Já existe um setor com número ${parsed.data.numero} em ${parsed.data.municipio}.`,
      };
    }
    return { error: error.message };
  }

  revalidarTudo();
  return { ok: true };
}

export async function atualizarSetor(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const parsed = setorRecordSchema
    .pick({ nome: true, numero: true, cor: true })
    .safeParse({
      nome: formData.get("nome"),
      numero: formData.get("numero"),
      cor: formData.get("cor") || "",
    });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("setores")
    .update({
      nome: parsed.data.nome,
      numero: parsed.data.numero,
      cor: parsed.data.cor,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: `Já existe outro setor com este número no município.` };
    }
    return { error: error.message };
  }

  revalidarTudo();
  return { ok: true };
}

export async function alternarAtivoSetor(
  id: string,
  ativo: boolean
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("setores")
    .update({ ativo })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidarTudo();
  return { ok: true };
}

export async function excluirSetor(id: string): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();

  // Bloqueia se houver bairros vinculados ao setor.
  const { count, error: countError } = await supabase
    .from("bairros")
    .select("id", { count: "exact", head: true })
    .eq("setor_id", id);
  if (countError) return { error: countError.message };
  if ((count ?? 0) > 0) {
    return {
      error: `Não é possível excluir: ${count} bairro(s) ainda vinculado(s). Realoque antes de excluir.`,
    };
  }

  const { error } = await supabase.from("setores").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidarTudo();
  return { ok: true };
}

// ============================================================================
// Bairros
// ============================================================================

export async function criarBairro(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const parsed = bairroRecordSchema.safeParse({
    nome: formData.get("nome"),
    municipio: formData.get("municipio") || "Três Lagoas",
    setor_id: formData.get("setor_id") || "",
    ativo: true,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const supabase = createClient();
  const { error } = await supabase.from("bairros").insert({
    nome: parsed.data.nome,
    municipio: parsed.data.municipio,
    setor_id: parsed.data.setor_id,
    ativo: parsed.data.ativo,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: `Já existe um bairro com este nome em ${parsed.data.municipio}.`,
      };
    }
    return { error: error.message };
  }

  revalidarTudo();
  return { ok: true };
}

export async function atualizarBairro(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const parsed = bairroRecordSchema
    .pick({ nome: true, setor_id: true })
    .safeParse({
      nome: formData.get("nome"),
      setor_id: formData.get("setor_id") || "",
    });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("bairros")
    .update({
      nome: parsed.data.nome,
      setor_id: parsed.data.setor_id,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe outro bairro com este nome no município." };
    }
    return { error: error.message };
  }

  revalidarTudo();
  return { ok: true };
}

/** Atualização rápida do setor de um bairro (uso na tabela do gerenciador). */
export async function definirSetorDoBairro(
  id: string,
  setor_id: string | null
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("bairros")
    .update({ setor_id })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidarTudo();
  return { ok: true };
}

export async function alternarAtivoBairro(
  id: string,
  ativo: boolean
): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("bairros")
    .update({ ativo })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidarTudo();
  return { ok: true };
}

export async function excluirBairro(id: string): Promise<ActionState> {
  const permissao = await exigirPermissao();
  if (permissao.error) return { error: permissao.error };

  const supabase = createClient();

  // Bloqueia se houver registros referenciando o bairro.
  const [apoiadoresRes, liderancasRes, demandasRes] = await Promise.all([
    supabase
      .from("apoiadores")
      .select("id", { count: "exact", head: true })
      .eq("bairro_id", id),
    supabase
      .from("liderancas")
      .select("id", { count: "exact", head: true })
      .eq("bairro_id", id),
    supabase
      .from("demandas")
      .select("id", { count: "exact", head: true })
      .eq("bairro_id", id),
  ]);

  const totais =
    (apoiadoresRes.count ?? 0) +
    (liderancasRes.count ?? 0) +
    (demandasRes.count ?? 0);

  if (totais > 0) {
    return {
      error: `Não é possível excluir: ${totais} registro(s) vinculado(s). Desative em vez de excluir.`,
    };
  }

  const { error } = await supabase.from("bairros").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidarTudo();
  return { ok: true };
}
