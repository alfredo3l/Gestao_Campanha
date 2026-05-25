"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Loader2, Search, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { cn } from "@/lib/utils/cn";
import { formatarCpf, somenteDigitos } from "@/lib/utils/cpf";
import { fmtTelefone } from "@/lib/utils/formatters";

type Group = "apoiador" | "lideranca" | "demanda";

interface ResultItem {
  group: Group;
  id: string;
  href: string;
  primary: string;
  secondary?: string | null;
  fotoPath?: string | null;
}

const groupLabel: Record<Group, string> = {
  apoiador: "Apoiadores",
  lideranca: "Lideranças",
  demanda: "Demandas",
};

const MIN_CHARS = 2;
const DEBOUNCE_MS = 220;
const LIMIT_PER_GROUP = 5;

export function GlobalSearch() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(term.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [term]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const q = debounced;
    if (q.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    const reqId = ++reqIdRef.current;
    setLoading(true);

    (async () => {
      try {
        const digits = somenteDigitos(q);
        const like = `%${q.replace(/[%,]/g, " ")}%`;
        const digitsLike = digits.length >= 3 ? `%${digits}%` : null;

        const apoiadoresFilter = digitsLike
          ? `nome.ilike.${like},cpf.ilike.${digitsLike},tel.ilike.${digitsLike}`
          : `nome.ilike.${like}`;

        const [apoRes, lideRes, demRes] = await Promise.all([
          supabase
            .from("apoiadores")
            .select("id, nome, cpf, tel, municipio, foto_path")
            .or(apoiadoresFilter)
            .order("nome")
            .limit(LIMIT_PER_GROUP),
          supabase
            .from("liderancas")
            .select("id, nome, cargo, municipio, foto_path")
            .ilike("nome", like)
            .order("nome")
            .limit(LIMIT_PER_GROUP),
          supabase
            .from("demandas")
            .select("id, codigo, titulo, categoria, status")
            .or(`titulo.ilike.${like},codigo.ilike.${like}`)
            .order("created_at", { ascending: false })
            .limit(LIMIT_PER_GROUP),
        ]);

        if (reqId !== reqIdRef.current) return;

        const items: ResultItem[] = [];

        for (const a of apoRes.data ?? []) {
          const tail = [a.municipio, a.tel ? fmtTelefone(a.tel) : null]
            .filter(Boolean)
            .join(" · ");
          items.push({
            group: "apoiador",
            id: a.id,
            href: `/apoiadores/${a.id}`,
            primary: a.nome,
            secondary: [formatarCpf(a.cpf), tail].filter(Boolean).join(" — "),
            fotoPath: a.foto_path,
          });
        }
        for (const l of lideRes.data ?? []) {
          items.push({
            group: "lideranca",
            id: l.id,
            href: `/liderancas/${l.id}`,
            primary: l.nome,
            secondary: [l.cargo, l.municipio].filter(Boolean).join(" · "),
            fotoPath: l.foto_path,
          });
        }
        for (const d of demRes.data ?? []) {
          items.push({
            group: "demanda",
            id: d.id,
            href: `/demandas/${d.id}`,
            primary: d.titulo,
            secondary: [d.codigo, d.categoria, d.status]
              .filter(Boolean)
              .join(" · "),
          });
        }

        setResults(items);
        setActive(0);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    })();
  }, [debounced, supabase]);

  const grouped = useMemo(() => {
    const map: Record<Group, ResultItem[]> = {
      apoiador: [],
      lideranca: [],
      demanda: [],
    };
    for (const r of results) map[r.group].push(r);
    return map;
  }, [results]);

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      setTerm("");
      setDebounced("");
      setResults([]);
      router.push(href);
    },
    [router]
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) {
        navigateTo(hit.href);
        return;
      }
      const q = term.trim();
      if (q.length >= MIN_CHARS) {
        navigateTo(`/apoiadores?q=${encodeURIComponent(q)}`);
      }
    }
  }

  const showPanel =
    open && (term.trim().length >= MIN_CHARS || loading);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="search"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar apoiador, liderança, demanda…"
        aria-label="Busca global"
        autoComplete="off"
        className="h-9 w-full rounded-md border border-ink-200 bg-ink-50/60 pl-9 pr-16 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-ink-200 bg-white px-1.5 py-0.5 font-mono-tab text-[10px] font-medium text-ink-500 md:inline-flex">
        Ctrl K
      </kbd>

      {showPanel && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-md border border-ink-200 bg-white shadow-lg"
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-ink-500">
              Nenhum resultado para{" "}
              <span className="font-medium text-ink-700">“{debounced}”</span>.
              <div className="mt-1 text-xs text-ink-400">
                Pressione Enter para abrir a lista de apoiadores com este termo.
              </div>
            </div>
          ) : (
            (Object.keys(grouped) as Group[]).map((g) => {
              const list = grouped[g];
              if (list.length === 0) return null;
              return (
                <div key={g} className="py-1">
                  <div className="flex items-center justify-between px-3 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-ink-500">
                    <span>{groupLabel[g]}</span>
                    <span className="font-mono-tab text-ink-400">{list.length}</span>
                  </div>
                  <ul>
                    {list.map((item) => {
                      const idx = results.indexOf(item);
                      const isActive = idx === active;
                      return (
                        <li key={`${item.group}-${item.id}`}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => navigateTo(item.href)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                              isActive ? "bg-brand-50" : "hover:bg-ink-50"
                            )}
                          >
                            {item.group === "demanda" ? (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                                <Inbox className="h-4 w-4" />
                              </span>
                            ) : item.group === "apoiador" || item.group === "lideranca" ? (
                              <AvatarInitials
                                nome={item.primary}
                                fotoPath={item.fotoPath}
                              />
                            ) : (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                                <Users className="h-4 w-4" />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-ink-900">
                                {item.primary}
                              </p>
                              {item.secondary && (
                                <p className="truncate text-2xs text-ink-500">
                                  {item.secondary}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}

          {results.length > 0 && (
            <div className="border-t border-ink-100 px-3 py-2 text-2xs text-ink-500">
              <kbd className="font-mono-tab">↵</kbd> abrir &nbsp;·&nbsp;
              <kbd className="font-mono-tab">↑ ↓</kbd> navegar &nbsp;·&nbsp;
              <kbd className="font-mono-tab">Esc</kbd> fechar
            </div>
          )}
        </div>
      )}
    </div>
  );
}
