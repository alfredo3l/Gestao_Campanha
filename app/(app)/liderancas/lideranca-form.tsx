"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
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
import {
  criarLideranca,
  atualizarLideranca,
  type ActionState,
} from "./actions";
import { cargoLiderMap } from "@/components/app/status-badge";
import type { CargoLider } from "@/lib/validations/lideranca";

const cargos: CargoLider[] = [
  "coord_regional",
  "coord_zona",
  "lider_bairro",
  "lider_comunitario",
  "lider_rural",
];

interface Props {
  modo: "novo" | "editar";
  id?: string;
  inicial?: {
    nome: string;
    cargo: CargoLider;
    municipio: string;
    bairro: string | null;
    tel: string | null;
    email: string | null;
    meta_votos: number;
    ativa: boolean;
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

export function LiderancaForm({ modo, id, inicial }: Props) {
  const router = useRouter();
  const action =
    modo === "novo"
      ? criarLideranca
      : (state: ActionState, fd: FormData) => atualizarLideranca(id!, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  useEffect(() => {
    if (state.error) toast.error("Não foi possível salvar", { description: state.error });
    if (state.ok) toast.success("Liderança atualizada");
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="nome">Nome completo *</Label>
          <Input id="nome" name="nome" required defaultValue={inicial?.nome} maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo *</Label>
          <Select name="cargo" defaultValue={inicial?.cargo ?? "lider_bairro"}>
            <SelectTrigger id="cargo">
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {cargos.map((c) => (
                <SelectItem key={c} value={c}>
                  {cargoLiderMap[c]}
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
