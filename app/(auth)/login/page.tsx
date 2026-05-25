import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; erro?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <header className="mb-6">
          <p className="font-mono-tab text-xs uppercase tracking-widest text-brand-700">Gestão de Campanha</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">Entrar</h1>
          <p className="mt-1 text-sm text-ink-500">Acesso restrito à equipe de coordenação.</p>
        </header>
        <LoginForm next={searchParams.next} erro={searchParams.erro} />
      </div>
    </main>
  );
}
