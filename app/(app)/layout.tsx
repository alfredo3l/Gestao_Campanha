import { redirect } from "next/navigation";

import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/auth-helpers";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // user e profile usam React.cache() — se uma página filha pedir de novo,
  // não há roundtrip extra. Paralelizamos as duas chamadas: o getCurrentProfile
  // já espera o user internamente, mas a roundtrip do profile dispara em paralelo
  // com qualquer outra await que ocorra mais abaixo na árvore.
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[theme(spacing.sidebar)_1fr] md:grid-rows-[theme(spacing.topbar)_1fr]">
      <Sidebar />
      <Topbar
        email={user.email ?? ""}
        nome={profile?.nome ?? null}
        role={profile?.role ?? null}
        fotoPath={profile?.foto_path ?? null}
      />
      <main className="overflow-y-auto bg-ink-50/40 p-6">{children}</main>
    </div>
  );
}
