"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPinned } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";

export interface BairroOption {
  id: string;
  nome: string;
  municipio: string;
  setor_id: string | null;
  setor_numero: number | null;
  setor_nome: string | null;
  ativo: boolean;
}

interface Props {
  /** Nome do campo (text) — recebe o NOME do bairro (compat com `bairro` text). */
  name: string;
  /** Nome do campo hidden que carrega o uuid do bairro selecionado. */
  bairroIdName?: string;
  /** Nome do campo hidden que carrega o uuid do setor inferido. */
  setorIdName?: string;
  id?: string;
  required?: boolean;
  /** Nome do bairro inicial (texto). */
  defaultValue?: string;
  /** UUID do bairro inicial (para edição). */
  defaultBairroId?: string | null;
  /** UUID do setor inicial (para edição quando o bairro foi inativado). */
  defaultSetorId?: string | null;
  /** Lista completa de bairros disponíveis (vinda do servidor). */
  options: BairroOption[];
  /** Município corrente — filtra a lista. Quando vazio, mostra todos. */
  municipio?: string;
  placeholder?: string;
  className?: string;
}

function normalizar(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Combobox de bairros com setor associado. Comportamento:
 *  - Lista vem do server (cadastro em /configuracoes/bairros).
 *  - Filtra por município passado em `municipio` (quando informado).
 *  - Aceita texto livre — útil para localidades ainda não cadastradas.
 *    Nesse caso `bairro_id` fica vazio e o usuário pode pedir ao admin
 *    para incluir o novo bairro nas configurações.
 *  - Ao selecionar um item, emite também o `setor_id` no input hidden.
 */
export function BairroCombobox({
  name,
  bairroIdName = "bairro_id",
  setorIdName = "setor_id",
  id,
  required,
  defaultValue = "",
  defaultBairroId = null,
  defaultSetorId = null,
  options,
  municipio,
  placeholder = "Comece a digitar o bairro…",
  className,
}: Props) {
  const autoId = useId();
  const inputId = id ?? `bairro-${autoId}`;
  const listboxId = `${inputId}-listbox`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [value, setValue] = useState<string>(defaultValue);
  const [bairroId, setBairroId] = useState<string>(defaultBairroId ?? "");
  const [setorId, setSetorId] = useState<string>(defaultSetorId ?? "");
  const [setorLabel, setSetorLabel] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const opcoesDoMunicipio = useMemo(() => {
    const lista = options.filter((b) => b.ativo);
    if (!municipio) return lista;
    const q = normalizar(municipio);
    return lista.filter((b) => normalizar(b.municipio) === q);
  }, [options, municipio]);

  const filtered = useMemo(() => {
    const q = normalizar(value);
    if (!q) return opcoesDoMunicipio;
    return opcoesDoMunicipio.filter((b) => normalizar(b.nome).includes(q));
  }, [opcoesDoMunicipio, value]);

  useEffect(() => {
    if (!defaultBairroId) return;
    const found = options.find((o) => o.id === defaultBairroId);
    if (found) {
      setValue(found.nome);
      setSetorId(found.setor_id ?? "");
      setSetorLabel(
        found.setor_numero != null
          ? `Setor ${found.setor_numero}${
              found.setor_nome && found.setor_nome !== `Setor ${found.setor_numero}`
                ? ` · ${found.setor_nome}`
                : ""
            }`
          : ""
      );
    }
  }, [defaultBairroId, options]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [value, municipio]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLLIElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function escolher(item: BairroOption) {
    setValue(item.nome);
    setBairroId(item.id);
    setSetorId(item.setor_id ?? "");
    setSetorLabel(
      item.setor_numero != null
        ? `Setor ${item.setor_numero}${
            item.setor_nome && item.setor_nome !== `Setor ${item.setor_numero}`
              ? ` · ${item.setor_nome}`
              : ""
          }`
        : ""
    );
    setOpen(false);
  }

  function onChangeTexto(novo: string) {
    setValue(novo);
    setOpen(true);
    const exato = opcoesDoMunicipio.find(
      (b) => normalizar(b.nome) === normalizar(novo)
    );
    if (exato) {
      setBairroId(exato.id);
      setSetorId(exato.setor_id ?? "");
      setSetorLabel(
        exato.setor_numero != null
          ? `Setor ${exato.setor_numero}${
              exato.setor_nome && exato.setor_nome !== `Setor ${exato.setor_numero}`
                ? ` · ${exato.setor_nome}`
                : ""
            }`
          : ""
      );
    } else {
      setBairroId("");
      setSetorId("");
      setSetorLabel("");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (filtered[highlight]) {
        e.preventDefault();
        escolher(filtered[highlight]);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input type="hidden" name={bairroIdName} value={bairroId} />
      <input type="hidden" name={setorIdName} value={setorId} />

      <div className="relative">
        <MapPinned className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          id={inputId}
          name={name}
          required={required}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChangeTexto(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={120}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            open && filtered[highlight] ? `${listboxId}-${highlight}` : undefined
          }
          className="pl-9 pr-9"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar lista" : "Abrir lista de bairros"}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 transition-colors hover:text-ink-700"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      {setorLabel && (
        <p className="mt-1 text-2xs text-ink-500">
          Setor associado:{" "}
          <span className="font-medium text-brand-800">{setorLabel}</span>
        </p>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg">
          {opcoesDoMunicipio.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-ink-500">
              Nenhum bairro cadastrado para {municipio || "este município"}.
              <br />
              <span className="text-ink-400">
                Você pode digitar manualmente ou pedir ao administrador para incluir em
                Configurações → Bairros & Setores.
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-ink-500">
              Nenhum bairro encontrado para “{value}”.
              <br />
              <span className="text-ink-400">
                Pode digitar manualmente — o nome será gravado no cadastro.
              </span>
            </div>
          ) : (
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="max-h-72 overflow-y-auto py-1 text-sm"
            >
              {filtered.map((b, i) => {
                const isHighlight = i === highlight;
                const isSelected = b.id === bairroId;
                return (
                  <li
                    key={b.id}
                    id={`${listboxId}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      escolher(b);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 transition-colors",
                      isHighlight ? "bg-brand-50 text-brand-900" : "text-ink-800"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-brand-700" : "text-transparent"
                        )}
                      />
                      <span>{b.nome}</span>
                    </span>
                    {b.setor_numero != null && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-800">
                        Setor {b.setor_numero}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
