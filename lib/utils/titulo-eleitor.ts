/**
 * Validação de Título de Eleitor (TSE).
 * Estrutura: 12 dígitos = NNNNNNNN UF DV1 DV2
 *   - 8 dígitos: número sequencial
 *   - 2 dígitos: UF (01..28)
 *   - 2 dígitos: DV1 e DV2 (módulo 11)
 */

import { somenteDigitos } from "./cpf";

export function formatarTitulo(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 12);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)} ${d.slice(4)}`;
  if (d.length <= 10) return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

export function validarTituloEleitor(valor: string): boolean {
  const tit = somenteDigitos(valor);
  if (tit.length !== 12) return false;

  const uf = Number(tit.slice(8, 10));
  if (uf < 1 || uf > 28) return false;

  const calcDv = (base: string, pesos: number[]): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesos[i] ?? 0);
    }
    let dv = soma % 11;
    if (dv === 10) dv = 0;
    return dv;
  };

  // DV1 sobre os 8 primeiros dígitos, pesos 2..9
  const dv1Esperado = calcDv(tit.slice(0, 8), [2, 3, 4, 5, 6, 7, 8, 9]);
  if (dv1Esperado !== Number(tit[10])) return false;

  // DV2 sobre os 2 da UF + DV1, pesos 7,8,9
  const dv2Esperado = calcDv(tit.slice(8, 11), [7, 8, 9]);
  return dv2Esperado === Number(tit[11]);
}
