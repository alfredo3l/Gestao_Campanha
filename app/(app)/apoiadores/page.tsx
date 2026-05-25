import Link from "next/link";
import { Plus, Users } from "lucide-react";

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
import { ApoiadoresFiltros } from "./filtros";
import { fmtNumero, fmtTelefone, fmtData } from "@/lib/utils/formatters";
import { formatarCpf, somenteDigitos } from "@/lib/utils/cpf";

export const metadata = { title: "Apoiadores" };

const PAGE_SIZE = 30;

interface Search {
  q?: string;
  status?: string;
  municipio?: string;
  lider?: string;
  page?: string;
}

export default async function ApoiadoresPage({ searchParams }: { searchParams: Search }) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("apoiadores")
    .select(
      "id, nome, cpf, tel, municipio, bairro, status, created_at, lider:liderancas(id, nome)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.status && searchParams.status !== "todos") {
    query = query.eq(
      "status",
      searchParams.status as "confirmado" | "provavel" | "indeciso" | "contato" | "nao_vota"
    );
  }
  if (searchParams.municipio && searchParams.municipio !== "todos") {
    query = query.eq("municipio", searchParams.municipio);
  }
  if (searchParams.lider && searchParams.lider !== "todos") {
    query = query.eq("lider_id", searchParams.lider);
  }
  if (searchParams.q?.trim()) {
    const term = searchParams.q.trim();
    const digits = somenteDigitos(term);
    if (digits.length >= 3) {
      query = query.or(`nome.ilike.%${term}%,cpf.ilike.%${digits}%,tel.ilike.%${digits}%`);
    } else {
      query = query.ilike("nome", `%${term}%`);
    }
  }

  const [{ data: apoiadores, count, error }, lideRes, kpiRes] = await Promise.all([
    query,
    supabase.from("liderancas").select("id, nome").eq("ativa", true).order("nome"),
    supabase.from("v_dashboard_kpis").select("apoiadores_total, apoiadores_semana").maybeSingle(),
  ]);

  const { data: municipiosRows } = await supabase
    .from("apoiadores")
    .select("municipio")
    .order("municipio");
  const municipios = Array.from(
    new Set((municipiosRows ?? []).map((r) => r.municipio).filter(Boolean))
  ) as string[];

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const liderancas = lideRes.data ?? [];

  const sp = new URLSearchParams();
  if (searchParams.q) sp.set("q", searchParams.q);
  if (searchParams.status) sp.set("status", searchParams.status);
  if (searchParams.municipio) sp.set("municipio", searchParams.municipio);
  if (searchParams.lider) sp.set("lider", searchParams.lider);

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

      <ApoiadoresFiltros liderancas={liderancas} municipios={municipios} />

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
                <TableHead>Liderança</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cadastrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apoiadores.map((a) => {
                const lid = Array.isArray(a.lider) ? a.lider[0] : a.lider;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/apoiadores/${a.id}`} className="font-medium text-ink-900 hover:underline">
                        {a.nome}
                      </Link>
                      {a.bairro && (
                        <p className="text-2xs text-ink-500">{a.bairro}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono-tab text-xs text-ink-600">
                      {formatarCpf(a.cpf)}
                    </TableCell>
                    <TableCell className="text-ink-700">{a.municipio}</TableCell>
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
