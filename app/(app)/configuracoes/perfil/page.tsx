import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/auth-helpers";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PerfilForm } from "./perfil-form";

export const metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu perfil"
        description="Sua foto, nome de exibição e dados de acesso."
        actions={
          <Link
            href="/configuracoes"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Configurações
          </Link>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <PerfilForm
            userId={user.id}
            email={user.email ?? ""}
            nome={profile?.nome ?? ""}
            role={profile?.role ?? null}
            fotoPath={profile?.foto_path ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
