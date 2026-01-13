// lib/checklistRules.ts
import type { ClienteComContatos } from "@/types/crm";
import { parseLooseDate, daysSince } from "@/lib/dates";

export type CardStatus = "danger" | "warning" | "ok";
export type BoardColumn = "needs_message" | "contacted_no_sale" | "ok";

function isSnoozed(client: ClienteComContatos) {
  const until = parseLooseDate((client as any).snooze_until);
  if (!until) return false;
  return until.getTime() > Date.now();
}

export function shouldHideClient(client: ClienteComContatos) {
  return isSnoozed(client);
}

export function getCardStatus(daysSinceLastPurchase: number | null): CardStatus {
  if (daysSinceLastPurchase === null) return "warning";
  if (daysSinceLastPurchase > 30) return "danger";
  if (daysSinceLastPurchase > 7) return "warning";
  return "ok";
}

export function getBoardColumn(client: ClienteComContatos): BoardColumn {
  // Se estiver snoozado, a gente vai filtrar antes no HomeClient,
  // mas deixar consistente:
  if (isSnoozed(client)) return "ok";

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

  return bValue - aValue;
}
