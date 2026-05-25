import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ApoiadorForm } from "../apoiador-form";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { getBairrosComSetor } from "@/lib/localidades/get-localidades";

export const metadata = { title: "Novo apoiador" };

export default async function NovoApoiadorPage() {
  const supabase = createClient();
  const [{ data: liderancas }, bairros] = await Promise.all([
    supabase
      .from("liderancas")
      .select("id, nome, municipio")
      .eq("ativa", true)
      .order("nome"),
    getBairrosComSetor(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo apoiador"
        description="Registre um eleitor que prometeu voto ou está em contato com a campanha."
        actions={
          <Link
            href="/apoiadores"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          {!liderancas || liderancas.length === 0 ? (
            <EmptyState
              title="Nenhuma liderança ativa"
              description="Cada apoiador precisa estar vinculado a uma liderança. Cadastre uma antes."
              action={
                <Button asChild>
                  <Link href="/liderancas/novo">Cadastrar liderança</Link>
                </Button>
              }
            />
          ) : (
            <ApoiadorForm modo="novo" liderancas={liderancas} bairros={bairros} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
