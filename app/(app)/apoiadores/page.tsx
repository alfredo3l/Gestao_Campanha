import Link from "next/link";
import { Pencil, Plus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusApoioBadge } from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { ApoiadoresFiltros } from "./filtros";
import { fmtNumero, fmtTelefone, fmtData } from "@/lib/utils/formatters";
import { formatarCpf, somenteDigitos } from "@/lib/utils/cpf";
import { getSetores } from "@/lib/localidades/get-localidades";

export const metadata = { title: "Apoiadores" };

const PAGE_SIZE = 30;

interface Search {
  q?: string;
  status?: string;
  municipio?: string;
  lider?: string;
  setor?: string;
  page?: string;
}

/** Lê parâmetro multi-valor (CSV) — suporta filtros do tipo "in (...)". */
function parseMulti(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "todos");
}

type StatusApoioValue =
  | "confirmado"
  | "provavel"
  | "indeciso"
  | "contato"
  | "nao_vota";

export default async function ApoiadoresPage({ searchParams }: { searchParams: Search }) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const statusSel = parseMulti(searchParams.status) as StatusApoioValue[];
  const municipioSel = parseMulti(searchParams.municipio);
  const liderSel = parseMulti(searchParams.lider);
  const setorSel = parseMulti(searchParams.setor);

  let query = supabase
    .from("apoiadores")
    .select(
      "id, nome, cpf, tel, foto_path, municipio, bairro, setor_id, status, created_at, lider:liderancas(id, nome, foto_path)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusSel.length > 0) query = query.in("status", statusSel);
  if (municipioSel.length > 0) query = query.in("municipio", municipioSel);
  if (liderSel.length > 0) query = query.in("lider_id", liderSel);
  if (setorSel.length > 0) query = query.in("setor_id", setorSel);

  if (searchParams.q?.trim()) {
    const term = searchParams.q.trim();
    const digits = somenteDigitos(term);
    if (digits.length >= 3) {
      query = query.or(`nome.ilike.%${term}%,cpf.ilike.%${digits}%,tel.ilike.%${digits}%`);
    } else {
      query = query.ilike("nome", `%${term}%`);
    }
  }

  const [{ data: apoiadores, count, error }, lideRes, kpiRes, municipiosRes, setoresAll] =
    await Promise.all([
      query,
      supabase.from("liderancas").select("id, nome").eq("ativa", true).order("nome"),
      supabase
        .from("v_dashboard_kpis")
        .select("apoiadores_total, apoiadores_semana")
        .maybeSingle(),
      supabase.from("v_apoiadores_municipios").select("municipio"),
      getSetores(),
    ]);

  const municipios = (municipiosRes.data ?? [])
    .map((r) => r.municipio)
    .filter((m): m is string => Boolean(m));
  const setores = setoresAll
    .filter((s) => s.ativo)
    .map((s) => ({
      id: s.id,
      numero: s.numero,
      nome: s.nome,
      municipio: s.municipio,
    }));
  const setoresMap = new Map(
    setoresAll.map((s) => [s.id, { numero: s.numero, nome: s.nome }])
  );

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const liderancas = lideRes.data ?? [];

  const sp = new URLSearchParams();
  if (searchParams.q) sp.set("q", searchParams.q);
  if (searchParams.status) sp.set("status", searchParams.status);
  if (searchParams.municipio) sp.set("municipio", searchParams.municipio);
  if (searchParams.lider) sp.set("lider", searchParams.lider);
  if (searchParams.setor) sp.set("setor", searchParams.setor);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apoiadores"
        description="Eleitores que prometeram voto ou estão sendo trabalhados pela campanha."
        actions={
          <Button asChild>
            <Link href="/apoiadores/novo">
              <Plus className="h-4 w-4" /> Novo apoiador
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total no banco" value={fmtNumero(kpiRes.data?.apoiadores_total ?? 0)} />
        <Stat label="Novos na semana" value={fmtNumero(kpiRes.data?.apoiadores_semana ?? 0)} />
        <Stat label="Resultado da busca" value={fmtNumero(total)} />
        <Stat label="Página" value={`${page} / ${totalPages}`} />
      </div>

      <ApoiadoresFiltros
        liderancas={liderancas}
        municipios={municipios}
        setores={setores}
      />

      {error ? (
        <Card className="p-4 text-sm text-status-red">Erro ao carregar: {error.message}</Card>
      ) : !apoiadores || apoiadores.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={searchParams.q ? "Nenhum resultado" : "Nenhum apoiador cadastrado"}
          description={
            searchParams.q
              ? "Tente outro termo de busca ou limpe os filtros."
              : "Comece registrando o primeiro eleitor da sua base."
          }
          action={
            !searchParams.q && (
              <Button asChild>
                <Link href="/apoiadores/novo">
                  <Plus className="h-4 w-4" /> Cadastrar apoiador
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Liderança</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cadastrado</TableHead>
                <TableHead className="w-[1%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apoiadores.map((a) => {
                const lid = Array.isArray(a.lider) ? a.lider[0] : a.lider;
                const setor = a.setor_id ? setoresMap.get(a.setor_id) : null;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarInitials nome={a.nome} fotoPath={a.foto_path} />
                        <div className="min-w-0">
                          <Link
                            href={`/apoiadores/${a.id}`}
                            className="block font-medium text-ink-900 hover:underline"
                          >
                            {a.nome}
                          </Link>
                          {a.bairro && (
                            <p className="text-2xs text-ink-500">{a.bairro}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono-tab text-xs text-ink-600">
                      {formatarCpf(a.cpf)}
                    </TableCell>
                    <TableCell className="text-ink-700">{a.municipio}</TableCell>
                    <TableCell>
                      {setor ? (
                        <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-800">
                          Setor {setor.numero}
                        </span>
                      ) : (
                        <span className="text-2xs text-ink-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lid ? (
                        <Link
                          href={`/liderancas/${lid.id}`}
                          className="text-xs text-brand-700 hover:underline"
                        >
                          {lid.nome}
                        </Link>
                      ) : (
                        <span className="text-2xs text-ink-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono-tab text-xs text-ink-600">
                      {a.tel ? fmtTelefone(a.tel) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusApoioBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono-tab text-xs text-ink-500">
                      {fmtData(a.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" aria-label={`Editar ${a.nome}`}>
                        <Link href={`/apoiadores/${a.id}`}>
                          <Pencil className="h-4 w-4" /> Editar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-ink-500">
            Exibindo {from + 1}–{Math.min(to + 1, total)} de {fmtNumero(total)}
          </p>
          <div className="flex items-center gap-2">
            <PageLink disabled={page <= 1} sp={sp} page={page - 1}>
              Anterior
            </PageLink>
            <PageLink disabled={page >= totalPages} sp={sp} page={page + 1}>
              Próxima
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular text-ink-900">{value}</p>
    </div>
  );
}

function PageLink({
  page,
  sp,
  disabled,
  children,
}: {
  page: number;
  sp: URLSearchParams;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-md border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs text-ink-400">
        {children}
      </span>
    );
  }
  const qs = new URLSearchParams(sp);
  qs.set("page", String(page));
  return (
    <Link
      href={`/apoiadores?${qs.toString()}`}
      className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs hover:bg-ink-50"
    >
      {children}
    </Link>
  );
}
