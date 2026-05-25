"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { comentarDemanda, type ActionState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enviando…" : "Comentar"}
    </Button>
  );
}

export function ComentarioForm({ demandaId }: { demandaId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const action = (state: ActionState, fd: FormData) => comentarDemanda(demandaId, state, fd);
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  useEffect(() => {
    if (state.error) toast.error("Erro ao comentar", { description: state.error });
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-2">
      <Textarea
        name="texto"
        required
        minLength={1}
        maxLength={2000}
        rows={3}
        placeholder="Adicione um comentário ou registro de andamento…"
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
