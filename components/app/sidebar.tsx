"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Target,
  Inbox,
  BarChart3,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apoiadores", label: "Apoiadores", icon: Users },
  { href: "/liderancas", label: "Lideranças", icon: UserCog },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/demandas", label: "Demandas", icon: Inbox },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden bg-brand-900 text-white md:row-span-2 md:flex md:flex-col">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="font-mono-tab text-2xs uppercase tracking-widest text-white/60">Plataforma de Gestão de Campanha</p>
        <p className="mt-0.5 font-display text-base font-semibold">MS · Dep. Estadual</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3 text-sm">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-white/80 transition-colors hover:bg-white/5 hover:text-white",
                active && "bg-white/10 text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-3 text-2xs text-white/50">
        Versão interna · 2026
      </div>
    </aside>
  );
}
