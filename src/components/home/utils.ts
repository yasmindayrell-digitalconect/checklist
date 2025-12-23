export const keyOf = (v: string | number) => String(v);

export function cleanName(raw: string): string {
  if (!raw) return "";
  const s = raw.replace(/^\d+\s*[-:]?\s*/g, "");
  const full_name = s.split(" ");
  return full_name.slice(0, 2).join(" ");
}

export const normalizePhone = (input?: string | null) => {
  if (!input) return "";
  let digits = String(input).replace(/\D/g, "");
  if (digits.startsWith("55")) digits = digits.slice(2);
  return digits;
};

/**
 * Aceita:
 * - number (dias)
 * - string numérica / "37 dias"
 * - string date ISO ("2025-12-01" / "2025-12-01T...")
 * - Date
 * Retorna dias ou Infinity (quando não existe / inválido)
 */
export function daysFrom(value?: string | number | Date | null) {
  if (value === null || value === undefined || value === "") return Infinity;

  // número direto (ex: ultima_compra já como number)
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }

  // Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    const diffMs = Date.now() - value.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    // 🔹 1️⃣ tenta como DATA primeiro
    // normaliza formato do Postgres: "2025-12-05 14:23:22+00"
    const normalized =
      trimmed.includes(" ") && !trimmed.includes("T")
        ? trimmed.replace(" ", "T")
        : trimmed;

    const d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      const diffMs = Date.now() - d.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // 🔹 2️⃣ só trata como número se for string NUMÉRICA PURA
    if (/^-?\d+(?:[.,]\d+)?$/.test(trimmed)) {
      const n = Number(trimmed.replace(",", "."));
      if (Number.isFinite(n)) return Math.floor(n);
    }

    return Infinity;
  }

  return Infinity;
}




