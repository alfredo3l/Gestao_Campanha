"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface FilterComboboxOption {
  value: string;
  label: string;
  /** Texto auxiliar para busca (ex.: município da liderança). */
  hint?: string;
}

interface Props {
  options: FilterComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  /** Texto exibido quando nada está selecionado. */
  placeholder?: string;
  /** Largura do trigger (classes Tailwind). */
  className?: string;
  /** Placeholder do campo de busca. */
  searchPlaceholder?: string;
  /** Texto exibido quando não há resultados. */
  emptyMessage?: string;
  /** Rótulo acessível (aria-label) para o trigger. */
  ariaLabel?: string;
  disabled?: boolean;
}

function normalizar(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Combobox de filtro com busca tolerante a acentos e caixa.
 * - Pensado para substituir <Select> quando a lista é longa e o usuário precisa digitar.
 * - Mantém o visual e altura do SelectTrigger para consistência.
 * - Acessível por teclado: ↑ ↓ Enter Esc Tab.
 */
export function FilterCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione…",
  className,
  searchPlaceholder = "Pesquisar…",
  emptyMessage = "Nenhum resultado.",
  ariaLabel,
  disabled,
}: Props) {
  const autoId = useId();
  const triggerId = `filter-combobox-${autoId}`;
  const listboxId = `${triggerId}-listbox`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = normalizar(query);
    if (!q) return options;
    return options.filter((o) => {
      const hay = normalizar(`${o.label} ${o.hint ?? ""}`);
      return hay.includes(q);
    });
  }, [options, query]);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value]
  );

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
      const idx = Math.max(
        0,
        options.findIndex((o) => o.value === value)
      );
      setHighlight(idx);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open, options, value]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLLIElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function escolher(v: string) {
    onChange(v);
    setOpen(false);
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
        escolher(filtered[highlight].value);
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
          !selectedLabel && "text-ink-500"
        )}
      >
        <span className="truncate text-left">{selectedLabel || placeholder}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg">
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
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="max-h-72 overflow-y-auto py-1 text-sm"
            >
              {filtered.map((opt, i) => {
                const isHighlight = i === highlight;
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    id={`${listboxId}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      escolher(opt.value);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors",
                      isHighlight ? "bg-brand-50 text-brand-900" : "text-ink-800"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isSelected ? "text-brand-700" : "text-transparent"
                      )}
                    />
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
          )}
        </div>
      )}
    </div>
  );
}
