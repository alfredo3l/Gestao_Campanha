/**
 * Utilitários de CPF — validação de dígitos verificadores + formatação.
 * Receita Federal: 11 dígitos, último par é DV calculado por módulo 11.
 */

export function somenteDigitos(valor: string): string {
  return (valor ?? "").replace(/\D+/g, "");
}

export function formatarCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function validarCpf(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11) return false;
  // rejeita sequências triviais (000…, 111…, etc.)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDv = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const dv1 = calcDv(cpf.slice(0, 9), 10);
  if (dv1 !== Number(cpf[9])) return false;

  const dv2 = calcDv(cpf.slice(0, 10), 11);
  return dv2 === Number(cpf[10]);
}
