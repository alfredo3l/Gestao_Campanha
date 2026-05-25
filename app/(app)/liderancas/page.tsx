import Link from "next/link";
import { Plus, MapPin, ArrowRight, LayoutGrid, Rows3, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCargosLider, getCargosLiderMap } from "@/lib/cargos/get-cargos";
import { getSetores } from "@/lib/localidades/get-localidades";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgressBar } from "@/components/app/progress-bar";
import { CargoBadge } from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import { fmtNumero } from "@/lib/utils/formatters";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { cn } from "@/lib/utils/cn";
import { LiderancasFiltros } from "./filtros";

export const metadata = { title: "Lideranças" };

type ViewMode = "cards" | "tabela";

interface Search {
  view?: string;
  q?: string;
  cargo?: string;
  municipio?: string;
  setor?: string;
  status?: string;
}

function parseView(raw: string | undefined): ViewMode {
  return raw === "cards" ? "cards" : "tabela";
}

/** Lê parâmetro multi-valor (CSV) — suporta filtros do tipo "in (...)". */
function parseMulti(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "todos");
}

export default async function LiderancasPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const supabase = createClient();
  const view = parseView(searchParams.view);

  const cargoSel = parseMulti(searchParams.cargo);
  const municipioSel = parseMulti(searchParams.municipio);
  const setorSel = parseMulti(searchParams.setor);
  const statusSel = parseMulti(searchParams.status);
  const termo = searchParams.q?.trim() ?? "";

  // Filtro por setor (N:N): resolve antes os ids de liderança que possuem
  // QUALQUER um dos setores selecionados — depois aplica `.in("id", ...)`
  // na view de progresso. Em caso de erro, retorna lista vazia.
  let liderIdsPorSetor: string[] | null = null;
  if (setorSel.length > 0) {
    const { data: vinc } = await supabase
      .from("lideranca_setores")
      .select("lideranca_id")
      .in("setor_id", setorSel);
    liderIdsPorSetor = Array.from(
      new Set((vinc ?? []).map((r) => r.lideranca_id))
    );
    if (liderIdsPorSetor.length === 0) liderIdsPorSetor = ["__none__"];
  }

  let query = supabase
    .from("v_progresso_lideranca")
    .select("*")
    .order("apoiadores_total", { ascending: false });

  if (cargoSel.length > 0) query = query.in("cargo", cargoSel);
  if (municipioSel.length > 0) query = query.in("municipio", municipioSel);
  if (liderIdsPorSetor) query = query.in("id", liderIdsPorSetor);

  if (statusSel.length === 1) {
    query = query.eq("ativa", statusSel[0] === "ativa");
  }
  // Se ambos `ativa` e `inativa` estão marcados, não filtra (mesma semântica
  // de "nenhum filtro de status").

  if (termo) {
    // Busca tolerante em nome, e-mail e telefone (ilike, sem acento-fold).
    const safe = termo.replace(/[%,]/g, " ");
    query = query.or(
      `nome.ilike.%${safe}%,email.ilike.%${safe}%,tel.ilike.%${safe}%`
    );
  }

  const [
    { data: liderancas, error },
    cargosMap,
    cargosAll,
    setoresAll,
    municipiosRes,
  ] = await Promise.all([
    query,
    getCargosLiderMap(),
    getCargosLider(),
    getSetores(),
    supabase.from("liderancas").select("municipio"),
  ]);

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

  const cargosFiltro = cargosAll
    .filter((c) => c.ativo)
    .map((c) => ({ value: c.value, label: c.label }));
  const setoresFiltro = setoresAll
    .filter((s) => s.ativo)
    .map((s) => ({ id: s.id, numero: s.numero, nome: s.nome, municipio: s.municipio }));
  const municipios = Array.from(
    new Set(
      (municipiosRes.data ?? [])
        .map((r) => r.municipio)
        .filter((m): m is string => Boolean(m))
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const hasFilters =
    cargoSel.length > 0 ||
    municipioSel.length > 0 ||
    setorSel.length > 0 ||
    statusSel.length > 0 ||
    Boolean(termo);

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
        <SummaryStat label={hasFilters ? "Resultado da busca" : "Total"} value={total} />
        <SummaryStat label="Ativas" value={ativas} />
        <SummaryStat label="Apoiadores vinculados" value={fmtNumero(totalApoiadores)} />
        <SummaryStat label="Meta agregada" value={fmtNumero(totalMeta)} />
      </div>

      <LiderancasFiltros
        cargos={cargosFiltro}
        municipios={municipios}
        setores={setoresFiltro}
        view={searchParams.view}
      />

      {!liderancas || liderancas.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nenhum resultado" : "Nenhuma liderança cadastrada"}
          description={
            hasFilters
              ? "Tente outro termo de busca ou limpe os filtros."
              : "Comece registrando coordenadores regionais e líderes de bairro."
          }
          action={
            !hasFilters && (
              <Button asChild>
                <Link href="/liderancas/novo">
                  <Plus className="h-4 w-4" /> Cadastrar a primeira
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-500">
              {fmtNumero(total)} {total === 1 ? "liderança" : "lideranças"}
            </p>
            <ViewToggle current={view} searchParams={searchParams} />
          </div>

          {view === "tabela" ? (
            <LiderancasTable liderancas={liderancas} cargosMap={cargosMap} />
          ) : (
            <LiderancasCards liderancas={liderancas} cargosMap={cargosMap} />
          )}
        </>
      )}
    </div>
  );
}

type SetorVinculado = {
  id: string;
  numero: number;
  nome: string;
  cor: string | null;
};

type Lideranca = {
  id: string;
  nome: string;
  cargo: string;
  municipio: string;
  bairro: string | null;
  meta_votos: number;
  ativa: boolean;
  foto_path: string | null;
  /** Anotações livres — exibidas truncadas com tooltip (migration 0015). */
  observacoes: string | null;
  /** Lista de setores vinculados (N:N — migration 0012). */
  setores: SetorVinculado[] | null;
  apoiadores_total: number;
  apoiadores_confirmados: number;
  votos_projetados: number;
  pct_meta: number | null;
};

function progressTone(pct: number): "brand" | "amber" | "red" | "green" {
  return pct >= 100 ? "green" : pct >= 60 ? "brand" : pct >= 30 ? "amber" : "red";
}

/**
 * Renderiza a célula de observações: trunca em uma linha com ellipsis e
 * mostra o conteúdo completo via tooltip (`title`). Reaproveitado nas tabelas
 * de lideranças e de apoiadores.
 */
function ObservacoesCell({ texto }: { texto: string | null }) {
  if (!texto || texto.trim().length === 0) {
    return <span className="text-2xs text-ink-400">—</span>;
  }
  return (
    <span
      title={texto}
      className="block max-w-[260px] truncate text-xs text-ink-700"
    >
      {texto}
    </span>
  );
}

function SetoresBadges({
  setores,
  max,
  align = "start",
}: {
  setores: SetorVinculado[] | null | undefined;
  max?: number;
  align?: "start" | "end";
}) {
  const lista = setores ?? [];
  if (lista.length === 0) {
    return <span className="text-2xs text-ink-400">—</span>;
  }
  const visiveis = typeof max === "number" ? lista.slice(0, max) : lista;
  const restantes = lista.length - visiveis.length;
  const restantesLabel = visiveis.length === 0 && restantes > 0 ? "+all" : "";
  return (
    <span
      className={cn(
        "flex flex-wrap gap-1",
        align === "end" ? "justify-end" : "justify-start"
      )}
    >
      {visiveis.map((s) => (
        <span
          key={s.id}
          title={s.nome}
          className="inline-flex items-center rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-800"
        >
          S{s.numero}
        </span>
      ))}
      {restantes > 0 && (
        <span
          title={lista
            .slice(visiveis.length)
            .map((s) => `Setor ${s.numero}`)
            .join(", ")}
          className="inline-flex items-center rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-700"
        >
          +{restantes}
          {restantesLabel}
        </span>
      )}
    </span>
  );
}

function LiderancasCards({
  liderancas,
  cargosMap,
}: {
  liderancas: Lideranca[];
  cargosMap: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {liderancas.map((l) => {
        const pct = l.pct_meta ?? 0;
        const tone = progressTone(pct);
        return (
          <Card key={l.id} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-3 space-y-0 pb-2">
              <AvatarInitials
                nome={l.nome}
                fotoPath={l.foto_path}
                className="h-10 w-10 mt-0.5"
              />
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
                  <CargoBadge cargo={l.cargo} label={cargosMap[l.cargo]} />
                  <span className="flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="h-3 w-3" /> {l.municipio}
                    {l.bairro ? ` · ${l.bairro}` : ""}
                  </span>
                </div>
                {l.setores && l.setores.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-2xs uppercase tracking-wide text-ink-400">
                      Setor:
                    </span>
                    <SetoresBadges setores={l.setores} max={4} />
                  </div>
                )}
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
              {l.observacoes && l.observacoes.trim().length > 0 && (
                <p
                  title={l.observacoes}
                  className="line-clamp-2 rounded-md border border-ink-100 bg-ink-50/60 px-2 py-1.5 text-2xs italic text-ink-600"
                >
                  {l.observacoes}
                </p>
              )}
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
  );
}

function LiderancasTable({
  liderancas,
  cargosMap,
}: {
  liderancas: Lideranca[];
  cargosMap: Record<string, string>;
}) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead className="text-right">Apoiadores</TableHead>
            <TableHead className="text-right">Confirmados</TableHead>
            <TableHead className="text-right">Meta</TableHead>
            <TableHead className="w-[180px]">Progresso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-[1%] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liderancas.map((l) => {
            const pct = l.pct_meta ?? 0;
            const tone = progressTone(pct);
            return (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <AvatarInitials nome={l.nome} fotoPath={l.foto_path} />
                    <div className="min-w-0">
                      <Link
                        href={`/liderancas/${l.id}`}
                        className="block font-medium text-ink-900 hover:underline"
                      >
                        {l.nome}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CargoBadge cargo={l.cargo} label={cargosMap[l.cargo]} />
                </TableCell>
                <TableCell className="text-ink-700">
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3 text-ink-400" />
                    <span>
                      {l.municipio}
                      {l.bairro ? ` · ${l.bairro}` : ""}
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <SetoresBadges setores={l.setores} max={3} />
                </TableCell>
                <TableCell className="text-right font-mono-tab text-sm text-ink-800">
                  {fmtNumero(l.apoiadores_total ?? 0)}
                </TableCell>
                <TableCell className="text-right font-mono-tab text-sm text-ink-800">
                  {fmtNumero(l.apoiadores_confirmados ?? 0)}
                </TableCell>
                <TableCell className="text-right font-mono-tab text-sm text-ink-800">
                  {fmtNumero(l.meta_votos ?? 0)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={pct} tone={tone} className="flex-1" />
                    <span className="font-mono-tab text-xs font-medium text-ink-700 w-10 text-right">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {l.ativa ? (
                    <Badge variant="green">Ativa</Badge>
                  ) : (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <ObservacoesCell texto={l.observacoes} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm" aria-label={`Editar ${l.nome}`}>
                    <Link href={`/liderancas/${l.id}`}>
                      <Pencil className="h-4 w-4" /> Editar
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function ViewToggle({
  current,
  searchParams,
}: {
  current: ViewMode;
  searchParams: Search;
}) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className="inline-flex items-center rounded-md border border-ink-200 bg-white p-0.5"
    >
      <ViewToggleLink
        view="cards"
        current={current}
        label="Cartões"
        icon={<LayoutGrid className="h-3.5 w-3.5" />}
        searchParams={searchParams}
      />
      <ViewToggleLink
        view="tabela"
        current={current}
        label="Tabela"
        icon={<Rows3 className="h-3.5 w-3.5" />}
        searchParams={searchParams}
      />
    </div>
  );
}

function ViewToggleLink({
  view,
  current,
  label,
  icon,
  searchParams,
}: {
  view: ViewMode;
  current: ViewMode;
  label: string;
  icon: React.ReactNode;
  searchParams: Search;
}) {
  const active = view === current;
  // Preserva os filtros vigentes na URL ao alternar entre cards/tabela.
  // "tabela" é o padrão — só emitimos `view=` quando for "cards".
  const qs = new URLSearchParams();
  if (searchParams.q) qs.set("q", searchParams.q);
  if (searchParams.cargo) qs.set("cargo", searchParams.cargo);
  if (searchParams.municipio) qs.set("municipio", searchParams.municipio);
  if (searchParams.setor) qs.set("setor", searchParams.setor);
  if (searchParams.status) qs.set("status", searchParams.status);
  if (view === "cards") qs.set("view", "cards");
  const params = qs.toString();
  const href = params ? `/liderancas?${params}` : "/liderancas";
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-brand-100 text-brand-800"
          : "text-ink-500 hover:bg-ink-50 hover:text-ink-700"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
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
