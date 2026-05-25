"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  BairroCombobox,
  type BairroOption,
} from "@/components/ui/bairro-combobox";
import { MultiFilterCombobox } from "@/components/ui/multi-filter-combobox";
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

export interface SetorOpcao {
  id: string;
  numero: number;
  nome: string;
  municipio: string;
  ativo: boolean;
}

interface Props {
  modo: "novo" | "editar";
  id?: string;
  /** Cargos disponíveis no momento (já filtrados por `ativo` na origem). */
  cargos: CargoOpcao[];
  bairros: BairroOption[];
  /** Setores disponíveis (inclui inativos para preservar vínculos antigos). */
  setores: SetorOpcao[];
  inicial?: {
    nome: string;
    cargo: string;
    municipio: string;
    bairro: string | null;
    bairro_id?: string | null;
    setor_id?: string | null;
    /** IDs dos setores já vinculados (relação N:N — migration 0012). */
    setor_ids?: string[];
    tel: string | null;
    email: string | null;
    meta_votos: number;
    ativa: boolean;
    observacoes?: string | null;
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

export function LiderancaForm({ modo, id, cargos, bairros, setores, inicial }: Props) {
  const router = useRouter();
  const action =
    modo === "novo"
      ? criarLideranca
      : (state: ActionState, fd: FormData) => atualizarLideranca(id!, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [municipio, setMunicipio] = useState<string>(inicial?.municipio ?? "Três Lagoas");
  const [fotoPath, setFotoPath] = useState<string | null>(inicial?.foto_path ?? null);
  const [setorIds, setSetorIds] = useState<string[]>(inicial?.setor_ids ?? []);

  /**
   * Mostra os setores do município corrente; mantém inativos apenas se já
   * vinculados (para não perder o registro ao editar).
   */
  const opcoesSetor = useMemo(() => {
    const norm = (s: string) =>
      s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
    const muniNorm = norm(municipio);
    return setores
      .filter((s) =>
        muniNorm ? norm(s.municipio) === muniNorm : true
      )
      .filter((s) => s.ativo || setorIds.includes(s.id))
      .sort((a, b) => a.numero - b.numero)
      .map((s) => ({
        value: s.id,
        label: `Setor ${s.numero}${
          s.nome && s.nome !== `Setor ${s.numero}` ? ` · ${s.nome}` : ""
        }${s.ativo ? "" : " (inativo)"}`,
        hint: s.municipio,
      }));
  }, [setores, municipio, setorIds]);

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
      {setorIds.map((sid) => (
        <input key={sid} type="hidden" name="setor_ids" value={sid} />
      ))}

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
            onValueChange={setMunicipio}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bairro">Bairro / Localidade</Label>
          <BairroCombobox
            id="bairro"
            name="bairro"
            options={bairros}
            municipio={municipio}
            defaultValue={inicial?.bairro ?? ""}
            defaultBairroId={inicial?.bairro_id ?? null}
            defaultSetorId={inicial?.setor_id ?? null}
          />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="setores">Setores de atuação</Label>
          <MultiFilterCombobox
            options={opcoesSetor}
            value={setorIds}
            onChange={setSetorIds}
            placeholder="Selecione um ou mais setores…"
            searchPlaceholder="Buscar setor pelo número ou nome…"
            emptyMessage={
              opcoesSetor.length === 0
                ? `Nenhum setor cadastrado para ${municipio || "este município"}.`
                : "Nenhum setor encontrado."
            }
            ariaLabel="Setores de atuação"
            countLabel={(n) => `${n} ${n === 1 ? "setor" : "setores"}`}
          />
          <p className="text-2xs text-ink-500">
            Uma liderança pode atender múltiplos setores. Selecione todos os
            setores em que ela atua.
          </p>
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
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            defaultValue={inicial?.observacoes ?? ""}
            maxLength={2000}
            rows={4}
            placeholder="Anotações livres sobre esta liderança (perfil, histórico, compromissos, particularidades…)"
          />
          <p className="text-2xs text-ink-500">
            Texto livre — até 2000 caracteres. Não inclua dados sensíveis sem
            necessidade.
          </p>
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
