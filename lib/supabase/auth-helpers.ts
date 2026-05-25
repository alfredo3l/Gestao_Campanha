import { cache } from "react";

import { MissingSupabaseEnvError, createClient } from "./server";

/**
 * `getCurrentUser` valida o JWT da sessão consultando o Supabase Auth API.
 *
 * Encapsulado com `React.cache()` para que múltiplas chamadas dentro do MESMO
 * server render (layout + page + componente) reutilizem o mesmo resultado e
 * façam um único roundtrip à Auth API por navegação.
 *
 * Usar SEMPRE este helper em vez de chamar `supabase.auth.getUser()` em
 * componentes server — caso contrário ocorre fan-out de roundtrips.
 *
 * Resiliência:
 *  - Se as envs Supabase estiverem ausentes (deploy mal configurado), tratamos
 *    como usuário não-autenticado (`null`). O layout autenticado já redireciona
 *    para `/login` nesse caso, então o site exibe a tela de login em vez de
 *    "Application error" 500.
 *  - Qualquer outra falha de rede também é logada e tratada como sem-sessão,
 *    evitando que o site inteiro caia.
 */
export const getCurrentUser = cache(async () => {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    if (error instanceof MissingSupabaseEnvError) {
      console.error(error.message);
    } else {
      console.error("[auth-helpers] Falha ao obter usuário autenticado:", error);
    }
    return null;
  }
});

/**
 * `getCurrentProfile` busca o perfil do usuário autenticado. Também `cache()`
 * para deduplicação por render.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, role, ativo, foto_path")
      .eq("id", user.id)
      .maybeSingle();
    return data;
  } catch (error) {
    console.error("[auth-helpers] Falha ao carregar profile:", error);
    return null;
  }
});
