"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FilterComboboxOption } from "@/components/ui/filter-combobox";
import { MultiFilterCombobox } from "@/components/ui/multi-filter-combobox";
import type {
  Prioridade,
  StatusDemanda,
  TipoSolicitante,
} from "@/lib/validations/demanda";

interface Props {
  categorias: string[];
  liderancas: { id: string; nome: string }[];
  /** View atual ("kanban" ou "tabela") — preservada nos cliques de filtro. */
  view?: string;
}

const statusOpcoes: { value: StatusDemanda; label: string }[] = [
  { value: "aberta", label: "Aberta" },
  { value: "andamento", label: "Em andamento" },
  { value: "resolvida", label: "Resolvida" },
  { value: "cancelada", label: "Cancelada" },
];

const prioridadeOpcoes: { value: Prioridade; label: string }[] = [
  { value: "urgente", label: "Urgente" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

const tipoSolicitanteOpcoes: { value: TipoSolicitante; label: string }[] = [
  { value: "apoiador", label: "Apoiador" },
  { value: "lideranca", label: "Liderança" },
  { value: "avulso", label: "Avulso" },
];

/** Lê um param multi-valor da URL: aceita "a,b,c" e devolve array (sem vazios). */
function readMulti(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function DemandasFiltros({ categorias, liderancas, view }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  function buildHref(next: URLSearchParams): string {
    next.delete("page");
    // "tabela" é o padrão — só propagamos `view` quando for "kanban".
    if (view === "kanban") next.set("view", "kanban");
    else next.delete("view");
    const qs = next.toString();
    return qs ? `/demandas?${qs}` : "/demandas";
  }

  function updateMulti(key: string, values: string[]) {
    const next = new URLSearchParams(params);
    if (values.length === 0) next.delete(key);
    else next.set(key, values.join(","));
    startTransition(() => router.push(buildHref(next)));
  }

  function updateText(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    startTransition(() => router.push(buildHref(next)));
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateText("q", q.trim());
  }

  function clear() {
    setQ("");
    const next = new URLSearchParams();
    if (view === "kanban") next.set("view", "kanban");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/demandas?${qs}` : "/demandas"));
  }

  const hasFilters = [
    "q",
    "status",
    "prioridade",
    "categoria",
    "lider",
    "solicitante_tipo",
  ].some((k) => params.get(k));

  const statusOptions: FilterComboboxOption[] = statusOpcoes.map((o) => ({
    value: o.value,
    label: o.label,
  }));
  const prioridadeOptions: FilterComboboxOption[] = prioridadeOpcoes.map((o) => ({
    value: o.value,
    label: o.label,
  }));
  const categoriaOptions: FilterComboboxOption[] = categorias.map((c) => ({
    value: c,
    label: c,
  }));
  const liderancaOptions: FilterComboboxOption[] = liderancas.map((l) => ({
    value: l.id,
    label: l.nome,
  }));
  const tipoSolicitanteOptions: FilterComboboxOption[] =
    tipoSolicitanteOpcoes.map((o) => ({ value: o.value, label: o.label }));

  const statusValue = readMulti(params, "status");
  const prioridadeValue = readMulti(params, "prioridade");
  const categoriaValue = readMulti(params, "categoria");
  const liderValue = readMulti(params, "lider");
  const solicitanteValue = readMulti(params, "solicitante_tipo");

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <form onSubmit={onSearchSubmit} className="relative flex-1 md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título ou código…"
          className="pl-9"
        />
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <MultiFilterCombobox
          className="w-[170px]"
          options={statusOptions}
          value={statusValue}
          onChange={(v) => updateMulti("status", v)}
          placeholder="Status"
          ariaLabel="Filtrar por status (multi)"
          searchPlaceholder="Pesquisar status…"
          emptyMessage="Nenhum status encontrado."
          countLabel={(n) => `${n} status`}
        />
        <MultiFilterCombobox
          className="w-[170px]"
          options={prioridadeOptions}
          value={prioridadeValue}
          onChange={(v) => updateMulti("prioridade", v)}
          placeholder="Prioridade"
          ariaLabel="Filtrar por prioridade (multi)"
          searchPlaceholder="Pesquisar prioridade…"
          emptyMessage="Nenhuma prioridade encontrada."
          countLabel={(n) => (n === 1 ? "1 prioridade" : `${n} prioridades`)}
        />
        <MultiFilterCombobox
          className="w-[190px]"
          options={categoriaOptions}
          value={categoriaValue}
          onChange={(v) => updateMulti("categoria", v)}
          placeholder="Categoria"
          ariaLabel="Filtrar por categoria (multi)"
          searchPlaceholder="Pesquisar categoria…"
          emptyMessage="Nenhuma categoria encontrada."
          countLabel={(n) => (n === 1 ? "1 categoria" : `${n} categorias`)}
        />
        <MultiFilterCombobox
          className="w-[220px]"
          options={liderancaOptions}
          value={liderValue}
          onChange={(v) => updateMulti("lider", v)}
          placeholder="Liderança"
          ariaLabel="Filtrar por liderança responsável (multi)"
          searchPlaceholder="Pesquisar liderança…"
          emptyMessage="Nenhuma liderança encontrada."
          countLabel={(n) => (n === 1 ? "1 liderança" : `${n} lideranças`)}
        />
        <MultiFilterCombobox
          className="w-[190px]"
          options={tipoSolicitanteOptions}
          value={solicitanteValue}
          onChange={(v) => updateMulti("solicitante_tipo", v)}
          placeholder="Solicitante"
          ariaLabel="Filtrar por tipo de solicitante (multi)"
          searchPlaceholder="Pesquisar tipo…"
          emptyMessage="Nenhum tipo encontrado."
          countLabel={(n) => (n === 1 ? "1 tipo" : `${n} tipos`)}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clear} disabled={pending}>
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
