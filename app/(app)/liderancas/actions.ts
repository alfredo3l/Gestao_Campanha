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
    foto_path: formData.get("foto_path") || "",
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
      foto_path: payload.foto_path,
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
    foto_path: formData.get("foto_path") || "",
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
      foto_path: p.foto_path,
    })
    .eq("id", id);

  if (error) return { error: error.message };

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
