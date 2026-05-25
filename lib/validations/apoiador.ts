import { z } from "zod";

import { validarCpf, somenteDigitos } from "@/lib/utils/cpf";
import { validarTituloEleitor } from "@/lib/utils/titulo-eleitor";

export const statusApoioEnum = z.enum([
  "confirmado",
  "provavel",
  "indeciso",
  "contato",
  "nao_vota",
]);
export type StatusApoio = z.infer<typeof statusApoioEnum>;

/**
 * Campos comuns entre criação e edição. Manter sem `consentimento_lgpd`:
 * esse campo é exigido apenas no momento do cadastro inicial (a coluna
 * `data_consentimento` registra o opt-in original e não muda em updates).
 */
export const apoiadorBaseSchema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto").max(120),
  cpf: z
    .string()
    .trim()
    .transform(somenteDigitos)
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos")
    .refine(validarCpf, "CPF inválido (dígito verificador)"),
  titulo_eleitor: z
    .string()
    .trim()
    .transform(somenteDigitos)
    .refine((v) => v === "" || v.length === 12, "Título deve ter 12 dígitos")
    .refine((v) => v === "" || validarTituloEleitor(v), "Título inválido (dígito verificador)")
    .optional()
    .or(z.literal("")),
  zona: z.string().trim().max(4).optional().or(z.literal("")),
  secao: z.string().trim().max(4).optional().or(z.literal("")),
  tel: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(120).optional().or(z.literal("")),
  nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD")
    .optional()
    .or(z.literal("")),
  endereco: z.string().trim().max(200).optional().or(z.literal("")),
  bairro: z.string().trim().max(80).optional().or(z.literal("")),
  municipio: z.string().trim().min(2).max(80),
  cep: z
    .string()
    .trim()
    .transform(somenteDigitos)
    .refine((v) => v === "" || v.length === 8, "CEP deve ter 8 dígitos")
    .optional()
    .or(z.literal("")),
  lider_id: z.string().uuid("Liderança obrigatória"),
  status: statusApoioEnum.default("contato"),
  indicado_por: z.string().trim().max(120).optional().or(z.literal("")),
  observacoes: z.string().trim().max(2000).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
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

/** Schema usado no cadastro inicial — exige consentimento LGPD. */
export const apoiadorCreateSchema = apoiadorBaseSchema.extend({
  consentimento_lgpd: z
    .boolean()
    .refine((v) => v === true, "É necessário registrar o consentimento (LGPD)"),
});

/** Schema usado na edição — o consentimento já foi registrado no cadastro. */
export const apoiadorUpdateSchema = apoiadorBaseSchema;

/** @deprecated Use `apoiadorCreateSchema` (mais explícito). Mantido p/ compatibilidade. */
export const apoiadorSchema = apoiadorCreateSchema;

export type ApoiadorInput = z.infer<typeof apoiadorCreateSchema>;
export type ApoiadorUpdateInput = z.infer<typeof apoiadorUpdateSchema>;
