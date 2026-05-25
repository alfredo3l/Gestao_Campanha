import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";

import { GerenciadorCargos } from "./gerenciador-cargos";

export const metadata = { title: "Cargos de liderança" };

export default async function ConfiguracoesCargosPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const podeGerenciar = profile.ativo && (profile.role === "admin" || profile.role === "coordenador");
  if (!podeGerenciar) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cargos de liderança"
          description="Apenas administradores e coordenadores podem gerenciar esta lista."
          actions={
            <Link
              href="/configuracoes"
              className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          }
        />
        <Card>
          <CardContent className="py-12 text-center text-sm text-ink-500">
            Você não tem permissão para acessar esta área. Solicite ao
            administrador para promover seu perfil a <strong>Coordenador</strong> ou{" "}
            <strong>Administrador</strong>.
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = createClient();
  const { data: cargos, error } = await supabase
    .from("cargos_lider")
    .select("id, value, label, ordem, ativo, created_at, updated_at")
    .order("ordem", { ascending: true })
    .order("label", { ascending: true });

  // Contagem de lideranças por cargo (para mostrar quem está em uso).
  const { data: contagem } = await supabase
    .from("liderancas")
    .select("cargo")
    .returns<{ cargo: string }[]>();
  const usoPorCargo = (contagem ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.cargo] = (acc[row.cargo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargos de liderança"
        description="Gerencie os cargos disponíveis no cadastro de lideranças."
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
        <CardHeader>
          <CardTitle className="text-base">Catálogo de cargos</CardTitle>
          <CardDescription>
            Os cargos aqui listados aparecem no campo <strong>Cargo</strong> ao cadastrar uma nova
            liderança. Inativar um cargo o oculta de novos cadastros, mas mantém as lideranças
            antigas vinculadas a ele.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-status-red">Erro ao carregar: {error.message}</p>
          ) : (
            <GerenciadorCargos cargos={cargos ?? []} usoPorCargo={usoPorCargo} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
