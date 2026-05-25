"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Calendar, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { PrioridadeBadge } from "@/components/app/status-badge";
import { fmtData } from "@/lib/utils/formatters";
import { moverStatusDemanda } from "./actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import type { Prioridade, StatusDemanda } from "@/lib/validations/demanda";

interface Props {
  id: string;
  codigo: string | null;
  titulo: string;
  categoria: string;
  prioridade: Prioridade;
  prazo: string | null;
  status: StatusDemanda;
  liderNome?: string | null;
}

const proximo: Record<StatusDemanda, StatusDemanda | null> = {
  aberta: "andamento",
  andamento: "resolvida",
  resolvida: null,
  cancelada: null,
};

const anterior: Record<StatusDemanda, StatusDemanda | null> = {
  aberta: null,
  andamento: "aberta",
  resolvida: "andamento",
  cancelada: "aberta",
};

export function DemandaCard({
  id,
  codigo,
  titulo,
  categoria,
  prioridade,
  prazo,
  status,
  liderNome,
}: Props) {
  const [pending, startTransition] = useTransition();
  const next = proximo[status];
  const prev = anterior[status];

  function move(novo: StatusDemanda) {
    startTransition(async () => {
      const res = await moverStatusDemanda(id, novo);
      if (res?.error) toast.error("Erro ao mover", { description: res.error });
    });
  }

  const venceHoje = prazo && new Date(prazo).toDateString() === new Date().toDateString();
  const vencido =
    prazo && new Date(prazo) < new Date(new Date().toDateString()) && status !== "resolvida";

  return (
    <article
      className={cn(
        "group rounded-md border border-ink-200 bg-white p-3 shadow-sm transition-colors",
        pending && "opacity-60"
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <span className="font-mono-tab text-2xs font-semibold uppercase tracking-wider text-ink-500">
          {codigo ?? "—"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded p-0.5 text-ink-500 opacity-0 transition-opacity hover:bg-ink-100 hover:text-ink-700 group-hover:opacity-100">
            <MoreVertical className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mover para</DropdownMenuLabel>
            {(["aberta", "andamento", "resolvida", "cancelada"] as const)
              .filter((s) => s !== status)
              .map((s) => (
                <DropdownMenuItem key={s} onSelect={() => move(s)}>
                  {s === "aberta" && "Aberta"}
                  {s === "andamento" && "Em andamento"}
                  {s === "resolvida" && "Resolvida"}
                  {s === "cancelada" && "Cancelada"}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/demandas/${id}`}>Abrir detalhes</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <Link
        href={`/demandas/${id}`}
        className="mt-1 block font-medium leading-snug text-ink-900 hover:underline"
      >
        {titulo}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PrioridadeBadge prioridade={prioridade} />
        <span className="rounded bg-ink-100 px-1.5 py-0.5 text-2xs uppercase tracking-wide text-ink-600">
          {categoria}
        </span>
      </div>
      <footer className="mt-2 flex items-center justify-between text-2xs text-ink-500">
        {liderNome ? <span className="truncate">{liderNome}</span> : <span>—</span>}
        {prazo && (
          <span
            className={cn(
              "flex items-center gap-1 font-mono-tab",
              vencido && "text-status-red",
              venceHoje && !vencido && "text-status-amber"
            )}
          >
            <Calendar className="h-3 w-3" />
            {fmtData(prazo)}
          </span>
        )}
      </footer>
      {(prev || next) && (
        <div className="mt-2 flex items-center gap-1">
          {prev && (
            <button
              type="button"
              disabled={pending}
              onClick={() => move(prev)}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-ink-200 px-2 py-1 text-2xs text-ink-600 transition-colors hover:bg-ink-50"
            >
              <ChevronLeft className="h-3 w-3" /> Voltar
            </button>
          )}
          {next && (
            <button
              type="button"
              disabled={pending}
              onClick={() => move(next)}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-brand-100 bg-brand-100/40 px-2 py-1 text-2xs font-medium text-brand-800 transition-colors hover:bg-brand-100"
            >
              Avançar <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
