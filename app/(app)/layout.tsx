import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, role, ativo")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[theme(spacing.sidebar)_1fr] md:grid-rows-[theme(spacing.topbar)_1fr]">
      <Sidebar />
      <Topbar email={user.email ?? ""} nome={profile?.nome ?? null} role={profile?.role ?? null} />
      <main className="overflow-y-auto bg-ink-50/40 p-6">{children}</main>
    </div>
  );
}
