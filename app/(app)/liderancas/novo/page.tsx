import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LiderancaForm } from "../lideranca-form";

export const metadata = { title: "Nova liderança" };

export default function NovaLiderancaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova liderança"
        description="Cadastre coordenadores regionais e líderes responsáveis por captação de apoiadores."
        actions={
          <Link
            href="/liderancas"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <LiderancaForm modo="novo" />
        </CardContent>
      </Card>
    </div>
  );
}
