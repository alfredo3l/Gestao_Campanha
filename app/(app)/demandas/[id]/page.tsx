import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Megaphone, UserPlus, Phone, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getBairrosComSetor } from "@/lib/localidades/get-localidades";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemandaForm } from "../demanda-form";
import { ComentarioForm } from "./comentario-form";
import { ExcluirDemandaButton } from "./excluir-button";
import { StatusDemandaBadge, PrioridadeBadge } from "@/components/app/status-badge";
import { TrilhaAuditoria } from "@/components/app/trilha-auditoria";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { resolverUsuariosAuditoria } from "@/lib/auditoria";
import { fmtData, fmtDataHora, fmtTelefone } from "@/lib/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DemandaDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [demandaRes, lideRes, apoiaRes, movRes, bairros] = await Promise.all([
    supabase.from("demandas").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("liderancas").select("id, nome, municipio").order("nome"),
    supabase.from("apoiadores").select("id, nome").order("nome").limit(500),
    supabase
      .from("demanda_movimentacoes")
      .select("id, tipo, texto, criada_em, autor_id")
      .eq("demanda_id", params.id)
      .order("criada_em", { ascending: false }),
    getBairrosComSetor(),
  ]);

  if (demandaRes.error || !demandaRes.data) notFound();

  const d = demandaRes.data;
  const movs = movRes.data ?? [];
  const auditUsers = await resolverUsuariosAuditoria([
    d.created_by,
    d.updated_by,
    ...movs.map((m) => m.autor_id),
  ]);

  // Resolve o nome+contexto do solicitante para exibição.
  let solicitanteApoiador: { id: string; nome: string } | null = null;
  let solicitanteLider: { id: string; nome: string } | null = null;
  if (d.solicitante_tipo === "apoiador" && d.solicitante_id) {
    const res = await supabase
      .from("apoiadores")
      .select("id, nome")
      .eq("id", d.solicitante_id)
      .maybeSingle();
    solicitanteApoiador = res.data ?? null;
  } else if (d.solicitante_tipo === "lideranca" && d.solicitante_lider_id) {
    const res = await supabase
      .from("liderancas")
      .select("id, nome")
      .eq("id", d.solicitante_lider_id)
      .maybeSingle();
    solicitanteLider = res.data ?? null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={d.titulo}
        description={
          <span className="flex items-center gap-2 text-sm">
            <span className="font-mono-tab text-ink-500">{d.codigo ?? "—"}</span>·
            <StatusDemandaBadge status={d.status} />
            <PrioridadeBadge prioridade={d.prioridade} />
            <span className="text-ink-500">· {d.categoria}</span>
          </span>
        }
        actions={
          <Link
            href="/demandas"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            {d.descricao ? (
              <p className="whitespace-pre-wrap text-sm text-ink-700">{d.descricao}</p>
            ) : (
              <p className="text-sm text-ink-400">Sem descrição.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SolicitanteResumo
              tipo={d.solicitante_tipo}
              apoiador={solicitanteApoiador}
              lider={solicitanteLider}
              nome={d.solicitante_nome}
              tel={d.solicitante_tel}
              bairro={d.solicitante_bairro}
              demandaId={d.id}
              titulo={d.titulo}
            />
            <Field label="Prazo">{d.prazo ? fmtData(d.prazo) : "—"}</Field>
            {d.resolvida_em && <Field label="Resolvida em">{fmtDataHora(d.resolvida_em)}</Field>}
            <TrilhaAuditoria
              createdAt={d.created_at}
              updatedAt={d.updated_at}
              createdBy={auditUsers.get(d.created_by ?? "") ?? null}
              updatedBy={auditUsers.get(d.updated_by ?? "") ?? null}
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="historico">
        <TabsList>
          <TabsTrigger value="historico">Histórico ({movs.length})</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <ComentarioForm demandaId={d.id} />
              <ul className="space-y-3">
                {movs.length === 0 && (
                  <li className="rounded-md border border-dashed border-ink-200 bg-ink-50/40 p-4 text-center text-sm text-ink-500">
                    Sem movimentações ainda.
                  </li>
                )}
                {movs.map((m) => {
                  const autor = auditUsers.get(m.autor_id ?? "") ?? null;
                  return (
                    <li key={m.id} className="rounded-md border border-ink-200 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {autor ? (
                            <AvatarInitials
                              nome={autor.nome}
                              fotoPath={autor.foto_path}
                              className="h-6 w-6 text-[10px]"
                            />
                          ) : null}
                          <div>
                            <span className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
                              {m.tipo === "comentario"
                                ? "Comentário"
                                : m.tipo === "status_change"
                                ? "Mudança de status"
                                : "Anexo"}
                            </span>
                            {autor && (
                              <span className="ml-1.5 text-2xs text-ink-700">
                                por <span className="font-medium">{autor.nome}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono-tab text-2xs text-ink-500">
                          {fmtDataHora(m.criada_em)}
                        </span>
                      </div>
                      {m.texto && <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{m.texto}</p>}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados">
          <Card>
            <CardContent className="pt-6">
              <DemandaForm
                modo="editar"
                id={d.id}
                liderancas={lideRes.data ?? []}
                apoiadores={apoiaRes.data ?? []}
                bairros={bairros}
                inicial={{
                  titulo: d.titulo,
                  descricao: d.descricao,
                  categoria: d.categoria,
                  prioridade: d.prioridade,
                  status: d.status,
                  solicitante: {
                    tipo: d.solicitante_tipo,
                    apoiador_id: d.solicitante_id,
                    lider_id: d.solicitante_lider_id,
                    nome: d.solicitante_nome,
                    tel: d.solicitante_tel,
                    bairro: d.solicitante_bairro,
                  },
                  lider_id: d.lider_id,
                  bairro: d.bairro,
                  bairro_id: d.bairro_id,
                  setor_id: d.setor_id,
                  prazo: d.prazo,
                }}
              />
              <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">Excluir demanda</p>
                  <p className="text-xs text-ink-500">
                    Remove a demanda e todo o histórico associado. Use somente em duplicidades.
                  </p>
                </div>
                <ExcluirDemandaButton id={d.id} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="text-ink-900">{children}</p>
    </div>
  );
}

function SolicitanteResumo({
  tipo,
  apoiador,
  lider,
  nome,
  tel,
  bairro,
  demandaId,
  titulo,
}: {
  tipo: "apoiador" | "lideranca" | "avulso";
  apoiador: { id: string; nome: string } | null;
  lider: { id: string; nome: string } | null;
  nome: string | null;
  tel: string | null;
  bairro: string | null;
  demandaId: string;
  titulo: string;
}) {
  return (
    <div className="space-y-1.5 rounded-md border border-ink-100 bg-ink-50/50 p-2.5">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
        Solicitante
      </p>
      {tipo === "apoiador" && apoiador && (
        <Link
          href={`/apoiadores/${apoiador.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <User className="h-3.5 w-3.5" />
          {apoiador.nome}
          <span className="ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
            Apoiador
          </span>
        </Link>
      )}
      {tipo === "lideranca" && lider && (
        <Link
          href={`/liderancas/${lider.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <Megaphone className="h-3.5 w-3.5" />
          {lider.nome}
          <span className="ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
            Liderança
          </span>
        </Link>
      )}
      {tipo === "avulso" && (
        <>
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
            <UserPlus className="h-3.5 w-3.5 text-ink-500" />
            {nome ?? "—"}
            <span className="ml-1 rounded bg-ink-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-700">
              Avulso
            </span>
          </p>
          {(tel || bairro) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-600">
              {tel && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3 text-ink-400" />
                  {fmtTelefone(tel)}
                </span>
              )}
              {bairro && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-ink-400" />
                  {bairro}
                </span>
              )}
            </div>
          )}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-1.5 w-full"
            aria-label="Cadastrar este solicitante como apoiador"
          >
            <Link
              href={`/apoiadores/novo?${new URLSearchParams({
                nome: nome ?? "",
                tel: tel ?? "",
                bairro: bairro ?? "",
                demanda_origem: demandaId,
                demanda_titulo: titulo,
              }).toString()}`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Cadastrar como apoiador
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
