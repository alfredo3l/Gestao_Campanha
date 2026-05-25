"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { FilterComboboxOption } from "@/components/ui/filter-combobox";

interface Props {
  options: FilterComboboxOption[];
  /** Lista de `value`s selecionados. Vazio = "todos" (sem filtro). */
  value: string[];
  onChange: (value: string[]) => void;
  /** Texto exibido quando nada está selecionado. */
  placeholder?: string;
  /** Largura do trigger (classes Tailwind). */
  className?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  disabled?: boolean;
  /**
   * Quando informado, gera o rótulo do trigger a partir da contagem (ex.: "3 setores").
   * Quando ausente: mostra os labels separados por vírgula, com fallback no `placeholder`.
   */
  countLabel?: (n: number) => string;
}

function normalizar(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Variante multi-select do FilterCombobox. Mantém a mesma estética (h-9, busca
 * tolerante a acentos) e adiciona:
 *  - Checkbox por linha; clicar não fecha o menu (permite marcar vários).
 *  - Botão "Selecionar todos" / "Limpar" no rodapé do menu.
 *  - `value: string[]` — vazio = "sem filtro" (mostra placeholder).
 *  - Trigger mostra contagem por padrão ("3 selecionados") ou via `countLabel`.
 */
export function MultiFilterCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione…",
  className,
  searchPlaceholder = "Pesquisar…",
  emptyMessage = "Nenhum resultado.",
  ariaLabel,
  disabled,
  countLabel,
}: Props) {
  const autoId = useId();
  const triggerId = `multi-combobox-${autoId}`;
  const listboxId = `${triggerId}-listbox`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = normalizar(query);
    if (!q) return options;
    return options.filter((o) => {
      const hay = normalizar(`${o.label} ${o.hint ?? ""}`);
      return hay.includes(q);
    });
  }, [options, query]);

  const triggerLabel = useMemo(() => {
    if (value.length === 0) return "";
    if (countLabel) return countLabel(value.length);
    if (value.length === 1) {
      return options.find((o) => o.value === value[0])?.label ?? "1 selecionado";
    }
    return `${value.length} selecionados`;
  }, [value, options, countLabel]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLLIElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function toggle(v: string) {
    const next = new Set(value);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(Array.from(next));
  }

  function selecionarTodosFiltrados() {
    const next = new Set(value);
    for (const o of filtered) next.add(o.value);
    onChange(Array.from(next));
  }

  function limparSelecao() {
    onChange([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (filtered[highlight]) {
        e.preventDefault();
        toggle(filtered[highlight].value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        id={triggerId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !triggerLabel && "text-ink-500"
        )}
      >
        <span className="truncate text-left">{triggerLabel || placeholder}</span>
        <div className="flex shrink-0 items-center gap-1">
          {value.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Limpar seleção"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                limparSelecao();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  limparSelecao();
                }
              }}
              className="rounded p-0.5 text-ink-400 hover:text-status-red"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg">
          <div className="relative border-b border-ink-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                filtered[highlight] ? `${listboxId}-${highlight}` : undefined
              }
              className="h-8 w-full rounded-md border border-ink-200 bg-white pl-8 pr-7 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            {query && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-ink-500">
              {emptyMessage}
            </div>
          ) : (
            <>
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-multiselectable="true"
                className="max-h-72 overflow-y-auto py-1 text-sm"
              >
                {filtered.map((opt, i) => {
                  const isHighlight = i === highlight;
                  const isSelected = selectedSet.has(opt.value);
                  return (
                    <li
                      key={opt.value}
                      id={`${listboxId}-${i}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggle(opt.value);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors",
                        isHighlight ? "bg-brand-50 text-brand-900" : "text-ink-800"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-brand-700 bg-brand-700 text-white"
                            : "border-ink-300 bg-white text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.hint && (
                        <span className="shrink-0 text-2xs text-ink-400">
                          {opt.hint}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/50 px-2 py-1.5 text-2xs">
                <button
                  type="button"
                  onClick={selecionarTodosFiltrados}
                  className="rounded px-2 py-1 text-brand-700 hover:bg-brand-50"
                >
                  {query
                    ? `Selecionar visíveis (${filtered.length})`
                    : "Selecionar todos"}
                </button>
                <button
                  type="button"
                  onClick={limparSelecao}
                  disabled={value.length === 0}
                  className="rounded px-2 py-1 text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Limpar ({value.length})
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
