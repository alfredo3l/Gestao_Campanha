import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCargosLider, getCargosLiderMap } from "@/lib/cargos/get-cargos";
import { getBairrosComSetor, getSetores } from "@/lib/localidades/get-localidades";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiderancaForm } from "../lideranca-form";
import { CargoBadge, StatusApoioBadge, StatusDemandaBadge, PrioridadeBadge } from "@/components/app/status-badge";
import { ProgressBar } from "@/components/app/progress-bar";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { TrilhaAuditoria } from "@/components/app/trilha-auditoria";
import { resolverUsuariosAuditoria } from "@/lib/auditoria";
import { fmtNumero, fmtTelefone, fmtData } from "@/lib/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExcluirLiderancaButton } from "./excluir-button";

export default async function LiderancaDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [
    liderancaRes,
    progressoRes,
    apoiadoresRes,
    demandasRes,
    liderancaSetoresRes,
    cargos,
    cargosMap,
    bairros,
    setores,
  ] = await Promise.all([
    supabase.from("liderancas").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("v_progresso_lideranca").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("apoiadores")
      .select("id, nome, foto_path, municipio, bairro, status, tel, created_at")
      .eq("lider_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("demandas")
      .select("id, codigo, titulo, status, prioridade, prazo, created_at")
      .eq("lider_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lideranca_setores")
      .select("setor_id")
      .eq("lideranca_id", params.id),
    getCargosLider(),
    getCargosLiderMap(),
    getBairrosComSetor(),
    getSetores(),
  ]);

  if (liderancaRes.error || !liderancaRes.data) notFound();

  const lider = liderancaRes.data;
  const prog = progressoRes.data;
  const apoiadores = apoiadoresRes.data ?? [];
  const demandas = demandasRes.data ?? [];
  const setorIdsVinculados = (liderancaSetoresRes.data ?? []).map((r) => r.setor_id);
  const setoresMap = new Map(setores.map((s) => [s.id, s]));
  const setoresVinculados = setorIdsVinculados
    .map((sid) => setoresMap.get(sid))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .sort((a, b) => a.numero - b.numero);
  const cargosAtivos = cargos
    .filter((c) => c.ativo)
    .map((c) => ({ value: c.value, label: c.label }));

  const auditUsers = await resolverUsuariosAuditoria([lider.created_by, lider.updated_by]);

  const pct = prog?.pct_meta ?? 0;
  const tone: "brand" | "amber" | "red" | "green" =
    pct >= 100 ? "green" : pct >= 60 ? "brand" : pct >= 30 ? "amber" : "red";

  return (
    <div className="space-y-6">
      <PageHeader
        title={lider.nome}
        description="Detalhes, vínculos e progresso desta liderança."
        actions={
          <Link
            href="/liderancas"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Lideranças
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <AvatarInitials
                nome={lider.nome}
                fotoPath={lider.foto_path}
                className="h-16 w-16 shrink-0 text-base"
              />
              <div className="min-w-0 flex-1">
                <CardTitle>Identificação</CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <CargoBadge cargo={lider.cargo} label={cargosMap[lider.cargo]} />
                  {lider.ativa ? (
                    <Badge variant="green">Ativa</Badge>
                  ) : (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Info icon={<MapPin className="h-3.5 w-3.5" />} label="Município">
                {lider.municipio}
                {lider.bairro ? ` · ${lider.bairro}` : ""}
              </Info>
              <Info icon={<Phone className="h-3.5 w-3.5" />} label="Telefone">
                {lider.tel ? fmtTelefone(lider.tel) : "—"}
              </Info>
              <Info icon={<Mail className="h-3.5 w-3.5" />} label="E-mail">
                {lider.email ?? "—"}
              </Info>
              <Info label="Cadastrada em">{fmtData(lider.created_at)}</Info>
              <div className="md:col-span-2">
                <Info label="Setores de atuação">
                  {setoresVinculados.length === 0 ? (
                    <span className="text-ink-500">—</span>
                  ) : (
                    <span className="flex flex-wrap gap-1.5">
                      {setoresVinculados.map((s) => (
                        <Badge key={s.id} variant="secondary" className="font-normal">
                          Setor {s.numero}
                          {s.nome && s.nome !== `Setor ${s.numero}` ? ` · ${s.nome}` : ""}
                        </Badge>
                      ))}
                    </span>
                  )}
                </Info>
              </div>
            </div>
            <TrilhaAuditoria
              createdAt={lider.created_at}
              updatedAt={lider.updated_at}
              createdBy={auditUsers.get(lider.created_by ?? "") ?? null}
              updatedBy={auditUsers.get(lider.updated_by ?? "") ?? null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progresso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Apoiadores" value={fmtNumero(prog?.apoiadores_total ?? 0)} />
              <Stat label="Confirmados" value={fmtNumero(prog?.apoiadores_confirmados ?? 0)} />
              <Stat label="Meta" value={fmtNumero(lider.meta_votos ?? 0)} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>Atingimento da meta</span>
                <span className="font-mono-tab font-medium text-ink-700">{Math.round(pct)}%</span>
              </div>
              <ProgressBar value={pct} tone={tone} />
            </div>
            <p className="text-2xs text-ink-500">
              Votos projetados: <span className="font-mono-tab">{fmtNumero(prog?.votos_projetados ?? 0)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="apoiadores">Apoiadores ({apoiadores.length})</TabsTrigger>
          <TabsTrigger value="demandas">Demandas ({demandas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <Card>
            <CardContent className="pt-6">
              <LiderancaForm
                modo="editar"
                id={lider.id}
                cargos={cargosAtivos}
                bairros={bairros}
                setores={setores}
                inicial={{
                  nome: lider.nome,
                  cargo: lider.cargo,
                  municipio: lider.municipio,
                  bairro: lider.bairro,
                  bairro_id: lider.bairro_id,
                  setor_id: lider.setor_id,
                  setor_ids: setorIdsVinculados,
                  tel: lider.tel,
                  email: lider.email,
                  meta_votos: lider.meta_votos,
                  ativa: lider.ativa,
                  foto_path: lider.foto_path,
                }}
              />
              <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">Excluir liderança</p>
                  <p className="text-xs text-ink-500">
                    Remove a liderança permanentemente. Apoiadores vinculados precisam ser realocados antes.
                  </p>
                </div>
                <ExcluirLiderancaButton id={lider.id} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apoiadores">
          <Card>
            {apoiadores.length === 0 ? (
              <CardContent className="py-12 text-center text-sm text-ink-500">
                Nenhum apoiador vinculado a esta liderança.
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cadastrado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apoiadores.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <AvatarInitials nome={a.nome} fotoPath={a.foto_path} />
                          <Link
                            href={`/apoiadores/${a.id}`}
                            className="font-medium text-ink-900 hover:underline"
                          >
                            {a.nome}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-ink-600">
                        {a.municipio}
                        {a.bairro ? ` · ${a.bairro}` : ""}
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
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="demandas">
          <Card>
            {demandas.length === 0 ? (
              <CardContent className="py-12 text-center text-sm text-ink-500">
                Nenhuma demanda atribuída a esta liderança.
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prazo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demandas.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono-tab text-xs text-ink-600">{d.codigo ?? "—"}</TableCell>
                      <TableCell>
                        <Link href={`/demandas/${d.id}`} className="font-medium text-ink-900 hover:underline">
                          {d.titulo}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <PrioridadeBadge prioridade={d.prioridade} />
                      </TableCell>
                      <TableCell>
                        <StatusDemandaBadge status={d.status} />
                      </TableCell>
                      <TableCell className="font-mono-tab text-xs text-ink-500">
                        {d.prazo ? fmtData(d.prazo) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide text-ink-500">
        {icon} {label}
      </p>
      <p className="text-sm text-ink-900">{children}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-ink-50 px-2 py-1.5">
      <p className="text-2xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="font-mono-tab text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}
