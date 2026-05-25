import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; erro?: string };
}) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-brand-900 md:grid-cols-[1.05fr_1fr]">
      {/* PHOTO */}
      <section className="relative hidden bg-brand-900 md:block">
        <Image
          src="/foto_Guerreiro.webp"
          alt="Ângelo Guerreiro"
          fill
          priority
          sizes="(min-width: 768px) 52vw, 100vw"
          className="object-cover object-center"
        />
        {/* Gradient overlay for legibility of footer */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/85 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-10 py-10 text-center text-white md:px-14 md:py-12">
          <p className="text-[12px] text-white/70">
            © 2026 · Plataforma de Gestão Política · Ângelo Guerreiro
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="grid place-items-center bg-[#f4f6fa] p-4 md:p-10">
        <div className="w-full max-w-[410px] rounded-xl border border-ink-200 bg-white p-9 shadow-lg">
          <h3 className="mb-1 font-display text-[22px] font-semibold text-ink-900">
            Entrar no sistema
          </h3>
          <p className="mb-6 text-[13.5px] text-ink-500">
            Acesse com seu e-mail institucional da campanha.
          </p>
          <LoginForm next={searchParams.next} erro={searchParams.erro} />
        </div>
      </section>
    </main>
  );
}
