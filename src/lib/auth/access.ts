// lib/auth/access.ts

export type AppAccess = "crm" | "dashboard" | "finance" | "ranking";

const cargosFinanceiro = new Set<number>([511, 502]);
const cargosDiretoria = new Set<number>([501, 11, 610]);
const cargosVendedor = new Set<number>([2]);
const cargosGerenteVendas = new Set<number>([500]);
const cargosDevs = new Set<number>([4, 629]);

export function accessesFromCargoId(cargoId: number): AppAccess[] {
  if (cargosDiretoria.has(cargoId) || cargosDevs.has(cargoId)) {
    return ["crm", "dashboard", "finance", "ranking"];
  }
  if (cargosGerenteVendas.has(cargoId)) {
    return ["crm", "dashboard", "ranking"];
  }
  if (cargosFinanceiro.has(cargoId)) {
    return ["finance"];
  }
  if (cargosVendedor.has(cargoId)) {
    return ["crm", "dashboard"];
  }
  return [];
}

export function hasAccess(accesses: AppAccess[], needed: AppAccess) {
  return accesses.includes(needed);
}