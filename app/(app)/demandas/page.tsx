import Link from "next/link";
import {
  Plus,
  Inbox,
  LayoutGrid,
  Rows3,
  Pencil,
  Calendar,
  User,
  Megaphone,
  UserPlus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PrioridadeBadge,
  StatusDemandaBadge,
} from "@/components/app/status-badge";
import { DemandaCard } from "./demanda-card";
import { fmtNumero, fmtData } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type {
  Prioridade,
  StatusDemanda,
  TipoSolicitante,
} from "@/lib/validations/demanda";

export const metadata = { title: "Demandas" };

type ViewMode = "kanban" | "tabela";

interface Search {
  view?: string;
}

function parseView(raw: string | undefined): ViewMode {
  return raw === "tabela" ? "tabela" : "kanban";
}

const colunas: { status: StatusDemanda; titulo: string; descricao: string; tone: string }[] = [
  { status: "aberta", titulo: "Aberta", descricao: "Recebidas e aguardando triagem", tone: "border-status-amber" },
  { status: "andamento", titulo: "Em andamento", descricao: "Sendo trabalhadas pela equipe", tone: "border-status-blue" },
  { status: "resolvida", titulo: "Resolvida", descricao: "Concluídas nos últimos 60 dias", tone: "border-status-green" },
];

type DemandaItem = {
  id: string;
  codigo: string | null;
  titulo: string;
  categoria: string;
  prioridade: Prioridade;
  status: StatusDemanda;
  prazo: string | null;
  created_at: string;
  liderNome: string | null;
  solicitanteTipo: TipoSolicitante;
  solicitanteId: string | null;
  solicitanteLiderId: string | null;
  solicitanteNome: string | null;
};

export default async function DemandasPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const supabase = createClient();
  const view = parseView(searchParams.view);

  const sessenta = new Date();
  sessenta.setDate(sessenta.getDate() - 60);

  const { data, error } = await supabase
    .from("demandas")
    .select(
      `id, codigo, titulo, categoria, prioridade, status, prazo, created_at,
       solicitante_tipo, solicitante_id, solicitante_lider_id, solicitante_nome,
       lider:liderancas!demandas_lider_id_fkey(nome),
       solicitante_apoiador:apoiadores!demandas_solicitante_id_fkey(nome),
       solicitante_lider:liderancas!demandas_solicitante_lider_id_fkey(nome)`
    )
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

  const items: DemandaItem[] = (data ?? []).map((d) => {
    const lid = Array.isArray(d.lider) ? d.lider[0] : d.lider;
    const solApo = Array.isArray(d.solicitante_apoiador)
      ? d.solicitante_apoiador[0]
      : d.solicitante_apoiador;
    const solLid = Array.isArray(d.solicitante_lider)
      ? d.solicitante_lider[0]
      : d.solicitante_lider;
    // Nome efetivo do solicitante, conforme o tipo. Para avulso vem do campo
    // texto (`solicitante_nome`); para apoiador/líder, vem do JOIN.
    const solNome =
      d.solicitante_tipo === "apoiador"
        ? solApo?.nome ?? null
        : d.solicitante_tipo === "lideranca"
        ? solLid?.nome ?? null
        : d.solicitante_nome ?? null;
    return {
      id: d.id,
      codigo: d.codigo,
      titulo: d.titulo,
      categoria: d.categoria,
      prioridade: d.prioridade,
      status: d.status,
      prazo: d.prazo,
      created_at: d.created_at,
      liderNome: lid?.nome ?? null,
      solicitanteTipo: d.solicitante_tipo,
      solicitanteId: d.solicitante_id,
      solicitanteLiderId: d.solicitante_lider_id,
      solicitanteNome: solNome,
    };
  });
  const ativas = items.filter((d) => d.status !== "cancelada");

  const grupos: Record<StatusDemanda, DemandaItem[]> = {
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
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-500">
              {fmtNumero(ativas.length)} {ativas.length === 1 ? "demanda" : "demandas"}
            </p>
            <ViewToggle current={view} />
          </div>

          {view === "tabela" ? (
            <DemandasTabela items={ativas} />
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
        </>
      )}
    </div>
  );
}

function DemandasTabela({ items }: { items: DemandaItem[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Código</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Liderança</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Aberta em</TableHead>
            <TableHead className="w-[1%] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((d) => {
            const venceHoje =
              d.prazo &&
              new Date(d.prazo).toDateString() === new Date().toDateString();
            const vencido =
              d.prazo &&
              new Date(d.prazo) < new Date(new Date().toDateString()) &&
              d.status !== "resolvida";
            return (
              <TableRow key={d.id}>
                <TableCell className="font-mono-tab text-2xs font-semibold uppercase tracking-wider text-ink-500">
                  {d.codigo ?? "—"}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/demandas/${d.id}`}
                    className="block max-w-[420px] truncate font-medium text-ink-900 hover:underline"
                    title={d.titulo}
                  >
                    {d.titulo}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded bg-ink-100 px-1.5 py-0.5 text-2xs uppercase tracking-wide text-ink-600">
                    {d.categoria}
                  </span>
                </TableCell>
                <TableCell>
                  <PrioridadeBadge prioridade={d.prioridade} />
                </TableCell>
                <TableCell>
                  <StatusDemandaBadge status={d.status} />
                </TableCell>
                <TableCell>
                  <SolicitanteCell
                    tipo={d.solicitanteTipo}
                    nome={d.solicitanteNome}
                    apoiadorId={d.solicitanteId}
                    liderId={d.solicitanteLiderId}
                  />
                </TableCell>
                <TableCell className="text-xs text-ink-700">
                  {d.liderNome ?? (
                    <span className="text-2xs text-ink-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {d.prazo ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono-tab text-xs text-ink-700",
                        vencido && "text-status-red",
                        venceHoje && !vencido && "text-status-amber"
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {fmtData(d.prazo)}
                    </span>
                  ) : (
                    <span className="text-2xs text-ink-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono-tab text-xs text-ink-500">
                  {fmtData(d.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    aria-label={`Abrir ${d.titulo}`}
                  >
                    <Link href={`/demandas/${d.id}`}>
                      <Pencil className="h-4 w-4" /> Abrir
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

function ViewToggle({ current }: { current: ViewMode }) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className="inline-flex items-center rounded-md border border-ink-200 bg-white p-0.5"
    >
      <ViewToggleLink
        view="kanban"
        current={current}
        label="Quadro"
        icon={<LayoutGrid className="h-3.5 w-3.5" />}
      />
      <ViewToggleLink
        view="tabela"
        current={current}
        label="Tabela"
        icon={<Rows3 className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

function ViewToggleLink({
  view,
  current,
  label,
  icon,
}: {
  view: ViewMode;
  current: ViewMode;
  label: string;
  icon: React.ReactNode;
}) {
  const active = view === current;
  // "kanban" é o padrão — só emitimos `view=` quando for "tabela".
  const href = view === "tabela" ? "/demandas?view=tabela" : "/demandas";
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

function SolicitanteCell({
  tipo,
  nome,
  apoiadorId,
  liderId,
}: {
  tipo: TipoSolicitante;
  nome: string | null;
  apoiadorId: string | null;
  liderId: string | null;
}) {
  if (!nome) {
    return <span className="text-2xs text-ink-400">—</span>;
  }
  if (tipo === "apoiador" && apoiadorId) {
    return (
      <Link
        href={`/apoiadores/${apoiadorId}`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-700 hover:underline"
        title={`Apoiador: ${nome}`}
      >
        <User className="h-3 w-3 text-ink-400" />
        <span className="max-w-[160px] truncate">{nome}</span>
      </Link>
    );
  }
  if (tipo === "lideranca" && liderId) {
    return (
      <Link
        href={`/liderancas/${liderId}`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-700 hover:underline"
        title={`Liderança: ${nome}`}
      >
        <Megaphone className="h-3 w-3 text-ink-400" />
        <span className="max-w-[160px] truncate">{nome}</span>
      </Link>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-ink-700"
      title={`Avulso: ${nome}`}
    >
      <UserPlus className="h-3 w-3 text-ink-400" />
      <span className="max-w-[160px] truncate">{nome}</span>
      <span className="rounded bg-ink-100 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-600">
        Avulso
      </span>
    </span>
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
