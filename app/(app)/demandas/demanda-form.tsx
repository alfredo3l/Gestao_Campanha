"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
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
import { criarDemanda, atualizarDemanda, type ActionState } from "./actions";
import type { Prioridade, StatusDemanda } from "@/lib/validations/demanda";

interface Inicial {
  titulo: string;
  descricao: string | null;
  categoria: string;
  prioridade: Prioridade;
  status: StatusDemanda;
  solicitante_id: string | null;
  lider_id: string;
  prazo: string | null;
}

interface Props {
  modo: "novo" | "editar";
  id?: string;
  liderancas: { id: string; nome: string; municipio: string }[];
  apoiadores: { id: string; nome: string }[];
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

export function DemandaForm({ modo, id, liderancas, apoiadores, inicial }: Props) {
  const router = useRouter();
  const action =
    modo === "novo"
      ? criarDemanda
      : (state: ActionState, fd: FormData) => atualizarDemanda(id!, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

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
        <div className="space-y-1.5">
          <Label htmlFor="solicitante_id">Solicitante (apoiador)</Label>
          <Select name="solicitante_id" defaultValue={inicial?.solicitante_id ?? "none"}>
            <SelectTrigger id="solicitante_id">
              <SelectValue placeholder="Sem vínculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem vínculo direto</SelectItem>
              {apoiadores.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
