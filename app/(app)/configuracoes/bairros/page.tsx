import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth-helpers";

import { GerenciadorLocalidades } from "./gerenciador-localidades";

export const metadata = { title: "Bairros & Setores" };

export default async function ConfiguracoesBairrosPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const podeGerenciar =
    profile.ativo && (profile.role === "admin" || profile.role === "coordenador");
  if (!podeGerenciar) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bairros & Setores"
          description="Apenas administradores e coordenadores podem gerenciar esta lista."
          actions={
            <Link
              href="/configuracoes"
              className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          }
        />
        <Card>
          <CardContent className="py-12 text-center text-sm text-ink-500">
            Você não tem permissão para acessar esta área. Solicite ao administrador
            para promover seu perfil a <strong>Coordenador</strong> ou{" "}
            <strong>Administrador</strong>.
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = createClient();

  const [setoresRes, bairrosRes, apoiadoresRes, liderancasRes, demandasRes] =
    await Promise.all([
      supabase
        .from("setores")
        .select("id, numero, nome, municipio, cor, ativo")
        .order("municipio", { ascending: true })
        .order("numero", { ascending: true }),
      supabase
        .from("bairros")
        .select("id, nome, municipio, setor_id, ativo")
        .order("municipio", { ascending: true })
        .order("nome", { ascending: true }),
      supabase.from("apoiadores").select("bairro_id").returns<{ bairro_id: string | null }[]>(),
      supabase.from("liderancas").select("bairro_id").returns<{ bairro_id: string | null }[]>(),
      supabase.from("demandas").select("bairro_id").returns<{ bairro_id: string | null }[]>(),
    ]);

  const setores = setoresRes.data ?? [];
  const bairros = bairrosRes.data ?? [];

  // Contagem de uso por bairro (apoiadores + lideranças + demandas).
  const usoPorBairro: Record<string, number> = {};
  for (const list of [apoiadoresRes.data, liderancasRes.data, demandasRes.data]) {
    for (const row of list ?? []) {
      if (row?.bairro_id) usoPorBairro[row.bairro_id] = (usoPorBairro[row.bairro_id] ?? 0) + 1;
    }
  }

  // Contagem de bairros vinculados por setor.
  const usoPorSetor: Record<string, number> = {};
  for (const b of bairros) {
    if (b.setor_id) usoPorSetor[b.setor_id] = (usoPorSetor[b.setor_id] ?? 0) + 1;
  }

  const municipiosCadastrados = Array.from(
    new Set([...setores.map((s) => s.municipio), ...bairros.map((b) => b.municipio)])
  ).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bairros & Setores"
        description="Cadastre os setores e bairros usados nos formulários de endereço. Ao selecionar um bairro, o setor associado é preenchido automaticamente."
        actions={
          <Link
            href="/configuracoes"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" /> Configurações
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo</CardTitle>
          <CardDescription>
            Comece criando os setores e depois cadastre os bairros, associando-os ao
            setor correspondente. A estrutura suporta múltiplos municípios — basta
            digitar o nome em outra cidade quando adicionar setores ou bairros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {setoresRes.error || bairrosRes.error ? (
            <p className="text-sm text-status-red">
              Erro ao carregar:{" "}
              {setoresRes.error?.message ?? bairrosRes.error?.message}
            </p>
          ) : (
            <GerenciadorLocalidades
              setores={setores}
              bairros={bairros}
              usoPorBairro={usoPorBairro}
              usoPorSetor={usoPorSetor}
              municipiosCadastrados={municipiosCadastrados}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
