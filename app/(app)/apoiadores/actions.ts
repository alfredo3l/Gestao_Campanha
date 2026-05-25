"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { apoiadorSchema } from "@/lib/validations/apoiador";

export type ActionState = { error?: string; ok?: boolean };

function parseForm(formData: FormData) {
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);

  return apoiadorSchema.safeParse({
    nome: formData.get("nome"),
    cpf: formData.get("cpf"),
    titulo_eleitor: formData.get("titulo_eleitor") || "",
    zona: formData.get("zona") || "",
    secao: formData.get("secao") || "",
    tel: formData.get("tel") || "",
    email: formData.get("email") || "",
    nascimento: formData.get("nascimento") || "",
    endereco: formData.get("endereco") || "",
    bairro: formData.get("bairro") || "",
    municipio: formData.get("municipio"),
    cep: formData.get("cep") || "",
    lider_id: formData.get("lider_id"),
    status: formData.get("status") || "contato",
    indicado_por: formData.get("indicado_por") || "",
    observacoes: formData.get("observacoes") || "",
    tags,
    consentimento_lgpd: formData.get("consentimento_lgpd") === "on",
  });
}

export async function criarApoiador(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p = parsed.data;

  const { data: apoiador, error } = await supabase
    .from("apoiadores")
    .insert({
      nome: p.nome,
      cpf: p.cpf,
      titulo_eleitor: p.titulo_eleitor || null,
      zona: p.zona || null,
      secao: p.secao || null,
      tel: p.tel || null,
      email: p.email || null,
      nascimento: p.nascimento || null,
      endereco: p.endereco || null,
      bairro: p.bairro || null,
      municipio: p.municipio,
      cep: p.cep || null,
      lider_id: p.lider_id,
      status: p.status,
      indicado_por: p.indicado_por || null,
      observacoes: p.observacoes || null,
      data_consentimento: new Date().toISOString(),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (p.tags.length > 0) {
    await supabase
      .from("apoiador_tags")
      .insert(p.tags.map((tag) => ({ apoiador_id: apoiador.id, tag })));
  }

  revalidatePath("/apoiadores");
  redirect(`/apoiadores/${apoiador.id}`);
}

export async function atualizarApoiador(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p = parsed.data;

  const { error } = await supabase
    .from("apoiadores")
    .update({
      nome: p.nome,
      cpf: p.cpf,
      titulo_eleitor: p.titulo_eleitor || null,
      zona: p.zona || null,
      secao: p.secao || null,
      tel: p.tel || null,
      email: p.email || null,
      nascimento: p.nascimento || null,
      endereco: p.endereco || null,
      bairro: p.bairro || null,
      municipio: p.municipio,
      cep: p.cep || null,
      lider_id: p.lider_id,
      status: p.status,
      indicado_por: p.indicado_por || null,
      observacoes: p.observacoes || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("apoiador_tags").delete().eq("apoiador_id", id);
  if (p.tags.length > 0) {
    await supabase
      .from("apoiador_tags")
      .insert(p.tags.map((tag) => ({ apoiador_id: id, tag })));
  }

  revalidatePath("/apoiadores");
  revalidatePath(`/apoiadores/${id}`);
  return { ok: true };
}

export async function excluirApoiador(id: string): Promise<ActionState> {
  const supabase = createClient();
  const { error } = await supabase.from("apoiadores").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/apoiadores");
  redirect("/apoiadores");
}
