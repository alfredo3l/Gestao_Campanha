"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type PerfilActionState = { error?: string; ok?: boolean };

const perfilSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(120),
  foto_path: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
});

export async function atualizarPerfil(
  _: PerfilActionState,
  formData: FormData
): Promise<PerfilActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const parsed = perfilSchema.safeParse({
    nome: formData.get("nome"),
    foto_path: formData.get("foto_path") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nome: parsed.data.nome, foto_path: parsed.data.foto_path })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes/perfil");
  revalidatePath("/", "layout"); // o Topbar reflete a foto/nome em todas as páginas
  return { ok: true };
}
