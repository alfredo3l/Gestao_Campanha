/**
 * Lista oficial dos 79 municípios do estado de Mato Grosso do Sul.
 *
 * `MUNICIPIO_PADRAO` representa a cidade-sede da maioria dos cadastros desta
 * campanha — fica fixado no topo da lista do combobox para acelerar a entrada
 * de dados. Os demais municípios estão em ordem alfabética (PT-BR).
 *
 * Fonte: IBGE — Divisão Político-Administrativa de MS.
 */
export const MUNICIPIO_PADRAO = "Três Lagoas";

const MUNICIPIOS_RESTANTES = [
  "Água Clara",
  "Alcinópolis",
  "Amambai",
  "Anastácio",
  "Anaurilândia",
  "Angélica",
  "Antônio João",
  "Aparecida do Taboado",
  "Aquidauana",
  "Aral Moreira",
  "Bandeirantes",
  "Bataguassu",
  "Batayporã",
  "Bela Vista",
  "Bodoquena",
  "Bonito",
  "Brasilândia",
  "Caarapó",
  "Camapuã",
  "Campo Grande",
  "Caracol",
  "Cassilândia",
  "Chapadão do Sul",
  "Corguinho",
  "Coronel Sapucaia",
  "Corumbá",
  "Costa Rica",
  "Coxim",
  "Deodápolis",
  "Dois Irmãos do Buriti",
  "Douradina",
  "Dourados",
  "Eldorado",
  "Fátima do Sul",
  "Figueirão",
  "Glória de Dourados",
  "Guia Lopes da Laguna",
  "Iguatemi",
  "Inocência",
  "Itaporã",
  "Itaquiraí",
  "Ivinhema",
  "Japorã",
  "Jaraguari",
  "Jardim",
  "Jateí",
  "Juti",
  "Ladário",
  "Laguna Carapã",
  "Maracaju",
  "Miranda",
  "Mundo Novo",
  "Naviraí",
  "Nioaque",
  "Nova Alvorada do Sul",
  "Nova Andradina",
  "Novo Horizonte do Sul",
  "Paraíso das Águas",
  "Paranaíba",
  "Paranhos",
  "Pedro Gomes",
  "Ponta Porã",
  "Porto Murtinho",
  "Ribas do Rio Pardo",
  "Rio Brilhante",
  "Rio Negro",
  "Rio Verde de Mato Grosso",
  "Rochedo",
  "Santa Rita do Pardo",
  "São Gabriel do Oeste",
  "Selvíria",
  "Sete Quedas",
  "Sidrolândia",
  "Sonora",
  "Tacuru",
  "Taquarussu",
  "Terenos",
  "Vicentina",
] as const;

/**
 * Lista final: município padrão no topo, demais em ordem alfabética.
 * Total: 79 itens (mantém a contagem oficial do IBGE para MS).
 */
export const MUNICIPIOS_MS: readonly string[] = [
  MUNICIPIO_PADRAO,
  ...MUNICIPIOS_RESTANTES,
] as const;

/**
 * Normaliza string para busca tolerante a acentos e caixa:
 *   "três lagoas" → "tres lagoas"
 *   "DOURADOS"    → "dourados"
 */
export function normalizarMunicipio(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
