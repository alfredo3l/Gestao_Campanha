"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { User, Megaphone, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BairroCombobox,
  type BairroOption,
} from "@/components/ui/bairro-combobox";
import { MunicipioCombobox } from "@/components/ui/municipio-combobox";
import { cn } from "@/lib/utils/cn";
import { criarDemanda, atualizarDemanda, type ActionState } from "./actions";
import type {
  Prioridade,
  StatusDemanda,
  TipoSolicitante,
} from "@/lib/validations/demanda";

export interface DemandaSolicitanteInicial {
  tipo: TipoSolicitante;
  apoiador_id?: string | null;
  lider_id?: string | null;
  nome?: string | null;
  tel?: string | null;
  bairro?: string | null;
}

interface Inicial {
  titulo: string;
  descricao: string | null;
  categoria: string;
  prioridade: Prioridade;
  status: StatusDemanda;
  solicitante: DemandaSolicitanteInicial;
  lider_id: string;
  bairro?: string | null;
  bairro_id?: string | null;
  setor_id?: string | null;
  /** Município do endereço (não fica gravado na demanda — só usado pelo combobox). */
  municipio?: string;
  prazo: string | null;
}

interface Props {
  modo: "novo" | "editar";
  id?: string;
  liderancas: { id: string; nome: string; municipio: string }[];
  apoiadores: { id: string; nome: string }[];
  bairros: BairroOption[];
  inicial?: Inicial;
}

const categorias = [
  "Saúde",
  "Infraestrutura",
  "Educação",
  "Segurança",
  "Assistência Social",
  "Trabalho",
  "Habitação",
  "Outro",
];

function SubmitButton({ modo }: { modo: "novo" | "editar" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : modo === "novo" ? "Criar demanda" : "Salvar alterações"}
    </Button>
  );
}

export function DemandaForm({
  modo,
  id,
  liderancas,
  apoiadores,
  bairros,
  inicial,
}: Props) {
  const router = useRouter();
  const action =
    modo === "novo"
      ? criarDemanda
      : (state: ActionState, fd: FormData) => atualizarDemanda(id!, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  const [municipio, setMunicipio] = useState<string>(
    inicial?.municipio ?? "Três Lagoas"
  );

  const [tipoSolicitante, setTipoSolicitante] = useState<TipoSolicitante>(
    inicial?.solicitante.tipo ?? "apoiador"
  );

  useEffect(() => {
    if (state.error) toast.error("Não foi possível salvar", { description: state.error });
    if (state.ok) toast.success("Demanda atualizada");
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input id="titulo" name="titulo" required defaultValue={inicial?.titulo} maxLength={160} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select name="categoria" defaultValue={inicial?.categoria ?? "Outro"}>
            <SelectTrigger id="categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prioridade">Prioridade</Label>
          <Select name="prioridade" defaultValue={inicial?.prioridade ?? "media"}>
            <SelectTrigger id="prioridade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={inicial?.status ?? "aberta"}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="andamento">Em andamento</SelectItem>
              <SelectItem value="resolvida">Resolvida</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prazo">Prazo</Label>
          <Input id="prazo" name="prazo" type="date" defaultValue={inicial?.prazo ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lider_id">Liderança responsável *</Label>
          <Select name="lider_id" defaultValue={inicial?.lider_id} required>
            <SelectTrigger id="lider_id">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {liderancas.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nome} · {l.municipio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            Solicitante *
          </Label>
          <p className="text-2xs text-ink-500">
            Quem está pedindo essa demanda. Pode ser um apoiador ou liderança já
            cadastrado, ou alguém ainda não cadastrado (avulso).
          </p>
          <input type="hidden" name="solicitante_tipo" value={tipoSolicitante} />

          <div
            role="radiogroup"
            aria-label="Tipo de solicitante"
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            <TipoSolicitanteChip
              ativo={tipoSolicitante === "apoiador"}
              onClick={() => setTipoSolicitante("apoiador")}
              icon={<User className="h-3.5 w-3.5" />}
              titulo="Apoiador"
              descricao="Cadastrado na base"
            />
            <TipoSolicitanteChip
              ativo={tipoSolicitante === "lideranca"}
              onClick={() => setTipoSolicitante("lideranca")}
              icon={<Megaphone className="h-3.5 w-3.5" />}
              titulo="Liderança"
              descricao="Cadastrada na base"
            />
            <TipoSolicitanteChip
              ativo={tipoSolicitante === "avulso"}
              onClick={() => setTipoSolicitante("avulso")}
              icon={<UserPlus className="h-3.5 w-3.5" />}
              titulo="Avulso"
              descricao="Ainda não cadastrado"
            />
          </div>

          {tipoSolicitante === "apoiador" && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="solicitante_apoiador_id">Apoiador *</Label>
              <Select
                name="solicitante_apoiador_id"
                defaultValue={inicial?.solicitante.apoiador_id ?? undefined}
              >
                <SelectTrigger id="solicitante_apoiador_id">
                  <SelectValue placeholder="Selecione o apoiador" />
                </SelectTrigger>
                <SelectContent>
                  {apoiadores.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipoSolicitante === "lideranca" && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="solicitante_lider_id">Liderança *</Label>
              <Select
                name="solicitante_lider_id"
                defaultValue={inicial?.solicitante.lider_id ?? undefined}
              >
                <SelectTrigger id="solicitante_lider_id">
                  <SelectValue placeholder="Selecione a liderança" />
                </SelectTrigger>
                <SelectContent>
                  {liderancas.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nome} · {l.municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipoSolicitante === "avulso" && (
            <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="solicitante_nome">Nome do solicitante *</Label>
                <Input
                  id="solicitante_nome"
                  name="solicitante_nome"
                  required={tipoSolicitante === "avulso"}
                  maxLength={120}
                  defaultValue={inicial?.solicitante.nome ?? ""}
                  placeholder="Ex.: Carlos Mendes"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="solicitante_tel">Telefone (opcional)</Label>
                <Input
                  id="solicitante_tel"
                  name="solicitante_tel"
                  maxLength={20}
                  defaultValue={inicial?.solicitante.tel ?? ""}
                  placeholder="(67) 99999-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="solicitante_bairro">Bairro (opcional)</Label>
                <Input
                  id="solicitante_bairro"
                  name="solicitante_bairro"
                  maxLength={80}
                  defaultValue={inicial?.solicitante.bairro ?? ""}
                  placeholder="Ex.: Vila Piloto"
                />
              </div>
              <p className="text-2xs text-ink-500 md:col-span-2">
                Depois de criar a demanda você poderá converter este solicitante
                em um apoiador cadastrado a partir da página de detalhes.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            Localidade (opcional)
          </Label>
          <p className="text-2xs text-ink-500">
            Útil para mapear demandas por região da cidade. Não substitui o endereço
            do apoiador solicitante.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="demanda-municipio">Município</Label>
          <MunicipioCombobox
            id="demanda-municipio"
            name="municipio_ref"
            defaultValue={inicial?.municipio ?? "Três Lagoas"}
            onValueChange={setMunicipio}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="demanda-bairro">Bairro</Label>
          <BairroCombobox
            id="demanda-bairro"
            name="bairro"
            options={bairros}
            municipio={municipio}
            defaultValue={inicial?.bairro ?? ""}
            defaultBairroId={inicial?.bairro_id ?? null}
            defaultSetorId={inicial?.setor_id ?? null}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            name="descricao"
            defaultValue={inicial?.descricao ?? ""}
            rows={5}
            maxLength={5000}
            placeholder="Detalhe a demanda, contexto e o que se espera de retorno…"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <SubmitButton modo={modo} />
      </div>
    </form>
  );
}

function TipoSolicitanteChip({
  ativo,
  onClick,
  icon,
  titulo,
  descricao,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={ativo}
      onClick={onClick}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors",
        ativo
          ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-200"
          : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          ativo ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-medium",
            ativo ? "text-brand-900" : "text-ink-900"
          )}
        >
          {titulo}
        </span>
        <span className="block text-2xs text-ink-500">{descricao}</span>
      </span>
    </button>
  );
}
