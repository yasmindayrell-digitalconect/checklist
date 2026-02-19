import type { RadarJoinedRow } from "@/types/crm";
import type { Row } from "@/types/dashboard";
export function toNumber(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function fmtMonthBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function fmtBRShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

export function isActiveFlag(v?: string | null) {
  const s = (v ?? "").trim().toUpperCase();
  if (!s) return true;
  if (s === "N") return false;
  if (s === "0") return false;
  if (s === "F") return false;
  return true;
}

export function pickClientName(r: RadarJoinedRow | Row) {
  const nf = (r.nome_fantasia ?? "").trim();
  if (nf) return nf;
  const rs = (r.nome_razao_social ?? "").trim();
  return rs || "Sem nome";
}

export function getWeekRangeFromRef(ref: Date) {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const jsDay = d.getDay(); // 0 dom ... 6 sáb
  const diffToMonday = (jsDay + 6) % 7; // seg=0 ... dom=6
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return { monday, friday };
}

export function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}
