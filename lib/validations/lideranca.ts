import { z } from "zod";

export const cargoLiderEnum = z.enum([
  "coord_regional",
  "coord_zona",
  "lider_bairro",
  "lider_comunitario",
  "lider_rural",
]);
export type CargoLider = z.infer<typeof cargoLiderEnum>;

export const liderancaSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(120),
  cargo: cargoLiderEnum,
  municipio: z.string().trim().min(2).max(80),
  bairro: z.string().trim().max(80).optional().or(z.literal("")),
  tel: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(120).optional().or(z.literal("")),
  meta_votos: z.coerce.number().int().min(0, "Meta não pode ser negativa").max(1_000_000),
  ativa: z.boolean().default(true),
  profile_id: z.string().uuid().nullable().optional(),
});

export type LiderancaInput = z.infer<typeof liderancaSchema>;
