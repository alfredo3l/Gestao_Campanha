"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import {
  MUNICIPIO_PADRAO,
  MUNICIPIOS_MS,
  normalizarMunicipio,
} from "@/lib/data/municipios-ms";

interface Props {
  /** Nome do campo no FormData enviado para o server action. */
  name: string;
  id?: string;
  required?: boolean;
  /** Valor inicial. Quando ausente, sugere o município padrão da campanha. */
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  /** Quando `true`, NÃO pré-preenche com o padrão (útil em edição). */
  semPadrao?: boolean;
}

/**
 * Combobox de municípios de MS com:
 *  - Busca tolerante a acentos e caixa (digite "tres" → encontra "Três Lagoas").
 *  - Município padrão (`Três Lagoas`) fixado no topo, com selo "Padrão".
 *  - Navegação por teclado: ↑ ↓ para mover, Enter seleciona, Esc fecha, Tab fecha.
 *  - Aceita texto livre (caso a cidade não esteja na lista, basta digitar).
 *  - Funciona com server actions: renderiza um `<input>` real com o `name` informado.
 */
export function MunicipioCombobox({
  name,
  id,
  required,
  defaultValue,
  placeholder = "Comece a digitar o município…",
  className,
  semPadrao,
}: Props) {
  const autoId = useId();
  const inputId = id ?? `municipio-${autoId}`;
  const listboxId = `${inputId}-listbox`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const valorInicial = defaultValue ?? (semPadrao ? "" : MUNICIPIO_PADRAO);
  const [value, setValue] = useState<string>(valorInicial);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = normalizarMunicipio(value);
    if (!q) return MUNICIPIOS_MS;
    return MUNICIPIOS_MS.filter((m) => normalizarMunicipio(m).includes(q));
  }, [value]);

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
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLLIElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function escolher(municipio: string) {
    setValue(municipio);
    setOpen(false);
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
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          id={inputId}
          name={name}
          required={required}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={80}
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
          aria-label={open ? "Fechar lista" : "Abrir lista de municípios"}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 transition-colors hover:text-ink-700"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-ink-500">
              Nenhum município encontrado em MS.
              <br />
              <span className="text-ink-400">
                Você pode digitar o nome manualmente.
              </span>
            </div>
          ) : (
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="max-h-72 overflow-y-auto py-1 text-sm"
            >
              {filtered.map((municipio, i) => {
                const isPadrao = municipio === MUNICIPIO_PADRAO;
                const isHighlight = i === highlight;
                const isSelected = municipio === value;
                return (
                  <li
                    key={municipio}
                    id={`${listboxId}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => {
                      // mousedown evita perder o foco antes do clique registrar
                      e.preventDefault();
                      escolher(municipio);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 transition-colors",
                      isHighlight
                        ? "bg-brand-50 text-brand-900"
                        : "text-ink-800"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-brand-700" : "text-transparent"
                        )}
                      />
                      <span>{municipio}</span>
                    </span>
                    {isPadrao && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-800">
                        Padrão
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
