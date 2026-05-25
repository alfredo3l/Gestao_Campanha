"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
import { Badge } from "@/components/ui/badge";
import { MunicipioCombobox } from "@/components/ui/municipio-combobox";
import {
  BairroCombobox,
  type BairroOption,
} from "@/components/ui/bairro-combobox";
import { FotoUpload } from "@/components/app/foto-upload";
import { criarApoiador, atualizarApoiador, type ActionState } from "./actions";
import type { StatusApoio } from "@/lib/validations/apoiador";
import { formatarCpf } from "@/lib/utils/cpf";
import { fmtTelefone, fmtCep } from "@/lib/utils/formatters";

interface LiderancaOption {
  id: string;
  nome: string;
  municipio: string;
}

interface Inicial {
  nome: string;
  cpf: string;
  titulo_eleitor: string | null;
  zona: string | null;
  secao: string | null;
  tel: string | null;
  email: string | null;
  nascimento: string | null;
  endereco: string | null;
  bairro: string | null;
  bairro_id?: string | null;
  setor_id?: string | null;
  municipio: string;
  cep: string | null;
  lider_id: string;
  status: StatusApoio;
  indicado_por: string | null;
  observacoes: string | null;
  tags: string[];
  foto_path?: string | null;
}

interface Props {
  modo: "novo" | "editar";
  id?: string;
  liderancas: LiderancaOption[];
  bairros: BairroOption[];
  inicial?: Inicial;
}

const statusOpcoes: { value: StatusApoio; label: string }[] = [
  { value: "confirmado", label: "Confirmado" },
  { value: "provavel", label: "Provável" },
  { value: "indeciso", label: "Indeciso" },
  { value: "contato", label: "Em contato" },
  { value: "nao_vota", label: "Não vota" },
];

function SubmitButton({ modo }: { modo: "novo" | "editar" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : modo === "novo" ? "Criar apoiador" : "Salvar alterações"}
    </Button>
  );
}

export function ApoiadorForm({ modo, id, liderancas, bairros, inicial }: Props) {
  const router = useRouter();
  const action =
    modo === "novo"
      ? criarApoiador
      : (state: ActionState, fd: FormData) => atualizarApoiador(id!, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  const [tags, setTags] = useState<string[]>(inicial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [cpf, setCpf] = useState(inicial?.cpf ? formatarCpf(inicial.cpf) : "");
  const [tel, setTel] = useState(inicial?.tel ? fmtTelefone(inicial.tel) : "");
  const [cep, setCep] = useState(inicial?.cep ? fmtCep(inicial.cep) : "");
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [municipio, setMunicipio] = useState<string>(inicial?.municipio ?? "Três Lagoas");
  const [fotoPath, setFotoPath] = useState<string | null>(inicial?.foto_path ?? null);

  useEffect(() => {
    if (state.error) toast.error("Não foi possível salvar", { description: state.error });
    if (state.ok) toast.success("Apoiador atualizado");
  }, [state]);

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = tagInput.trim().replace(/,$/, "");
      if (v && !tags.includes(v) && tags.length < 20) setTags([...tags, v]);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="tags" value={tags.join(",")} />
      <input type="hidden" name="foto_path" value={fotoPath ?? ""} />

      {modo === "editar" && id ? (
        <div className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-ink-50/40 p-4">
          <Label className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            Foto do apoiador
          </Label>
          <FotoUpload
            nome={nome}
            scope="apoiadores"
            ownerId={id}
            value={fotoPath}
            onChange={setFotoPath}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-3 text-xs text-ink-500">
          A foto do apoiador pode ser enviada após criar o cadastro, na tela de edição.
        </div>
      )}

      <Section title="Dados pessoais">
        <Field label="Nome completo *" colSpan={2}>
          <Input
            name="nome"
            required
            defaultValue={inicial?.nome}
            maxLength={120}
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>
        <Field label="CPF *">
          <Input
            name="cpf"
            required
            value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
        </Field>
        <Field label="Data de nascimento">
          <Input
            name="nascimento"
            type="date"
            defaultValue={inicial?.nascimento ?? ""}
          />
        </Field>
        <Field label="Telefone / WhatsApp">
          <Input
            name="tel"
            value={tel}
            onChange={(e) => setTel(fmtTelefone(e.target.value))}
            placeholder="(67) 99999-9999"
            inputMode="tel"
          />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" defaultValue={inicial?.email ?? ""} maxLength={120} />
        </Field>
      </Section>

      <Section title="Título de eleitor">
        <Field label="Número do título">
          <Input
            name="titulo_eleitor"
            defaultValue={inicial?.titulo_eleitor ?? ""}
            placeholder="12 dígitos"
            inputMode="numeric"
            maxLength={14}
          />
        </Field>
        <Field label="Zona">
          <Input name="zona" defaultValue={inicial?.zona ?? ""} maxLength={4} />
        </Field>
        <Field label="Seção">
          <Input name="secao" defaultValue={inicial?.secao ?? ""} maxLength={4} />
        </Field>
      </Section>

      <Section title="Endereço">
        <Field label="Endereço" colSpan={2}>
          <Input name="endereco" defaultValue={inicial?.endereco ?? ""} maxLength={200} />
        </Field>
        <Field label="Município *">
          <MunicipioCombobox
            name="municipio"
            required
            defaultValue={inicial?.municipio}
            semPadrao={modo === "editar"}
            onValueChange={setMunicipio}
          />
        </Field>
        <Field
          label="Bairro"
          colSpan={2}
          hint="Selecione um bairro cadastrado; o setor associado aparece automaticamente."
        >
          <BairroCombobox
            name="bairro"
            options={bairros}
            municipio={municipio}
            defaultValue={inicial?.bairro ?? ""}
            defaultBairroId={inicial?.bairro_id ?? null}
            defaultSetorId={inicial?.setor_id ?? null}
          />
        </Field>
        <Field label="CEP">
          <Input
            name="cep"
            value={cep}
            onChange={(e) => setCep(fmtCep(e.target.value))}
            placeholder="00000-000"
            inputMode="numeric"
            maxLength={9}
          />
        </Field>
      </Section>

      <Section title="Vínculo & status">
        <Field label="Liderança responsável *" colSpan={2}>
          <Select name="lider_id" defaultValue={inicial?.lider_id} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma liderança" />
            </SelectTrigger>
            <SelectContent>
              {liderancas.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nome} · {l.municipio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status do apoio">
          <Select name="status" defaultValue={inicial?.status ?? "contato"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOpcoes.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Indicado por">
          <Input name="indicado_por" defaultValue={inicial?.indicado_por ?? ""} maxLength={120} />
        </Field>
      </Section>

      <Section title="Tags & observações">
        <Field label="Tags" colSpan={3} hint="Pressione Enter ou vírgula para adicionar.">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 normal-case">
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="text-ink-500 hover:text-status-red"
                  aria-label={`remover ${t}`}
                >
                  ×
                </button>
              </Badge>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={tags.length === 0 ? "saúde, infraestrutura, jovens…" : ""}
              className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              maxLength={40}
            />
          </div>
        </Field>
        <Field label="Observações" colSpan={3}>
          <Textarea
            name="observacoes"
            defaultValue={inicial?.observacoes ?? ""}
            maxLength={2000}
            rows={4}
          />
        </Field>
      </Section>

      {modo === "novo" && (
        <div className="flex items-start gap-2 rounded-md border border-ink-200 bg-ink-50/40 p-3">
          <Checkbox id="consentimento_lgpd" name="consentimento_lgpd" required />
          <Label htmlFor="consentimento_lgpd" className="cursor-pointer text-xs leading-snug text-ink-700">
            <strong>Consentimento LGPD:</strong> o eleitor autorizou o uso de seus dados para fins
            de campanha e contato (artigo 7º, I, da Lei 13.709/2018).
          </Label>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <SubmitButton modo={modo} />
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  colSpan = 1,
  children,
}: {
  label: string;
  hint?: string;
  colSpan?: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const cls = colSpan === 3 ? "md:col-span-3" : colSpan === 2 ? "md:col-span-2" : "";
  return (
    <div className={`space-y-1.5 ${cls}`}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-2xs text-ink-500">{hint}</p>}
    </div>
  );
}
