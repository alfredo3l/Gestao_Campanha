"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MunicipioCombobox } from "@/components/ui/municipio-combobox";
import { FotoUpload } from "@/components/app/foto-upload";
import {
  criarLideranca,
  atualizarLideranca,
  type ActionState,
} from "./actions";

export interface CargoOpcao {
  value: string;
  label: string;
}

interface Props {
  modo: "novo" | "editar";
  id?: string;
  /** Cargos disponíveis no momento (já filtrados por `ativo` na origem). */
  cargos: CargoOpcao[];
  inicial?: {
    nome: string;
    cargo: string;
    municipio: string;
    bairro: string | null;
    tel: string | null;
    email: string | null;
    meta_votos: number;
    ativa: boolean;
    foto_path?: string | null;
  };
}

function SubmitButton({ modo }: { modo: "novo" | "editar" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : modo === "novo" ? "Criar liderança" : "Salvar alterações"}
    </Button>
  );
}

export function LiderancaForm({ modo, id, cargos, inicial }: Props) {
  const router = useRouter();
  const action =
    modo === "novo"
      ? criarLideranca
      : (state: ActionState, fd: FormData) => atualizarLideranca(id!, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [fotoPath, setFotoPath] = useState<string | null>(inicial?.foto_path ?? null);

  // Se estamos editando e o cargo atual (ex.: cargo inativado depois) não
  // estiver mais na lista, mantemos a opção visível para não perder o vínculo.
  const cargosVisiveis: CargoOpcao[] =
    inicial?.cargo && !cargos.some((c) => c.value === inicial.cargo)
      ? [...cargos, { value: inicial.cargo, label: `${inicial.cargo} (inativo)` }]
      : cargos;

  const defaultCargo =
    inicial?.cargo ??
    cargos.find((c) => c.value === "lider_bairro")?.value ??
    cargos[0]?.value;

  useEffect(() => {
    if (state.error) toast.error("Não foi possível salvar", { description: state.error });
    if (state.ok) toast.success("Liderança atualizada");
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="foto_path" value={fotoPath ?? ""} />

      {modo === "editar" && id && (
        <div className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-ink-50/40 p-4">
          <Label className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            Foto da liderança
          </Label>
          <FotoUpload
            nome={nome}
            scope="liderancas"
            ownerId={id}
            value={fotoPath}
            onChange={setFotoPath}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="nome">Nome completo *</Label>
          <Input
            id="nome"
            name="nome"
            required
            defaultValue={inicial?.nome}
            maxLength={120}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo *</Label>
          <Select name="cargo" defaultValue={defaultCargo}>
            <SelectTrigger id="cargo">
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {cargosVisiveis.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meta_votos">Meta de votos</Label>
          <Input
            id="meta_votos"
            name="meta_votos"
            type="number"
            min={0}
            step={10}
            defaultValue={inicial?.meta_votos ?? 0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="municipio">Município *</Label>
          <MunicipioCombobox
            id="municipio"
            name="municipio"
            required
            defaultValue={inicial?.municipio}
            semPadrao={modo === "editar"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bairro">Bairro / Localidade</Label>
          <Input id="bairro" name="bairro" defaultValue={inicial?.bairro ?? ""} maxLength={80} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Telefone / WhatsApp</Label>
          <Input id="tel" name="tel" defaultValue={inicial?.tel ?? ""} maxLength={20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={inicial?.email ?? ""}
            maxLength={120}
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2 pt-1">
          <Checkbox id="ativa" name="ativa" defaultChecked={inicial?.ativa ?? true} />
          <Label htmlFor="ativa" className="cursor-pointer">
            Liderança ativa
          </Label>
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
