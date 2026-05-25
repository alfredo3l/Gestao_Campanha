import { Badge } from "@/components/ui/badge";

import type { Prioridade, StatusDemanda } from "@/lib/validations/demanda";
import type { StatusApoio } from "@/lib/validations/apoiador";

const statusApoioMap: Record<StatusApoio, { label: string; variant: "green" | "blue" | "amber" | "violet" | "secondary" }> = {
  confirmado: { label: "Confirmado", variant: "green" },
  provavel: { label: "Provável", variant: "blue" },
  indeciso: { label: "Indeciso", variant: "amber" },
  contato: { label: "Em contato", variant: "violet" },
  nao_vota: { label: "Não vota", variant: "secondary" },
};

const statusDemandaMap: Record<StatusDemanda, { label: string; variant: "amber" | "blue" | "green" | "secondary" }> = {
  aberta: { label: "Aberta", variant: "amber" },
  andamento: { label: "Em andamento", variant: "blue" },
  resolvida: { label: "Resolvida", variant: "green" },
  cancelada: { label: "Cancelada", variant: "secondary" },
};

const prioridadeMap: Record<Prioridade, { label: string; variant: "secondary" | "blue" | "amber" | "red" }> = {
  baixa: { label: "Baixa", variant: "secondary" },
  media: { label: "Média", variant: "blue" },
  alta: { label: "Alta", variant: "amber" },
  urgente: { label: "Urgente", variant: "red" },
};

export function StatusApoioBadge({ status }: { status: StatusApoio }) {
  const cfg = statusApoioMap[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function StatusDemandaBadge({ status }: { status: StatusDemanda }) {
  const cfg = statusDemandaMap[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const cfg = prioridadeMap[prioridade];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

/**
 * Renderiza o badge de cargo de liderança.
 *
 * Recebe diretamente o `label` (texto em PT-BR) carregado do banco — a página
 * que invoca deve resolver via `getCargosLiderMap()` (em `lib/cargos`).
 * Quando o `label` não é fornecido (cargo deletado, etc.), exibe o próprio
 * slug como fallback.
 */
export function CargoBadge({
  cargo,
  label,
}: {
  cargo: string;
  label?: string;
}) {
  return <Badge variant="outline">{label ?? cargo}</Badge>;
}
