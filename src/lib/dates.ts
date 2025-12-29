function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Parse robusto para ultima_compra (text).
 * Aceita: "2025-12-01", "01/12/2025", "2025/12/01", "01-12-2025"
 */
export function parseLooseDate(input: string | null): Date | null {
  if (!input) return null;

  const s = input.trim();
  if (!s) return null;

  // ISO-like
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;

  // dd/mm/yyyy or dd-mm-yyyy
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (!Number.isNaN(d.getTime())) return d;
  }

  // yyyy/mm/dd or yyyy-mm-dd (fallback)
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2) {
    const yyyy = Number(m2[1]);
    const mm = Number(m2[2]);
    const dd = Number(m2[3]);
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

export function daysSince(date: Date | null): number | null {
  if (!date) return null;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfWeekLocal(d: Date) {
  // semana começando na segunda
  const day = d.getDay(); // 0 domingo..6 sábado
  const diff = (day === 0 ? -6 : 1) - day;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);
  return start;
}

export function isInThisWeek(date: Date) {
  const now = new Date();
  const start = startOfWeekLocal(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

export function formatLocalShort(date: Date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}
