import Link from "next/link";
import { Plus, MapPin, Mail, Phone, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/app/progress-bar";
import { CargoBadge } from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import { fmtNumero, fmtTelefone } from "@/lib/utils/formatters";
import { AvatarInitials } from "@/components/app/avatar-initials";

export const metadata = { title: "Lideranças" };

export default async function LiderancasPage() {
  const supabase = createClient();
  const { data: liderancas, error } = await supabase
    .from("v_progresso_lideranca")
    .select("*")
    .order("apoiadores_total", { ascending: false });

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Lideranças" />
        <Card>
          <CardContent className="text-sm text-status-red">Erro ao carregar: {error.message}</CardContent>
        </Card>
      </div>
    );
  }

  const total = liderancas?.length ?? 0;
  const ativas = liderancas?.filter((l) => l.ativa).length ?? 0;
  const totalApoiadores = liderancas?.reduce((acc, l) => acc + (l.apoiadores_total ?? 0), 0) ?? 0;
  const totalMeta = liderancas?.reduce((acc, l) => acc + (l.meta_votos ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lideranças"
        description="Coordenadores regionais, líderes de bairro, comunitários e rurais."
        actions={
          <Button asChild>
            <Link href="/liderancas/novo">
              <Plus className="h-4 w-4" /> Nova liderança
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryStat label="Total" value={total} />
        <SummaryStat label="Ativas" value={ativas} />
        <SummaryStat label="Apoiadores vinculados" value={fmtNumero(totalApoiadores)} />
        <SummaryStat label="Meta agregada" value={fmtNumero(totalMeta)} />
      </div>

      {!liderancas || liderancas.length === 0 ? (
        <EmptyState
          title="Nenhuma liderança cadastrada"
          description="Comece registrando coordenadores regionais e líderes de bairro."
          action={
            <Button asChild>
              <Link href="/liderancas/novo">
                <Plus className="h-4 w-4" /> Cadastrar a primeira
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {liderancas.map((l) => {
            const pct = l.pct_meta ?? 0;
            const tone: "brand" | "amber" | "red" | "green" =
              pct >= 100 ? "green" : pct >= 60 ? "brand" : pct >= 30 ? "amber" : "red";
            return (
              <Card key={l.id} className="flex flex-col">
                <CardHeader className="flex-row items-start gap-3 space-y-0 pb-2">
                  <AvatarInitials nome={l.nome} className="h-10 w-10 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/liderancas/${l.id}`}
                        className="font-display text-base font-semibold text-ink-900 hover:underline truncate"
                      >
                        {l.nome}
                      </Link>
                      {!l.ativa && <Badge variant="secondary">Inativa</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <CargoBadge cargo={l.cargo} />
                      <span className="flex items-center gap-1 text-xs text-ink-500">
                        <MapPin className="h-3 w-3" /> {l.municipio}
                        {l.bairro ? ` · ${l.bairro}` : ""}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Stat label="Apoiadores" value={fmtNumero(l.apoiadores_total ?? 0)} />
                    <Stat label="Confirmados" value={fmtNumero(l.apoiadores_confirmados ?? 0)} />
                    <Stat label="Meta" value={fmtNumero(l.meta_votos ?? 0)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-ink-500">
                      <span>Progresso</span>
                      <span className="font-mono-tab font-medium text-ink-700">{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} tone={tone} />
                  </div>
                  <Link
                    href={`/liderancas/${l.id}`}
                    className="mt-auto inline-flex items-center justify-end gap-1 pt-1 text-xs font-medium text-brand-700 hover:underline"
                  >
                    Ver detalhes <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular text-ink-900">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-ink-50 px-2 py-1.5">
      <p className="text-2xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="font-mono-tab text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}
