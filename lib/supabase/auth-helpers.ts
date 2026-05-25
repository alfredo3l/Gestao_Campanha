import { cache } from "react";

import { createClient } from "./server";

/**
 * `getCurrentUser` valida o JWT da sessão consultando o Supabase Auth API.
 *
 * Encapsulado com `React.cache()` para que múltiplas chamadas dentro do MESMO
 * server render (layout + page + componente) reutilizem o mesmo resultado e
 * façam um único roundtrip à Auth API por navegação.
 *
 * Usar SEMPRE este helper em vez de chamar `supabase.auth.getUser()` em
 * componentes server — caso contrário ocorre fan-out de roundtrips.
 */
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * `getCurrentProfile` busca o perfil do usuário autenticado. Também `cache()`
 * para deduplicação por render.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nome, role, ativo")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
