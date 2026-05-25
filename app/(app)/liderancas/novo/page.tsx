import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCargosLider } from "@/lib/cargos/get-cargos";
import { getBairrosComSetor, getSetores } from "@/lib/localidades/get-localidades";
import { LiderancaForm } from "../lideranca-form";

export const metadata = { title: "Nova liderança" };

export default async function NovaLiderancaPage() {
  const [cargosRaw, bairros, setores] = await Promise.all([
    getCargosLider(),
    getBairrosComSetor(),
    getSetores(),
  ]);
  const cargos = cargosRaw
    .filter((c) => c.ativo)
    .map((c) => ({ value: c.value, label: c.label }));

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
          <LiderancaForm
            modo="novo"
            cargos={cargos}
            bairros={bairros}
            setores={setores}
          />
        </CardContent>
      </Card>
    </div>
  );
}
