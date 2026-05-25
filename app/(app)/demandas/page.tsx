import Link from "next/link";
import { Plus, Inbox } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { DemandaCard } from "./demanda-card";
import { fmtNumero } from "@/lib/utils/formatters";
import type { StatusDemanda } from "@/lib/validations/demanda";

export const metadata = { title: "Demandas" };

const colunas: { status: StatusDemanda; titulo: string; descricao: string; tone: string }[] = [
  { status: "aberta", titulo: "Aberta", descricao: "Recebidas e aguardando triagem", tone: "border-status-amber" },
  { status: "andamento", titulo: "Em andamento", descricao: "Sendo trabalhadas pela equipe", tone: "border-status-blue" },
  { status: "resolvida", titulo: "Resolvida", descricao: "Concluídas nos últimos 60 dias", tone: "border-status-green" },
];

export default async function DemandasPage() {
  const supabase = createClient();

  const sessenta = new Date();
  sessenta.setDate(sessenta.getDate() - 60);

  const { data, error } = await supabase
    .from("demandas")
    .select("id, codigo, titulo, categoria, prioridade, status, prazo, created_at, lider:liderancas(nome)")
    .or(`status.neq.resolvida,resolvida_em.gte.${sessenta.toISOString()}`)
    .order("prioridade", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Demandas" />
        <p className="rounded-md border border-status-red-100 bg-status-red-100/50 p-3 text-sm text-status-red">
          Erro ao carregar demandas: {error.message}
        </p>
      </div>
    );
  }

  const items = (data ?? []).map((d) => {
    const lid = Array.isArray(d.lider) ? d.lider[0] : d.lider;
    return { ...d, liderNome: lid?.nome ?? null };
  });
  const ativas = items.filter((d) => d.status !== "cancelada");

  const grupos: Record<StatusDemanda, typeof items> = {
    aberta: [],
    andamento: [],
    resolvida: [],
    cancelada: [],
  };
  for (const d of ativas) grupos[d.status].push(d);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandas"
        description="Solicitações dos eleitores — saúde, infraestrutura, educação e mais."
        actions={
          <Button asChild>
            <Link href="/demandas/nova">
              <Plus className="h-4 w-4" /> Nova demanda
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Abertas" value={fmtNumero(grupos.aberta.length)} tone="amber" />
        <Stat label="Em andamento" value={fmtNumero(grupos.andamento.length)} tone="blue" />
        <Stat label="Resolvidas (60d)" value={fmtNumero(grupos.resolvida.length)} tone="green" />
        <Stat label="Total ativas" value={fmtNumero(ativas.length)} />
      </div>

      {ativas.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-5 w-5" />}
          title="Nenhuma demanda registrada"
          description="Cadastre as solicitações dos eleitores para acompanhá-las nesta caixa de entrada."
          action={
            <Button asChild>
              <Link href="/demandas/nova">
                <Plus className="h-4 w-4" /> Nova demanda
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {colunas.map((col) => (
            <section
              key={col.status}
              className={`flex flex-col gap-2 rounded-lg border-t-4 ${col.tone} bg-ink-50/40 p-3`}
            >
              <header className="flex items-baseline justify-between px-1">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-900">{col.titulo}</h2>
                  <p className="text-2xs text-ink-500">{col.descricao}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-2xs font-semibold tabular text-ink-700 shadow-sm">
                  {grupos[col.status].length}
                </span>
              </header>
              <div className="flex flex-1 flex-col gap-2">
                {grupos[col.status].length === 0 ? (
                  <p className="rounded-md border border-dashed border-ink-200 bg-white p-3 text-center text-2xs text-ink-400">
                    Nenhuma demanda nesta coluna.
                  </p>
                ) : (
                  grupos[col.status].map((d) => (
                    <DemandaCard
                      key={d.id}
                      id={d.id}
                      codigo={d.codigo}
                      titulo={d.titulo}
                      categoria={d.categoria}
                      prioridade={d.prioridade}
                      prazo={d.prazo}
                      status={d.status}
                      liderNome={d.liderNome}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "amber" | "blue" | "green";
}) {
  const toneCls =
    tone === "amber"
      ? "text-status-amber"
      : tone === "blue"
      ? "text-status-blue"
      : tone === "green"
      ? "text-status-green"
      : "text-ink-900";
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tabular ${toneCls}`}>{value}</p>
    </div>
  );
}
