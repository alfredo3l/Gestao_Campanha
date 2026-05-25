import { Download, FileBarChart, FileSpreadsheet, FileText, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtNumero } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Relatórios" };

export default async function RelatoriosPage() {
  const supabase = createClient();
  const [statusRes, cargoRes, catRes, regiaoRes] = await Promise.all([
    supabase.from("apoiadores").select("status"),
    supabase.from("liderancas").select("cargo"),
    supabase.from("demandas").select("categoria, status"),
    supabase.from("v_progresso_regiao").select("regiao, votos_projetados, meta_votos"),
  ]);

  const porStatus = agrupar(statusRes.data ?? [], (r) => r.status);
  const porCargo = agrupar(cargoRes.data ?? [], (r) => r.cargo);
  const porCategoria = agrupar(catRes.data ?? [], (r) => r.categoria);

  const relatorios = [
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      titulo: "Apoiadores por município",
      descricao: "CSV completo dos apoiadores com filtros por região, status e liderança.",
      acao: "Em breve",
    },
    {
      icon: <FileBarChart className="h-5 w-5" />,
      titulo: "Progresso por liderança",
      descricao: "Atingimento de meta por liderança ativa e cargo.",
      acao: "Em breve",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      titulo: "Mapa de cobertura",
      descricao: "Distribuição geográfica de apoiadores e lideranças por município.",
      acao: "Em breve",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      titulo: "Demandas por categoria",
      descricao: "Demandas agrupadas por categoria, status e prioridade.",
      acao: "Em breve",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Indicadores consolidados e exportações para análise da campanha."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apoiadores por status</CardTitle>
            <CardDescription>Distribuição da base atual de eleitores.</CardDescription>
          </CardHeader>
          <CardContent>
            <DistribuicaoLista dados={porStatus} labels={statusLabels} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lideranças por cargo</CardTitle>
            <CardDescription>Composição da estrutura de coordenação.</CardDescription>
          </CardHeader>
          <CardContent>
            <DistribuicaoLista dados={porCargo} labels={cargoLabels} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demandas por categoria</CardTitle>
            <CardDescription>Principais temas trazidos pelos eleitores.</CardDescription>
          </CardHeader>
          <CardContent>
            <DistribuicaoLista dados={porCategoria} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance por região</CardTitle>
            <CardDescription>Votos projetados vs. meta agregada.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(regiaoRes.data ?? []).map((r) => {
                const pct =
                  r.meta_votos && r.meta_votos > 0 ? (r.votos_projetados / r.meta_votos) * 100 : 0;
                return (
                  <li key={r.regiao} className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink-700">{r.regiao}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tab text-xs text-ink-500">
                        {fmtNumero(r.votos_projetados)} / {fmtNumero(r.meta_votos)}
                      </span>
                      <Badge variant={pct >= 100 ? "green" : pct >= 60 ? "blue" : pct >= 30 ? "amber" : "red"}>
                        {Math.round(pct)}%
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-ink-900">
          Exportações disponíveis
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {relatorios.map((r) => (
            <Card key={r.titulo}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="rounded-md bg-brand-100 p-2 text-brand-800">{r.icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-sm">{r.titulo}</CardTitle>
                  <CardDescription className="text-xs">{r.descricao}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-end pt-0">
                <Button size="sm" variant="outline" disabled>
                  <Download className="h-4 w-4" /> {r.acao}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  confirmado: "Confirmado",
  provavel: "Provável",
  indeciso: "Indeciso",
  contato: "Em contato",
  nao_vota: "Não vota",
};

const cargoLabels: Record<string, string> = {
  coord_regional: "Coord. Regional",
  coord_zona: "Coord. de Zona",
  lider_bairro: "Líder de Bairro",
  lider_comunitario: "Líder Comunitário",
  lider_rural: "Líder Rural",
};

function agrupar<T>(rows: T[], key: (r: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r) ?? "indefinido";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([k, v]) => ({ chave: k, total: v }))
    .sort((a, b) => b.total - a.total);
}

function DistribuicaoLista({
  dados,
  labels,
}: {
  dados: { chave: string; total: number }[];
  labels?: Record<string, string>;
}) {
  const max = Math.max(1, ...dados.map((d) => d.total));
  if (dados.length === 0) {
    return <p className="text-sm text-ink-500">Sem dados ainda.</p>;
  }
  return (
    <ul className="space-y-2">
      {dados.map((d) => (
        <li key={d.chave} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-700">{labels?.[d.chave] ?? d.chave}</span>
            <span className="font-mono-tab text-xs font-semibold text-ink-900">
              {fmtNumero(d.total)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${(d.total / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
