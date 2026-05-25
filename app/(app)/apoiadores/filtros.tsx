"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FilterComboboxOption } from "@/components/ui/filter-combobox";
import { MultiFilterCombobox } from "@/components/ui/multi-filter-combobox";
import type { StatusApoio } from "@/lib/validations/apoiador";

interface SetorOpt {
  id: string;
  numero: number;
  nome: string;
  municipio: string;
}

interface Props {
  liderancas: { id: string; nome: string }[];
  municipios: string[];
  setores: SetorOpt[];
}

const statusOpcoes: { value: StatusApoio; label: string }[] = [
  { value: "confirmado", label: "Confirmados" },
  { value: "provavel", label: "Prováveis" },
  { value: "indeciso", label: "Indecisos" },
  { value: "contato", label: "Em contato" },
  { value: "nao_vota", label: "Não vota" },
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

export function ApoiadoresFiltros({ liderancas, municipios, setores }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  function updateMulti(key: string, values: string[]) {
    const next = new URLSearchParams(params);
    if (values.length === 0) next.delete(key);
    else next.set(key, values.join(","));
    next.delete("page");
    startTransition(() => router.push(`/apoiadores?${next.toString()}`));
  }

  function updateText(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    startTransition(() => router.push(`/apoiadores?${next.toString()}`));
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateText("q", q.trim());
  }

  function clear() {
    setQ("");
    startTransition(() => router.push("/apoiadores"));
  }

  const hasFilters = ["q", "status", "municipio", "lider", "setor"].some((k) =>
    params.get(k)
  );

  const statusOptions: FilterComboboxOption[] = statusOpcoes.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  const municipioOptions: FilterComboboxOption[] = municipios.map((m) => ({
    value: m,
    label: m,
  }));

  const liderancaOptions: FilterComboboxOption[] = liderancas.map((l) => ({
    value: l.id,
    label: l.nome,
  }));

  // Se houver setores em mais de um município, prefixa o município no label
  // para evitar ambiguidade. Caso contrário, mostra apenas "Setor N — Nome".
  const municipiosDistintos = new Set(setores.map((s) => s.municipio)).size;
  const setorOptions: FilterComboboxOption[] = setores.map((s) => ({
    value: s.id,
    label:
      municipiosDistintos > 1
        ? `${s.municipio} · Setor ${s.numero} — ${s.nome}`
        : `Setor ${s.numero} — ${s.nome}`,
  }));

  const statusValue = readMulti(params, "status");
  const municipioValue = readMulti(params, "municipio");
  const liderValue = readMulti(params, "lider");
  const setorValue = readMulti(params, "setor");

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <form onSubmit={onSearchSubmit} className="relative flex-1 md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, CPF, telefone…"
          className="pl-9"
        />
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <MultiFilterCombobox
          className="w-[180px]"
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
          className="w-[220px]"
          options={liderancaOptions}
          value={liderValue}
          onChange={(v) => updateMulti("lider", v)}
          placeholder="Liderança"
          ariaLabel="Filtrar por liderança (multi)"
          searchPlaceholder="Pesquisar liderança…"
          emptyMessage="Nenhuma liderança encontrada."
          countLabel={(n) => (n === 1 ? "1 liderança" : `${n} lideranças`)}
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
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clear} disabled={pending}>
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
