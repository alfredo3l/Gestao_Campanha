import { Badge } from "@/components/ui/badge";

import type { Prioridade, StatusDemanda } from "@/lib/validations/demanda";
import type { StatusApoio } from "@/lib/validations/apoiador";
import type { CargoLider } from "@/lib/validations/lideranca";

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

export const cargoLiderMap: Record<CargoLider, string> = {
  coord_regional: "Coord. Regional",
  coord_zona: "Coord. de Zona",
  lider_bairro: "Líder de Bairro",
  lider_comunitario: "Líder Comunitário",
  lider_rural: "Líder Rural",
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

export function CargoBadge({ cargo }: { cargo: CargoLider }) {
  return <Badge variant="outline">{cargoLiderMap[cargo]}</Badge>;
}
