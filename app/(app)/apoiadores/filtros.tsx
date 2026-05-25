"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusApoio } from "@/lib/validations/apoiador";

interface Props {
  liderancas: { id: string; nome: string }[];
  municipios: string[];
}

const statusOpcoes: { value: StatusApoio | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "confirmado", label: "Confirmados" },
  { value: "provavel", label: "Prováveis" },
  { value: "indeciso", label: "Indecisos" },
  { value: "contato", label: "Em contato" },
  { value: "nao_vota", label: "Não vota" },
];

export function ApoiadoresFiltros({ liderancas, municipios }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "todos") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    startTransition(() => router.push(`/apoiadores?${next.toString()}`));
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    update("q", q.trim());
  }

  function clear() {
    setQ("");
    startTransition(() => router.push("/apoiadores"));
  }

  const hasFilters = ["q", "status", "municipio", "lider"].some((k) => params.get(k));

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
        <Select
          value={params.get("status") ?? "todos"}
          onValueChange={(v) => update("status", v)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOpcoes.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.get("municipio") ?? "todos"}
          onValueChange={(v) => update("municipio", v)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os municípios</SelectItem>
            {municipios.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.get("lider") ?? "todos"}
          onValueChange={(v) => update("lider", v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Liderança" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as lideranças</SelectItem>
            {liderancas.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clear} disabled={pending}>
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
