import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ApoiadorForm } from "../apoiador-form";
import { Button } from "@/components/ui/button";
import { ExcluirApoiadorButton } from "./excluir-button";
import { StatusApoioBadge } from "@/components/app/status-badge";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { TrilhaAuditoria } from "@/components/app/trilha-auditoria";
import { resolverUsuariosAuditoria } from "@/lib/auditoria";
import { fmtData } from "@/lib/utils/formatters";

export default async function ApoiadorDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [apoiadorRes, liderancasRes, tagsRes] = await Promise.all([
    supabase.from("apoiadores").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("liderancas").select("id, nome, municipio").order("nome"),
    supabase.from("apoiador_tags").select("tag").eq("apoiador_id", params.id),
  ]);

  if (apoiadorRes.error || !apoiadorRes.data) notFound();

  const a = apoiadorRes.data;
  const liderancas = liderancasRes.data ?? [];
  const tags = (tagsRes.data ?? []).map((t) => t.tag);
  const auditUsers = await resolverUsuariosAuditoria([a.created_by, a.updated_by]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <AvatarInitials
              nome={a.nome}
              fotoPath={a.foto_path}
              className="h-10 w-10 text-sm"
            />
            <span>{a.nome}</span>
          </span>
        }
        description={
          <span className="flex items-center gap-2">
            <StatusApoioBadge status={a.status} /> · cadastrado em {fmtData(a.created_at)}
          </span>
        }
        actions={
          <Link
            href="/apoiadores"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Apoiadores
          </Link>
        }
      />

      <TrilhaAuditoria
        createdAt={a.created_at}
        updatedAt={a.updated_at}
        createdBy={auditUsers.get(a.created_by ?? "") ?? null}
        updatedBy={auditUsers.get(a.updated_by ?? "") ?? null}
      />

      <Card>
        <CardContent className="pt-6">
          <ApoiadorForm
            modo="editar"
            id={a.id}
            liderancas={liderancas}
            inicial={{
              nome: a.nome,
              cpf: a.cpf,
              titulo_eleitor: a.titulo_eleitor,
              zona: a.zona,
              secao: a.secao,
              tel: a.tel,
              email: a.email,
              nascimento: a.nascimento,
              endereco: a.endereco,
              bairro: a.bairro,
              municipio: a.municipio,
              cep: a.cep,
              lider_id: a.lider_id,
              status: a.status,
              indicado_por: a.indicado_por,
              observacoes: a.observacoes,
              tags,
              foto_path: a.foto_path,
            }}
          />
          <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
            <div>
              <p className="text-sm font-medium text-ink-900">Excluir apoiador</p>
              <p className="text-xs text-ink-500">
                Remove o cadastro permanentemente. Use apenas em caso de duplicidade ou solicitação LGPD.
              </p>
            </div>
            <ExcluirApoiadorButton id={a.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
