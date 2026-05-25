"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FotoUpload } from "@/components/app/foto-upload";
import { atualizarPerfil, type PerfilActionState } from "./actions";

interface Props {
  userId: string;
  email: string;
  nome: string;
  role: string | null;
  fotoPath: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  coordenador: "Coordenador",
  operador: "Operador",
  visualizador: "Visualizador",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : "Salvar alterações"}
    </Button>
  );
}

export function PerfilForm({ userId, email, nome, role, fotoPath }: Props) {
  const [state, formAction] = useFormState<PerfilActionState, FormData>(atualizarPerfil, {});
  const [nomeAtual, setNomeAtual] = useState(nome);
  const [fotoAtual, setFotoAtual] = useState<string | null>(fotoPath);

  useEffect(() => {
    if (state.error) toast.error("Não foi possível salvar", { description: state.error });
    if (state.ok) toast.success("Perfil atualizado");
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="foto_path" value={fotoAtual ?? ""} />

      <div className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-ink-50/40 p-4">
        <Label className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
          Foto de perfil
        </Label>
        <FotoUpload
          nome={nomeAtual}
          scope="profiles"
          ownerId={userId}
          value={fotoAtual}
          onChange={setFotoAtual}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome de exibição *</Label>
          <Input
            id="nome"
            name="nome"
            required
            value={nomeAtual}
            onChange={(e) => setNomeAtual(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input value={email} disabled readOnly />
          <p className="text-2xs text-ink-500">
            Para alterar o e-mail, peça ao administrador no Supabase Auth.
          </p>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Função no sistema</Label>
          <div>
            {role ? (
              <Badge variant="secondary">{roleLabels[role] ?? role}</Badge>
            ) : (
              <Badge variant="secondary">Sem perfil</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
