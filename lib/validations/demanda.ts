import { z } from "zod";

export const statusDemandaEnum = z.enum(["aberta", "andamento", "resolvida", "cancelada"]);
export type StatusDemanda = z.infer<typeof statusDemandaEnum>;

export const prioridadeEnum = z.enum(["baixa", "media", "alta", "urgente"]);
export type Prioridade = z.infer<typeof prioridadeEnum>;

export const demandaSchema = z.object({
  titulo: z.string().trim().min(5, "Título muito curto").max(160),
  descricao: z.string().trim().max(5000).optional().or(z.literal("")),
  categoria: z.string().trim().min(2).max(60),
  prioridade: prioridadeEnum.default("media"),
  status: statusDemandaEnum.default("aberta"),
  solicitante_id: z.string().uuid().nullable().optional(),
  lider_id: z.string().uuid("Liderança responsável obrigatória"),
  bairro: z.string().trim().max(80).optional().or(z.literal("")),
  bairro_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
  setor_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
  prazo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD")
    .optional()
    .or(z.literal("")),
});

export type DemandaInput = z.infer<typeof demandaSchema>;

export const movimentacaoSchema = z.object({
  demanda_id: z.string().uuid(),
  tipo: z.enum(["comentario", "status_change", "anexo"]).default("comentario"),
  texto: z.string().trim().min(1).max(2000),
  metadata: z.record(z.unknown()).optional(),
});

export type MovimentacaoInput = z.infer<typeof movimentacaoSchema>;
