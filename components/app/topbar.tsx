"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarInitials } from "@/components/app/avatar-initials";
import { GlobalSearch } from "@/components/app/global-search";

interface Props {
  email: string;
  nome?: string | null;
  role?: string | null;
  fotoPath?: string | null;
}

export function Topbar({ email, nome, role, fotoPath }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Erro ao sair", { description: error.message });
        return;
      }
      router.replace("/login");
      router.refresh();
    });
  }

  const displayName = nome?.trim() || email;

  return (
    <header className="border-b border-ink-200 bg-white">
      <div className="flex h-topbar items-center justify-between gap-4 px-5">
        <div className="hidden flex-1 items-center md:flex">
          <GlobalSearch />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-md p-1 text-left transition-colors hover:bg-ink-50">
            <AvatarInitials nome={displayName} fotoPath={fotoPath} />
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-tight text-ink-900">{displayName}</p>
              <p className="font-mono-tab text-2xs uppercase tracking-wide text-ink-500">
                {role ?? "membro"}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Conta</DropdownMenuLabel>
            <div className="px-2 pb-2 text-xs text-ink-500">{email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracoes/perfil">
                <UserCircle className="h-4 w-4" />
                <span>Meu perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={pending} onSelect={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>{pending ? "Saindo…" : "Sair"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
