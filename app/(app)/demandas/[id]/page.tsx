import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemandaForm } from "../demanda-form";
import { ComentarioForm } from "./comentario-form";
import { ExcluirDemandaButton } from "./excluir-button";
import { StatusDemandaBadge, PrioridadeBadge } from "@/components/app/status-badge";
import { TrilhaAuditoria } from "@/components/app/trilha-auditoria";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { resolverUsuariosAuditoria } from "@/lib/auditoria";
import { fmtData, fmtDataHora } from "@/lib/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DemandaDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [demandaRes, lideRes, apoiaRes, movRes] = await Promise.all([
    supabase.from("demandas").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("liderancas").select("id, nome, municipio").order("nome"),
    supabase.from("apoiadores").select("id, nome").order("nome").limit(500),
    supabase
      .from("demanda_movimentacoes")
      .select("id, tipo, texto, criada_em, autor_id")
      .eq("demanda_id", params.id)
      .order("criada_em", { ascending: false }),
  ]);

  if (demandaRes.error || !demandaRes.data) notFound();

  const d = demandaRes.data;
  const movs = movRes.data ?? [];
  const auditUsers = await resolverUsuariosAuditoria([
    d.created_by,
    d.updated_by,
    ...movs.map((m) => m.autor_id),
  ]);

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
                inicial={{
                  titulo: d.titulo,
                  descricao: d.descricao,
                  categoria: d.categoria,
                  prioridade: d.prioridade,
                  status: d.status,
                  solicitante_id: d.solicitante_id,
                  lider_id: d.lider_id,
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
