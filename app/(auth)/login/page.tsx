import type { Metadata } from "next";

import { CrestLogo } from "@/components/app/crest-logo";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const STATS: string[] = ["Lideranças ativas", "Apoiadores", "Meta atingida"];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; erro?: string };
}) {
  return (
    <main
      className="grid min-h-screen grid-cols-1 bg-brand-900 md:grid-cols-[1.05fr_1fr]"
      style={{
        backgroundImage:
          "radial-gradient(1100px 600px at 80% 20%, rgba(38,131,191,0.12), transparent 60%), radial-gradient(900px 500px at 10% 80%, rgba(31,138,82,0.10), transparent 60%)",
      }}
    >
      {/* HERO */}
      <section className="flex flex-col justify-between gap-12 px-6 py-10 text-white md:px-16 md:py-14">
        <header className="flex items-center gap-3">
          <CrestLogo />
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-[0.3px] text-white">
              Plataforma de Gestão de Campanha
            </div>
            <div className="text-[11.5px] text-white/55">
              Gestão de Campanha · MS
            </div>
          </div>
        </header>

        <div>
          <h2 className="mb-3.5 font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.5px] md:text-[38px]">
            Coordene a campanha
            <br />
            com clareza de dados.
          </h2>
          <p className="max-w-[460px] text-[15px] leading-[1.55] text-white/75">
            Cadastre apoiadores, organize lideranças por bairro, acompanhe
            metas de votos por região e responda demandas dos eleitores em um
            único lugar.
          </p>

          <div className="mt-7 grid max-w-[460px] grid-cols-3 gap-x-4">
            {STATS.map((label) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
              >
                <div className="text-[11.5px] uppercase tracking-[0.8px] text-white/60">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-[12px] text-white/45">
          © 2026 · Sistema interno de coordenação. Dados protegidos pela LGPD.
        </footer>
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
