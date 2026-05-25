import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { iniciais } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface Props {
  nome: string;
  className?: string;
}

export function AvatarInitials({ nome, className }: Props) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarFallback>{iniciais(nome)}</AvatarFallback>
    </Avatar>
  );
}
