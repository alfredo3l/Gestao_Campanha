"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FilterComboboxOption } from "@/components/ui/filter-combobox";
import { MultiFilterCombobox } from "@/components/ui/multi-filter-combobox";

interface SetorOpt {
  id: string;
  numero: number;
  nome: string;
  municipio: string;
}

interface CargoOpt {
  value: string;
  label: string;
}

interface Props {
  cargos: CargoOpt[];
  municipios: string[];
  setores: SetorOpt[];
  /** View atual ("cards" ou "tabela") — preservada nos cliques de filtro. */
  view?: string;
}

const statusOpcoes: { value: "ativa" | "inativa"; label: string }[] = [
  { value: "ativa", label: "Ativas" },
  { value: "inativa", label: "Inativas" },
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

export function LiderancasFiltros({
  cargos,
  municipios,
  setores,
  view,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  function buildHref(next: URLSearchParams): string {
    next.delete("page");
    // "tabela" é o padrão — só propagamos `view` quando for "cards".
    if (view === "cards") next.set("view", "cards");
    else next.delete("view");
    const qs = next.toString();
    return qs ? `/liderancas?${qs}` : "/liderancas";
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
    if (view === "cards") next.set("view", "cards");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/liderancas?${qs}` : "/liderancas"));
  }

  const hasFilters = ["q", "cargo", "municipio", "setor", "status"].some((k) =>
    params.get(k)
  );

  const cargoOptions: FilterComboboxOption[] = cargos.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const municipioOptions: FilterComboboxOption[] = municipios.map((m) => ({
    value: m,
    label: m,
  }));

  // Se houver setores em mais de um município, prefixa o município no label
  // para evitar ambiguidade. Caso contrário, mostra apenas "Setor N — Nome".
  const municipiosDistintos = new Set(setores.map((s) => s.municipio)).size;
  const setorOptions: FilterComboboxOption[] = setores.map((s) => ({
    value: s.id,
    label:
      municipiosDistintos > 1
        ? `${s.municipio} · Setor ${s.numero}${
            s.nome && s.nome !== `Setor ${s.numero}` ? ` — ${s.nome}` : ""
          }`
        : `Setor ${s.numero}${
            s.nome && s.nome !== `Setor ${s.numero}` ? ` — ${s.nome}` : ""
          }`,
  }));

  const statusOptions: FilterComboboxOption[] = statusOpcoes.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  const cargoValue = readMulti(params, "cargo");
  const municipioValue = readMulti(params, "municipio");
  const setorValue = readMulti(params, "setor");
  const statusValue = readMulti(params, "status");

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <form onSubmit={onSearchSubmit} className="relative flex-1 md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, e-mail, telefone…"
          className="pl-9"
        />
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <MultiFilterCombobox
          className="w-[180px]"
          options={cargoOptions}
          value={cargoValue}
          onChange={(v) => updateMulti("cargo", v)}
          placeholder="Cargo"
          ariaLabel="Filtrar por cargo (multi)"
          searchPlaceholder="Pesquisar cargo…"
          emptyMessage="Nenhum cargo encontrado."
          countLabel={(n) => (n === 1 ? "1 cargo" : `${n} cargos`)}
        />
        <MultiFilterCombobox
          className="w-[200px]"
          options={municipioOptions}
          value={municipioValue}
          onChange={(v) => updateMulti("municipio", v)}
          placeholder="Município"
          ariaLabel="Filtrar por município (multi)"
          searchPlaceholder="Pesquisar município…"
          emptyMessage="Nenhum município encontrado."
          countLabel={(n) => (n === 1 ? "1 município" : `${n} municípios`)}
        />
        <MultiFilterCombobox
          className="w-[200px]"
          options={setorOptions}
          value={setorValue}
          onChange={(v) => updateMulti("setor", v)}
          placeholder="Setor"
          ariaLabel="Filtrar por setor (multi)"
          searchPlaceholder="Pesquisar setor…"
          emptyMessage="Nenhum setor encontrado."
          countLabel={(n) => (n === 1 ? "1 setor" : `${n} setores`)}
        />
        <MultiFilterCombobox
          className="w-[160px]"
          options={statusOptions}
          value={statusValue}
          onChange={(v) => updateMulti("status", v)}
          placeholder="Status"
          ariaLabel="Filtrar por status (multi)"
          searchPlaceholder="Pesquisar status…"
          emptyMessage="Nenhum status encontrado."
          countLabel={(n) => `${n} status`}
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
