import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DemandaForm } from "../demanda-form";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { getBairrosComSetor } from "@/lib/localidades/get-localidades";

export const metadata = { title: "Nova demanda" };

export default async function NovaDemandaPage() {
  const supabase = createClient();
  const [lideRes, apoiaRes, bairros] = await Promise.all([
    supabase.from("liderancas").select("id, nome, municipio").eq("ativa", true).order("nome"),
    supabase.from("apoiadores").select("id, nome").order("nome").limit(500),
    getBairrosComSetor(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova demanda"
        description="Registre uma solicitação ou problema relatado por um eleitor."
        actions={
          <Link
            href="/demandas"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          {!lideRes.data || lideRes.data.length === 0 ? (
            <EmptyState
              title="Nenhuma liderança ativa"
              description="Toda demanda precisa estar atribuída a uma liderança responsável."
              action={
                <Button asChild>
                  <Link href="/liderancas/novo">Cadastrar liderança</Link>
                </Button>
              }
            />
          ) : (
            <DemandaForm
              modo="novo"
              liderancas={lideRes.data}
              apoiadores={apoiaRes.data ?? []}
              bairros={bairros}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
