import Link from "next/link";
import { ShieldCheck, Database, Users2, Tags, UserCog, UserCircle, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { fmtData } from "@/lib/utils/formatters";

export const metadata = { title: "Configurações" };

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  coordenador: "Coordenador",
  operador: "Operador",
  visualizador: "Visualizador",
};

const roleVariants: Record<string, "blue" | "green" | "secondary" | "violet"> = {
  admin: "violet",
  coordenador: "blue",
  operador: "green",
  visualizador: "secondary",
};

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nome, role, ativo, foto_path, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Usuários, permissões e parâmetros gerais do sistema."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuários da campanha</CardTitle>
            <CardDescription>
              Pessoas com acesso ao sistema. Para incluir um novo usuário, peça ao administrador
              criar um convite no Supabase Auth.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!profiles || profiles.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-ink-500">
                Nenhum perfil encontrado. Os perfis aparecem aqui automaticamente quando um usuário
                é convidado pelo administrador.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cadastrado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <AvatarInitials nome={p.nome} fotoPath={p.foto_path} />
                          <div className="min-w-0">
                            <p className="font-medium text-ink-900">{p.nome}</p>
                            <p className="font-mono-tab text-2xs text-ink-500">{p.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleVariants[p.role] ?? "secondary"}>
                          {roleLabels[p.role] ?? p.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.ativo ? (
                          <Badge variant="green">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono-tab text-xs text-ink-500">
                        {fmtData(p.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funções e permissões</CardTitle>
            <CardDescription>Política aplicada via RLS no banco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Funcao
              titulo="Administrador"
              variant="violet"
              descricao="Acesso total a todas as áreas, incluindo gerenciamento de usuários e exclusões."
            />
            <Funcao
              titulo="Coordenador"
              variant="blue"
              descricao="Pode criar/editar lideranças, apoiadores e demandas das suas regiões. Sem exclusão."
            />
            <Funcao
              titulo="Operador"
              variant="green"
              descricao="Cria e edita apoiadores e demandas. Não exclui registros nem altera lideranças."
            />
            <Funcao
              titulo="Visualizador"
              variant="secondary"
              descricao="Acesso somente leitura, ideal para acompanhamento gerencial e auditoria."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/configuracoes/perfil"
          className="group rounded-lg border border-ink-200 bg-white p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-100 p-2 text-brand-800">
              <UserCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">Meu perfil</p>
                <ArrowRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </div>
              <p className="mt-0.5 text-xs text-ink-500">
                Atualize sua foto de exibição e o nome usado no sistema.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/configuracoes/cargos"
          className="group rounded-lg border border-ink-200 bg-white p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-100 p-2 text-brand-800">
              <UserCog className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">Cargos de liderança</p>
                <ArrowRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </div>
              <p className="mt-0.5 text-xs text-ink-500">
                Adicione, renomeie ou desative as opções de cargo usadas no cadastro de
                lideranças. Somente <strong>admin</strong> e <strong>coordenador</strong>.
              </p>
            </div>
          </div>
        </Link>

        <Card>
          <CardHeader className="flex-row items-start gap-3 space-y-0">
            <div className="rounded-md bg-brand-100 p-2 text-brand-800">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm">Integração Supabase</CardTitle>
              <CardDescription>Banco, Auth e Storage do projeto.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <Linha label="Schema" valor="campanha" />
            <Linha label="RLS" valor="ativo em todas as tabelas" tone="green" />
            <Linha label="Storage" valor="bucket demandas" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start gap-3 space-y-0">
            <div className="rounded-md bg-green-100 p-2 text-green-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm">LGPD</CardTitle>
              <CardDescription>Consentimento e exclusão sob solicitação.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <Linha label="Consentimento" valor="registrado no cadastro" />
            <Linha label="Exclusão sob solicitação" valor="manual via admin" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start gap-3 space-y-0">
            <div className="rounded-md bg-status-amber-100 p-2 text-status-amber">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm">Categorias e tags</CardTitle>
              <CardDescription>Organização padrão para classificação.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-ink-500">
            Categorias de demanda e tags de apoiador são livres por enquanto. Padronização
            centralizada será adicionada em iteração futura.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start gap-3 space-y-0">
            <div className="rounded-md bg-status-blue-100 p-2 text-status-blue">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm">Convites de acesso</CardTitle>
              <CardDescription>Cadastro restrito a convidados.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-ink-500">
            Não há registro público. Para incluir um novo membro, o administrador deve criar o
            usuário no Supabase Auth e configurar o perfil em <code>campanha.profiles</code>.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Funcao({
  titulo,
  descricao,
  variant,
}: {
  titulo: string;
  descricao: string;
  variant: "violet" | "blue" | "green" | "secondary";
}) {
  return (
    <div className="space-y-1 border-l-2 border-ink-200 pl-3">
      <Badge variant={variant}>{titulo}</Badge>
      <p className="text-ink-600">{descricao}</p>
    </div>
  );
}

function Linha({
  label,
  valor,
  tone,
}: {
  label: string;
  valor: string;
  tone?: "green";
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-1 last:border-b-0">
      <span className="text-ink-500">{label}</span>
      <span className={`font-medium ${tone === "green" ? "text-status-green" : "text-ink-900"}`}>
        {valor}
      </span>
    </div>
  );
}
