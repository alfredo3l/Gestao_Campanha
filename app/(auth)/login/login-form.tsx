"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface Props {
  next?: string;
  erro?: string;
}

export function LoginForm({ next, erro }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(erro ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const supabase = createClient();

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error("Não foi possível entrar", { description: error.message });
        return;
      }

      const dest = next && next.startsWith("/") ? next : "/dashboard";
      router.replace(dest);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-status-red-100 bg-status-red-100/50 px-3 py-2 text-xs text-status-red"
        >
          {errorMsg}
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-[12px] font-semibold text-ink-700"
        >
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@campanha.app"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 text-[13px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="senha"
          className="text-[12px] font-semibold text-ink-700"
        >
          Senha
        </Label>
        <Input
          id="senha"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="h-10 text-[13px]"
        />
      </div>

      <div className="-mt-1 flex items-center justify-between text-[12.5px]">
        <label className="flex cursor-pointer items-center gap-2 text-ink-600">
          <Checkbox
            checked={manterConectado}
            onCheckedChange={(checked) => setManterConectado(checked === true)}
          />
          Manter conectado
        </label>
        <Link
          href="/recuperar-senha"
          className="text-brand-700 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full bg-brand-800 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-900"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>

      <p className="pt-4 text-center text-[12px] text-ink-500">
        Acesso restrito · solicite convite ao coordenador
      </p>
    </form>
  );
}
