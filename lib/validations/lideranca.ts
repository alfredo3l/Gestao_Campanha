import { z } from "zod";

/**
 * O cargo de uma liderança era um enum Postgres (`cargo_lider`). A partir da
 * migração 0010, é um slug texto referenciando `campanha.cargos_lider(value)`.
 * Validamos o formato (snake_case) e o tamanho aqui; a integridade referencial
 * é garantida pela FK no banco e checada pelo server action ao listar cargos
 * disponíveis.
 */
export const cargoSlugSchema = z
  .string()
  .trim()
  .min(2, "Cargo inválido")
  .max(50, "Cargo inválido")
  .regex(/^[a-z][a-z0-9_]{1,49}$/, "Cargo inválido");

export type CargoSlug = z.infer<typeof cargoSlugSchema>;

/** @deprecated Mantido apenas para retrocompatibilidade enquanto migramos referências. */
export type CargoLider = CargoSlug;

export const liderancaSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(120),
  cargo: cargoSlugSchema,
  municipio: z.string().trim().min(2).max(80),
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
  /**
   * IDs dos setores associados à liderança (N:N — migration 0012).
   * Aceita 0..N setores. Duplicatas são descartadas no servidor.
   */
  setor_ids: z
    .array(z.string().uuid("Setor inválido"))
    .default([])
    .transform((arr) => Array.from(new Set(arr))),
  tel: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(120).optional().or(z.literal("")),
  meta_votos: z.coerce.number().int().min(0, "Meta não pode ser negativa").max(1_000_000),
  ativa: z.boolean().default(true),
  /** Texto livre — anotações do operador (perfil, histórico, particularidades). */
  observacoes: z
    .string()
    .trim()
    .max(2000, "Observações: limite de 2000 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
  profile_id: z.string().uuid().nullable().optional(),
  /** Caminho relativo no bucket `campanha-fotos`. NULL/'' = sem foto. */
  foto_path: z
    .string()
    .trim()
    .max(300, "Caminho de foto muito longo")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .nullable(),
});

export type LiderancaInput = z.infer<typeof liderancaSchema>;

/**
 * Schema usado pela tela de gerenciamento de cargos (admin/coordenador).
 *
 * `value` é o slug imutável usado como FK; `label` é o nome exibido.
 */
export const cargoLiderRecordSchema = z.object({
  value: cargoSlugSchema,
  label: z.string().trim().min(2, "Nome muito curto").max(80, "Nome muito longo"),
  ordem: z.coerce.number().int().min(0).max(9999).default(0),
  ativo: z.boolean().default(true),
});

export type CargoLiderRecord = z.infer<typeof cargoLiderRecordSchema>;
