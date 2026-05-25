/**
 * Formatadores pt-BR de uso comum (datas, números, telefone, status).
 */

const intlNum = new Intl.NumberFormat("pt-BR");
const intlPct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });
const intlDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const intlDateLong = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const intlDateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const fmtNumero = (v: number) => intlNum.format(v);
export const fmtPercentual = (v: number) => intlPct.format(v);
export const fmtData = (v: string | Date) => intlDate.format(new Date(v));
export const fmtDataLonga = (v: string | Date) => intlDateLong.format(new Date(v));
export const fmtDataHora = (v: string | Date) => intlDateTime.format(new Date(v));

export function fmtTelefone(valor: string): string {
  const d = (valor ?? "").replace(/\D+/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function fmtCep(valor: string): string {
  const d = (valor ?? "").replace(/\D+/g, "").slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function iniciais(nome: string): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return (partes[0]![0]! + partes[partes.length - 1]![0]!).toUpperCase();
}
