import { z } from "zod";

/**
 * Schemas para o cadastro de setores e bairros (Configurações → Bairros & Setores).
 *
 * Setor: divisão geográfica de um município (ex.: 1 a 7 em Três Lagoas).
 * Bairro: pertence a um município; pode (opcionalmente) referenciar um setor.
 */

export const setorRecordSchema = z.object({
  numero: z.coerce
    .number()
    .int("Número deve ser inteiro")
    .min(1, "Número deve ser maior que zero")
    .max(9999, "Número fora da faixa"),
  nome: z.string().trim().min(1, "Informe o nome do setor").max(80, "Nome muito longo"),
  municipio: z.string().trim().min(2, "Município inválido").max(80),
  cor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/u, "Use hex no formato #RRGGBB")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
  ativo: z.boolean().default(true),
});

export type SetorRecord = z.infer<typeof setorRecordSchema>;

export const bairroRecordSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do bairro").max(120, "Nome muito longo"),
  municipio: z.string().trim().min(2, "Município inválido").max(80),
  setor_id: z
    .string()
    .uuid("Setor inválido")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
  ativo: z.boolean().default(true),
});

export type BairroRecord = z.infer<typeof bairroRecordSchema>;

/**
 * Schema dos campos de localidade reutilizado por apoiador/liderança/demanda.
 * Tudo opcional — os formulários podem aceitar texto livre quando o bairro
 * não está cadastrado.
 */
export const localidadeRefSchema = z.object({
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
});
