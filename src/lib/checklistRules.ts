// lib/checklistRules.ts
import type { ClienteComContatos } from "@/types/crm";
import { parseLooseDate, daysSince } from "@/lib/dates";

export type CardStatus = "danger" | "warning" | "ok";
export type BoardColumn = "needs_message" | "contacted_no_sale" | "ok";

export function getCardStatus(daysSinceLastPurchase: number | null): CardStatus {
  // >30 red, 8-30 yellow, <=7 green
  if (daysSinceLastPurchase === null) return "warning";
  if (daysSinceLastPurchase > 30) return "danger";
  if (daysSinceLastPurchase > 7) return "warning";
  return "ok";
}

export function getBoardColumn(client: ClienteComContatos): BoardColumn {
  const daysSinceLastPurchase = daysSince(parseLooseDate(client.ultima_compra as any));
  const daysSinceLastContact = daysSince(parseLooseDate(client.ultima_interacao as any));

  if (daysSinceLastPurchase !== null && daysSinceLastPurchase <= 7) return "ok";
  if (daysSinceLastContact !== null && daysSinceLastContact < 7) return "contacted_no_sale";
  return "needs_message";
}

export function sortByUrgency(a: ClienteComContatos, b: ClienteComContatos) {
  const aDaysSinceLastPurchase = daysSince(parseLooseDate(a.ultima_compra as any));
  const bDaysSinceLastPurchase = daysSince(parseLooseDate(b.ultima_compra as any));

  const aValue = aDaysSinceLastPurchase === null ? -1 : aDaysSinceLastPurchase;
  const bValue = bDaysSinceLastPurchase === null ? -1 : bDaysSinceLastPurchase;

  // Higher = more urgent (more days without purchase first)
  return bValue - aValue;
}
