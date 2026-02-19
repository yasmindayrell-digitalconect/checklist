export function formatBRL(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPct(v: number, decimals = 2) {
  const n = Number.isFinite(v) ? v : 0;
  return `${n.toFixed(decimals)}%`;
}

// em um arquivo comum (ex: financeLayout.ts) ou no SellerTable.tsx
export const FINANCE_GRID =
  "grid-cols-[minmax(220px,1.4fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_96px]";
