import Link from "next/link";
import { Users, UserCog, Inbox, Target, ArrowRight, Clock, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { ProgressBar } from "@/components/app/progress-bar";
import { EvolucaoChart } from "@/components/app/evolucao-chart";
import { MetaDonut } from "@/components/app/meta-donut";
import { Button } from "@/components/ui/button";
import { fmtNumero, fmtData, fmtDataLonga } from "@/lib/utils/formatters";
import { PrioridadeBadge, StatusDemandaBadge } from "@/components/app/status-badge";
import { AvatarInitials } from "@/components/app/avatar-initials";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [kpiRes, topLideRes, urgentesRes, recentesRes, evoRes] = await Promise.all([
    supabase.from("v_dashboard_kpis").select("*").maybeSingle(),
    supabase
      .from("v_progresso_lideranca")
      .select("id, nome, cargo, municipio, foto_path, apoiadores_total, votos_projetados, meta_votos, pct_meta")
      .order("apoiadores_total", { ascending: false })
      .limit(5),
    supabase
      .from("demandas")
      .select("id, codigo, titulo, status, prioridade, prazo, lider:liderancas(nome)")
      .in("status", ["aberta", "andamento"])
      .order("prioridade", { ascending: false })
      .order("prazo", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("apoiadores")
      .select("id, nome, foto_path, municipio, status, created_at, lider:liderancas(nome)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("apoiadores")
      .select("created_at")
      .gte("created_at", since.toISOString()),
  ]);

  const k = kpiRes.data ?? {
    apoiadores_total: 0,
    apoiadores_semana: 0,
    liderancas_ativas: 0,
    meta_total: 0,
    votos_projetados: 0,
    demandas_abertas: 0,
    demandas_vencendo: 0,
  };

  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of evoRes.data ?? []) {
    const k2 = r.created_at?.slice(0, 10);
    if (k2 && buckets.has(k2)) buckets.set(k2, (buckets.get(k2) ?? 0) + 1);
  }
  let acumulado = 0;
  const evoData = Array.from(buckets.entries()).map(([dia, cadastros]) => {
    acumulado += cadastros;
    return { dia: fmtDataLonga(dia), cadastros, acumulado };
  });

  const topLider = topLideRes.data ?? [];
  const urgentes = (urgentesRes.data ?? []).map((d) => ({
    ...d,
    liderNome: (Array.isArray(d.lider) ? d.lider[0] : d.lider)?.nome ?? null,
  }));
  const recentes = (recentesRes.data ?? []).map((a) => ({
    ...a,
    liderNome: (Array.isArray(a.lider) ? a.lider[0] : a.lider)?.nome ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da campanha — apoiadores, lideranças, demandas e meta de votos."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/apoiadores/novo">
                <Plus className="h-4 w-4" /> Apoiador
              </Link>
            </Button>
            <Button asChild>
              <Link href="/demandas/nova">
                <Plus className="h-4 w-4" /> Demanda
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Apoiadores" value={fmtNumero(k.apoiadores_total)} hint={`+${k.apoiadores_semana} na semana`} />
        <KpiCard label="Lideranças ativas" value={fmtNumero(k.liderancas_ativas)} />
        <KpiCard label="Meta de votos" value={fmtNumero(k.meta_total)} hint={`Projeção ${fmtNumero(k.votos_projetados)}`} />
        <KpiCard
          label="Demandas abertas"
          value={fmtNumero(k.demandas_abertas)}
          hint={`${k.demandas_vencendo} vencendo`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Evolução de cadastros (30 dias)</CardTitle>
            <CardDescription>Apoiadores adicionados por dia.</CardDescription>
          </CardHeader>
          <CardContent>
            <EvolucaoChart data={evoData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta da campanha</CardTitle>
            <CardDescription>Votos projetados sobre a meta agregada.</CardDescription>
          </CardHeader>
          <CardContent>
            <MetaDonut meta={k.meta_total} projetado={k.votos_projetados} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-md bg-ink-50 px-2 py-1.5">
                <p className="text-2xs uppercase tracking-wide text-ink-500">Projetado</p>
                <p className="font-mono-tab font-semibold text-ink-900">{fmtNumero(k.votos_projetados)}</p>
              </div>
              <div className="rounded-md bg-ink-50 px-2 py-1.5">
                <p className="text-2xs uppercase tracking-wide text-ink-500">Meta</p>
                <p className="font-mono-tab font-semibold text-ink-900">{fmtNumero(k.meta_total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Top lideranças</CardTitle>
              <CardDescription>Maior número de apoiadores cadastrados.</CardDescription>
            </div>
            <Link href="/liderancas" className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLider.length === 0 && <p className="text-sm text-ink-500">Sem dados.</p>}
            {topLider.map((l) => {
              const pct = l.pct_meta ?? 0;
              const tone: "green" | "brand" | "amber" | "red" =
                pct >= 100 ? "green" : pct >= 60 ? "brand" : pct >= 30 ? "amber" : "red";
              return (
                <Link
                  key={l.id}
                  href={`/liderancas/${l.id}`}
                  className="block rounded-md p-2 transition-colors hover:bg-ink-50"
                >
                  <div className="flex items-center gap-2">
                    <AvatarInitials nome={l.nome} fotoPath={l.foto_path} className="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{l.nome}</p>
                      <p className="text-2xs text-ink-500">{l.municipio}</p>
                    </div>
                    <span className="font-mono-tab text-xs font-semibold text-ink-900">
                      {fmtNumero(l.apoiadores_total ?? 0)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <ProgressBar value={pct} tone={tone} className="flex-1" />
                    <span className="font-mono-tab text-2xs text-ink-500 w-9 text-right">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Demandas urgentes</CardTitle>
              <CardDescription>Prioridade alta/urgente em aberto ou em andamento.</CardDescription>
            </div>
            <Link href="/demandas" className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {urgentes.length === 0 ? (
              <p className="text-sm text-ink-500">Sem demandas urgentes no momento.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {urgentes.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/demandas/${d.id}`}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {d.titulo}
                      </Link>
                      <p className="text-2xs text-ink-500">
                        {d.codigo ?? "—"}
                        {d.liderNome && ` · ${d.liderNome}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PrioridadeBadge prioridade={d.prioridade} />
                      <StatusDemandaBadge status={d.status} />
                      {d.prazo && (
                        <span className="hidden items-center gap-1 font-mono-tab text-2xs text-ink-500 md:flex">
                          <Clock className="h-3 w-3" /> {fmtData(d.prazo)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Cadastros recentes</CardTitle>
            <CardDescription>Últimos apoiadores registrados.</CardDescription>
          </div>
          <Link href="/apoiadores" className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentes.length === 0 ? (
            <p className="text-sm text-ink-500">Nenhum cadastro ainda.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {recentes.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border border-ink-200 bg-white p-2.5"
                >
                  <AvatarInitials nome={a.nome} fotoPath={a.foto_path} className="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/apoiadores/${a.id}`}
                      className="block truncate text-sm font-medium text-ink-900 hover:underline"
                    >
                      {a.nome}
                    </Link>
                    <p className="text-2xs text-ink-500 truncate">
                      {a.municipio}
                      {a.liderNome && ` · ${a.liderNome}`}
                    </p>
                  </div>
                  <span className="font-mono-tab text-2xs text-ink-500">{fmtData(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
