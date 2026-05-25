import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { iniciais } from "@/lib/utils/formatters";
import { getFotoUrl } from "@/lib/utils/avatar";
import { cn } from "@/lib/utils/cn";

interface Props {
  nome: string;
  /**
   * Caminho da foto dentro do bucket `campanha-fotos` (coluna `foto_path`).
   * Quando vazio, mostra fallback de iniciais.
   */
  fotoPath?: string | null;
  className?: string;
}

/**
 * Avatar padrão dos cadastros (apoiadores, lideranças, usuários):
 *  - se houver `fotoPath`, mostra a foto carregada do Supabase Storage;
 *  - caso contrário, exibe as iniciais do nome em formato circular.
 *
 * O nome do componente é mantido para compatibilidade com chamadas existentes,
 * mas agora ele suporta ambos os modos (foto + iniciais).
 */
export function AvatarInitials({ nome, fotoPath, className }: Props) {
  const url = getFotoUrl(fotoPath);
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {url && <AvatarImage src={url} alt={nome} />}
      <AvatarFallback>{iniciais(nome)}</AvatarFallback>
    </Avatar>
  );
}
