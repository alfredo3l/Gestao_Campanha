import { Clock, UserPlus } from "lucide-react";

import { AvatarInitials } from "@/components/app/avatar-initials";
import { fmtDataHora } from "@/lib/utils/formatters";
import type { AuditoriaUsuario } from "@/lib/auditoria";
import { cn } from "@/lib/utils/cn";

interface Props {
  createdAt: string | null | undefined;
  updatedAt: string | null | undefined;
  createdBy: AuditoriaUsuario | null | undefined;
  updatedBy: AuditoriaUsuario | null | undefined;
  className?: string;
}

/**
 * Mostra a trilha de auditoria de um registro (quem cadastrou, quando, e
 * quem alterou pela última vez).
 *
 * Usado nas páginas de detalhe de apoiador, liderança e demanda.
 *
 * Heurística de exibição:
 *  - Sempre mostra "Cadastrado".
 *  - Só mostra "Última alteração" se a alteração for diferente da criação
 *    (>1 minuto de diferença e/ou autor diferente). Caso contrário esconde
 *    para evitar repetição visual em registros recém-criados.
 */
export function TrilhaAuditoria({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  className,
}: Props) {
  const mostrarAlteracao =
    !!updatedAt &&
    (createdAt
      ? Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) >
          60_000 ||
        (updatedBy?.id && updatedBy.id !== createdBy?.id)
      : true);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-ink-200 bg-ink-50/40 p-3 text-xs",
        className
      )}
    >
      <Linha
        icone={<UserPlus className="h-3.5 w-3.5" />}
        rotulo="Cadastrado"
        data={createdAt}
        usuario={createdBy}
      />
      {mostrarAlteracao && (
        <Linha
          icone={<Clock className="h-3.5 w-3.5" />}
          rotulo="Última alteração"
          data={updatedAt}
          usuario={updatedBy}
        />
      )}
    </div>
  );
}

function Linha({
  icone,
  rotulo,
  data,
  usuario,
}: {
  icone: React.ReactNode;
  rotulo: string;
  data: string | null | undefined;
  usuario: AuditoriaUsuario | null | undefined;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 font-mono-tab text-2xs uppercase tracking-wide text-ink-500">
        {icone}
        {rotulo}
      </span>
      {usuario ? (
        <span className="flex items-center gap-1.5 text-ink-900">
          <AvatarInitials nome={usuario.nome} fotoPath={usuario.foto_path} className="h-5 w-5 text-[10px]" />
          <span className="font-medium">{usuario.nome}</span>
        </span>
      ) : (
        <span className="text-ink-400">—</span>
      )}
      {data && (
        <span className="font-mono-tab text-ink-500">
          · {fmtDataHora(data)}
        </span>
      )}
    </div>
  );
}
