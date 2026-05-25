import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgressBar } from "@/components/app/progress-bar";
import { Badge } from "@/components/ui/badge";
import { fmtNumero, fmtPercentual, fmtData } from "@/lib/utils/formatters";

export const metadata = { title: "Metas" };

const QUOCIENTE_ESTADUAL_MS = 28500;

export default async function MetasPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_progresso_regiao")
    .select("*")
    .order("regiao");

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Metas" />
        <Card>
          <CardContent className="text-sm text-status-red">Erro: {error.message}</CardContent>
        </Card>
      </div>
    );
  }

  const regioes = data ?? [];
  const totalMeta = regioes.reduce((acc, r) => acc + (r.meta_votos ?? 0), 0);
  const totalProj = regioes.reduce((acc, r) => acc + (r.votos_projetados ?? 0), 0);
  const totalLider = regioes.reduce((acc, r) => acc + (r.liderancas_ativas ?? 0), 0);
  const totalApoia = regioes.reduce((acc, r) => acc + (r.apoiadores_total ?? 0), 0);
  const folga = totalProj - QUOCIENTE_ESTADUAL_MS;
  const pctMetaTotal = totalMeta > 0 ? (totalProj / totalMeta) * 100 : 0;

  const emAtencao = regioes
    .filter((r) => (r.pct_meta ?? 0) < 60)
    .sort((a, b) => (a.pct_meta ?? 0) - (b.pct_meta ?? 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas por região"
        description="Distribuição da meta de votos pelas regiões do Mato Grosso do Sul, com folga vs. quociente eleitoral estadual."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiBox label="Meta total" value={fmtNumero(totalMeta)} hint="agregada das regiões" />
        <KpiBox
          label="Votos projetados"
          value={fmtNumero(totalProj)}
          hint={`${fmtPercentual(Math.min(1, pctMetaTotal / 100))} da meta`}
        />
        <KpiBox
          label="Quociente eleitoral MS"
          value={fmtNumero(QUOCIENTE_ESTADUAL_MS)}
          hint="referência Dep. Estadual"
        />
        <KpiBox
          label="Folga vs. quociente"
          value={`${folga >= 0 ? "+" : ""}${fmtNumero(folga)}`}
          tone={folga >= 0 ? "green" : "red"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso por região</CardTitle>
          <CardDescription>
            Lideranças ativas, eleitores cadastrados, votos projetados e atingimento da meta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Região</TableHead>
                <TableHead className="text-right">Eleitores aptos</TableHead>
                <TableHead className="text-right">Lideranças</TableHead>
                <TableHead className="text-right">Apoiadores</TableHead>
                <TableHead className="text-right">Projetado</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="w-[200px]">Atingido</TableHead>
                <TableHead>Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regioes.map((r) => {
                const pct = r.pct_meta ?? 0;
                const tone: "green" | "brand" | "amber" | "red" =
                  pct >= 100 ? "green" : pct >= 70 ? "brand" : pct >= 40 ? "amber" : "red";
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium text-ink-900">{r.regiao}</p>
                      <p className="text-2xs text-ink-500">
                        {(r.municipios ?? []).slice(0, 3).join(", ")}
                        {(r.municipios?.length ?? 0) > 3 ? "…" : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono-tab text-xs">
                      {fmtNumero(r.eleitores ?? 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono-tab text-xs">
                      {fmtNumero(r.liderancas_ativas ?? 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono-tab text-xs">
                      {fmtNumero(r.apoiadores_total ?? 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono-tab text-xs font-semibold text-ink-900">
                      {fmtNumero(r.votos_projetados ?? 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono-tab text-xs">
                      {fmtNumero(r.meta_votos ?? 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar value={pct} tone={tone} />
                        </div>
                        <span className="font-mono-tab text-2xs font-semibold text-ink-700 w-10 text-right">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono-tab text-xs text-ink-500">
                      {r.prazo ? fmtData(r.prazo) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo executivo</CardTitle>
            <CardDescription>Visão consolidada para a coordenação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ResumoLinha
              label="Cenário atual"
              value={
                folga >= 0 ? (
                  <span className="text-status-green">Acima do quociente eleitoral</span>
                ) : (
                  <span className="text-status-red">Abaixo do quociente — atenção</span>
                )
              }
            />
            <ResumoLinha
              label="Folga / déficit"
              value={
                <span className="font-mono-tab">
                  {folga >= 0 ? "+" : ""}
                  {fmtNumero(folga)} votos
                </span>
              }
            />
            <ResumoLinha
              label="Total de lideranças ativas"
              value={<span className="font-mono-tab">{fmtNumero(totalLider)}</span>}
            />
            <ResumoLinha
              label="Total de apoiadores cadastrados"
              value={<span className="font-mono-tab">{fmtNumero(totalApoia)}</span>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regiões em atenção</CardTitle>
            <CardDescription>Abaixo de 60% da meta — priorizar reforço.</CardDescription>
          </CardHeader>
          <CardContent>
            {emAtencao.length === 0 ? (
              <p className="text-sm text-ink-500">Nenhuma região abaixo de 60% da meta no momento.</p>
            ) : (
              <ul className="space-y-3">
                {emAtencao.map((r) => (
                  <li key={r.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-900">{r.regiao}</span>
                      <Badge variant={(r.pct_meta ?? 0) < 30 ? "red" : "amber"}>
                        {Math.round(r.pct_meta ?? 0)}%
                      </Badge>
                    </div>
                    <ProgressBar
                      value={r.pct_meta ?? 0}
                      tone={(r.pct_meta ?? 0) < 30 ? "red" : "amber"}
                    />
                    <p className="text-2xs text-ink-500">
                      {fmtNumero(r.votos_projetados ?? 0)} de {fmtNumero(r.meta_votos ?? 0)} votos
                      projetados · {fmtNumero(r.liderancas_ativas ?? 0)} liderança(s)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiBox({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "green" | "red";
}) {
  const valueCls =
    tone === "green" ? "text-status-green" : tone === "red" ? "text-status-red" : "text-ink-900";
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold tabular ${valueCls}`}>{value}</p>
      {hint && <p className="text-2xs text-ink-500">{hint}</p>}
    </div>
  );
}

function ResumoLinha({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
